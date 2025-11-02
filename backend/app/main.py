"""Main FastAPI application"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from fastapi.staticfiles import StaticFiles
import logging
from pathlib import Path

from app.core.config import settings
from app.core.database import init_db

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc"
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup templates directory
BASE_DIR = Path(__file__).resolve().parent.parent
templates = Jinja2Templates(directory=str(BASE_DIR / "templates"))

# Mount static files directory (for logo and assets)
try:
    static_dir = BASE_DIR / "static"
    if static_dir.exists():
        app.mount("/static", StaticFiles(directory=str(static_dir)), name="static")
except Exception as e:
    logger.warning(f"Static directory not found: {e}")


@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    logger.info("Starting Coach AI backend...")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    # Initialize database
    try:
        await init_db()
        logger.info("Database initialized successfully")
    except Exception as e:
        logger.error(f"Failed to initialize database: {e}")


@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    logger.info("Shutting down Coach AI backend...")


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT
    }


# API v1 health check
@app.get(f"{settings.API_V1_STR}/health")
async def api_health_check():
    """API health check endpoint"""
    return {
        "status": "healthy",
        "api_version": "v1",
        "service": settings.PROJECT_NAME
    }


# Root endpoint - Landing page
@app.get("/", include_in_schema=False)
async def landing_page(request: Request):
    """Serve the landing page"""
    return templates.TemplateResponse("landing.html", {"request": request})


# API info endpoint
@app.get("/api/info")
async def api_info():
    """API information endpoint"""
    return {
        "message": "Welcome to Coach AI - Clinical Training Platform",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs"
    }


# WebSocket connection manager
class ConnectionManager:
    """Manages WebSocket connections for real-time scenario interactions"""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        """Connect a client to a scenario session"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"Client connected to session {session_id}")

    def disconnect(self, session_id: str):
        """Disconnect a client from a scenario session"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
            logger.info(f"Client disconnected from session {session_id}")

    async def send_message(self, session_id: str, message: dict):
        """Send message to a specific scenario session"""
        if session_id in self.active_connections:
            await self.active_connections[session_id].send_json(message)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections.values():
            await connection.send_json(message)


# Create connection manager instance
manager = ConnectionManager()


# WebSocket endpoint for scenario interactions
@app.websocket("/ws/{session_id}")
async def websocket_endpoint(websocket: WebSocket, session_id: str):
    """
    WebSocket endpoint for real-time scenario interactions

    Args:
        websocket: WebSocket connection
        session_id: Unique session ID
    """
    from app.core.database import SessionLocal
    from app.models.session import Session as SessionModel
    from app.models.scenario import Scenario
    from app.core.azure_services import azure_openai_service, azure_speech_service
    from datetime import datetime
    import base64

    await manager.connect(session_id, websocket)

    # Get database session
    db = SessionLocal()

    try:
        # Load session and scenario
        session = db.query(SessionModel).filter(
            SessionModel.session_id == session_id
        ).first()

        if not session:
            await websocket.send_json({
                "type": "error",
                "message": f"Session {session_id} not found"
            })
            await websocket.close()
            return

        scenario = db.query(Scenario).filter(
            Scenario.id == session.scenario_id
        ).first()

        if not scenario:
            await websocket.send_json({
                "type": "error",
                "message": "Scenario not found"
            })
            await websocket.close()
            return

        logger.info(f"WebSocket connected for session {session_id}, scenario: {scenario.title}")

        while True:
            # Receive message from client
            data = await websocket.receive_json()

            logger.info(f"Received message for session {session_id}: {data}")

            if data.get("type") == "student_message":
                student_message = data.get("message", "")

                # Build conversation context
                scenario_context = {
                    "patient_profile": scenario.patient_profile,
                    "dialogue_tree": scenario.dialogue_tree,
                    "specialty": scenario.specialty,
                    "learning_objectives": scenario.learning_objectives
                }

                # Get conversation history from session
                conversation_history = []
                for msg in (session.transcript or []):
                    role = "assistant" if msg["role"] == "patient" else "user"
                    conversation_history.append({
                        "role": role,
                        "content": msg["message"]
                    })

                # Generate patient response using Azure OpenAI
                patient_response = await azure_openai_service.generate_patient_response(
                    scenario_context=scenario_context,
                    student_message=student_message,
                    conversation_history=conversation_history
                )

                logger.info(f"Generated patient response: {patient_response}")

                # Generate audio using Azure Speech Services
                voice_profile = scenario.patient_profile.get("voice_profile", {})
                voice_name = azure_speech_service.get_voice_for_profile(voice_profile)
                emotional_style = voice_profile.get("emotional_state", "neutral")

                audio_data = await azure_speech_service.synthesize_speech(
                    text=patient_response,
                    voice_name=voice_name,
                    emotional_style=emotional_style
                )

                # Convert audio to base64 for transmission
                audio_base64 = base64.b64encode(audio_data).decode('utf-8')
                audio_url = f"data:audio/wav;base64,{audio_base64}"

                # Save patient message to session transcript
                patient_message = {
                    "role": "patient",
                    "message": patient_response,
                    "timestamp": datetime.utcnow().isoformat(),
                    "audio_url": audio_url
                }

                transcript = session.transcript or []
                transcript.append(patient_message)
                session.transcript = transcript

                db.commit()

                # Send response back to client
                response = {
                    "type": "patient_response",
                    "message": patient_response,
                    "audio_url": audio_url
                }

                await manager.send_message(session_id, response)
                logger.info(f"Sent patient response for session {session_id}")

    except WebSocketDisconnect:
        manager.disconnect(session_id)
        logger.info(f"Client disconnected from session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}", exc_info=True)
        try:
            await websocket.send_json({
                "type": "error",
                "message": f"Error processing message: {str(e)}"
            })
        except:
            pass
        manager.disconnect(session_id)
    finally:
        db.close()


# Import and include routers
from app.api import scenarios, sessions, assessments, voice, analytics

app.include_router(scenarios.router, prefix=f"{settings.API_V1_STR}/scenarios", tags=["scenarios"])
app.include_router(sessions.router, prefix=f"{settings.API_V1_STR}/sessions", tags=["sessions"])
app.include_router(assessments.router, prefix=f"{settings.API_V1_STR}/assessments", tags=["assessments"])
app.include_router(voice.router, prefix=f"{settings.API_V1_STR}/voice", tags=["voice"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.DEBUG
    )

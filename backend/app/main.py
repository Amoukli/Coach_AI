"""Main FastAPI application"""

import base64
import logging

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from app.core.azure_services import azure_speech_service
from app.core.config import settings
from app.core.database import AsyncSessionLocal, init_db
from app.services.scenario_engine import ScenarioEngine

# Configure logging
logging.basicConfig(
    level=logging.INFO if not settings.DEBUG else logging.DEBUG,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
)
logger = logging.getLogger(__name__)

# Create FastAPI application
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    openapi_url=f"{settings.API_V1_STR}/openapi.json",
    docs_url=f"{settings.API_V1_STR}/docs",
    redoc_url=f"{settings.API_V1_STR}/redoc",
)

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
        "environment": settings.ENVIRONMENT,
    }


# API v1 health check
@app.get(f"{settings.API_V1_STR}/health")
async def api_health_check():
    """API health check endpoint"""
    return {"status": "healthy", "api_version": "v1", "service": settings.PROJECT_NAME}


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Welcome to Coach AI - Clinical Training Platform",
        "version": settings.VERSION,
        "docs": f"{settings.API_V1_STR}/docs",
    }


# WebSocket connection manager
class ConnectionManager:
    """Manages WebSocket connections for real-time scenario interactions"""

    def __init__(self):
        self.active_connections: dict[str, WebSocket] = {}
        self.scenario_engines: dict[str, ScenarioEngine] = {}

    async def connect(self, session_id: str, websocket: WebSocket):
        """Connect a client to a scenario session"""
        await websocket.accept()
        self.active_connections[session_id] = websocket
        logger.info(f"Client connected to session {session_id}")

    def disconnect(self, session_id: str):
        """Disconnect a client from a scenario session"""
        if session_id in self.active_connections:
            del self.active_connections[session_id]
        if session_id in self.scenario_engines:
            del self.scenario_engines[session_id]
        logger.info(f"Client disconnected from session {session_id}")

    def set_engine(self, session_id: str, engine: ScenarioEngine):
        """Set the scenario engine for a session"""
        self.scenario_engines[session_id] = engine

    def get_engine(self, session_id: str) -> ScenarioEngine | None:
        """Get the scenario engine for a session"""
        return self.scenario_engines.get(session_id)

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
        session_id: Unique session ID (from session creation)
    """
    await manager.connect(session_id, websocket)

    try:
        # Load session and scenario data from database
        async with AsyncSessionLocal() as db:
            # Get session with scenario data
            result = await db.execute(
                text(
                    """
                    SELECT s.id, s.scenario_id, sc.title, sc.specialty,
                           sc.patient_profile, sc.dialogue_tree, sc.assessment_rubric
                    FROM sessions s
                    JOIN scenarios sc ON s.scenario_id = sc.id
                    WHERE s.session_id = :session_id
                """
                ),
                {"session_id": session_id},
            )
            row = result.fetchone()

            if row:
                scenario_data = {
                    "id": str(row.scenario_id),
                    "title": row.title,
                    "specialty": row.specialty,
                    "patient_profile": row.patient_profile or {},
                    "dialogue_tree": row.dialogue_tree or {},
                    "assessment_rubric": row.assessment_rubric or {},
                }

                # Create and store scenario engine
                engine = ScenarioEngine(scenario_data)
                manager.set_engine(session_id, engine)
                logger.info(f"Loaded scenario '{row.title}' for session {session_id}")
            else:
                logger.warning(f"No session found for {session_id}")

        while True:
            # Receive message from client
            data = await websocket.receive_json()

            logger.info(f"Received message for session {session_id}: {data}")

            # Get scenario engine
            engine = manager.get_engine(session_id)

            if data.get("type") == "student_message" and engine:
                student_message = data.get("message", "")

                # Generate patient response using scenario engine
                try:
                    patient_response, metadata = await engine.process_student_input(student_message)

                    logger.info(f"Patient response: {patient_response}")

                    # Generate TTS audio for the response (optional)
                    audio_base64 = None
                    try:
                        scenario_data = engine.scenario
                        voice_profile = scenario_data.get("patient_profile", {}).get(
                            "voice_profile", {}
                        )
                        voice_name = azure_speech_service.get_voice_for_profile(voice_profile)
                        emotional_style = voice_profile.get("emotional_state", "neutral")

                        audio_bytes = await azure_speech_service.synthesize_speech(
                            text=patient_response,
                            voice_name=voice_name,
                            emotional_style=emotional_style,
                        )

                        # Convert to base64 for sending over WebSocket
                        audio_base64 = base64.b64encode(audio_bytes).decode("utf-8")
                        logger.info(f"Generated {len(audio_bytes)} bytes of audio")

                    except Exception as audio_error:
                        logger.warning(f"TTS failed (continuing without audio): {audio_error}")

                    response = {
                        "type": "patient_response",
                        "message": patient_response,
                        "audio_base64": audio_base64,
                        "metadata": metadata,
                    }

                except Exception as e:
                    logger.error(f"Error generating response: {e}")
                    response = {
                        "type": "patient_response",
                        "message": "I'm not sure I understand. Could you rephrase that?",
                        "audio_base64": None,
                        "error": str(e),
                    }
            else:
                response = {
                    "type": "error",
                    "message": "Invalid message type or no scenario engine available",
                }

            # Send response back to client
            await manager.send_message(session_id, response)

    except WebSocketDisconnect:
        manager.disconnect(session_id)
        logger.info(f"Client disconnected from session {session_id}")
    except Exception as e:
        logger.error(f"WebSocket error for session {session_id}: {e}")
        manager.disconnect(session_id)


# Import and include routers
from app.api import (  # noqa: E402
    analytics,
    assessments,
    clark,
    guidelines,
    scenarios,
    sessions,
    voice,
)

app.include_router(scenarios.router, prefix=f"{settings.API_V1_STR}/scenarios", tags=["scenarios"])
app.include_router(sessions.router, prefix=f"{settings.API_V1_STR}/sessions", tags=["sessions"])
app.include_router(
    assessments.router, prefix=f"{settings.API_V1_STR}/assessments", tags=["assessments"]
)
app.include_router(voice.router, prefix=f"{settings.API_V1_STR}/voice", tags=["voice"])
app.include_router(analytics.router, prefix=f"{settings.API_V1_STR}/analytics", tags=["analytics"])
app.include_router(
    guidelines.router, prefix=f"{settings.API_V1_STR}/guidelines", tags=["guidelines"]
)
app.include_router(clark.router, prefix=f"{settings.API_V1_STR}/clark", tags=["clark"])


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=settings.DEBUG)  # nosec B104

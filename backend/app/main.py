"""Main FastAPI application"""

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging

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


# Root endpoint
@app.get("/")
async def root():
    """Root endpoint"""
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

    async def connect(self, scenario_id: str, websocket: WebSocket):
        """Connect a client to a scenario session"""
        await websocket.accept()
        self.active_connections[scenario_id] = websocket
        logger.info(f"Client connected to scenario {scenario_id}")

    def disconnect(self, scenario_id: str):
        """Disconnect a client from a scenario session"""
        if scenario_id in self.active_connections:
            del self.active_connections[scenario_id]
            logger.info(f"Client disconnected from scenario {scenario_id}")

    async def send_message(self, scenario_id: str, message: dict):
        """Send message to a specific scenario session"""
        if scenario_id in self.active_connections:
            await self.active_connections[scenario_id].send_json(message)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected clients"""
        for connection in self.active_connections.values():
            await connection.send_json(message)


# Create connection manager instance
manager = ConnectionManager()


# WebSocket endpoint for scenario interactions
@app.websocket("/ws/{scenario_id}")
async def websocket_endpoint(websocket: WebSocket, scenario_id: str):
    """
    WebSocket endpoint for real-time scenario interactions

    Args:
        websocket: WebSocket connection
        scenario_id: Unique scenario session ID
    """
    await manager.connect(scenario_id, websocket)

    try:
        while True:
            # Receive message from client
            data = await websocket.receive_json()

            logger.info(f"Received message for scenario {scenario_id}: {data}")

            # Process message (will be implemented with scenario engine)
            response = {
                "type": "patient_response",
                "message": "Patient response will be generated here",
                "audio_url": None
            }

            # Send response back to client
            await manager.send_message(scenario_id, response)

    except WebSocketDisconnect:
        manager.disconnect(scenario_id)
        logger.info(f"Client disconnected from scenario {scenario_id}")
    except Exception as e:
        logger.error(f"WebSocket error for scenario {scenario_id}: {e}")
        manager.disconnect(scenario_id)


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

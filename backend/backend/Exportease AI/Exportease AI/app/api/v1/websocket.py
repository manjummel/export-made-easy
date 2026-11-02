# ============================================================
# ExportEase AI - WebSocket Streaming
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
WebSocket endpoint for streaming agent events to the frontend.
WS /api/v1/projects/{project_id}/stream

System 1 creates agent events.
System 3 validates, stores, and forwards them.
System 4 displays them.
"""

from __future__ import annotations

import asyncio
import json
import logging
from typing import Any

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from app.schemas.websocket import WSEvent
from app.utils.constants import WSEventType
from app.utils.validators import generate_uuid, utc_now_iso

logger = logging.getLogger(__name__)

router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections per project."""

    def __init__(self):
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, project_id: str):
        await websocket.accept()
        if project_id not in self.active_connections:
            self.active_connections[project_id] = []
        self.active_connections[project_id].append(websocket)
        logger.info(f"WebSocket connected for project: {project_id}")

    def disconnect(self, websocket: WebSocket, project_id: str):
        if project_id in self.active_connections:
            self.active_connections[project_id].remove(websocket)
            if not self.active_connections[project_id]:
                del self.active_connections[project_id]
        logger.info(f"WebSocket disconnected for project: {project_id}")

    async def send_event(self, project_id: str, event: WSEvent):
        """Send an event to all connections for a project."""
        if project_id in self.active_connections:
            event_data = event.to_json()
            for connection in self.active_connections[project_id]:
                try:
                    await connection.send_json(event_data)
                except Exception as e:
                    logger.warning(f"Failed to send WS event: {e}")

    async def broadcast_event(self, event: WSEvent):
        """Broadcast an event to all connected clients."""
        event_data = event.to_json()
        for connections in self.active_connections.values():
            for connection in connections:
                try:
                    await connection.send_json(event_data)
                except Exception:
                    pass


# Global connection manager
ws_manager = ConnectionManager()


@router.websocket("/projects/{project_id}/stream")
async def websocket_stream(websocket: WebSocket, project_id: str):
    """
    WebSocket endpoint for streaming agent events.
    WS /api/v1/projects/{project_id}/stream
    """
    await ws_manager.connect(websocket, project_id)

    # Send connection acknowledgment
    ack_event = WSEvent(
        event_type=WSEventType.REQUEST_RECEIVED.value,
        request_id=generate_uuid(),
        project_id=project_id,
        status="connected",
        partial_output="WebSocket connection established",
        timestamp=utc_now_iso(),
    )
    await websocket.send_json(ack_event.to_json())

    try:
        while True:
            # Keep connection alive and listen for client messages
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                # Handle client messages (e.g., ping, subscription changes)
                if message.get("type") == "ping":
                    await websocket.send_json({"type": "pong", "timestamp": utc_now_iso()})
            except json.JSONDecodeError:
                pass
    except WebSocketDisconnect:
        ws_manager.disconnect(websocket, project_id)
    except Exception as e:
        logger.error(f"WebSocket error for project {project_id}: {e}")
        ws_manager.disconnect(websocket, project_id)

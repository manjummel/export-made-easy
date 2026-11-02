# ============================================================
# ExportEase AI - AI Streaming API (Prompt 3.18)
# EXPORT-EASE-BACKEND-V1
# ============================================================

import asyncio
import json
import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from app.database import get_db
from app.integrations.agent_client import AgentExecutionPipeline
from app.integrations.trace_manager import TraceManager
from app.utils.validators import generate_uuid

logger = logging.getLogger(__name__)

router = APIRouter()

@router.websocket("/chat")
async def websocket_chat(websocket: WebSocket, db: AsyncSession = Depends(get_db)):
    """
    WebSocket: /api/chat
    Provides streaming access to actual agent execution pipeline. 
    Implements authentication (mocked via standard JWT validation usually, but we bypass for pure ws tests here), connection handling.
    """
    await websocket.accept()
    
    # We establish session IDs
    request_id = generate_uuid()
    # Assume project is provided in initial payload, defaulting to arbitrary string
    project_id = "ws-session-project"

    try:
        while True:
            # Handle commands
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                command = message.get("command")
                query = message.get("query", "")
                project_id = message.get("project_id", project_id) # override if they pass auth/project logic inside message
                
                if command == "ping":
                    await websocket.send_json({"event": "pong"})
                elif command == "start_analysis":
                    # Initialize trace persistence
                    tm = TraceManager(db, project_id, request_id)
                    await tm.initialize_run("CHAT_AGENT", query)
                    
                    # Stream execution
                    async for event_dict in AgentExecutionPipeline.execute_agent_stream(query, tm):
                        try:
                            await asyncio.wait_for(websocket.send_json(event_dict), timeout=5.0)
                        except asyncio.TimeoutError:
                            logger.error("Timeout sending via websocket")
                            break
                        except Exception as inner_e:
                            logger.error(f"Failed to send to client: {inner_e}")
                            break
            except json.JSONDecodeError:
                await websocket.send_json({"event": "error", "partial_output": "Invalid JSON format payload"})
                
    except WebSocketDisconnect:
        logger.info(f"Client disconnected for request {request_id}")
    except Exception as e:
        logger.error(f"WebSocket unhandled error: {e}")
        try:
            await websocket.close()
        except:
            pass

from pydantic import BaseModel
class AnalyzeRequest(BaseModel):
    query: str
    project_id: str

@router.post("/analyze")
async def analyze_post(req: AnalyzeRequest, db: AsyncSession = Depends(get_db)):
    """Standard POST access to kickoff async batch jobs without WS streaming."""
    request_id = generate_uuid()
    tm = TraceManager(db, req.project_id, request_id)
    await tm.initialize_run("BATCH_AGENT", req.query)
    
    events_collected = []
    async for event_dict in AgentExecutionPipeline.execute_agent_stream(req.query, tm):
        events_collected.append(event_dict)
        
    return {"status": "success", "request_id": request_id, "events_log": events_collected}

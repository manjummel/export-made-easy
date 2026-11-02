# ============================================================
# ExportEase AI - Agent Client (Orchestrator)
# EXPORT-EASE-BACKEND-V1
# ============================================================

import asyncio
from app.integrations.llm_client import LLMClient
from app.integrations.rag_client import RAGClient
from app.integrations.trace_manager import TraceManager
from app.utils.validators import utc_now_iso

class AgentExecutionPipeline:
    """Orchestrates RAG and LLM streams, producing real-time yielded events for WebSocket."""
    
    @staticmethod
    async def execute_agent_stream(query: str, trace_manager: TraceManager):
        """Async generator that produces websocket-ready JSON dictionaries while tracing to DB."""
        
        def format_event(event_type, agent, status, partial_output, confidence=0.0, sources=None):
            if sources is None:
                sources = []
            return {
                "event": event_type,
                "agent": agent,
                "status": status,
                "partial_output": partial_output,
                "confidence": confidence,
                "sources": sources,
                "timestamp": utc_now_iso()
            }

        yield format_event("agent_started", "Export Planner Setup", "Initialize", "Starting execution pipeline...")
        await trace_manager.log_event("agent_started", "Export Planner Setup", "Initialize", "Starting execution pipeline...")

        yield format_event("agent_processing", "RAG Retriever", "Searching", "Looking up compliance directives...")
        await trace_manager.log_event("agent_processing", "RAG Retriever", "Searching", "Looking up compliance directives...")
        
        # Connect to SET 2 Knowledge Base
        rag_data = await RAGClient.fetch_context(query)
        
        if rag_data["hits"] > 0:
            sources = rag_data["sources"]
            yield format_event("source_found", "RAG Retriever", "Success", f"Found {rag_data['hits']} relevant sources.", confidence=0.95, sources=sources)
            await trace_manager.log_event("source_found", "RAG Retriever", "Success", f"Found {rag_data['hits']} relevant sources.", confidence=0.95, sources=sources)
        else:
            yield format_event("warning", "RAG Retriever", "Empty", "No specific sources found in KB.")
            await trace_manager.log_event("warning", "RAG Retriever", "Empty", "No specific sources found in KB.")

        yield format_event("agent_processing", "LLM Synthesizer", "Generating", "Analyzing gathered constraints...")
        await trace_manager.log_event("agent_processing", "LLM Synthesizer", "Generating", "Analyzing gathered constraints...")

        # Map streamed LLM output
        final_answer = ""
        try:
            async for chunk in LLMClient.stream_analysis(query):
                final_answer += chunk
                yield format_event("agent_partial_output", "LLM Synthesizer", "Streaming", chunk)
                # We usually don't log every single token to DB to save writes, but we can log milestones.
        except Exception as e:
            yield format_event("error", "LLM Synthesizer", "Failed", str(e))
            await trace_manager.log_event("error", "LLM Synthesizer", "Failed", str(e))
            await trace_manager.complete_run("", str(e))
            return
            
        yield format_event("final_answer", "Export Planner", "Completed", final_answer, confidence=0.9)
        await trace_manager.log_event("final_answer", "Export Planner", "Completed", final_answer, confidence=0.9)
        
        yield format_event("agent_completed", "Master Orchestrator", "Clean Exit", "Pipeline finished successfully.")
        await trace_manager.log_event("agent_completed", "Master Orchestrator", "Clean Exit", "Pipeline finished successfully.")
        
        await trace_manager.complete_run(final_answer)

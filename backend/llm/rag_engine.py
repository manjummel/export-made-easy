"""
ExportEase AI — RAG Engine (Groq-Powered)
Uses Groq's free-tier LLM (llama-3.3-70b-versatile) for ultra-fast,
high-quality export trade intelligence responses.
Embeddings use HuggingFace (free, no API key needed).
"""

import os
from dotenv import load_dotenv
from langchain_groq import ChatGroq
from langchain_huggingface import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain.tools import tool
from langchain.agents import AgentExecutor, create_react_agent
from langchain_core.prompts import PromptTemplate
from mcp_tools import EXPORTEASE_MCP_TOOLS

load_dotenv()

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
CHROMA_DB_DIR = os.path.join(BASE_DIR, "chroma_db")
COLLECTION_NAME = "exportease_docs"

# ─────────────────────────────────────────────────────────────────────────────
# RAG Knowledge Base as an MCP Tool
# ─────────────────────────────────────────────────────────────────────────────

def _make_rag_tool(search_func):
    """Wrap the RAG search function as a LangChain tool so the agent can call it."""
    @tool
    def search_knowledge_base(query: str) -> str:
        """
        Search the official ExportEase AI knowledge base containing government trade
        documents, DGFT notifications, customs guidelines, and export procedure manuals.
        Use this for any questions about export procedures, policies, trade rules,
        customs forms, DGFT notifications, or official government guidelines.

        Args:
            query: The question or topic to search for in the knowledge base.

        Returns:
            Relevant excerpts from official documents with source references.
        """
        try:
            results = search_func(query)
            if not results:
                return "No relevant documents found in the knowledge base for this query."
            
            formatted_results = []
            for i, res in enumerate(results, 1):
                source = res.get("source", "Unknown source")
                page = res.get("page", "")
                page_info = f" (Page {page})" if page else ""
                text = res.get("text", "")
                formatted_results.append(f"[Doc {i}] Source: {source}{page_info}\n{text}")
            
            return "\n\n---\n\n".join(formatted_results)
        except Exception as e:
            return f"Error querying knowledge base: {e}"
    
    return search_knowledge_base


# ─────────────────────────────────────────────────────────────────────────────
# ExportEase AI ReAct Agent Prompt
# ─────────────────────────────────────────────────────────────────────────────

AGENT_PROMPT_TEMPLATE = """You are ExportEase AI, an expert Indian MSME export consultant with deep knowledge of:
- DGFT Foreign Trade Policy (FTP 2023-28)
- ITC-HS Tariff Classification (CBIC)
- India-UAE CEPA, EU GSP, India-Australia ECTA, UK DCTS
- ICEGATE customs filing procedures
- RBI FEMA export realisation rules
- APEDA, Spices Board, EIC certification processes
- RoDTEP, Advance Authorisation, EPCG schemes
- Risk management, forex hedging, ECGC insurance

You have access to the following tools:

{tools}

CRITICAL GUIDELINES:
- Always be concise, professional, and actionable
- When citing regulations, mention the specific act/notification number
- For HS code questions, always suggest the most likely 8-digit code
- For market questions, compare at least 3 countries with tariff rates
- For compliance questions, list required documents with issuing authorities
- Format responses with clear sections using bullet points and bold headers
- Always end with 1-2 concrete next steps the exporter should take
- If knowledge base has relevant info, always cite it as [Source: ...]

Chat History:
{chat_history}

Use the following format STRICTLY:

Question: the input question you must answer
Thought: you should always think about what to do
Action: the action to take, should be one of [{tool_names}]
Action Input: the input to the action
Observation: the result of the action
... (this Thought/Action/Action Input/Observation can repeat N times)
Thought: I now know the final answer
Final Answer: the final answer to the original input question

Begin!

Question: {input}
Thought: {agent_scratchpad}"""


# ─────────────────────────────────────────────────────────────────────────────
# Main ExportEase RAG Class (Groq-Powered)
# ─────────────────────────────────────────────────────────────────────────────

class ExportEaseRAG:
    def __init__(self):
        groq_api_key = os.getenv("GROQ_API_KEY")
        if not groq_api_key:
            raise ValueError(
                "GROQ_API_KEY not found in .env file.\n"
                "Get your free key at: https://console.groq.com/keys"
            )

        # ── Groq LLM (free, fast, powerful) ──────────────────────────────
        self.llm = ChatGroq(
            model=os.getenv("LLM_MODEL", "llama-3.3-70b-versatile"),
            temperature=float(os.getenv("LLM_TEMPERATURE", "0.15")),
            groq_api_key=groq_api_key,
            max_tokens=2048,
        )

        # ── FastEmbed (Embedding Model) ───────────────────────────
        print("⏳ Loading embedding model (FastEmbed - BAAI/bge-small-en)...")
        try:
            from fastembed import TextEmbedding
            self.embedding_model = TextEmbedding(model_name="BAAI/bge-small-en")
            print("✅ Embedding model ready")
        except Exception as e:
            print(f"⚠️ Error loading FastEmbed: {e}")
            self.embedding_model = None

        # ── Actian VectorAI Client ────────────────────────────────────
        try:
            from actian_client import ActianDBClient
            self.actian_client = ActianDBClient(host="localhost", grpc_port=6574)
            self.collection_name = "exportease_docs_384"
            print(f"✅ Actian VectorAI client initialized for {self.collection_name}")
        except Exception as e:
            print(f"⚠️ Actian VectorAI Client not found or failed to load: {e}")
            self.actian_client = None

        def search_actian(query: str):
            if not self.embedding_model or not self.actian_client:
                return []
            
            # 1. Generate query embedding
            query_embed_gen = self.embedding_model.embed([query])
            query_embedding = list(list(query_embed_gen)[0])
            
            # 2. Search Actian DB
            return self.actian_client.search(
                collection_name=self.collection_name,
                query_embedding=query_embedding,
                limit=5
            )

        # ── Build tool list: MCP tools + Actian RAG tool ────────────────
        self.tools = list(EXPORTEASE_MCP_TOOLS)
        if self.embedding_model and self.actian_client:
            self.tools.append(_make_rag_tool(search_actian))


        # ── Build ReAct agent ─────────────────────────────────────────────
        prompt = PromptTemplate.from_template(AGENT_PROMPT_TEMPLATE)
        agent = create_react_agent(self.llm, self.tools, prompt)
        self.agent_executor = AgentExecutor(
            agent=agent,
            tools=self.tools,
            verbose=True,
            handle_parsing_errors=True,
            max_iterations=6,
            return_intermediate_steps=False,
        )

    def _format_history(self, history_dicts: list) -> str:
        """Convert history list to a plain string for the prompt."""
        if not history_dicts:
            return "No previous conversation."
        lines = []
        for msg in history_dicts:
            role = msg.get("role", "user").capitalize()
            text = msg.get("text", "")
            lines.append(f"{role}: {text}")
        return "\n".join(lines)

    def get_answer(self, query: str, history_dicts: list = None) -> str:
        """Get a complete answer from the ReAct agent."""
        chat_history = self._format_history(history_dicts or [])
        try:
            result = self.agent_executor.invoke({
                "input": query,
                "chat_history": chat_history,
            })
            return result.get("output", "I apologize, I could not generate a response. Please try again.")
        except Exception as e:
            return f"⚠️ Error generating response: {str(e)}\n\nPlease rephrase your question or try again."

    def stream_answer(self, query: str, history_dicts: list = None):
        """Stream the answer token by token."""
        chat_history = self._format_history(history_dicts or [])
        try:
            for chunk in self.agent_executor.stream({
                "input": query,
                "chat_history": chat_history,
            }):
                if "output" in chunk:
                    yield chunk["output"]
                elif "messages" in chunk:
                    for msg in chunk["messages"]:
                        if hasattr(msg, "content") and msg.content:
                            yield msg.content
        except Exception as e:
            yield f"⚠️ Streaming error: {str(e)}"

    def get_tools_list(self) -> list:
        """Return a list of available tool names and descriptions."""
        return [
            {"name": t.name, "description": t.description}
            for t in self.tools
        ]


# ─────────────────────────────────────────────────────────────────────────────
# Local test
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    rag = ExportEaseRAG()
    
    test_queries = [
        "What is the HS code for men's cotton shirts and what is the tariff for UAE?",
        "What government schemes are available for a textile MSME exporter?",
        "What compliance documents do I need to export spices to Germany?",
    ]
    
    for query in test_queries:
        print(f"\n{'='*60}")
        print(f"User: {query}")
        print(f"ExportEase AI: {rag.get_answer(query)}")

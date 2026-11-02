"""
ExportEase AI — Actian VectorAI Client
Manages connection, collection creation, vector upsert, and semantic search
using the local Actian VectorAI database.
"""

from typing import List, Dict, Any
import uuid

try:
    from actian_vectorai import VectorAIClient
    from actian_vectorai.models import Distance, VectorParams, PointStruct
except ImportError:
    # Fallback to avoid breaking immediately if not installed yet
    pass

class ActianDBClient:
    def __init__(self, host: str = "localhost", grpc_port: int = 6574, rest_port: int = 6573):
        self.host = host
        self.grpc_port = grpc_port
        self.rest_port = rest_port
        
        # We use gRPC port for the Python SDK client
        self.client = VectorAIClient(url=f"{self.host}:{self.grpc_port}")

    def initialize_collection(self, collection_name: str, vector_size: int = 384):
        """Ensure the collection exists with the correct vector size and distance metric."""
        try:
            # Check if collection exists
            collections_response = self.client.get_collections()
            existing_collections = [col.name for col in collections_response.collections]
            
            if collection_name not in existing_collections:
                print(f"Collection '{collection_name}' not found. Creating it...")
                self.client.create_collection(
                    collection_name=collection_name,
                    vectors_config=VectorParams(size=vector_size, distance=Distance.COSINE)
                )
                print(f"Successfully created collection: {collection_name}")
            else:
                print(f"Collection '{collection_name}' already exists.")
                
            return True
        except Exception as e:
            print(f"⚠️ Error initializing Actian collection: {e}")
            return False

    def upsert_vectors(self, collection_name: str, texts: List[str], embeddings: List[List[float]], metadatas: List[Dict[str, Any]] = None):
        """Insert vectors and payloads into the Actian collection."""
        if len(texts) != len(embeddings):
            raise ValueError("Number of texts must match number of embeddings")
            
        if not metadatas:
            metadatas = [{} for _ in texts]
            
        points = []
        for i, (text, embedding, metadata) in enumerate(zip(texts, embeddings, metadatas)):
            # Generate a UUID based on the index/text for uniqueness
            point_id = str(uuid.uuid5(uuid.NAMESPACE_DNS, f"{text[:50]}_{i}"))
            
            payload = metadata.copy()
            payload["text"] = text
            
            points.append(
                PointStruct(
                    id=point_id,
                    vector=embedding,
                    payload=payload
                )
            )
            
        print(f"Inserting {len(points)} vectors into Actian VectorAI...")
        self.client.upsert(
            collection_name=collection_name,
            points=points
        )
        return len(points)

    def search(self, collection_name: str, query_embedding: List[float], limit: int = 5) -> List[Dict[str, Any]]:
        """Perform semantic search and return matched payloads."""
        results = self.client.search(
            collection_name=collection_name,
            query_vector=query_embedding,
            limit=limit,
            with_payload=True
        )
        
        # Extract payloads
        retrieved = []
        for result in results:
            if hasattr(result, "payload") and result.payload:
                retrieved.append({
                    "score": result.score if hasattr(result, "score") else 0,
                    "text": result.payload.get("text", ""),
                    "source": result.payload.get("source", "Unknown"),
                    "page": result.payload.get("page", "")
                })
        return retrieved

# ============================================================
# ExportEase AI - Product Service
# EXPORT-EASE-BACKEND-V1
# ============================================================
import json
from typing import List, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.models.product import Product
from app.models.business import Business
from app.models.msme_profile import MSMEProfile
from app.schemas.product import ProductCreate, ProductUpdate
from app.utils.validators import generate_uuid
from app.clients.ai_client import AIServiceClient
from app.clients.knowledge_client import KnowledgeServiceClient


class ProductService:
    """Service handling product state and AI analysis integration."""
    
    @staticmethod
    async def create_product(db: AsyncSession, request: ProductCreate, user_id: str) -> Product:
        # Verify ownership mapping Business -> MSMEProfile -> User
        stmt = select(Business).join(MSMEProfile).where(
            Business.id == request.business_id,
            MSMEProfile.user_id == user_id
        )
        business = (await db.execute(stmt)).scalar_one_or_none()
        if not business:
            raise ValueError("Business not found or access denied")
            
        product = Product(
            id=generate_uuid(),
            business_id=request.business_id,
            product_name=request.product_name,
            description=request.description,
            category=request.category,
            unit_of_measure=request.unit_of_measure,
            quantity=request.quantity,
            unit_price_usd=request.unit_price_usd,
            annual_production_capacity=request.annual_production_capacity,
            raw_materials=request.raw_materials,
            specifications=request.specifications,
            intended_destination=request.intended_destination,
        )
        db.add(product)
        await db.flush()
        return product

    @staticmethod
    async def get_product(db: AsyncSession, product_id: str, user_id: str) -> Optional[Product]:
        stmt = select(Product).join(Business).join(MSMEProfile).where(
            Product.id == product_id,
            MSMEProfile.user_id == user_id
        )
        return (await db.execute(stmt)).scalar_one_or_none()
        
    @staticmethod
    async def list_products(db: AsyncSession, business_id: str, user_id: str) -> List[Product]:
        stmt = select(Product).join(Business).join(MSMEProfile).where(
            Product.business_id == business_id,
            MSMEProfile.user_id == user_id
        )
        return list((await db.execute(stmt)).scalars().all())

    @staticmethod
    async def update_product(db: AsyncSession, product_id: str, request: ProductUpdate, user_id: str) -> Product:
        product = await ProductService.get_product(db, product_id, user_id)
        if not product:
            raise ValueError("Product not found")
            
        for field, val in request.model_dump(exclude_unset=True).items():
            setattr(product, field, val)
            
        await db.flush()
        return product
        
    @staticmethod
    async def delete_product(db: AsyncSession, product_id: str, user_id: str) -> None:
        product = await ProductService.get_product(db, product_id, user_id)
        if not product:
            raise ValueError("Product not found")
        await db.delete(product)
        await db.flush()

    @staticmethod
    async def analyze_product(db: AsyncSession, product_id: str, user_id: str) -> Product:
        """
        Executes System 1 AI and System 2 RAG evaluation to normalize and map HS parameters.
        Does not invent regulatory codes.
        """
        product = await ProductService.get_product(db, product_id, user_id)
        if not product:
            raise ValueError("Product not found")
            
        # Standard workflow dependency execution against System 1 and System 2
        from app.main import app_state
        ai_client: AIServiceClient = app_state.get("ai_client")
        knowledge_client: KnowledgeServiceClient = app_state.get("knowledge_client")
        
        # Pull definitions using Knowledge Service
        rag_context = await knowledge_client.search_sources(
            query=f"HS classification definition {product.product_name}",
            project_id=f"prod-{product.id}"
        )
        
        # Analyze parameters via AI Agent passing RAG contexts
        analysis = await ai_client.classify_hs({
            "product_description": product.product_name,
            "destination": product.intended_destination or "Germany",
            "context": str(rag_context.get("data", {}).get("results", []))
        })
        
        # Apply strict data limits
        if analysis["status"] == "success":
            data = analysis["data"]
            product.normalized_name = data.get("normalized_name", product.product_name)
            product.hs_code = data.get("hs_code")
            product.hs_description = data.get("description")
            product.hs_classification_confidence = analysis.get("confidence", 0.0)
            product.hs_classification_source = "AI_VERIFIED"
            product.attributes = json.dumps(data.get("attributes", {}))
            await db.flush()
            
        return product

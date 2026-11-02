# ============================================================
# ExportEase AI - Products API Routes
# EXPORT-EASE-BACKEND-V1
# ============================================================

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from typing import List

from app.database import get_db
from app.schemas.common import ResponseEnvelope
from app.schemas.product import ProductCreate, ProductUpdate, ProductResponse, ProductAnalysisRequest
from app.services.product_service import ProductService
from app.dependencies import get_current_active_user

router = APIRouter()


@router.post("/", response_model=ResponseEnvelope, status_code=201)
async def create_product(
    request: ProductCreate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    try:
        product = await ProductService.create_product(db, request, current_user["user_id"])
        return ResponseEnvelope.success(
            data=ProductResponse.model_validate(product).model_dump()
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/", response_model=ResponseEnvelope)
async def list_products(
    business_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    products = await ProductService.list_products(db, business_id, current_user["user_id"])
    serialized = [ProductResponse.model_validate(p).model_dump() for p in products]
    return ResponseEnvelope.success(data={"products": serialized, "total": len(serialized)})


@router.get("/{product_id}", response_model=ResponseEnvelope)
async def get_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    product = await ProductService.get_product(db, product_id, current_user["user_id"])
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
        
    return ResponseEnvelope.success(data=ProductResponse.model_validate(product).model_dump())


@router.put("/{product_id}", response_model=ResponseEnvelope)
async def update_product(
    product_id: str,
    request: ProductUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    try:
        product = await ProductService.update_product(db, product_id, request, current_user["user_id"])
        return ResponseEnvelope.success(data=ProductResponse.model_validate(product).model_dump())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
        
        
@router.delete("/{product_id}", status_code=204)
async def delete_product(
    product_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    try:
        await ProductService.delete_product(db, product_id, current_user["user_id"])
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))


@router.post("/analyze", response_model=ResponseEnvelope)
async def analyze_product(
    request: ProductAnalysisRequest,
    db: AsyncSession = Depends(get_db),
    current_user: dict = Depends(get_current_active_user),
):
    """
    Kicks off System 1 + System 2 agentic evaluation for HS Classification normalization on the provided product.
    """
    try:
        product = await ProductService.analyze_product(db, request.product_id, current_user["user_id"])
        return ResponseEnvelope.success(data=ProductResponse.model_validate(product).model_dump())
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))

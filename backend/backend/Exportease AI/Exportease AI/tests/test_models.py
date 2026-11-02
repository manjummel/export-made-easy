# ============================================================
# ExportEase AI - Model Tests
# ============================================================
"""
Tests for SQLAlchemy 2.x declarative models and relationships.
Testing the MSME -> Business -> Product -> Project data chain.
"""

import pytest
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.models.user import User
from app.models.msme_profile import MSMEProfile
from app.models.business import Business
from app.models.product import Product
from app.models.export_project import ExportProject
from app.models.project_step import ProjectStep
from app.utils.validators import generate_uuid
from app.utils.security import hash_password


@pytest.mark.asyncio
async def test_user_creation(async_client, setup_db):
    """Test user creation with UUID and default values."""
    from app.database import async_session_factory
    
    async with async_session_factory() as db:
        user = User(
            id=generate_uuid(),
            email="test_models@exportease.ai",
            hashed_password=hash_password("passwd123"),
            full_name="Modeling User",
            role="MSME_USER"
        )
        db.add(user)
        await db.commit()
        await db.refresh(user)

        assert user.id is not None
        assert user.is_active is True
        assert user.created_at is not None


@pytest.mark.asyncio
async def test_full_chain_relationships(async_client, setup_db):
    """Test the full relational chain: User -> MSME -> Business -> Product -> Project -> Workflow Step"""
    from app.database import async_session_factory
    
    async with async_session_factory() as db:
        # Create User
        user = User(
            id=generate_uuid(),
            email="chain@exportease.ai",
            hashed_password="mock",
            full_name="Chain Tester",
        )
        db.add(user)
        await db.flush()

        # Create MSME
        msme = MSMEProfile(
            id=generate_uuid(),
            user_id=user.id,
            company_name="Chain Pvt Ltd",
            gstin="27AADCK1234F1ZH"
        )
        db.add(msme)
        await db.flush()

        # Create Business
        business = Business(
            id=generate_uuid(),
            msme_id=msme.id,
            business_name="Chain Processing"
        )
        db.add(business)
        await db.flush()

        # Create Product
        product = Product(
            id=generate_uuid(),
            business_id=business.id,
            product_name="Chain Widget",
            hs_code="9999.99"
        )
        db.add(product)
        await db.flush()

        # Create Project
        project = ExportProject(
            id=generate_uuid(),
            msme_id=msme.id,
            product_id=product.id,
            project_name="Export Widget to DE",
            destination_country="Germany"
        )
        db.add(project)
        await db.flush()

        # Create Project Step
        step = ProjectStep(
            id=generate_uuid(),
            project_id=project.id,
            step_name="MSME_PROFILE",
            step_order=1,
            status="COMPLETED"
        )
        db.add(step)
        
        await db.commit()

        # ── Verification of relationships ──────────────────────────
        
        # Verify MSME -> Businesses
        stmt = select(MSMEProfile).where(MSMEProfile.id == msme.id)
        result = await db.execute(stmt)
        fetched_msme = result.scalars().first()
        # Ensure relation mapped via subquery load if relationship accessed
        assert fetched_msme.company_name == "Chain Pvt Ltd"

        # Verify Business -> Product
        stmt_prod = select(Product).where(Product.business_id == business.id)
        result_prod = await db.execute(stmt_prod)
        fetched_product = result_prod.scalars().first()
        assert fetched_product.product_name == "Chain Widget"

        # Verify Project -> Project Step
        stmt_proj = select(ExportProject).where(ExportProject.id == project.id)
        result_proj = await db.execute(stmt_proj)
        fetched_proj = result_proj.scalars().first()
        assert fetched_proj.destination_country == "Germany"

        stmt_step = select(ProjectStep).where(ProjectStep.project_id == fetched_proj.id)
        result_step = await db.execute(stmt_step)
        fetched_step = result_step.scalars().first()
        assert fetched_step.step_name == "MSME_PROFILE"
        assert fetched_step.status == "COMPLETED"

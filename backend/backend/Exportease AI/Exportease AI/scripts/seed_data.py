# ============================================================
# ExportEase AI - Database Seed Script
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Seed the database with sample data for the canonical scenario:
"I want to export turmeric powder to Germany."
"""

import asyncio
import json
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import async_session_factory, init_db
from app.models.user import User
from app.models.msme_profile import MSMEProfile
from app.models.business import Business
from app.models.product import Product
from app.models.country import Country
from app.utils.security import hash_password
from app.utils.validators import generate_uuid


COUNTRIES = [
    {"name": "Germany", "iso_alpha2": "DE", "iso_alpha3": "DEU", "region": "Europe", "sub_region": "Western Europe", "currency_code": "EUR"},
    {"name": "United States", "iso_alpha2": "US", "iso_alpha3": "USA", "region": "Americas", "sub_region": "Northern America", "currency_code": "USD"},
    {"name": "United Kingdom", "iso_alpha2": "GB", "iso_alpha3": "GBR", "region": "Europe", "sub_region": "Northern Europe", "currency_code": "GBP"},
    {"name": "Japan", "iso_alpha2": "JP", "iso_alpha3": "JPN", "region": "Asia", "sub_region": "Eastern Asia", "currency_code": "JPY"},
    {"name": "United Arab Emirates", "iso_alpha2": "AE", "iso_alpha3": "ARE", "region": "Asia", "sub_region": "Western Asia", "currency_code": "AED"},
    {"name": "Australia", "iso_alpha2": "AU", "iso_alpha3": "AUS", "region": "Oceania", "sub_region": "Australia and New Zealand", "currency_code": "AUD"},
    {"name": "Canada", "iso_alpha2": "CA", "iso_alpha3": "CAN", "region": "Americas", "sub_region": "Northern America", "currency_code": "CAD"},
    {"name": "Singapore", "iso_alpha2": "SG", "iso_alpha3": "SGP", "region": "Asia", "sub_region": "South-Eastern Asia", "currency_code": "SGD"},
    {"name": "France", "iso_alpha2": "FR", "iso_alpha3": "FRA", "region": "Europe", "sub_region": "Western Europe", "currency_code": "EUR"},
    {"name": "Netherlands", "iso_alpha2": "NL", "iso_alpha3": "NLD", "region": "Europe", "sub_region": "Western Europe", "currency_code": "EUR"},
]


async def seed():
    print("=" * 60)
    print("ExportEase AI — Seeding Database")
    print("=" * 60)

    await init_db()

    async with async_session_factory() as db:
        # ── 1. Create Admin User ──────────────────────────
        admin = User(
            id=generate_uuid(),
            email="admin@exportease.ai",
            hashed_password=hash_password("admin123456"),
            full_name="ExportEase Admin",
            role="ADMIN",
            is_active=True,
            is_verified=True,
        )
        db.add(admin)

        # ── 2. Create Demo MSME User ─────────────────────
        demo_user = User(
            id=generate_uuid(),
            email="demo@exportease.ai",
            hashed_password=hash_password("demo123456"),
            full_name="Raj Kumar (Demo MSME)",
            phone="+91-9876543210",
            role="MSME_USER",
            is_active=True,
            is_verified=True,
        )
        db.add(demo_user)

        # ── 3. Create MSME Profile ───────────────────────
        msme = MSMEProfile(
            id=generate_uuid(),
            user_id=demo_user.id,
            company_name="Kumar Spice Exports Pvt Ltd",
            gstin="27AADCK1234F1ZH",
            iec_code="AADCK1234F",
            udyam_number="UDYAM-KA-01-0012345",
            msme_category="SMALL",
            industry_sector="Food Processing — Spices",
            registered_address="Plot 42, MIDC Industrial Area",
            city="Sangli",
            state="Maharashtra",
            pincode="416416",
            website="https://kumarspices.example.com",
            export_experience_years=2,
            annual_turnover_inr=25000000,
            previous_export_countries=json.dumps(["UAE", "Nepal"]),
        )
        db.add(msme)

        # ── 4. Create Business ───────────────────────────
        business = Business(
            id=generate_uuid(),
            msme_id=msme.id,
            business_name="Kumar Spice Processing Unit",
            business_type="Manufacturing",
            description="Processing and export of turmeric powder, chili powder, and spice blends",
            primary_activity="Spice Processing & Export",
            manufacturing_capability="5 MT/day processing capacity with automated grinding and packaging",
            quality_certifications=json.dumps(["ISO 9001:2015", "HACCP"]),
        )
        db.add(business)

        # ── 5. Create Product ────────────────────────────
        product = Product(
            id=generate_uuid(),
            business_id=business.id,
            product_name="Premium Turmeric Powder",
            description="100% pure turmeric (Curcuma longa) powder with 4-5% curcumin content. "
                        "Stone-ground, no artificial colors or additives.",
            category="Spices — Turmeric",
            hs_code="0910.30",
            hs_description="Turmeric (curcuma)",
            hs_classification_confidence=0.92,
            hs_classification_source="MANUAL",
            unit_of_measure="KG",
            unit_price_usd=3.20,
            annual_production_capacity="1500 MT/year",
            raw_materials="Raw turmeric fingers sourced from Sangli and Erode regions",
            specifications="Curcumin: 4-5%, Moisture: <10%, Lead: <2.5 ppm, "
                          "Salmonella: Absent/25g, E.coli: <10 CFU/g",
        )
        db.add(product)

        # ── 6. Seed Countries ────────────────────────────
        for c in COUNTRIES:
            country = Country(id=generate_uuid(), **c)
            db.add(country)

        await db.commit()

    print("\n✅ Seed data created successfully!")
    print(f"   Admin:  admin@exportease.ai / admin123456")
    print(f"   Demo:   demo@exportease.ai / demo123456")
    print(f"   MSME:   Kumar Spice Exports Pvt Ltd")
    print(f"   Product: Premium Turmeric Powder (HS 0910.30)")
    print(f"   Countries: {len(COUNTRIES)} seeded")
    print("=" * 60)


if __name__ == "__main__":
    asyncio.run(seed())

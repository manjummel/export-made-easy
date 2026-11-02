# ============================================================
# ExportEase AI - Initial Database Schema Migration
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""Initial schema — all 17 tables

Revision ID: 001_initial_schema
Revises:
Create Date: 2026-08-12
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa

revision: str = "001_initial_schema"
down_revision: Union[str, None] = None
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── Users ─────────────────────────────────────────────
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("email", sa.String(255), unique=True, nullable=False, index=True),
        sa.Column("hashed_password", sa.Text, nullable=False),
        sa.Column("full_name", sa.String(255), nullable=False),
        sa.Column("phone", sa.String(20), nullable=True),
        sa.Column("role", sa.String(20), nullable=False, server_default="MSME_USER"),
        sa.Column("is_active", sa.Boolean, server_default="true"),
        sa.Column("is_verified", sa.Boolean, server_default="false"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── MSME Profiles ────────────────────────────────────
    op.create_table(
        "msme_profiles",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=False, index=True),
        sa.Column("company_name", sa.String(500), nullable=False),
        sa.Column("gstin", sa.String(15), nullable=True, index=True),
        sa.Column("iec_code", sa.String(10), nullable=True, index=True),
        sa.Column("udyam_number", sa.String(20), nullable=True),
        sa.Column("msme_category", sa.String(20), nullable=True),
        sa.Column("industry_sector", sa.String(255), nullable=True),
        sa.Column("registered_address", sa.Text, nullable=True),
        sa.Column("city", sa.String(100), nullable=True),
        sa.Column("state", sa.String(100), nullable=True),
        sa.Column("pincode", sa.String(10), nullable=True),
        sa.Column("website", sa.String(500), nullable=True),
        sa.Column("export_experience_years", sa.Integer, nullable=True),
        sa.Column("annual_turnover_inr", sa.Float, nullable=True),
        sa.Column("previous_export_countries", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Businesses ────────────────────────────────────────
    op.create_table(
        "businesses",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("msme_id", sa.String(36), sa.ForeignKey("msme_profiles.id"), nullable=False, index=True),
        sa.Column("business_name", sa.String(500), nullable=False),
        sa.Column("business_type", sa.String(100), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("primary_activity", sa.String(255), nullable=True),
        sa.Column("manufacturing_capability", sa.Text, nullable=True),
        sa.Column("quality_certifications", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Products ──────────────────────────────────────────
    op.create_table(
        "products",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("business_id", sa.String(36), sa.ForeignKey("businesses.id"), nullable=False, index=True),
        sa.Column("product_name", sa.String(500), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("category", sa.String(255), nullable=True),
        sa.Column("hs_code", sa.String(20), nullable=True, index=True),
        sa.Column("hs_description", sa.Text, nullable=True),
        sa.Column("hs_classification_confidence", sa.Float, nullable=True),
        sa.Column("hs_classification_source", sa.String(50), nullable=True),
        sa.Column("unit_of_measure", sa.String(50), nullable=True),
        sa.Column("unit_price_usd", sa.Float, nullable=True),
        sa.Column("annual_production_capacity", sa.String(255), nullable=True),
        sa.Column("raw_materials", sa.Text, nullable=True),
        sa.Column("specifications", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Countries ─────────────────────────────────────────
    op.create_table(
        "countries",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name", sa.String(255), nullable=False, unique=True),
        sa.Column("iso_alpha2", sa.String(2), nullable=False, unique=True, index=True),
        sa.Column("iso_alpha3", sa.String(3), nullable=False, unique=True),
        sa.Column("region", sa.String(100), nullable=True),
        sa.Column("sub_region", sa.String(100), nullable=True),
        sa.Column("trade_agreements", sa.Text, nullable=True),
        sa.Column("is_sanctioned", sa.Boolean, server_default="false"),
        sa.Column("currency_code", sa.String(3), nullable=True),
    )

    # ── Export Projects ───────────────────────────────────
    op.create_table(
        "export_projects",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("msme_id", sa.String(36), sa.ForeignKey("msme_profiles.id"), nullable=False, index=True),
        sa.Column("product_id", sa.String(36), sa.ForeignKey("products.id"), nullable=True, index=True),
        sa.Column("project_name", sa.String(500), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("destination_country", sa.String(255), nullable=True),
        sa.Column("destination_country_code", sa.String(3), nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="CREATED", index=True),
        sa.Column("current_step", sa.String(50), nullable=False, server_default="MSME_PROFILE"),
        sa.Column("overall_confidence", sa.Float, nullable=True),
        sa.Column("user_query", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
    )

    # ── Project Steps ────────────────────────────────────
    op.create_table(
        "project_steps",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("export_projects.id"), nullable=False, index=True),
        sa.Column("step_name", sa.String(50), nullable=False),
        sa.Column("step_order", sa.Integer, nullable=False),
        sa.Column("status", sa.String(30), nullable=False, server_default="PENDING"),
        sa.Column("result_summary", sa.Text, nullable=True),
        sa.Column("result_data", sa.Text, nullable=True),
        sa.Column("confidence", sa.Float, nullable=True),
        sa.Column("agent_run_id", sa.String(36), nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Project Documents ────────────────────────────────
    op.create_table(
        "project_documents",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("export_projects.id"), nullable=False, index=True),
        sa.Column("document_name", sa.String(500), nullable=False),
        sa.Column("document_type", sa.String(100), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="REQUIRED"),
        sa.Column("issuing_authority", sa.String(500), nullable=True),
        sa.Column("regulatory_reference", sa.Text, nullable=True),
        sa.Column("is_mandatory", sa.Boolean, server_default="true"),
        sa.Column("ai_recommended", sa.Boolean, server_default="false"),
        sa.Column("agent_run_id", sa.String(36), nullable=True),
        sa.Column("confidence", sa.Float, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Project Compliance ───────────────────────────────
    op.create_table(
        "project_compliance",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("export_projects.id"), nullable=False, index=True),
        sa.Column("requirement_name", sa.String(500), nullable=False),
        sa.Column("requirement_type", sa.String(100), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="PENDING_REVIEW"),
        sa.Column("regulatory_body", sa.String(500), nullable=True),
        sa.Column("regulation_reference", sa.Text, nullable=True),
        sa.Column("country_specific", sa.String(255), nullable=True),
        sa.Column("is_mandatory", sa.Boolean, server_default="true"),
        sa.Column("ai_assessment", sa.Text, nullable=True),
        sa.Column("confidence", sa.Float, nullable=True),
        sa.Column("agent_run_id", sa.String(36), nullable=True),
        sa.Column("evidence_status", sa.String(30), nullable=False, server_default="PENDING_REVIEW"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Project Certifications ───────────────────────────
    op.create_table(
        "project_certifications",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("export_projects.id"), nullable=False, index=True),
        sa.Column("certification_name", sa.String(500), nullable=False),
        sa.Column("certification_type", sa.String(100), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("status", sa.String(30), nullable=False, server_default="REQUIRED"),
        sa.Column("issuing_body", sa.String(500), nullable=True),
        sa.Column("validity_period", sa.String(100), nullable=True),
        sa.Column("estimated_cost", sa.String(100), nullable=True),
        sa.Column("estimated_time", sa.String(100), nullable=True),
        sa.Column("application_process", sa.Text, nullable=True),
        sa.Column("is_mandatory", sa.Boolean, server_default="true"),
        sa.Column("country_specific", sa.String(255), nullable=True),
        sa.Column("ai_recommended", sa.Boolean, server_default="false"),
        sa.Column("confidence", sa.Float, nullable=True),
        sa.Column("agent_run_id", sa.String(36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Market Analysis ──────────────────────────────────
    op.create_table(
        "market_analysis",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("export_projects.id"), nullable=False, index=True),
        sa.Column("target_country", sa.String(255), nullable=False),
        sa.Column("target_country_code", sa.String(3), nullable=True),
        sa.Column("market_size_usd", sa.String(100), nullable=True),
        sa.Column("growth_rate", sa.String(50), nullable=True),
        sa.Column("market_potential", sa.String(50), nullable=True),
        sa.Column("import_duty_rate", sa.String(50), nullable=True),
        sa.Column("trade_agreements", sa.Text, nullable=True),
        sa.Column("tariff_details", sa.Text, nullable=True),
        sa.Column("non_tariff_barriers", sa.Text, nullable=True),
        sa.Column("key_competitors", sa.Text, nullable=True),
        sa.Column("market_entry_strategy", sa.Text, nullable=True),
        sa.Column("ai_analysis", sa.Text, nullable=True),
        sa.Column("confidence", sa.Float, nullable=True),
        sa.Column("agent_run_id", sa.String(36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Project Risks ────────────────────────────────────
    op.create_table(
        "project_risks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("export_projects.id"), nullable=False, index=True),
        sa.Column("risk_title", sa.String(500), nullable=False),
        sa.Column("risk_category", sa.String(50), nullable=False),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("risk_level", sa.String(20), nullable=False, server_default="UNKNOWN"),
        sa.Column("probability", sa.Float, nullable=True),
        sa.Column("impact", sa.Float, nullable=True),
        sa.Column("risk_score", sa.Float, nullable=True),
        sa.Column("mitigation_strategy", sa.Text, nullable=True),
        sa.Column("contingency_plan", sa.Text, nullable=True),
        sa.Column("confidence", sa.Float, nullable=True),
        sa.Column("agent_run_id", sa.String(36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Export Plans ──────────────────────────────────────
    op.create_table(
        "export_plans",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("export_projects.id"), nullable=False, index=True),
        sa.Column("plan_title", sa.String(500), nullable=False),
        sa.Column("phase_a_readiness", sa.Text, nullable=True),
        sa.Column("phase_b_hs_classification", sa.Text, nullable=True),
        sa.Column("phase_c_compliance", sa.Text, nullable=True),
        sa.Column("phase_d_documents", sa.Text, nullable=True),
        sa.Column("phase_e_certifications", sa.Text, nullable=True),
        sa.Column("phase_f_destination_market", sa.Text, nullable=True),
        sa.Column("phase_g_risk_mitigation", sa.Text, nullable=True),
        sa.Column("phase_h_execution_checklist", sa.Text, nullable=True),
        sa.Column("confidence", sa.Float, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Agent Runs ────────────────────────────────────────
    op.create_table(
        "agent_runs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("export_projects.id"), nullable=False, index=True),
        sa.Column("request_id", sa.String(36), nullable=False, index=True),
        sa.Column("agent_type", sa.String(50), nullable=False),
        sa.Column("agent_name", sa.String(255), nullable=True),
        sa.Column("workflow_step", sa.String(50), nullable=True),
        sa.Column("status", sa.String(20), nullable=False, server_default="QUEUED"),
        sa.Column("input_data", sa.Text, nullable=True),
        sa.Column("output_data", sa.Text, nullable=True),
        sa.Column("confidence", sa.Float, nullable=True),
        sa.Column("total_tokens", sa.Integer, nullable=True),
        sa.Column("duration_ms", sa.Integer, nullable=True),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column("started_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("completed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Agent Events ─────────────────────────────────────
    op.create_table(
        "agent_events",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("agent_run_id", sa.String(36), sa.ForeignKey("agent_runs.id"), nullable=False, index=True),
        sa.Column("event_type", sa.String(30), nullable=False),
        sa.Column("event_order", sa.Integer, nullable=False, server_default="0"),
        sa.Column("request_id", sa.String(36), nullable=False),
        sa.Column("project_id", sa.String(36), nullable=False),
        sa.Column("agent", sa.String(100), nullable=True),
        sa.Column("status", sa.String(30), nullable=True),
        sa.Column("partial_output", sa.Text, nullable=True),
        sa.Column("confidence", sa.Float, nullable=True),
        sa.Column("sources", sa.Text, nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Citations ─────────────────────────────────────────
    op.create_table(
        "citations",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("project_id", sa.String(36), sa.ForeignKey("export_projects.id"), nullable=False, index=True),
        sa.Column("source_id", sa.String(36), nullable=True, index=True),
        sa.Column("chunk_id", sa.String(36), nullable=True),
        sa.Column("source_title", sa.String(500), nullable=True),
        sa.Column("source_type", sa.String(100), nullable=True),
        sa.Column("source_url", sa.Text, nullable=True),
        sa.Column("excerpt", sa.Text, nullable=True),
        sa.Column("page_number", sa.String(20), nullable=True),
        sa.Column("agent_run_id", sa.String(36), nullable=True),
        sa.Column("workflow_step", sa.String(50), nullable=True),
        sa.Column("relevance_score", sa.Float, nullable=True),
        sa.Column("is_verified", sa.Boolean, server_default="false"),
        sa.Column("verified_by", sa.String(36), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # ── Audit Logs ────────────────────────────────────────
    op.create_table(
        "audit_logs",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("user_id", sa.String(36), sa.ForeignKey("users.id"), nullable=True, index=True),
        sa.Column("project_id", sa.String(36), nullable=True, index=True),
        sa.Column("action", sa.String(50), nullable=False, index=True),
        sa.Column("resource_type", sa.String(100), nullable=True),
        sa.Column("resource_id", sa.String(36), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("request_data", sa.Text, nullable=True),
        sa.Column("response_summary", sa.Text, nullable=True),
        sa.Column("ip_address", sa.String(45), nullable=True),
        sa.Column("user_agent", sa.String(500), nullable=True),
        sa.Column("timestamp", sa.DateTime(timezone=True), server_default=sa.func.now(), index=True),
    )


def downgrade() -> None:
    op.drop_table("audit_logs")
    op.drop_table("citations")
    op.drop_table("agent_events")
    op.drop_table("agent_runs")
    op.drop_table("export_plans")
    op.drop_table("project_risks")
    op.drop_table("market_analysis")
    op.drop_table("project_certifications")
    op.drop_table("project_compliance")
    op.drop_table("project_documents")
    op.drop_table("project_steps")
    op.drop_table("export_projects")
    op.drop_table("countries")
    op.drop_table("products")
    op.drop_table("businesses")
    op.drop_table("msme_profiles")
    op.drop_table("users")

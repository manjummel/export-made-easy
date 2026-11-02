# ============================================================
# ExportEase AI - API v1 Router
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Central router aggregating all v1 API endpoints.
"""

from fastapi import APIRouter

from app.api.v1.auth import router as auth_router
from app.api.v1.users import router as users_router
from app.api.v1.msme_profiles import router as msme_router
from app.api.v1.businesses import router as businesses_router
from app.api.v1.products import router as products_router
from app.api.v1.projects import router as projects_router
from app.api.v1.workflow import router as workflow_router
from app.api.v1.ai import router as ai_router
from app.api.v1.health import router as health_router
from app.api.v1.audit import router as audit_router
from app.api.v1.hs import router as hs_router
from app.api.v1.compliance import router as compliance_router
from app.api.v1.documents import router as documents_router
from app.api.v1.certifications import router as certifications_router
from app.api.v1.risks import router as risks_router
from app.api.v1.market_analysis import router as market_analysis_router
from app.api.v1.export_plans import router as export_plans_router
from app.api.v1.synthetic_data import router as synthetic_data_router


api_router = APIRouter()

api_router.include_router(export_plans_router, prefix="/export-plan", tags=["Export Plan Engine"])
api_router.include_router(market_analysis_router, prefix="/market", tags=["Market Analysis Engine"])
api_router.include_router(risks_router, prefix="/risk", tags=["Risk Engine"])
api_router.include_router(certifications_router, prefix="/certifications", tags=["Certifications Engine"])
api_router.include_router(documents_router, prefix="/documents", tags=["Documents Engine"])
from app.api.v1.chat import router as chat_router
api_router.include_router(chat_router, tags=["AI Chat / Orchestration"])
api_router.include_router(auth_router, prefix="/auth", tags=["Authentication"])
api_router.include_router(users_router, prefix="/users", tags=["Users"])
api_router.include_router(msme_router, prefix="/msme-profiles", tags=["MSME Profiles"])
api_router.include_router(businesses_router, prefix="/businesses", tags=["Businesses"])
api_router.include_router(products_router, prefix="/products", tags=["Products"])
api_router.include_router(projects_router, prefix="/projects", tags=["Export Projects"])
api_router.include_router(workflow_router, prefix="/workflow", tags=["Workflow Engine"])
api_router.include_router(ai_router, prefix="/ai", tags=["AI Integration"])
api_router.include_router(hs_router, prefix="/hs", tags=["HS Classification"])
api_router.include_router(compliance_router, prefix="/compliance", tags=["Compliance Engine"])
api_router.include_router(health_router, tags=["Health & System"])
api_router.include_router(audit_router, prefix="/audit", tags=["Audit Logs"])
api_router.include_router(synthetic_data_router, prefix="/synthetic-data", tags=["Synthetic Data Gen"])

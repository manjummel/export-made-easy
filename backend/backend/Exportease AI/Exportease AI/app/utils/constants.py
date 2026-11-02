# ============================================================
# ExportEase AI - Global Constants & Enumerations
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Canonical status values, workflow steps, roles, and WebSocket event types.
These MUST stay in sync with the shared contracts repository.
"""

from enum import Enum


# ── User Roles ────────────────────────────────────────────────
class UserRole(str, Enum):
    MSME_USER = "MSME_USER"
    REVIEWER = "REVIEWER"
    ADMIN = "ADMIN"


# ── Project Status ────────────────────────────────────────────
class ProjectStatus(str, Enum):
    DRAFT = "DRAFT"
    ANALYZING = "ANALYZING"
    IN_PROGRESS = "IN_PROGRESS"
    REVIEW_REQUIRED = "REVIEW_REQUIRED"
    AWAITING_INPUT = "AWAITING_INPUT"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    ARCHIVED = "ARCHIVED"


# ── Workflow Steps (canonical order) ──────────────────────────
class WorkflowStep(str, Enum):
    MSME_PROFILE = "MSME_PROFILE"
    PRODUCT = "PRODUCT"
    HS_CLASSIFICATION = "HS_CLASSIFICATION"
    EXPORT_ELIGIBILITY = "EXPORT_ELIGIBILITY"
    COMPLIANCE = "COMPLIANCE"
    DOCUMENTS = "DOCUMENTS"
    CERTIFICATIONS = "CERTIFICATIONS"
    DESTINATION_MARKET = "DESTINATION_MARKET"
    RISK = "RISK"
    EXPORT_PLAN = "EXPORT_PLAN"


# Ordered list for workflow engine
WORKFLOW_ORDER = [
    WorkflowStep.MSME_PROFILE,
    WorkflowStep.PRODUCT,
    WorkflowStep.HS_CLASSIFICATION,
    WorkflowStep.EXPORT_ELIGIBILITY,
    WorkflowStep.COMPLIANCE,
    WorkflowStep.DOCUMENTS,
    WorkflowStep.CERTIFICATIONS,
    WorkflowStep.DESTINATION_MARKET,
    WorkflowStep.RISK,
    WorkflowStep.EXPORT_PLAN,
]


# ── Step Status ───────────────────────────────────────────────
class StepStatus(str, Enum):
    PENDING = "PENDING"
    IN_PROGRESS = "IN_PROGRESS"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    SKIPPED = "SKIPPED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    AWAITING_INPUT = "AWAITING_INPUT"


# ── Agent Run Status ──────────────────────────────────────────
class AgentRunStatus(str, Enum):
    QUEUED = "QUEUED"
    RUNNING = "RUNNING"
    COMPLETED = "COMPLETED"
    FAILED = "FAILED"
    TIMED_OUT = "TIMED_OUT"
    CANCELLED = "CANCELLED"


# ── WebSocket Event Types ────────────────────────────────────
class WSEventType(str, Enum):
    REQUEST_RECEIVED = "REQUEST_RECEIVED"
    AGENT_STARTED = "AGENT_STARTED"
    SOURCE_RETRIEVED = "SOURCE_RETRIEVED"
    AGENT_PROCESSING = "AGENT_PROCESSING"
    AGENT_COMPLETED = "AGENT_COMPLETED"
    AGENT_FAILED = "AGENT_FAILED"
    WARNING = "WARNING"
    FINAL_RESULT = "FINAL_RESULT"


# ── Compliance Status ─────────────────────────────────────────
class ComplianceStatus(str, Enum):
    COMPLIANT = "COMPLIANT"
    NON_COMPLIANT = "NON_COMPLIANT"
    PARTIALLY_COMPLIANT = "PARTIALLY_COMPLIANT"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"
    PENDING_REVIEW = "PENDING_REVIEW"


# ── Document Status ──────────────────────────────────────────
class DocumentStatus(str, Enum):
    REQUIRED = "REQUIRED"
    OPTIONAL = "OPTIONAL"
    SUBMITTED = "SUBMITTED"
    VERIFIED = "VERIFIED"
    REJECTED = "REJECTED"
    NOT_APPLICABLE = "NOT_APPLICABLE"


# ── Certification Status ─────────────────────────────────────
class CertificationStatus(str, Enum):
    REQUIRED = "REQUIRED"
    IN_PROGRESS = "IN_PROGRESS"
    OBTAINED = "OBTAINED"
    EXPIRED = "EXPIRED"
    NOT_REQUIRED = "NOT_REQUIRED"
    INSUFFICIENT_EVIDENCE = "INSUFFICIENT_EVIDENCE"


# ── Risk Level ────────────────────────────────────────────────
class RiskLevel(str, Enum):
    LOW = "LOW"
    MEDIUM = "MEDIUM"
    HIGH = "HIGH"
    CRITICAL = "CRITICAL"
    UNKNOWN = "UNKNOWN"


# ── Risk Category ─────────────────────────────────────────────
class RiskCategory(str, Enum):
    REGULATORY = "REGULATORY"
    MARKET = "MARKET"
    FINANCIAL = "FINANCIAL"
    LOGISTICS = "LOGISTICS"
    POLITICAL = "POLITICAL"
    QUALITY = "QUALITY"
    LEGAL = "LEGAL"


# ── Audit Action Types ───────────────────────────────────────
class AuditAction(str, Enum):
    CREATE = "CREATE"
    UPDATE = "UPDATE"
    DELETE = "DELETE"
    LOGIN = "LOGIN"
    LOGOUT = "LOGOUT"
    AI_REQUEST = "AI_REQUEST"
    AI_RESPONSE = "AI_RESPONSE"
    WORKFLOW_ADVANCE = "WORKFLOW_ADVANCE"
    EXPORT = "EXPORT"


# ── API Version ───────────────────────────────────────────────
API_VERSION = "v1"
API_PREFIX = f"/api/{API_VERSION}"

# ── System IDs ────────────────────────────────────────────────
SYSTEM_3_ID = "EXPORT-EASE-BACKEND-V1"
SYSTEM_1_ID = "EXPORT-EASE-AI-ENGINE-V1"
SYSTEM_2_ID = "EXPORT-EASE-KNOWLEDGE-V1"
SYSTEM_4_ID = "EXPORT-EASE-FRONTEND-V1"

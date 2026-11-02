# ============================================================
# ExportEase AI - Validators & Helpers
# EXPORT-EASE-BACKEND-V1
# ============================================================
"""
Common validation helpers and utility functions.
"""

from __future__ import annotations

import re
import uuid
from datetime import datetime, timezone


def generate_uuid() -> str:
    """Generate a UUID-compatible string identifier."""
    return str(uuid.uuid4())


def utc_now() -> datetime:
    """Return current UTC timestamp."""
    return datetime.now(timezone.utc)


def utc_now_iso() -> str:
    """Return current UTC timestamp as ISO 8601 string."""
    return utc_now().isoformat()


def validate_email(email: str) -> bool:
    """Basic email validation."""
    pattern = r"^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$"
    return bool(re.match(pattern, email))


def validate_gstin(gstin: str) -> bool:
    """Validate Indian GSTIN format (15 alphanumeric characters)."""
    pattern = r"^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$"
    return bool(re.match(pattern, gstin.upper()))


def validate_hs_code(hs_code: str) -> bool:
    """Validate HS code format (4-10 digits, optionally with dots)."""
    cleaned = hs_code.replace(".", "").replace(" ", "")
    return bool(re.match(r"^\d{4,10}$", cleaned))


def validate_iec_code(iec: str) -> bool:
    """Validate Import Export Code (10-digit alphanumeric)."""
    return bool(re.match(r"^[A-Z0-9]{10}$", iec.upper()))


def sanitize_string(value: str, max_length: int = 500) -> str:
    """Sanitize and truncate a string input."""
    if not value:
        return ""
    return value.strip()[:max_length]


def mask_sensitive(value: str, visible_chars: int = 4) -> str:
    """Mask sensitive data, showing only last N characters."""
    if not value or len(value) <= visible_chars:
        return "****"
    return "*" * (len(value) - visible_chars) + value[-visible_chars:]

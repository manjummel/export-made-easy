"""
ExportEase AI — Export Document OCR & Cross-Verification Engine
"""

import io
import re
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

try:
    from pypdf import PdfReader
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

try:
    from PIL import Image
    import pytesseract
    OCR_AVAILABLE = True
except ImportError:
    OCR_AVAILABLE = False

DOC_TYPES = [
    "commercial_invoice",
    "packing_list",
    "purchase_order",
    "bill_of_lading",
    "certificate_of_origin",
]

DOC_TYPE_LABELS = {
    "commercial_invoice": "Commercial Invoice",
    "packing_list": "Packing List",
    "purchase_order": "Purchase Order",
    "bill_of_lading": "Bill of Lading",
    "certificate_of_origin": "Certificate of Origin",
}

def extract_raw_text(file_bytes: bytes, filename: str) -> str:
    ext = os.path.splitext(filename.lower())[1]
    text = ""
    if ext == ".pdf":
        if PYPDF_AVAILABLE:
            try:
                reader = PdfReader(io.BytesIO(file_bytes))
                for page in reader.pages:
                    page_text = page.extract_text()
                    if page_text:
                        text += page_text + "\n"
            except Exception as e:
                text = f"[PDF Read Error: {e}]"
        else:
            try:
                text = file_bytes.decode("utf-8", errors="ignore")
            except Exception:
                text = ""
    elif ext in [".png", ".jpg", ".jpeg"]:
        if OCR_AVAILABLE:
            try:
                image = Image.open(io.BytesIO(file_bytes))
                text = pytesseract.image_to_string(image)
            except Exception as e:
                text = f"[OCR Processing Note: OCR engine not configured on system: {e}]"
        else:
            text = f"[OCR Note: PIL/pytesseract library not available]"
    return text.strip()

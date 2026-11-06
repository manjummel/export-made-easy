"""
ExportEase AI — Export Document OCR & Cross-Verification Engine
Supports: Commercial Invoice, Packing List, Purchase Order, Bill of Lading, Certificate of Origin.
Formats: PDF, PNG, JPG, JPEG.
"""

import io
import re
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

# Optional PDF parsing
try:
    from pypdf import PdfReader
    PYPDF_AVAILABLE = True
except ImportError:
    PYPDF_AVAILABLE = False

# Optional OCR parsing
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
    """Extract raw text from PDF or Image file bytes."""
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
            # Fallback simple string search in binary
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


def parse_export_fields(raw_text: str, filename: str, doc_type_hint: Optional[str] = None) -> Dict[str, Any]:
    """
    Parse structured export fields from raw text using regex heuristics.
    Extracts:
      - exporter_name
      - importer_name
      - invoice_number
      - invoice_date
      - product_description
      - hs_code
      - quantity
      - unit
      - gross_weight
      - net_weight
      - total_amount
      - currency
      - port_of_loading
      - port_of_discharge
    """
    t = raw_text

    # 1. Invoice / Document Reference Number
    inv_patterns = [
        r"(?:invoice\s*(?:no|num|number|#)?[:\s\-]+)([A-Z0-9\-\/]+)",
        r"(?:inv\s*(?:no|num|number|#)?[:\s\-]+)([A-Z0-9\-\/]+)",
        r"(?:b/?l\s*(?:no|num|number|#)?[:\s\-]+)([A-Z0-9\-\/]+)",
        r"(?:p\.?o\.?\s*(?:no|num|number|#)?[:\s\-]+)([A-Z0-9\-\/]+)",
        r"(?:coo\s*(?:no|num|number|#)?[:\s\-]+)([A-Z0-9\-\/]+)",
        r"(?:certificate\s*(?:no|num|number|#)?[:\s\-]+)([A-Z0-9\-\/]+)",
    ]
    invoice_number = None
    for p in inv_patterns:
        m = re.search(p, t, re.IGNORECASE)
        if m:
            invoice_number = m.group(1).strip()
            break

    # 2. Document Date
    date_patterns = [
        r"(?:date|dated)[:\s\-]+(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})",
        r"(?:date|dated)[:\s\-]+(\d{4}[\/\-\.]\d{1,2}[\/\-\.]\d{1,2})",
        r"(?:date|dated)[:\s\-]+([0-9]{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*[\s,]+\d{2,4})",
    ]
    invoice_date = None
    for p in date_patterns:
        m = re.search(p, t, re.IGNORECASE)
        if m:
            invoice_date = m.group(1).strip()
            break

    # 3. HS Code (4, 6 or 8 digits e.g. 5208.32.00 or 1006.30.10)
    hs_patterns = [
        r"(?:hs\s*code|itc[\-\s]*hs|tariff\s*code|commodity\s*code)[:\s\-]+(\d{4}(?:\.\d{2}(?:\.\d{2})?|\d{2,4}))",
        r"\b(\d{4}\.\d{2}(?:\.\d{2})?)\b",
    ]
    hs_code = None
    for p in hs_patterns:
        m = re.search(p, t, re.IGNORECASE)
        if m:
            hs_code = m.group(1).strip()
            break

    # 4. Exporter / Shipper Name
    exp_patterns = [
        r"(?:exporter|shipper|seller|consignor|from)[:\s\-]+([^\n\r,]+(?:ltd|pvt|inc|corp|co\.|llc|exports)?)",
        r"(?:m/s\.?|messrs\.?)\s+([A-Za-z0-9\s\.\&]+(?:ltd|pvt|private|limited|llc|exports)?)",
    ]
    exporter_name = None
    for p in exp_patterns:
        m = re.search(p, t, re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            if len(val) > 3 and not val.lower().startswith("name"):
                exporter_name = val
                break

    # 5. Importer / Consignee Name
    imp_patterns = [
        r"(?:importer|consignee|buyer|bill\s*to|to)[:\s\-]+([^\n\r,]+(?:ltd|pvt|inc|corp|co\.|llc|se|gmbh)?)",
    ]
    importer_name = None
    for p in imp_patterns:
        m = re.search(p, t, re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            if len(val) > 3 and not val.lower().startswith("name"):
                importer_name = val
                break

    # 6. Product Description
    desc_patterns = [
        r"(?:product|description\s*of\s*goods|item\s*description|description|goods)[:\s\-]+([^\n\r]+)",
    ]
    product_description = None
    for p in desc_patterns:
        m = re.search(p, t, re.IGNORECASE)
        if m:
            val = m.group(1).strip()
            if len(val) > 3 and not val.lower().startswith("goods"):
                product_description = val
                break

    # 7. Quantity & Unit
    qty_patterns = [
        r"(?:quantity|qty|total\s*quantity)[:\s\-]+([\d,]+(?:\.\d+)?)\s*([a-zA-Z]+)?",
        r"\b([\d,]+(?:\.\d+)?)\s*(pcs|pieces|kg|kgs|mt|metric\s*tonnes|units|boxes|cartons|bags|bales)\b",
    ]
    quantity = None
    unit = "PCS"
    for p in qty_patterns:
        m = re.search(p, t, re.IGNORECASE)
        if m:
            try:
                quantity = float(m.group(1).replace(",", ""))
                if m.group(2):
                    unit = m.group(2).strip().upper()
                break
            except Exception:
                pass

    # 8. Gross and Net Weights
    gw_match = re.search(r"(?:gross\s*weight|g\.?w\.?)[:\s\-]+([\d,]+(?:\.\d+)?)\s*(?:kg|kgs|mt)?", t, re.IGNORECASE)
    gross_weight = None
    if gw_match:
        try:
            gross_weight = float(gw_match.group(1).replace(",", ""))
        except Exception:
            pass

    nw_match = re.search(r"(?:net\s*weight|n\.?w\.?)[:\s\-]+([\d,]+(?:\.\d+)?)\s*(?:kg|kgs|mt)?", t, re.IGNORECASE)
    net_weight = None
    if nw_match:
        try:
            net_weight = float(nw_match.group(1).replace(",", ""))
        except Exception:
            pass

    # 9. Total Amount & Currency
    amt_match = re.search(r"(?:total\s*amount|invoice\s*value|total|fob\s*value|cif\s*value)[:\s\-]+([A-Z]{3}|\$|€|£|₹)?\s*([\d,]+(?:\.\d+)?)", t, re.IGNORECASE)
    total_amount = None
    currency = "USD"
    if amt_match:
        curr_raw = amt_match.group(1)
        if curr_raw:
            curr_raw = curr_raw.strip()
            if curr_raw == "$": currency = "USD"
            elif curr_raw == "€": currency = "EUR"
            elif curr_raw == "₹": currency = "INR"
            elif curr_raw == "£": currency = "GBP"
            else: currency = curr_raw.upper()
        try:
            total_amount = float(amt_match.group(2).replace(",", ""))
        except Exception:
            pass

    # 10. Ports (POL / POD)
    pol_match = re.search(r"(?:port\s*of\s*loading|loading\s*port|pol)[:\s\-]+([^\n\r,]+)", t, re.IGNORECASE)
    port_of_loading = pol_match.group(1).strip() if pol_match else None

    pod_match = re.search(r"(?:port\s*of\s*discharge|discharge\s*port|pod|destination\s*port)[:\s\-]+([^\n\r,]+)", t, re.IGNORECASE)
    port_of_discharge = pod_match.group(1).strip() if pod_match else None

    # Determine / infer doc_type
    doc_type = doc_type_hint or infer_doc_type(raw_text, filename)

    # Calculate extraction confidence
    populated_fields = [exporter_name, importer_name, invoice_number, invoice_date, product_description, hs_code, quantity]
    score = int((sum(1 for f in populated_fields if f is not None) / len(populated_fields)) * 100)
    confidence = max(40, min(100, score))

    return {
        "filename": filename,
        "document_type": doc_type,
        "document_label": DOC_TYPE_LABELS.get(doc_type, doc_type.replace("_", " ").title()),
        "raw_text_snippet": raw_text[:300] if raw_text else "",
        "confidence": confidence,
        "fields": {
            "exporter_name": exporter_name,
            "importer_name": importer_name,
            "invoice_number": invoice_number,
            "invoice_date": invoice_date,
            "product_description": product_description,
            "hs_code": hs_code,
            "quantity": quantity,
            "unit": unit,
            "gross_weight": gross_weight,
            "net_weight": net_weight,
            "total_amount": total_amount,
            "currency": currency,
            "port_of_loading": port_of_loading,
            "port_of_discharge": port_of_discharge,
        }
    }


def infer_doc_type(text: str, filename: str) -> str:
    """Infer document type from text and filename signals."""
    combined = (filename + " " + text).lower()
    if any(k in combined for k in ["bill of lading", "ocean bill", "bl ", "b/l", "waybill", "seaway"]):
        return "bill_of_lading"
    if any(k in combined for k in ["packing list", "package list", "weight list"]):
        return "packing_list"
    if any(k in combined for k in ["certificate of origin", "coo", "form a", "rex", "rules of origin"]):
        return "certificate_of_origin"
    if any(k in combined for k in ["purchase order", "po #", "p.o.", "order confirmation"]):
        return "purchase_order"
    return "commercial_invoice"



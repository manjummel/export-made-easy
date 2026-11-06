"""
ExportEase AI — Export Document OCR & Cross-Verification Engine
"""

import io
import re
import os
from typing import Dict, Any, List, Optional
from datetime import datetime

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

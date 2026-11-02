"""
ExportEase AI — MCP Tools Module
Defines structured tools using the MCP (Model Context Protocol) pattern.
Each tool is a Python function decorated and wrapped for LangChain tool-calling.
"""

import json
import os
from typing import Optional
from langchain.tools import tool

# ─────────────────────────────────────────────────────────────────────────────
# Tool 1: HS Code Finder
# ─────────────────────────────────────────────────────────────────────────────

@tool
def find_hs_code(product_description: str) -> str:
    """
    Find the most likely Harmonized System (HS) code for a product based on its description.
    Use this when the user asks about HS codes, tariff codes, or product classification for export/import.
    
    Args:
        product_description: A plain-language description of the product (e.g. 'basmati rice', 'leather shoes', 'cotton fabric')
    
    Returns:
        A JSON string with possible HS codes, their descriptions, and applicable duty rates.
    """
    # In production, this would query an HS code database or call a customs API.
    # Here we provide a structured lookup with common Indian export products.
    hs_database = {
        "rice": {
            "hs_code": "1006.30",
            "description": "Semi-milled or wholly milled rice",
            "basmati_code": "1006.30.10",
            "duty_rate": "0% (Agricultural export incentives may apply)",
            "regulation": "Export allowed. Minimum Export Price (MEP) conditions may apply.",
            "dgft_notification": "Refer DGFT Notification No. 44/2023",
        },
        "cotton": {
            "hs_code": "5208",
            "description": "Woven fabrics of cotton, <= 200 g/m²",
            "duty_rate": "0% Basic Customs Duty on export",
            "regulation": "No restriction. RODTEP scheme applicable.",
            "dgft_notification": "Refer DGFT Trade Notice 19/2023",
        },
        "leather": {
            "hs_code": "4107",
            "description": "Leather further prepared after tanning or crusting",
            "duty_rate": "0%",
            "regulation": "Finished leather: Free. Raw hides: Restricted.",
            "dgft_notification": "Refer FTP 2023 Chapter 4",
        },
        "spices": {
            "hs_code": "0910",
            "description": "Ginger, Saffron, Turmeric, Thyme, Bay leaves, Other spices",
            "duty_rate": "0% export duty",
            "regulation": "Permitted freely. Phytosanitary certificate required.",
            "dgft_notification": "Refer Spices Board of India guidelines",
        },
        "software": {
            "hs_code": "8524.31",
            "description": "Software — IT/ITES export services",
            "duty_rate": "N/A (Service export)",
            "regulation": "STPI/SEZ registration recommended. LUT filing required for GST.",
            "dgft_notification": "Refer FTP 2023 Services Chapter",
        },
        "jewelry": {
            "hs_code": "7113",
            "description": "Articles of jewelry and parts thereof, of precious metal",
            "duty_rate": "0% on export",
            "regulation": "Gold/Silver jewelry: Replenishment License may apply.",
            "dgft_notification": "Refer GJEPC guidelines",
        },
        "pharmaceutical": {
            "hs_code": "3004",
            "description": "Medicaments (pharmaceutical products)",
            "duty_rate": "0% export duty",
            "regulation": "CDSCO approval required. WHO-GMP certification needed.",
            "dgft_notification": "Refer Pharma Export Promotion Council",
        },
    }

    description_lower = product_description.lower()
    matched_key = None
    for key in hs_database:
        if key in description_lower:
            matched_key = key
            break

    if matched_key:
        result = hs_database[matched_key]
        return json.dumps({
            "status": "found",
            "product_query": product_description,
            "hs_code": result["hs_code"],
            "description": result["description"],
            "export_duty": result["duty_rate"],
            "regulation_note": result["regulation"],
            "reference": result["dgft_notification"],
            "disclaimer": "Always verify HS codes with a licensed customs broker or DGFT before shipping."
        }, indent=2)
    else:
        return json.dumps({
            "status": "not_found",
            "product_query": product_description,
            "message": (
                f"No pre-indexed HS code found for '{product_description}'. "
                "Please search https://www.icegate.gov.in or use the Customs Tariff portal at "
                "https://cbic.gov.in for an accurate HS code classification. "
                "You may also consult a licensed customs broker."
            ),
            "search_links": [
                "https://www.icegate.gov.in/Webappl/",
                "https://cbic.gov.in/resources//htdocs-cbec/customs/cst2022-23/cst2022-23.pdf"
            ]
        }, indent=2)


# ─────────────────────────────────────────────────────────────────────────────
# Tool 2: Country Compliance Checker
# ─────────────────────────────────────────────────────────────────────────────

@tool
def check_country_compliance(country: str, product: str) -> str:
    """
    Check export compliance requirements for a specific product being exported to a target country.
    Use this when the user asks about regulations, certifications, or requirements for exporting to a specific country.
    
    Args:
        country: The destination country name (e.g. 'USA', 'Germany', 'UAE', 'Bangladesh')
        product: The product being exported (e.g. 'spices', 'textiles', 'pharmaceuticals')
    
    Returns:
        A JSON string with compliance requirements, certifications, and regulatory notes.
    """
    compliance_db = {
        "usa": {
            "regulator": "FDA / USDA / CBP",
            "key_requirements": [
                "FDA Prior Notice for food items",
                "FSSAI certificate for food products",
                "Importer of Record (IOR) in USA required",
                "Certificate of Origin (preferably GSP Form A)",
                "Commercial Invoice & Packing List",
                "Shipper's Export Declaration",
            ],
            "prohibited_items": ["Narcotics", "Counterfeit goods", "Certain wood products"],
            "preferred_incoterms": "FOB or CIF",
            "tariff_scheme": "GSP (Generalized System of Preferences) — check eligibility",
            "avg_transit_days": "18–25 days (sea)",
            "useful_links": ["https://www.cbp.gov", "https://www.fda.gov/food/imports"],
        },
        "uae": {
            "regulator": "Dubai Customs / Federal Customs Authority",
            "key_requirements": [
                "Certificate of Origin (Form A or bilateral)",
                "Halal Certificate (for food/meat products)",
                "Commercial Invoice in English & Arabic",
                "ESMA approval for electronics",
                "Bill of Lading / Airway Bill",
            ],
            "prohibited_items": ["Pork products without special permit", "Alcohol (restricted)"],
            "preferred_incoterms": "CIF Jebel Ali",
            "tariff_scheme": "India–UAE CEPA (free trade) — 0% duty on many items",
            "avg_transit_days": "7–12 days (sea)",
            "useful_links": ["https://www.dubaicustoms.gov.ae", "https://cepa.commerce.gov.in"],
        },
        "germany": {
            "regulator": "European Commission / German Customs (Zoll)",
            "key_requirements": [
                "CE Marking (for electronics, machinery, toys)",
                "EUR.1 Movement Certificate or GSP Form A",
                "REACH compliance for chemicals",
                "Phytosanitary Certificate for plants/food",
                "EU Customs Declaration (SAD)",
            ],
            "prohibited_items": ["Products not meeting EU standards", "Certain pesticides"],
            "preferred_incoterms": "DAP or CIF Hamburg",
            "tariff_scheme": "EU GSP+ scheme — check eligibility",
            "avg_transit_days": "20–28 days (sea)",
            "useful_links": ["https://ec.europa.eu/taxation_customs", "https://www.zoll.de"],
        },
        "bangladesh": {
            "regulator": "NBR (National Board of Revenue) / BGMEA",
            "key_requirements": [
                "Certificate of Origin (Form A)",
                "Commercial Invoice",
                "Bill of Lading",
                "Packing List",
                "LC (Letter of Credit) — common for B2B",
            ],
            "prohibited_items": [],
            "preferred_incoterms": "FOB Chittagong",
            "tariff_scheme": "SAFTA preferential tariff — 0–5% duty",
            "avg_transit_days": "3–5 days (sea from Kolkata/Chennai)",
            "useful_links": ["https://www.nbr.gov.bd"],
        },
    }

    country_key = country.lower().strip()
    # Normalize some common names
    country_aliases = {"united states": "usa", "united arab emirates": "uae", "uk": "united kingdom"}
    country_key = country_aliases.get(country_key, country_key)

    if country_key in compliance_db:
        data = compliance_db[country_key]
        return json.dumps({
            "status": "found",
            "destination_country": country,
            "product": product,
            "regulatory_authority": data["regulator"],
            "key_requirements": data["key_requirements"],
            "prohibited_items": data["prohibited_items"],
            "recommended_incoterms": data["preferred_incoterms"],
            "trade_scheme": data["tariff_scheme"],
            "estimated_transit": data["avg_transit_days"],
            "useful_links": data["useful_links"],
            "disclaimer": "Requirements may change. Verify with DGFT and the destination country's customs authority."
        }, indent=2)
    else:
        return json.dumps({
            "status": "not_found",
            "destination_country": country,
            "message": (
                f"Detailed compliance data for '{country}' is not in our current database. "
                "General export requirements from India include: IEC registration, Certificate of Origin, "
                "Commercial Invoice, Packing List, Bill of Lading/Airway Bill, and Shipping Bill (filed via ICEGATE). "
                "Contact the relevant Export Promotion Council for product-specific guidance."
            ),
            "general_resources": [
                "https://www.dgft.gov.in",
                "https://www.icegate.gov.in",
                "https://www.exportpromotioncouncils.in"
            ]
        }, indent=2)


# ─────────────────────────────────────────────────────────────────────────────
# Tool 3: Export Pricing Calculator
# ─────────────────────────────────────────────────────────────────────────────

@tool
def calculate_export_price(
    fob_price_inr: float,
    freight_cost_inr: float,
    insurance_rate_percent: float,
    import_duty_percent: float,
    quantity: int
) -> str:
    """
    Calculate export pricing including FOB, CIF, landed cost, and profit margins.
    Use this when the user asks about pricing, costing, or landed cost calculations for export.
    
    Args:
        fob_price_inr: Free On Board price in Indian Rupees (per unit)
        freight_cost_inr: Total freight/shipping cost in INR
        insurance_rate_percent: Insurance rate as a percentage of CIF value (typically 0.5–2%)
        import_duty_percent: Import duty rate in the destination country (as a percentage)
        quantity: Number of units being exported (default: 1)
    
    Returns:
        A JSON string with detailed pricing breakdown.
    """
    try:
        # FOB Calculation
        total_fob = fob_price_inr * quantity

        # CIF Calculation
        # CIF = FOB + Freight + Insurance (on CIF value)
        # Insurance = rate% of CIF => CIF = (FOB + Freight) / (1 - insurance_rate/100)
        insurance_rate = insurance_rate_percent / 100
        cif_value = (total_fob + freight_cost_inr) / (1 - insurance_rate)
        insurance_cost = cif_value * insurance_rate

        # Landed Cost (what the buyer actually pays)
        import_duty_amount = cif_value * (import_duty_percent / 100)
        landed_cost = cif_value + import_duty_amount

        # Currency conversion (approximate — use live rates in production)
        usd_rate = 83.5
        eur_rate = 91.0
        aed_rate = 22.7

        return json.dumps({
            "status": "success",
            "quantity": quantity,
            "pricing_breakdown": {
                "ex_factory_per_unit_inr": round(fob_price_inr, 2),
                "total_fob_inr": round(total_fob, 2),
                "freight_cost_inr": round(freight_cost_inr, 2),
                "insurance_cost_inr": round(insurance_cost, 2),
                "cif_value_inr": round(cif_value, 2),
                "import_duty_amount_inr": round(import_duty_amount, 2),
                "total_landed_cost_inr": round(landed_cost, 2),
            },
            "currency_equivalents": {
                "cif_usd": round(cif_value / usd_rate, 2),
                "cif_eur": round(cif_value / eur_rate, 2),
                "cif_aed": round(cif_value / aed_rate, 2),
                "landed_usd": round(landed_cost / usd_rate, 2),
            },
            "notes": [
                "FOB = Free On Board (exporter's responsibility ends at port of loading)",
                "CIF = Cost, Insurance, Freight (includes delivery to destination port)",
                "Landed Cost = CIF + Import Duties at destination",
                "Currency rates are approximate. Use live rates for actual transactions.",
                "Consult a freight forwarder for accurate freight quotes.",
            ]
        }, indent=2)
    except Exception as e:
        return json.dumps({"status": "error", "message": str(e)})


# ─────────────────────────────────────────────────────────────────────────────
# Tool 4: Government Scheme Recommender
# ─────────────────────────────────────────────────────────────────────────────

@tool
def recommend_government_schemes(product_category: str, exporter_type: str) -> str:
    """
    Recommend relevant Indian government export promotion schemes for an exporter.
    Use this when the user asks about government support, incentives, subsidies, or schemes for exporters.
    
    Args:
        product_category: Category of product being exported (e.g. 'textiles', 'agriculture', 'pharma', 'handicrafts', 'IT services')
        exporter_type: Type of exporter — 'MSME', 'Large Enterprise', 'Startup', 'Women Entrepreneur' (default: 'MSME')
    
    Returns:
        A JSON string listing applicable government schemes with eligibility and application links.
    """
    all_schemes = {
        "general": [
            {
                "name": "RoDTEP (Remission of Duties and Taxes on Exported Products)",
                "benefit": "Refund of embedded taxes and duties not refunded under other schemes",
                "eligibility": "All exporters of goods",
                "authority": "DGFT",
                "apply_at": "https://www.dgft.gov.in",
            },
            {
                "name": "Advance Authorization Scheme",
                "benefit": "Duty-free import of inputs used in exported products",
                "eligibility": "Exporters with confirmed export orders",
                "authority": "DGFT",
                "apply_at": "https://www.dgft.gov.in",
            },
            {
                "name": "Export Credit Guarantee Corporation (ECGC) Cover",
                "benefit": "Insurance cover against payment default by foreign buyers",
                "eligibility": "All exporters",
                "authority": "ECGC",
                "apply_at": "https://www.ecgc.in",
            },
            {
                "name": "EPCG (Export Promotion Capital Goods) Scheme",
                "benefit": "0% customs duty on import of capital goods for export production",
                "eligibility": "Manufacturers and service providers",
                "authority": "DGFT",
                "apply_at": "https://www.dgft.gov.in",
            },
        ],
        "msme": [
            {
                "name": "MAI (Market Access Initiative) Scheme",
                "benefit": "Financial assistance for participation in international trade fairs & market studies",
                "eligibility": "MSMEs, Export Promotion Councils",
                "authority": "Ministry of Commerce",
                "apply_at": "https://www.commerce.gov.in",
            },
            {
                "name": "MSME Export Hub",
                "benefit": "Dedicated support for MSME exporters including trade data, buyer connects, and advisory",
                "eligibility": "Registered MSMEs",
                "authority": "Ministry of MSME",
                "apply_at": "https://msme.gov.in",
            },
        ],
        "textiles": [
            {
                "name": "SITP (Scheme for Integrated Textile Parks)",
                "benefit": "Infrastructure support for textile exporters",
                "eligibility": "Textile manufacturers",
                "authority": "Ministry of Textiles",
                "apply_at": "https://texmin.nic.in",
            },
            {
                "name": "TUFS (Technology Upgradation Fund Scheme)",
                "benefit": "Interest subsidy on technology upgradation loans",
                "eligibility": "Textile MSME units",
                "authority": "Ministry of Textiles",
                "apply_at": "https://texmin.nic.in",
            },
        ],
        "agriculture": [
            {
                "name": "APEDA Agricultural Export Scheme",
                "benefit": "Market development, infrastructure support, quality certification subsidies",
                "eligibility": "Agricultural product exporters registered with APEDA",
                "authority": "APEDA (Agricultural & Processed Food Products Export Development Authority)",
                "apply_at": "https://apeda.gov.in",
            },
        ],
        "pharma": [
            {
                "name": "Pharmaceutical Export Promotion Scheme (PHARMEXCIL)",
                "benefit": "Market development assistance, participation in international exhibitions",
                "eligibility": "Pharmaceutical manufacturers and exporters",
                "authority": "Pharmexcil / Ministry of Commerce",
                "apply_at": "https://pharmexcil.com",
            },
        ],
        "handicrafts": [
            {
                "name": "Export House Status (Handicrafts)",
                "benefit": "Priority treatment for export licenses, simplified procedures",
                "eligibility": "Handicrafts exporters with minimum FOB value",
                "authority": "EPCH (Export Promotion Council for Handicrafts)",
                "apply_at": "https://www.epch.in",
            },
        ],
        "it_services": [
            {
                "name": "STPI (Software Technology Parks of India)",
                "benefit": "Tax holidays, duty-free import of capital goods, single-window clearance",
                "eligibility": "IT/ITES companies",
                "authority": "STPI / Ministry of Electronics",
                "apply_at": "https://www.stpi.in",
            },
        ],
    }

    product_key = product_category.lower().strip()
    # Map common terms
    mapping = {
        "textile": "textiles", "clothing": "textiles", "garments": "textiles", "fabric": "textiles",
        "farm": "agriculture", "food": "agriculture", "agri": "agriculture", "crop": "agriculture",
        "medicine": "pharma", "drug": "pharma", "healthcare": "pharma",
        "craft": "handicrafts", "handmade": "handicrafts", "artisan": "handicrafts",
        "software": "it_services", "it": "it_services", "technology": "it_services", "ites": "it_services",
    }
    product_key = mapping.get(product_key, product_key)

    schemes = list(all_schemes["general"])  # Always include general schemes
    schemes += all_schemes.get(product_key, [])
    if exporter_type.upper() in ["MSME", "STARTUP", "WOMEN ENTREPRENEUR"]:
        schemes += all_schemes["msme"]

    # Deduplicate
    seen = set()
    unique_schemes = []
    for s in schemes:
        if s["name"] not in seen:
            seen.add(s["name"])
            unique_schemes.append(s)

    return json.dumps({
        "status": "success",
        "product_category": product_category,
        "exporter_type": exporter_type,
        "total_schemes_found": len(unique_schemes),
        "applicable_schemes": unique_schemes,
        "important_note": (
            "Register your IEC (Import Export Code) at https://www.dgft.gov.in before applying for any scheme. "
            "Also register as an MSME at https://udyamregistration.gov.in for MSME-specific benefits."
        )
    }, indent=2)


# ─────────────────────────────────────────────────────────────────────────────
# Tool 5: Export Document Generator
# ─────────────────────────────────────────────────────────────────────────────

@tool
def generate_export_document(doc_type: str, exporter_name: str, buyer_name: str,
                              product: str, quantity: str, unit_price: str,
                              destination_country: str) -> str:
    """
    Generate a template for a common export document.
    Use this when the user asks to create, draft, or generate an export document.
    
    Args:
        doc_type: Type of document — 'commercial_invoice', 'packing_list', 'certificate_of_origin', 'proforma_invoice', 'shipping_bill'
        exporter_name: Full name/company name of the exporter
        buyer_name: Full name/company name of the foreign buyer
        product: Product name and description
        quantity: Quantity being exported (e.g. '500 pieces', '2 MT')
        unit_price: Unit price (e.g. 'USD 15.00', 'INR 1250')
        destination_country: Destination country name
    
    Returns:
        A formatted document template as a string.
    """
    from datetime import datetime, date
    today = date.today().strftime("%d/%m/%Y")
    inv_no = f"EXP-{datetime.now().strftime('%Y%m%d%H%M')}"

    templates = {
        "commercial_invoice": f"""
================================================================================
                          COMMERCIAL INVOICE
================================================================================
Invoice No   : {inv_no}                    Date: {today}
--------------------------------------------------------------------------------
EXPORTER (SELLER):                    BUYER (CONSIGNEE):
{exporter_name}                       {buyer_name}
[Address]                             [Address]
[City, State, PIN]                    [{destination_country}]
GSTIN: [GSTIN]                        [Buyer Tax ID / VAT No.]
IEC No: [IEC Code]
--------------------------------------------------------------------------------
Terms of Delivery : CIF / FOB [Port of Loading]
Mode of Transport  : Sea / Air
Port of Loading    : [e.g. JNPT Mumbai / Mundra / Chennai]
Port of Discharge  : [Port in {destination_country}]
Country of Origin  : INDIA
Payment Terms      : [e.g. Advance / LC at sight / 30 days DA]
--------------------------------------------------------------------------------
 Sr | Description of Goods  | HS Code | Qty       | Unit Price | Total Amount
----|-----------------------|---------|-----------|------------|-------------
  1 | {product}             | [CODE]  | {quantity}| {unit_price}| [TOTAL]
--------------------------------------------------------------------------------
                                          Sub Total : [TOTAL]
                                          Freight   : [AMOUNT]
                                          Insurance : [AMOUNT]
                                          CIF Value : [TOTAL]
--------------------------------------------------------------------------------
Amount in Words: [AMOUNT IN WORDS]
Bank Details for Payment:
  Bank Name   : [Bank Name]
  Account No  : [Account Number]
  IFSC Code   : [IFSC]
  SWIFT Code  : [SWIFT BIC]
================================================================================
Declaration: We declare that this invoice shows the actual price of the goods
described and that all particulars are true and correct.

Authorized Signatory
For {exporter_name}
================================================================================
""",
        "packing_list": f"""
================================================================================
                           PACKING LIST
================================================================================
Packing List No : PL-{inv_no}               Date: {today}
Ref Invoice No  : {inv_no}
--------------------------------------------------------------------------------
EXPORTER: {exporter_name}
BUYER   : {buyer_name}, {destination_country}
--------------------------------------------------------------------------------
 Sr | Description | Qty        | Gross Wt | Net Wt | Dimensions | Package No
----|-------------|------------|----------|--------|------------|----------
  1 | {product}   | {quantity} | [kg]     | [kg]   | [L×W×H cm] | 1 to [N]
--------------------------------------------------------------------------------
Total Packages      : [NUMBER]
Total Gross Weight  : [KG] KGS
Total Net Weight    : [KG] KGS
Total Volume        : [CBM] CBM
Marks & Numbers     : [Shipping Marks]
================================================================================
Declaration: Contents as described above are true and correct.

Authorized Signatory
For {exporter_name}
================================================================================
""",
        "proforma_invoice": f"""
================================================================================
                         PROFORMA INVOICE
================================================================================
Proforma Invoice No : PI-{inv_no}            Date: {today}
Valid Until         : [DATE + 30 DAYS]
--------------------------------------------------------------------------------
FROM (EXPORTER):                      TO (BUYER):
{exporter_name}                       {buyer_name}
[Address, City, PIN]                  [{destination_country}]
Email: [EMAIL]                        Email: [BUYER EMAIL]
Phone: [PHONE]                        Phone: [BUYER PHONE]
--------------------------------------------------------------------------------
Product     : {product}
HS Code     : [HS CODE]
Quantity    : {quantity}
Unit Price  : {unit_price}
Total Value : [TOTAL]
Incoterms   : [FOB/CIF/EXW] [PORT]
Currency    : [USD/EUR/INR]
Origin      : INDIA
--------------------------------------------------------------------------------
Delivery    : [LEAD TIME, e.g. 30–45 days from order confirmation]
Payment     : [e.g. 30% advance, 70% against Bill of Lading]
Packaging   : [Description of packaging]
Validity    : This quotation is valid for 30 days.
================================================================================
Authorized Signatory
For {exporter_name}
================================================================================
""",
        "certificate_of_origin": f"""
================================================================================
              CERTIFICATE OF ORIGIN (Non-Preferential)
================================================================================
Certificate No : CO-{inv_no}               Date: {today}
--------------------------------------------------------------------------------
1. EXPORTER (Name & Address):
   {exporter_name}
   [Full Address, India]
   IEC: [IEC CODE]

2. CONSIGNEE (Name & Address):
   {buyer_name}
   [{destination_country}]

3. TRANSPORT DETAILS:
   Port of Loading  : [PORT], INDIA
   Port of Discharge: [PORT], {destination_country}
   Vessel/Flight No : [DETAILS]

4. GOODS DESCRIPTION:
   HS Code     : [HS CODE]
   Description : {product}
   Quantity    : {quantity}
   Invoice No  : {inv_no}   Date: {today}

5. COUNTRY OF ORIGIN: INDIA

6. DECLARATION:
   The undersigned hereby declares that the above details and statements are
   correct, that all the goods were produced or manufactured in India and
   that they comply with the origin requirements.

--------------------------------------------------------------------------------
Issuing Authority Stamp & Signature:        Exporter's Signature:
[Chamber of Commerce / DGFT]

[SEAL]                                       Authorized Signatory
                                             For {exporter_name}
================================================================================
NOTE: For preferential Certificate of Origin (Form A / EUR.1), apply at the
local Chamber of Commerce or DGFT Regional Authority.
================================================================================
""",
    }

    doc_key = doc_type.lower().replace(" ", "_")
    if doc_key in templates:
        return json.dumps({
            "status": "success",
            "document_type": doc_type,
            "document_content": templates[doc_key],
            "instructions": (
                "This is a template. Replace all [BRACKETED] fields with actual values. "
                "Have this document verified by a licensed custom house agent (CHA) before submission."
            )
        }, indent=2)
    else:
        available = list(templates.keys())
        return json.dumps({
            "status": "error",
            "message": f"Document type '{doc_type}' not recognized.",
            "available_document_types": available
        }, indent=2)


# ─────────────────────────────────────────────────────────────────────────────
# Tool 6: Market Discovery
# ─────────────────────────────────────────────────────────────────────────────

@tool
def discover_export_markets(product: str, current_markets: str) -> str:
    """
    Suggest the top target export markets for a given product based on trade data and trends.
    Use this when the user asks where to export, which countries to target, or market recommendations.
    
    Args:
        product: Product category being exported (e.g. 'spices', 'textiles', 'engineering goods', 'handicrafts')
        current_markets: Comma-separated list of countries already exporting to (optional, e.g. 'USA, UAE')
    
    Returns:
        A JSON string with top recommended markets, demand indicators, and entry tips.
    """
    market_intelligence = {
        "spices": {
            "top_markets": [
                {"country": "USA", "demand": "Very High", "value_usd_mn": 450, "tip": "FDA registration mandatory. Organic certification adds 30% premium."},
                {"country": "UAE", "demand": "High", "tip": "Re-export hub. Halal certification boosts market entry."},
                {"country": "UK", "demand": "High", "tip": "Post-Brexit UK-India FTA under discussion. High Indian diaspora demand."},
                {"country": "Germany", "demand": "Medium-High", "tip": "EU organic certification (EU-ECO) opens premium market."},
                {"country": "Japan", "demand": "Medium", "tip": "Strict quality and residue standards. JETRO assistance available."},
            ],
            "growth_trend": "Growing 12% YoY globally",
            "key_certifications": ["FSSAI", "APEDA", "Organic India", "SPICES BOARD"],
        },
        "textiles": {
            "top_markets": [
                {"country": "USA", "demand": "Very High", "tip": "Largest importer. Comply with CPSC safety standards."},
                {"country": "Germany", "demand": "High", "tip": "OEKO-TEX certification boosts demand significantly."},
                {"country": "UK", "demand": "High", "tip": "Strong demand for sustainable/ethical fashion."},
                {"country": "France", "demand": "Medium-High", "tip": "Luxury segment opportunity for premium Indian fabrics."},
                {"country": "Bangladesh", "demand": "High", "tip": "Yarn and fabric exports for their garment industry."},
            ],
            "growth_trend": "Growing 8% YoY post-COVID recovery",
            "key_certifications": ["OEKO-TEX", "GOTS (Organic)", "BCI (Better Cotton)", "APEO-free"],
        },
        "engineering goods": {
            "top_markets": [
                {"country": "USA", "demand": "Very High", "tip": "Auto components, machinery parts in high demand."},
                {"country": "Germany", "demand": "High", "tip": "Precision engineering parts, DIN standards compliance needed."},
                {"country": "UAE", "demand": "High", "tip": "Infrastructure boom drives demand for steel & fabricated metals."},
                {"country": "Australia", "demand": "Medium", "tip": "India-Australia FTA (ECTA) — zero duty on many engineering goods."},
                {"country": "Brazil", "demand": "Medium", "tip": "India-Mercosur PTA — preferential duty."},
            ],
            "growth_trend": "Growing 15% YoY — India's fastest growing export sector",
            "key_certifications": ["BIS", "ISO 9001", "CE Marking", "IATF (Auto)"],
        },
        "handicrafts": {
            "top_markets": [
                {"country": "USA", "demand": "Very High", "tip": "Ethnic decor in high demand. Amazon Global Selling opportunity."},
                {"country": "Germany", "demand": "High", "tip": "Fair trade and sustainable handicrafts premium segment."},
                {"country": "Australia", "demand": "Medium-High", "tip": "India-Australia ECTA — zero duty effective."},
                {"country": "Japan", "demand": "Medium", "tip": "Handmade premium products well-received. JETRO can assist."},
                {"country": "France", "demand": "Medium", "tip": "Indian art and luxury crafts segment growing."},
            ],
            "growth_trend": "Growing 10% YoY with e-commerce boost",
            "key_certifications": ["EPCH Registration", "GI Tag (if applicable)", "Fair Trade"],
        },
    }

    product_lower = product.lower().strip()
    mapping = {
        "spice": "spices", "masala": "spices", "herb": "spices",
        "textile": "textiles", "garment": "textiles", "clothing": "textiles", "fabric": "textiles",
        "engineering": "engineering goods", "machinery": "engineering goods", "auto parts": "engineering goods",
        "handicraft": "handicrafts", "craft": "handicrafts", "handmade": "handicrafts", "artisan": "handicrafts",
    }

    matched_key = mapping.get(product_lower, product_lower)
    data = market_intelligence.get(matched_key, None)

    if data:
        # Filter out already-served markets if provided
        existing = [m.strip().lower() for m in current_markets.split(",") if m.strip()]
        recommended = [m for m in data["top_markets"] if m["country"].lower() not in existing]

        return json.dumps({
            "status": "success",
            "product": product,
            "current_markets": current_markets or "None specified",
            "recommended_new_markets": recommended[:5],
            "market_growth_trend": data["growth_trend"],
            "key_certifications_to_get": data["key_certifications"],
            "next_steps": [
                "Register with the relevant Export Promotion Council (EPC) for your product",
                "Participate in India International Trade Fair (IITF) and trade exhibitions",
                "Use India Brand Equity Foundation (IBEF) for market research",
                "Connect with Indian Embassies/Trade Commissioners in target countries",
                "Explore Amazon Global Selling, Alibaba, and Global Linker for digital exports",
            ],
            "useful_resources": [
                "https://www.ibef.org",
                "https://www.dgft.gov.in",
                "https://commerce.gov.in/trade-data",
            ]
        }, indent=2)
    else:
        return json.dumps({
            "status": "partial",
            "product": product,
            "message": f"Specific market data for '{product}' is being expanded. General top export markets from India are: USA, UAE, Germany, UK, China, Bangladesh, Singapore, Australia.",
            "general_research_resources": [
                "https://www.ibef.org/exports",
                "https://tradestat.commerce.gov.in",
                "https://www.trademap.org"
            ]
        }, indent=2)


# ─────────────────────────────────────────────────────────────────────────────
# Export all tools as a list for easy registration
# ─────────────────────────────────────────────────────────────────────────────

EXPORTEASE_MCP_TOOLS = [
    find_hs_code,
    check_country_compliance,
    calculate_export_price,
    recommend_government_schemes,
    generate_export_document,
    discover_export_markets,
]


def get_tools_manifest() -> list:
    """Return a JSON-serializable manifest of all available MCP tools."""
    manifest = []
    for t in EXPORTEASE_MCP_TOOLS:
        manifest.append({
            "name": t.name,
            "description": t.description,
        })
    return manifest

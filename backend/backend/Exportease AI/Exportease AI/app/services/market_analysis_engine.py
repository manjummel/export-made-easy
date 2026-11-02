import json
import logging
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi import HTTPException
from app.schemas.market_analysis import MarketAnalysisRequest, MarketAnalysisResponse, Citation
from app.models.market_analysis import MarketAnalysis
from app.models.export_project import ExportProject
from app.dependencies import get_ai_client

logger = logging.getLogger(__name__)

class MarketAnalysisEngineService:
    @staticmethod
    async def analyze_market(
        db: AsyncSession, request: MarketAnalysisRequest
    ) -> MarketAnalysisResponse:
        logger.info(f"Analyzing market for project {request.project_id} destination {request.destination_country}")
        
        project = await db.get(ExportProject, request.project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")

        ai_client = get_ai_client()
        context = request.model_dump()
        context.update({"api_version": "v1", "language": "en"})
        
        ai_response = await ai_client.analyze_market(context)
        data = ai_response.get("data", {})
        confidence = ai_response.get("confidence", 0.0)
        sources = ai_response.get("sources", [])

        # Validate that sources only contains dictionaries with required fields before unpacking
        valid_citations = []
        for s in sources:
            if isinstance(s, dict) and "source" in s:
                valid_citations.append(Citation(**s))
            elif isinstance(s, dict) and "title" in s:
                 valid_citations.append(Citation(source=s["title"], link=s.get("url")))
            elif isinstance(s, str):
                valid_citations.append(Citation(source=s))

        response = MarketAnalysisResponse(
            destination_information=data.get("destination_information", "No data available."),
            product_market_requirements=data.get("product_market_requirements", []),
            trade_requirements=data.get("trade_requirements", []),
            tariff_trade_information=data.get("tariff_trade_information", "No data"),
            certifications=data.get("certifications", []),
            destination_documents=data.get("destination_documents", []),
            market_opportunities=data.get("market_opportunities", []),
            market_risks=data.get("market_risks", []),
            citations=valid_citations,
            confidence=confidence
        )
        
        db_ma = MarketAnalysis(
            project_id=request.project_id,
            country=request.destination_country,
            product=request.product,
            summary=response.destination_information,
            requirements=json.dumps({
                "product_market": response.product_market_requirements,
                "trade": response.trade_requirements,
                "tariff": response.tariff_trade_information,
                "certifications": response.certifications,
                "documents": response.destination_documents
            }),
            opportunities=json.dumps(response.market_opportunities),
            risks=json.dumps(response.market_risks),
            confidence=response.confidence
        )
        db.add(db_ma)
        
        await db.commit()
        return response

market_engine = MarketAnalysisEngineService()

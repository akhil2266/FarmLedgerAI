from fastapi import APIRouter, Depends, HTTPException
from app.schemas.financial_advisor import FinancialAdvisorRequest, FinancialAdvisorResponse
from app.services import financial_advisor_service
from app.utils.security import verify_internal_api_key

router = APIRouter(prefix="/api/v1", tags=["Financial Advisor"])


@router.post("/financial-advisor", response_model=FinancialAdvisorResponse, dependencies=[Depends(verify_internal_api_key)])
async def financial_advisor(payload: FinancialAdvisorRequest):
    try:
        result = financial_advisor_service.generate_advice(
            total_expense=payload.total_expense,
            total_revenue=payload.total_revenue,
            expense_breakdown=[e.dict() for e in payload.expense_breakdown],
            crop_summary=[c.dict() for c in payload.crop_summary],
        )
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Financial advisor failed: {str(e)}")

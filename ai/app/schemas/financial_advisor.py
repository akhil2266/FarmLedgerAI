from pydantic import BaseModel
from typing import List, Optional, Any, Dict


class ExpenseCategoryTotal(BaseModel):
    category: str
    total: float


class CropSummaryRow(BaseModel):
    crop_name: str
    cycles: Optional[int] = None
    total_yield_kg: Optional[float] = None
    total_expense: float
    total_revenue: float
    profit: float


class FinancialAdvisorRequest(BaseModel):
    total_expense: float
    total_revenue: float
    expense_breakdown: List[ExpenseCategoryTotal] = []
    crop_summary: List[CropSummaryRow] = []


class AdviceItem(BaseModel):
    advice_type: str
    title: str
    description: str
    priority: str  # low | medium | high | critical
    metadata: Optional[Dict[str, Any]] = None


class FinancialAdvisorResponse(BaseModel):
    advice: List[AdviceItem]
    model_version: str = "v1"

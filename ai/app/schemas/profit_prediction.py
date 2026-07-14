from pydantic import BaseModel, Field
from typing import Optional


class ProfitPredictionRequest(BaseModel):
    crop_name: str
    area_acres: float = Field(..., gt=0)
    estimated_cost: float = Field(..., ge=0)
    soil_type: Optional[str] = None
    season: Optional[str] = None
    state: Optional[str] = None


class ProfitPredictionResponse(BaseModel):
    predicted_yield_kg: float
    predicted_price_per_kg: float
    predicted_revenue: float
    predicted_profit: float
    predicted_roi_percent: float
    model_version: str = "v1"

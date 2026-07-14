from pydantic import BaseModel, Field
from typing import Optional


class PricePredictionRequest(BaseModel):
    crop_name: str
    market_name: Optional[str] = None
    state: Optional[str] = None
    forecast_horizon_days: int = Field(default=30, ge=1, le=365)


class PricePredictionResponse(BaseModel):
    predicted_price_per_kg: float
    prediction_date: str
    confidence_score: float
    model_version: str = "v1"

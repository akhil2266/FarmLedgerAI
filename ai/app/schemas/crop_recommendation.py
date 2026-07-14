from pydantic import BaseModel, Field
from typing import List


class CropRecommendationRequest(BaseModel):
    nitrogen: float = Field(..., ge=0, description="Nitrogen content in soil (kg/ha)")
    phosphorus: float = Field(..., ge=0, description="Phosphorus content in soil (kg/ha)")
    potassium: float = Field(..., ge=0, description="Potassium content in soil (kg/ha)")
    temperature: float = Field(..., description="Average temperature in Celsius")
    humidity: float = Field(..., ge=0, le=100, description="Relative humidity %")
    ph: float = Field(..., ge=0, le=14, description="Soil pH value")
    rainfall: float = Field(..., ge=0, description="Rainfall in mm")


class CropAlternative(BaseModel):
    crop: str
    confidence: float


class CropRecommendationResponse(BaseModel):
    recommended_crop: str
    confidence_score: float
    top_alternatives: List[CropAlternative]
    model_version: str = "v1"

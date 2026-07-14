from pydantic import BaseModel
from typing import Optional


class DiseaseDetectionResponse(BaseModel):
    detected_disease: str
    is_healthy: bool
    confidence_score: float
    severity: str  # none | low | medium | high | critical
    recommended_treatment: Optional[str] = None
    model_version: str = "v1"

from fastapi import APIRouter, Depends, HTTPException
from app.schemas.crop_recommendation import CropRecommendationRequest, CropRecommendationResponse
from app.services import crop_recommendation_service
from app.utils.security import verify_internal_api_key

router = APIRouter(prefix="/api/v1", tags=["Crop Recommendation"])


@router.post("/crop-recommendation", response_model=CropRecommendationResponse, dependencies=[Depends(verify_internal_api_key)])
async def crop_recommendation(payload: CropRecommendationRequest):
    try:
        result = crop_recommendation_service.predict(
            nitrogen=payload.nitrogen,
            phosphorus=payload.phosphorus,
            potassium=payload.potassium,
            temperature=payload.temperature,
            humidity=payload.humidity,
            ph=payload.ph,
            rainfall=payload.rainfall,
        )
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Crop recommendation failed: {str(e)}")

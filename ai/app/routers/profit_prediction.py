from fastapi import APIRouter, Depends, HTTPException
from app.schemas.profit_prediction import ProfitPredictionRequest, ProfitPredictionResponse
from app.services import profit_prediction_service
from app.utils.security import verify_internal_api_key

router = APIRouter(prefix="/api/v1", tags=["Profit Prediction"])


@router.post("/profit-prediction", response_model=ProfitPredictionResponse, dependencies=[Depends(verify_internal_api_key)])
async def profit_prediction(payload: ProfitPredictionRequest):
    try:
        result = profit_prediction_service.predict(
            crop_name=payload.crop_name,
            area_acres=payload.area_acres,
            estimated_cost=payload.estimated_cost,
            soil_type=payload.soil_type,
            season=payload.season,
            state=payload.state,
        )
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Profit prediction failed: {str(e)}")

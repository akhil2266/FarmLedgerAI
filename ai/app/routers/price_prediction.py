from fastapi import APIRouter, Depends, HTTPException
from app.schemas.price_prediction import PricePredictionRequest, PricePredictionResponse
from app.services import price_prediction_service
from app.utils.security import verify_internal_api_key

router = APIRouter(prefix="/api/v1", tags=["Price Prediction"])


@router.post("/price-prediction", response_model=PricePredictionResponse, dependencies=[Depends(verify_internal_api_key)])
async def price_prediction(payload: PricePredictionRequest):
    try:
        result = price_prediction_service.predict(
            crop_name=payload.crop_name,
            market_name=payload.market_name,
            state=payload.state,
            forecast_horizon_days=payload.forecast_horizon_days,
        )
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Price prediction failed: {str(e)}")

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.routers import crop_recommendation, profit_prediction, price_prediction, disease_detection, financial_advisor

app = FastAPI(
    title="FarmLedger AI - AI Service",
    description="FastAPI microservice powering crop recommendation, profit/price prediction, "
                 "crop disease detection, and the AI financial advisor for FarmLedger AI.",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.backend_origin],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(crop_recommendation.router)
app.include_router(profit_prediction.router)
app.include_router(price_prediction.router)
app.include_router(disease_detection.router)
app.include_router(financial_advisor.router)


@app.get("/")
async def root():
    return {"service": "FarmLedger AI - AI Service", "status": "running", "version": "1.0.0"}


@app.get("/health")
async def health():
    return {"status": "ok"}

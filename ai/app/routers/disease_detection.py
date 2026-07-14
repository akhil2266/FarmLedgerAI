import shutil
import tempfile
import os
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from app.schemas.disease_detection import DiseaseDetectionResponse
from app.services import disease_detection_service
from app.utils.security import verify_internal_api_key

router = APIRouter(prefix="/api/v1", tags=["Disease Detection"])

ALLOWED_EXTENSIONS = {".jpg", ".jpeg", ".png", ".webp"}


@router.post("/disease-detection", response_model=DiseaseDetectionResponse, dependencies=[Depends(verify_internal_api_key)])
async def disease_detection(file: UploadFile = File(...), crop_name: str = Form(default="unknown")):
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only JPG, JPEG, PNG, and WEBP images are supported.")

    tmp_path = None
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix=ext) as tmp:
            shutil.copyfileobj(file.file, tmp)
            tmp_path = tmp.name

        result = disease_detection_service.predict(tmp_path, crop_name=crop_name)
        return result
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Disease detection failed: {str(e)}")
    finally:
        if tmp_path and os.path.exists(tmp_path):
            os.remove(tmp_path)

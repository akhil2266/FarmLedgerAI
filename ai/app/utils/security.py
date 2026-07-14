from fastapi import Header, HTTPException, status
from app.config import settings


async def verify_internal_api_key(x_internal_api_key: str = Header(default="")):
    """
    Simple shared-secret check so only the Node.js backend (which holds
    AI_SERVICE_API_KEY) can call these endpoints directly.
    """
    if not x_internal_api_key or x_internal_api_key != settings.internal_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or missing internal API key.",
        )
    return True

from fastapi import APIRouter

from fastapp.app.api import docs, redirect, v1
from fastapp.app.core.config import settings

router = APIRouter(prefix="/api")
router.include_router(v1.router)
router.include_router(docs.router, prefix=f"/{settings.API_V1_STR}/docs")

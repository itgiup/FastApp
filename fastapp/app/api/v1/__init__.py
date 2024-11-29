from fastapi import APIRouter

from fastapp.app.api.v1.endpoints import auth, urls, users, stats
from fastapp.app.core.config import settings

router = APIRouter(prefix=f"/{settings.API_V1_STR}")
router.include_router(auth.router, prefix="/auth", tags=["Authentication"])
router.include_router(users.router, prefix="/users", tags=["Users"])
router.include_router(urls.router, prefix="/urls", tags=["URLs"])

# thêm router của mình
router.include_router(stats.router, prefix="/stats", tags=["Statistics"])

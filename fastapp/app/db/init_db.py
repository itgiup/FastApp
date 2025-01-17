from beanie import init_beanie
from motor.motor_asyncio import AsyncIOMotorClient

from fastapp.app.core.config import settings
from fastapp.app.core.security import get_password_hash
from fastapp.app.models import User, gather_documents


async def init() -> None:
    client = AsyncIOMotorClient(str(settings.MONGODB_URI))
    await init_beanie(
        database=client.db_name, #getattr(client, settings.MONGODB_DB_NAME),
        document_models=gather_documents(),  # type: ignore[arg-type]
    ) 
    if not await User.get_by_username(username=settings.FIRST_SUPERUSER):
        await User(
            username=settings.FIRST_SUPERUSER,
            email=settings.FIRST_SUPERUSER_EMAIL,
            hashed_password=get_password_hash(settings.FIRST_SUPERUSER_PASSWORD),
            is_superuser=True,
        ).insert()

# fastapp/app/api/v1/endpoints/stats.py
from fastapi import APIRouter
from typing import List
from fastapp.app.models import ShortUrl, User

router = APIRouter()


@router.get("/urls")
async def get_most_visited_urls(skip: int = 0, limit: int = 10) -> List[ShortUrl]:
    # Sort URLs in descending order based on their views
    return await ShortUrl.find(skip=skip, limit=limit).sort(-ShortUrl.views).to_list()

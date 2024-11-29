from datetime import datetime
from enum import Enum
from typing import Dict, Optional

from beanie import Document, Indexed
from pydantic.fields import Field

Symbol=str
Price=float
Volume=float
PriceVolumes = Dict[Price, Volume]  # giá: khối lượng

# Enum cho MarketType
class MarketType(str, Enum):
    SPOT = "spot"
    FUTURE = "future"


class Depth(Document):
    symbol: str
    market_type: MarketType
    time: float  # seconds
    bids: PriceVolumes
    asks: PriceVolumes
    precision: Optional[float] = None
    min_move: Optional[float] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)

    # @classmethod
    # async def get_by_range(cls, *, from: int, to: int) -> Optional["User"]:
    #     # Because all usernames are converted to lowercase at user creation,
    #     # make the given 'username' parameter also lowercase.
    #     return await cls.find_one(cls.username == username.lower())



    class Settings:
        name = "depths"
        # Unique index trên symbol, time, market_type
        indexes = [
            [("symbol", 1), ("time", 1), ("market_type", 1)]  # Composite unique index
        ]
        use_state_management = True

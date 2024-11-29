from datetime import datetime
from typing import Optional
from pydantic import BaseModel, StringConstraints
from fastapp.app.models.depth import MarketType, PriceVolumes




# Shared properties between user models
class DepthBase(BaseModel):
    symbol: str
    market_type: MarketType
    time: float # seconds
    bids: PriceVolumes
    asks: PriceVolumes
    precision: Optional[float]
    min_move: Optional[float]

class ConstrainedSymbol(StringConstraints):
    min_length = 1

# Properties to receive on user creation
class DepthCreate(DepthBase):
    symbol: ConstrainedSymbol


# Properties to receive on user update
class DepthUpdate(DepthBase):
    symbol: ConstrainedSymbol


class DepthInDBBase(DepthBase):
    created_at: datetime

    class Config:
        from_attributes = True


# Properties to return via API
class Depth(DepthInDBBase):
    pass


# Properties stored in DB
class DepthInDB(DepthInDBBase):
    pass
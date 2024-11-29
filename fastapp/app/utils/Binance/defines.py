
import json


TIMEFRAMES = {
    "1m": "1m",
    "3m": "3m",
    "5m": "5m",
    "15m": "15m",
    "30m": "30m",
    "1h": "1h", 
    "2h": "2h",
    "4h": "4h",
    "6h": "6h",
    "8h": "8h",
    "12h": "12h",
    "1d": "1d",
    "3d": "3d", 
    "1w": "1w",
    "1M": "1M", 
    "3M": "3M", 
    "1y": "1y",
}

class KlineMap:
    openTime = 0
    open = 1,
    high = 2,
    low = 3,
    close = 4,
    volume = 5,
    closeTime = 6,
    quoteAssetVolume = 7,
    numberOfTrades = 8,
    takerBuyBaseAssetVolume = 9,
    takerBuyQuoteAssetVolume = 10,

class TimeframeEventValue:
    remaining: float
    open_time: float
    close_time: float
    timeframe:str
    
    def __init__(self, remaining: float, open_time: float, close_time: float, timeframe:str):
        self.remaining = remaining
        self.open_time = open_time
        self.close_time = close_time
        self.timeframe = timeframe

    def to_json_object(self):
        return {
            "remaining": self.remaining,
            "openTime": self.open_time,
            "closeTime": self.close_time,
            "timeframe": self.timeframe,
        }

    def __repr__(self):
        return json.dumps(self.to_json_object())  # Để in đối tượng dễ đọc
        

class Timeframe:
    """
    Class định nghĩa các timeframe và chức năng chuyển đổi sang milliseconds.
    """
    
    TIMEFRAMES_MILLISECONDS = {
        "1m": 60000,
        "3m": 180000,
        "5m": 300000,
        "15m": 900000,
        "30m": 1800000,
        "1h": 3600000,
        "2h": 7200000,
        "4h": 14400000,
        "6h": 21600000,
        "8h": 28800000,
        "12h": 43200000,
        "1d": 86400000,
        "3d": 259200000,
        "1w": 604800000,
        "1M": 2592000000,  # Xấp xỉ
        "3M": 7776000000,  # Xấp xỉ
        "1y": 31536000000,  # Xấp xỉ
        "3y": 94608000000,  # Xấp xỉ
    }

    @staticmethod
    def to_milliseconds(timeframe: str):
        """
        Chuyển đổi timeframe sang milliseconds.
        """
        return Timeframe.TIMEFRAMES_MILLISECONDS.get(timeframe)
    
    @staticmethod
    def to_seconds(timeframe: str):
        """
        Chuyển đổi timeframe sang seconds.
        """
        return Timeframe.TIMEFRAMES_MILLISECONDS.get(timeframe) / 1000

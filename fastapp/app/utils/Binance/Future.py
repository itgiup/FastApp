import httpx
import websockets
import json
from typing import List, Dict, Union
import json
from ..Timeframe import Timeframe


class Future:
    """
    Class kết nối tới Binance WebSocket và lấy dữ liệu Klines.
    """
    url = "wss://fstream.binance.com/ws"
    url_http = "https://fapi.binance.com/fapi/v1"
    
    def __init__(self, url: str = "wss://fstream.binance.com/ws", url_http: str = "https://fapi.binance.com/fapi/v1"):
        self.url = url
        self.url_http = url_http
        self.connection = None

    async def connect(self):
        """
        Kết nối WebSocket.
        """
        self.connection = await websockets.connect(self.url)
        print("Connected to Binance Future WebSocket")

    async def disconnect(self):
        """
        Ngắt kết nối WebSocket.
        """
        if self.connection:
            await self.connection.close()
            print("Disconnected from Binance Future WebSocket")

    async def send_request(self, payload: dict) -> dict:
        """
        Gửi yêu cầu qua WebSocket và nhận phản hồi.
        """
        if not self.connection:
            raise RuntimeError("WebSocket connection not established")

        # Gửi yêu cầu
        await self.connection.send(json.dumps(payload))

        # Nhận phản hồi
        response = await self.connection.recv()
        return json.loads(response)

    async def get_klines(
        self,
        symbol: str,
        start_time: int,
        end_time: int,
        timeframe: str = "1d"
    ) -> List[Dict[str, Union[str, int]]]:
        """
        Lấy dữ liệu đồ thị nến cho một cặp tiền trong khoảng thời gian.
        Tự động chia nhỏ truy vấn nếu số nến lớn hơn 1000.
        """
        timeframe_ms = Timeframe.to_milliseconds(timeframe)
        if timeframe_ms == 0:
            raise ValueError(f"Invalid timeframe: {timeframe}")

        result = []
        limit = 1000
        current_start_time = start_time

        while current_start_time < end_time:
            # Tính toán end_time cho truy vấn này
            current_end_time = min(current_start_time + timeframe_ms * limit, end_time)

            # Tạo payload
            payload = {
                "method": "klines",
                "params": {
                    "symbol": symbol,
                    "interval": timeframe,
                    "startTime": current_start_time,
                    "endTime": current_end_time,
                    "limit": limit,
                },
                "id": 1,
            }

            # Gửi yêu cầu
            response = await self.send_request(payload)

            # Kiểm tra lỗi
            if "error" in response:
                raise RuntimeError(f"Error from Binance: {response['error']}")

            # Lưu kết quả
            klines = response.get("result", [])
            result.extend(klines)

            # Cập nhật current_start_time
            if len(klines) < limit:
                # Nếu nhận được ít hơn `limit` nến, nghĩa là đã hết dữ liệu
                break

            current_start_time = klines[-1][0] + timeframe_ms  # Tiếp tục từ nến cuối cùng

        return result
    
    @staticmethod
    async def get_klines(
        symbol: str,
        start_time: int,
        end_time: int,
        timeframe: str
    ) -> List[Dict[str, Union[int, float]]]:
        """
        Lấy dữ liệu đồ thị nến từ Binance API trong khoảng thời gian.
        :param symbol: Cặp tiền (VD: "BTCUSDT").
        :param start_time: Thời gian bắt đầu (epoch milliseconds).
        :param end_time: Thời gian kết thúc (epoch milliseconds).
        :param timeframe: Khoảng thời gian nến (VD: "1m", "1d").
        :return: Danh sách các nến.
        """
        url = f"{Future.url_http}/klines"
        limit = 1000  # Binance API giới hạn 1000 nến mỗi lần truy vấn
        result = []

        if timeframe not in Timeframe.TIMEFRAMES_MILLISECONDS:
            raise ValueError(f"Invalid timeframe: {timeframe}")

        timeframe_ms = Timeframe.to_milliseconds(timeframe)

        # Bắt đầu truy vấn dữ liệu
        current_start_time = start_time

        async with httpx.AsyncClient() as client:
            while current_start_time < end_time:
                # Tính thời gian kết thúc cho truy vấn hiện tại
                current_end_time = min(current_start_time + timeframe_ms * limit, end_time)

                # Thực hiện yêu cầu HTTP
                params = {
                    "symbol": symbol,
                    "interval": timeframe,
                    "startTime": current_start_time,
                    "endTime": current_end_time,
                    "limit": limit,
                }

                response = await client.get(url, params=params)

                if response.status_code != 200:
                    raise RuntimeError(f"Failed to fetch klines: {response.text}")

                klines = response.json()

                if not klines:
                    break

                result.extend(klines)

                # Cập nhật current_start_time cho vòng lặp tiếp theo
                current_start_time = klines[-1][0] + timeframe_ms

                # Dừng nếu nhận được ít hơn số lượng tối đa (đã hết dữ liệu)
                if len(klines) < limit:
                    break

        return result
    
    @staticmethod
    async def ticker_24hr() -> List[Dict[str, Union[str, float]]]:
        """
        Lấy dữ liệu ticker 24hr từ Binance API.
        :return: Danh sách các ticker với dữ liệu 24 giờ.
        """
        url = Future.url_http + "/ticker/24hr"

        # Gửi yêu cầu HTTP
        async with httpx.AsyncClient() as client:
            response = await client.get(url)

        # Kiểm tra lỗi từ API
        if response.status_code != 200:
            raise RuntimeError(f"Failed to fetch data: {response.text}")

        # Lọc bỏ những cặp mà có  lastQty = 0 và volume=0, nhớ chuyển thành số trước
        filtered_data = [item for item in response.json() if float(item["lastQty"]) != 0.0 and float(item["volume"]) != 0.0]
        
        # Trả về kết quả dưới dạng JSON
        return filtered_data
    
    @staticmethod
    async def exchangeInfo() -> List[Dict[str, Union[str, float]]]:
        """
        Lấy dữ liệu exchangeInfo từ Binance API.
        """
        url = Future.url_http + "/exchangeInfo"

        # Gửi yêu cầu HTTP
        async with httpx.AsyncClient() as client:
            response = await client.get(url)    

        # Kiểm tra lỗi từ API
        if response.status_code != 200:
            raise RuntimeError(f"Failed to fetch data: {response.text}")

        # Trả về kết quả dưới dạng JSON
        return response.json()

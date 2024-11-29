
from asyncio import Task
import asyncio
from concurrent.futures import ThreadPoolExecutor
from datetime import datetime
from enum import Enum
from pprint import pprint
import sys
import traceback
from typing import Callable, Coroutine, List, Dict, Literal, Optional
from colorama import Fore, Style
import requests
from fastapp.app import schemas
from fastapp.app.utils.Binance.defines import TimeframeEventValue
from fastapp.app.utils import get_precision_and_minmove
from fastapp.app.utils.ConnectionManager import WebSocketConnectionManager
from fastapp.app.utils.Binance import StreamFuture, StreamSpot
from fastapp.app.models.depth import Depth as DepthModel


Symbol=str
Price=float
Volume=float
PriceVolumes = Dict[Price, Volume]  # giá: khối lượng


# Enum cho MarketType
class MarketType(str, Enum):
    SPOT = "spot"
    FUTURE = "future"

class Depth:
    symbol: str
    market_type: MarketType
    time: float # seconds
    bids: PriceVolumes
    asks: PriceVolumes
    precision: Optional[float]
    min_move: Optional[float]
    
    def __init__(self, symbol: str, market_type: MarketType, time: float= datetime.now().timestamp(), 
                 bids: PriceVolumes= {}, asks: PriceVolumes= {}, precision: Optional[float]= None, min_move: Optional[float]= None):
        self.symbol = symbol
        self.market_type = market_type
        self.bids = bids
        self.asks = asks
        self.precision = precision
        self.min_move = min_move
    
    def to_dict(self):
        return {
            "symbol": self.symbol,
            "market_type": self.market_type,
            "time": self.time,
            "bids": self.bids,
            "asks": self.asks,
            "precision": self.precision,
            "min_move": self.min_move,
        }
        
SymbolDepth=Dict[Symbol, Depth]


running_loop = asyncio.get_running_loop()
executor = ThreadPoolExecutor()
print(running_loop)

class BotWatchDepths:
    """
    BotWatchDepths
    """
    stream_future: StreamFuture
    stream_spot: StreamSpot

    depth_futures: SymbolDepth = {} # {symbol: Depth}
    depth_spots: SymbolDepth = {} # {symbol: Depth}
    
    stop_watch: Task = None

    async def initExchanges(self):
        stream_future = StreamFuture()
        stream_spot = StreamSpot()
        
        await stream_future.connect()
        await stream_spot.connect()
        
        self.stream_future = stream_future
        self.stream_spot = stream_spot
        print(Fore.GREEN, "Kết nối thành công BotWatchDepths", Style.RESET_ALL)
 
    def isConnected(self):
        """
        Kiểm tra kết nối đến Binance WebSocket.
        """
        return self.stream_future.isConnected() and self.stream_spot.isConnected()

    async def multiActive(self, symbols: List[str]):
        """
        Đăng ký nhiều symbol để nhận dữ liệu depth.
        :param symbols: Danh sách các symbol để đăng ký.
        """
        await self.stream_future.subscribe_depths(symbols, self.on_depth_future)
        # await self.stream_spot.subscribe_depths(symbols, self.on_depth_spot)

    def on_depth_future(self, data):
        """
        Xử lý dữ liệu depth nhận được.
        :param data: Dữ liệu depth từ WebSocket.
        """
        # Xử lý dữ liệu depth ở đây
        symbol=data.get('s')
        b=data.get('b')
        a=data.get('a')

        if not symbol:
            return
        if symbol not in self.depth_futures:
            self.depth_futures[symbol] = Depth(symbol, MarketType.FUTURE)
            # precision 
            for v in b:
                price = float(v[0])
                volume = float(v[1])
                r = get_precision_and_minmove(price)
                if not self.depth_futures[symbol].precision or self.depth_futures[symbol].precision < r.precision:
                    self.depth_futures[symbol].precision = r.precision 
                    self.depth_futures[symbol].min_move = r.min_move 

        for v in b:
            price = float(v[0])
            volume = float(v[1])
            if volume > 0.0:
                self.depth_futures[symbol].bids[price] = volume

        for v in a:
            price = float(v[0])
            volume = float(v[1])
            if volume > 0.0:
                self.depth_futures[symbol].asks[price] = volume

        # pprint(vars(self.depth_futures[symbol]))

    def on_depth_spot(self, data):
        """
        Xử lý dữ liệu depth nhận được.
        :param data: Dữ liệu depth từ WebSocket.
        """
        # Xử lý dữ liệu depth ở đây
        symbol=data.get('s')
        b=data.get('b')
        a=data.get('a')

        if not symbol:
            return
            
        if symbol not in self.depth_spots:
            self.depth_spots[symbol] = Depth(symbol, MarketType.SPOT)
            # precision 
            for v in b:
                price = float(v[0])
                volume = float(v[1])
                r = get_precision_and_minmove(price)
                if not self.depth_spots[symbol].precision or self.depth_spots[symbol].precision < r.precision:
                    self.depth_spots[symbol].precision = r.precision
                    self.depth_spots[symbol].min_move = r.min_move

        for v in b:
            price = float(v[0])
            volume = float(v[1])
            if volume > 0.0:
                self.depth_spots[symbol].bids[price] = volume

        for v in a:
            price = float(v[0])
            volume = float(v[1])
            if volume > 0.0:
                self.depth_spots[symbol].asks[price] = volume
            
        # pprint(vars(self.depth_spots[symbol]))

    
    async def watchs(self, timeframe: str, 
                     callback: Coroutine, on_remaining: Coroutine=None, 
                     webSocketConnections:WebSocketConnectionManager=None):
        """
        Khi đóng nến, thực hiện tính toán:
        - Tính khoảng cách % giữa các giá.
        :param timeframe: Khoảng thời gian của nến (ví dụ: 1m, 5m, 1h, 1d).
        :param callback: Hàm callback sẽ được gọi khi nến đóng. Hàm này nhận hai đối số:
        - priceDifferenceFutures: Đối tượng chứa sự khác biệt giá của các cặp tiền future.
        - priceDifferenceSpots: Đối tượng chứa sự khác biệt giá của các cặp tiền spot.
        """
        # Dừng cái trước đó nếu có
        if self.stop_watch != None:
            self.stop_watch.cancel()
            
        async def on_close_timeframe(args:TimeframeEventValue = None):
            try:
                if asyncio.iscoroutinefunction(callback):
                    asyncio.create_task(callback(args))
                else:
                    running_loop.run_in_executor(executor, callback, args)
                    
            except Exception as err:
                print(f"{Fore.RED}Error: {err} {Style.RESET_ALL}", file=sys.stderr)
                traceback.print_exc(file=sys.stderr)
            finally:
                try:
                    if args and args.close_time:
                        # lưu
                        await self.saveDepths(args.close_time, webSocketConnections)
                        msg = { "status" : "Đã lưu depths xong hết" }
                        await self.webSocketConnections_send(webSocketConnections, msg)
                except Exception as err:
                    print(f"{Fore.RED}Error: {err} {Style.RESET_ALL}", file=sys.stderr)
                    traceback.print_exc(file=sys.stderr)
                finally:
                    self.reset_depths_values(self.depth_futures)
                    self.reset_depths_values(self.depth_spots)

        self.stop_watch = await StreamFuture.subscribe_timeframe(timeframe, on_close_timeframe, on_remaining)
        return self.stop_watch
    
    async def saveDepths(self, close_time: float, webSocketConnections:WebSocketConnectionManager=None):
        time = int(close_time * 1000)
        for symbol, depth in self.depth_futures.items():
            depth.time = time
            await DepthModel(**depth.to_dict()).insert()
            msg = {"status": f"đã lưu {depth.symbol}.{depth.time}.{depth.market_type}"}
            await self.webSocketConnections_send(webSocketConnections, msg)
            
        for symbol, depth in self.depth_spots.items():
            depth.time = time
            # depth_in:schemas.DepthCreate
            await DepthModel(**depth.to_dict()).insert()
            msg = {"status": "saved", "data": f"đã lưu {depth.symbol}.{depth.time}.{depth.market_type}"}
            await self.webSocketConnections_send(webSocketConnections, msg)
            
        try:
            asyncio.create_task(self.send_tele_message(datetime.fromtimestamp(close_time).strftime("%Y-%m-%d %H:%M:%S")))
        except Exception as err:
            print(Fore.RED, err, Style.RESET_ALL)
            msg = {"error": True, "status": f"send_tele_message", "data": err}
            await self.webSocketConnections_send(webSocketConnections, msg)
        
    async def send_tele_message(self, message:str="done", webSocketConnections:WebSocketConnectionManager=None):
        bot_token = ""  # Token của bot
        chat_id = "-"  # chat_id của nhóm, có thể là số hoặc bắt đầu bằng '-'
        url = f"https://api.telegram.org/bot{bot_token}/sendMessage"
        
        # Dữ liệu yêu cầu
        data = {
            "chat_id": chat_id,
            "text": message
        }
        # Gửi yêu cầu tới Telegram API
        response = requests.post(url, data=data)

        # Kiểm tra xem yêu cầu có thành công không
        if response.status_code == 200:
            print(Fore.RED, "Tin nhắn đã được gửi thành công!", Style.RESET_ALL)
            msg = {"status": f"Tin nhắn đã được gửi thành công!", "data": data}
            await self.webSocketConnections_send(webSocketConnections, msg )
        else:
            print(Fore.RED, f"Lỗi khi gửi tin nhắn: {response.status_code}, {response.text}", Style.RESET_ALL)
            msg = {"error": f"Lỗi khi gửi tin nhắn: {response.status_code}", "data": response.text}
            await self.webSocketConnections_send(webSocketConnections, msg )
        
    @staticmethod
    async def webSocketConnections_send(webSocketConnections:WebSocketConnectionManager, data: dict):
        try:
            if webSocketConnections:
                await webSocketConnections.send_json(data)
        except Exception as err:
            print(Fore.RED, err, Style.RESET_ALL)
            
    @staticmethod
    def reset_depth_values(depth: Depth):
        """
        Gán lại giá trị ban đầu cho pair_depth.
        :param pair_depth: Đối tượng PairDepth cần reset.
        """
        depth.asks = {}
        depth.bids = {}

    @staticmethod
    def reset_depths_values(depths):
        """
        Gán lại giá trị ban đầu cho các depths và depthSpots.
        :param depths: Từ điển chứa các đối tượng PairDepth.
        """
        for pair_depth in depths.values():
            BotWatchDepths.reset_depth_values(pair_depth)


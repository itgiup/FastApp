import json
from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from typing import List

class WebSocketConnectionManager:
    """
    Quản lý các kết nối WebSocket.
    """
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        """
        Kết nối một WebSocket.
        """
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"Client connected: {len(self.active_connections)} active connections.")

    def disconnect(self, websocket: WebSocket):
        """
        Ngắt kết nối một WebSocket.
        """
        self.active_connections.remove(websocket)
        print(f"Client disconnected: {len(self.active_connections)} active connections.")

    async def send_message(self, message: str):
        """
        Gửi tin nhắn tới tất cả các kết nối.
        """
        for connection in self.active_connections:
            await connection.send_text(message)
            
    async def send_json(self, data: dict):
        """
        Gửi một object JSON tới tất cả các kết nối.
        """
        json_message = json.dumps(data)  # Chuyển đổi object Python sang JSON
        for connection in self.active_connections:
            await connection.send_text(json_message)

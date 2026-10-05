from fastapi import WebSocket
from typing import List

class ConnectionManager:
    def __init__(self):
        # List to store all active WebSocket connections
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        print(f"✅ New client connected. Total clients: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            print(f" Client disconnected. Total clients: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        # Send data to ALL connected clients
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                print(f"Error sending to client: {e}")
                # Optionally handle broken connections here

manager = ConnectionManager()
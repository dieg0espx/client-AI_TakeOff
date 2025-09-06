#!/usr/bin/env python3
"""
View File Processing WebSocket
Client to view real-time file processing logs from the WebSocket endpoint
"""

import asyncio
import websockets
import sys
from datetime import datetime

async def view_file_processing():
    """View file processing logs from WebSocket endpoint"""
    url = "ws://localhost:5001/File-processing"
    
    try:
        print("📁 File Processing Monitor")
        print("=" * 40)
        print(f"🔗 Connecting to: {url}")
        print("📋 Live time updates (HH:MM:SS):")
        print("-" * 40)
        
        async with websockets.connect(url) as websocket:
            print("✅ Connected to File-processing endpoint")
            print("🕐 Receiving live time updates...")
            print()
            
            while True:
                try:
                    # Receive time message from server
                    time_message = await websocket.recv()
                    print(f"---")
                    
                except websockets.exceptions.ConnectionClosed:
                    print("❌ Connection lost")
                    break
                    
    except KeyboardInterrupt:
        print("\n👋 Stopped monitoring")
    except ConnectionRefusedError:
        print("❌ Cannot connect to server")
        print("💡 Make sure the server is running:")
        print("   uvicorn main:app --host 0.0.0.0 --port 5001 --reload")
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    try:
        asyncio.run(view_file_processing())
    except KeyboardInterrupt:
        print("\n👋 Goodbye!")
        sys.exit(0)

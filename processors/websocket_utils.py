"""
WebSocket utilities for processor files
This module provides WebSocket-aware print functions for all processor files
"""

import sys
import os

# Add the parent directory to the path to import from main
sys.path.append(os.path.join(os.path.dirname(__file__), '..'))

def sync_websocket_print(message: str):
    """
    Synchronous print that sends to WebSocket clients
    This function will be available to all processor files
    """
    # Print to console (existing behavior)
    print(message)
    
    # Try to send to WebSocket clients if any are connected
    try:
        # Import the websocket manager from main
        from main import websocket_manager
        
        if websocket_manager.active_connections:
            from datetime import datetime
            timestamp = datetime.now().strftime("%H:%M:%S")
            formatted_message = f"[{timestamp}] {message}"
            
            # Use asyncio.create_task to send without blocking
            import asyncio
            try:
                loop = asyncio.get_event_loop()
                if loop.is_running():
                    asyncio.create_task(websocket_manager.send_to_all(formatted_message))
            except:
                pass
    except ImportError:
        # If main module is not available, just print to console
        pass
    except Exception:
        # If any other error occurs, just print to console
        pass

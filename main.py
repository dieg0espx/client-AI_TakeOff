# source venv/bin/activate
# uvicorn main:app --host 0.0.0.0 --port 5001 --reload

from fastapi import FastAPI, BackgroundTasks, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sys
import os
import json
import asyncio
from typing import Set
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# WebSocket Connection Manager
class WebSocketManager:
    def __init__(self):
        self.active_connections: Set[WebSocket] = set()
    
    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.add(websocket)
        print(f"🔌 File-processing WebSocket client connected. Total clients: {len(self.active_connections)}")
    
    def disconnect(self, websocket: WebSocket):
        self.active_connections.discard(websocket)
        print(f"🔌 File-processing WebSocket client disconnected. Total clients: {len(self.active_connections)}")
    
    async def send_to_all(self, message: str):
        if self.active_connections:
            disconnected = set()
            for connection in self.active_connections:
                try:
                    await connection.send_text(message)
                except:
                    disconnected.add(connection)
            
            # Remove disconnected clients
            for connection in disconnected:
                self.active_connections.discard(connection)

# Global WebSocket manager instance
websocket_manager = WebSocketManager()

# Add the api directory to the Python path
sys.path.append(os.path.join(os.path.dirname(__file__), 'api'))

# Import the PDF downloader and config manager
from gdrive_pdf_downloader import download_pdf_from_drive
from utils.config_manager import config_manager

# Import the PDF to SVG converter
from pdf_to_svg_converter import ConvertioConverter

# Import the PDF text extractor
from api.pdf_text_extractor import extract_text_from_pdf



# Create FastAPI instance
app = FastAPI(
    title="AI-Takeoff Server",
    description="AI-Takeoff API server",
    version="1.0.0"
)


# Custom logging function
async def log_to_client(upload_id: str, message: str, log_type: str = "info"):
    """Log message to console and WebSocket clients"""
    # Print to console (existing behavior)
    print(message)
    
    # Send to WebSocket clients if any are connected
    if websocket_manager.active_connections:
        timestamp = datetime.now().strftime("%H:%M:%S")
        formatted_message = f"[{timestamp}] {message}"
        await websocket_manager.send_to_all(formatted_message)


# Synchronous version for use in non-async contexts
def sync_websocket_print(message: str):
    """Synchronous print that sends to WebSocket clients"""
    # Print to console (existing behavior)
    print(message)
    
    # Send to WebSocket clients if any are connected (fire and forget)
    if websocket_manager.active_connections:
        timestamp = datetime.now().strftime("%H:%M:%S")
        formatted_message = f"[{timestamp}] {message}"
        # Use asyncio.create_task to send without blocking
        try:
            loop = asyncio.get_event_loop()
            if loop.is_running():
                asyncio.create_task(websocket_manager.send_to_all(formatted_message))
        except:
            pass

# Modified pipeline runner with logging support
def run_pipeline_with_logging(upload_id: str):
    """Run the processing pipeline with logging"""
    import sys
    import os
    import importlib.util
    import json
    
    # Define the processing steps in order
    steps = [
        "Step1",  # Remove duplicate paths
        "Step2",  # Modify colors (lightgray and black)
        "Step3",  # Add background
        "Step4",  # Apply color coding to specific patterns
        "Step5",  # Detect blue X shapes
        "Step6",  # Detect red squares
        "Step7",  # Detect pink shapes
        "Step8",  # Detect green rectangles
    ]
    
    successful_steps = 0
    total_steps = len(steps)
    step_counts = {}
    
    # Run each step in sequence
    for i, step in enumerate(steps):
        try:
            # Construct the path to the step file
            step_file = f"processors/{step}.py"
            
            if not os.path.exists(step_file):
                sync_websocket_print(f"Step file {step_file} not found. Skipping...")
                continue
            
            sync_websocket_print(f"\n{'='*50}")
            sync_websocket_print(f"Running {step}...")
            sync_websocket_print(f"{'='*50}")
            
            # Add processors directory to Python path
            processors_dir = os.path.abspath("processors")
            if processors_dir not in sys.path:
                sys.path.insert(0, processors_dir)
            
            # Import and run the step
            spec = importlib.util.spec_from_file_location(step, step_file)
            step_module = importlib.util.module_from_spec(spec)
            sys.modules[step] = step_module
            spec.loader.exec_module(step_module)
            
            run_function_name = f'run_{step.lower()}'
            if hasattr(step_module, run_function_name):
                run_function = getattr(step_module, run_function_name)
                success = run_function()
                
                if success:
                    successful_steps += 1
                    sync_websocket_print(f"✅ {step} completed successfully")
                else:
                    sync_websocket_print(f"❌ {step} failed")
                    break
            else:
                sync_websocket_print(f"⚠️  No run function found for {step}")
                break
                
        except Exception as e:
            sync_websocket_print(f"❌ Error running {step}: {str(e)}")
            break
    
    # Summary
    sync_websocket_print(f"\n{'='*60}")
    sync_websocket_print(f"📊 Processing Summary")
    sync_websocket_print(f"{'='*60}")
    sync_websocket_print(f"Steps completed: {successful_steps}/{total_steps}")
    
    if successful_steps == total_steps:
        sync_websocket_print(f"🎉 All steps completed successfully!")
    else:
        sync_websocket_print(f"⚠️  Pipeline completed with some failures")
    
    return successful_steps == total_steps

# Initialize the PDF to SVG converter
try:
    converter = ConvertioConverter()
    sync_websocket_print("✅ PDF to SVG converter initialized successfully")
except ValueError as e:
    sync_websocket_print(f"⚠️  Warning: {e}. SVG conversion will not work.")
    converter = None

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Root endpoint
@app.get("/")
async def root():
    return {"message": "AI-Takeoff Server is running!", "status": "running"}


# WebSocket endpoint for file processing logs
@app.websocket("/File-processing")
async def websocket_file_processing(websocket: WebSocket):
    await websocket_manager.connect(websocket)
    
    try:
        # Send welcome message
        welcome_msg = f"[{datetime.now().strftime('%H:%M:%S')}] 🚀 Connected to File-processing WebSocket. You will receive all project logs here."
        await websocket.send_text(welcome_msg)
        
        # Keep connection alive and send periodic time updates
        while True:
            try:
                # Send current time every second when no processing is happening
                current_time = datetime.now().strftime("%H:%M:%S")
                await websocket.send_text("---")
                
                # Wait for 1 second before sending the next update
                await asyncio.sleep(1)
                
            except WebSocketDisconnect:
                break
                
    except WebSocketDisconnect:
        pass
    except Exception as e:
        print(f"❌ File-processing WebSocket error: {e}")
    finally:
        websocket_manager.disconnect(websocket)


# AI-Takeoff specific endpoint
@app.get("/AI-Takeoff/{upload_id}")
async def get_ai_takeoff_result(upload_id: str, background_tasks: BackgroundTasks = None, sync: bool = True):
    # Store the Google Drive file ID in JSON as google_drive_file_id
    config_manager.set_file_id(upload_id)
    
    print(f"🔍 AI-Takeoff Request for upload_id: {upload_id}")
    print(f"📝 Stored Google Drive file ID in JSON as google_drive_file_id: {upload_id}")
    
    # Force synchronous processing by default, or if sync=True
    if sync:
        print(f"🔄 Running in synchronous mode...")
        return await process_ai_takeoff_sync(upload_id)
    else:
        # Fallback to synchronous processing
        return await process_ai_takeoff_sync(upload_id)

# Extract text from PDF endpoint
@app.get("/extract-text/{upload_id}")
async def extract_pdf_text(upload_id: str):
    """Extract text from the PDF file and print to console"""
    try:
        # Store the Google Drive file ID
        config_manager.set_file_id(upload_id)
        
        print(f"🔍 Text extraction request for upload_id: {upload_id}")
        
        # Download the PDF first
        file_path = download_pdf_from_drive(upload_id)
        print(f"📄 PDF downloaded successfully to: {file_path}")
        
        # Extract text from the PDF
        extracted_text = extract_text_from_pdf(file_path)
        
        if extracted_text:
            return {
                "id": upload_id,
                "status": "success",
                "message": "Text extracted successfully and printed to console",
                "text_length": len(extracted_text),
                "pdf_path": file_path
            }
        else:
            return {
                "id": upload_id,
                "status": "no_text",
                "message": "No text was extracted from the PDF",
                "pdf_path": file_path
            }
            
    except Exception as e:
        print(f"❌ Error in text extraction: {e}")
        return {
            "id": upload_id,
            "status": "error",
            "error": str(e),
            "message": "Failed to extract text from PDF"
        }

# Get results endpoint
@app.get("/AI-Takeoff/{upload_id}/results")
async def get_ai_takeoff_results(upload_id: str):
    """Get the results from data.json for a specific upload_id"""
    data_json_path = os.path.join('data.json')
    
    if not os.path.exists(data_json_path):
        return {
            "id": upload_id,
            "status": "not_found",
            "message": "No results found. Processing may not be complete."
        }
    
    try:
        with open(data_json_path, 'r') as f:
            import json
            data_results = json.load(f)
        
        # Check if this result belongs to the requested upload_id
        if data_results.get('upload_id') == upload_id:
            return {
                "id": upload_id,
                "status": "completed",
                "results": data_results
            }
        else:
            return {
                "id": upload_id,
                "status": "not_found",
                "message": "Results not found for this upload_id. Processing may not be complete."
            }
            
    except Exception as e:
        return {
            "id": upload_id,
            "status": "error",
            "error": str(e),
            "message": "Error reading results file"
        }


async def process_ai_takeoff_sync(upload_id: str):
    """Synchronous processing"""
    try:
        await log_to_client(upload_id, f"📄 Starting PDF download for upload_id: {upload_id}")
        
        # Step 1: Download the PDF
        file_path = download_pdf_from_drive(upload_id)
        await log_to_client(upload_id, f"📄 PDF downloaded successfully to: {file_path}")
        
        # Step 2: Convert PDF to SVG
        svg_path = None
        svg_size = None
        
        if converter:
            await log_to_client(upload_id, f"🔄 Starting PDF to SVG conversion...")
            try:
                # Start conversion process
                conv_id = await converter.start_conversion()
                await log_to_client(upload_id, f"🔄 Conversion started with ID: {conv_id}")
                
                # Upload the file
                await converter.upload_file(conv_id, file_path)
                await log_to_client(upload_id, f"📤 PDF uploaded to conversion service")
                
                # Wait for conversion to complete
                download_url = await converter.check_status(conv_id)
                await log_to_client(upload_id, f"✅ Conversion completed, downloading SVG...")
                
                # Download the converted file
                svg_path = os.path.join('files', 'original.svg')
                await converter.download_file(download_url, svg_path)
                await log_to_client(upload_id, f"✅ SVG saved to: {svg_path}")
                
                svg_size = os.path.getsize(svg_path) if os.path.exists(svg_path) else 0
                
                # Start the processing pipeline
                await log_to_client(upload_id, f"🚀 Starting AI processing pipeline...")
                try:
                    pipeline_success = run_pipeline_with_logging(upload_id)
                    if pipeline_success:
                        await log_to_client(upload_id, f"✅ Processing pipeline completed successfully")
                    else:
                        await log_to_client(upload_id, f"⚠️  Processing pipeline completed with some failures")
                except Exception as pipeline_error:
                    await log_to_client(upload_id, f"❌ Error in processing pipeline: {pipeline_error}", "error")
                
            except Exception as conversion_error:
                await log_to_client(upload_id, f"❌ Error in SVG conversion: {conversion_error}", "error")
        else:
            await log_to_client(upload_id, f"⚠️  Skipping SVG conversion - CONVERTIO_API_KEY not set", "warning")
        
        # Get file sizes
        pdf_size = os.path.getsize(file_path) if os.path.exists(file_path) else 0
        
        # Read the data.json file that was generated by the pipeline
        data_json_path = os.path.join('data.json')
        if os.path.exists(data_json_path):
            try:
                with open(data_json_path, 'r') as f:
                    import json
                    data_results = json.load(f)
                
                result = {
                    "id": upload_id,
                    "status": "completed",
                    "pdf_path": file_path,
                    "pdf_size": pdf_size,
                    "svg_path": svg_path,
                    "svg_size": svg_size,
                    "message": "AI-Takeoff processing completed successfully",
                    "results": data_results
                }
            except Exception as e:
                await log_to_client(upload_id, f"❌ Error reading data.json: {e}", "error")
                result = {
                    "id": upload_id,
                    "status": "completed",
                    "pdf_path": file_path,
                    "pdf_size": pdf_size,
                    "svg_path": svg_path,
                    "svg_size": svg_size,
                    "message": "PDF downloaded and converted to SVG successfully, but could not read results"
                }
        else:
            result = {
                "id": upload_id,
                "status": "completed",
                "pdf_path": file_path,
                "pdf_size": pdf_size,
                "svg_path": svg_path,
                "svg_size": svg_size,
                "message": "PDF downloaded and converted to SVG successfully, but no results file found"
            }
        
    except Exception as e:
        await log_to_client(upload_id, f"❌ Error downloading PDF: {e}", "error")
        
        result = {
            "id": upload_id,
            "status": "error",
            "error": str(e),
            "message": "Failed to download PDF from Google Drive"
        }
    
    # Log final result
    await log_to_client(upload_id, f"📊 Result: {result}")
    await log_to_client(upload_id, "-" * 50)
    
    return result

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5001)

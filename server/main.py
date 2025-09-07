# source venv/bin/activate
# uvicorn main:app --host 0.0.0.0 --port 5001 --reload

from fastapi import FastAPI, BackgroundTasks
from fastapi.middleware.cors import CORSMiddleware
import uvicorn
import sys
import os
import json
import asyncio
import shutil
from dotenv import load_dotenv
from datetime import datetime

# Load environment variables from .env file
load_dotenv()

# Setup environment for Railway deployment
try:
    from setup_environment import setup_environment
    setup_environment()
except ImportError:
    print("⚠️  Environment setup script not found, continuing with default configuration")

# Verify dependencies on startup
try:
    from verify_dependencies import main as verify_deps
    print("🔍 Running dependency verification...")
    deps_ok = verify_deps()
    if not deps_ok:
        print("⚠️  Some dependencies may not be working correctly")
    else:
        print("✅ All dependencies verified successfully")
except ImportError:
    print("⚠️  Dependency verification script not found")
except Exception as e:
    print(f"⚠️  Error during dependency verification: {e}")


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
    """Log message to console"""
    print(message)


# Cleanup function to clear files and reset data.json
def cleanup_after_response():
    """Clear the files folder and reset data.json after response is sent"""
    try:
        # Clear the files folder
        files_dir = "files"
        if os.path.exists(files_dir):
            # Remove all files in the files directory
            for filename in os.listdir(files_dir):
                file_path = os.path.join(files_dir, filename)
                try:
                    if os.path.isfile(file_path) or os.path.islink(file_path):
                        os.unlink(file_path)
                    elif os.path.isdir(file_path):
                        shutil.rmtree(file_path)
                except Exception as e:
                    print(f"Failed to delete {file_path}. Reason: {e}")
            print("✅ Files folder cleared successfully")
        else:
            print("⚠️  Files directory does not exist")
        
        # Reset data.json to empty structure
        data_json_path = "data.json"
        empty_data = {
            "step_results": {},
            "cloudinary_urls": {},
            "extracted_text": ""
        }
        
        with open(data_json_path, 'w') as f:
            json.dump(empty_data, f, indent=4)
        
        print("✅ data.json reset to empty structure")
        
    except Exception as e:
        print(f"❌ Error during cleanup: {e}")



# Modified pipeline runner with logging support
def run_pipeline_with_logging(upload_id: str):
    """Run the processing pipeline with logging using the proper pipeline from processors/index.py"""
    import sys
    import os
    
    # Add processors directory to Python path
    processors_dir = os.path.abspath("processors")
    if processors_dir not in sys.path:
        sys.path.insert(0, processors_dir)
    
    try:
        # Import the main function from processors/index.py
        from index import main as pipeline_main
        
        print(f"\n{'='*60}")
        print(f"🚀 Starting AI TakeOff Processing Pipeline")
        print(f"{'='*60}")
        
        # Run the proper pipeline that includes data.json population
        success = pipeline_main(upload_id)
        
        if success:
            print(f"🎉 All steps completed successfully!")
        else:
            print(f"⚠️  Pipeline completed with some failures")
        
        return success
        
    except Exception as e:
        print(f"❌ Error running pipeline: {str(e)}")
        return False

# Initialize the PDF to SVG converter
try:
    converter = ConvertioConverter()
    print("✅ PDF to SVG converter initialized successfully")
except ValueError as e:
    print(f"⚠️  Warning: {e}. SVG conversion will not work.")
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

# Health check endpoint
@app.get("/health")
async def health_check():
    """Comprehensive health check including dependency status"""
    health_status = {
        "status": "healthy",
        "message": "Server is running properly",
        "timestamp": datetime.now().isoformat(),
        "dependencies": {}
    }
    
    # Check critical dependencies
    try:
        import cv2
        health_status["dependencies"]["opencv"] = {"status": "ok", "version": cv2.__version__}
    except Exception as e:
        health_status["dependencies"]["opencv"] = {"status": "error", "error": str(e)}
        health_status["status"] = "degraded"
    
    try:
        import pytesseract
        pytesseract.get_tesseract_version()
        health_status["dependencies"]["tesseract"] = {"status": "ok"}
    except Exception as e:
        health_status["dependencies"]["tesseract"] = {"status": "error", "error": str(e)}
        health_status["status"] = "degraded"
    
    try:
        import cairosvg
        health_status["dependencies"]["cairosvg"] = {"status": "ok"}
    except Exception as e:
        health_status["dependencies"]["cairosvg"] = {"status": "error", "error": str(e)}
        health_status["status"] = "degraded"
    
    try:
        import cloudinary
        health_status["dependencies"]["cloudinary"] = {"status": "ok"}
    except Exception as e:
        health_status["dependencies"]["cloudinary"] = {"status": "error", "error": str(e)}
    
    return health_status


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
        result = await process_ai_takeoff_sync(upload_id)
    else:
        # Fallback to synchronous processing
        result = await process_ai_takeoff_sync(upload_id)
    
    # Add cleanup task to run after response is sent
    if background_tasks:
        background_tasks.add_task(cleanup_after_response)
    
    return result

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
async def get_ai_takeoff_results(upload_id: str, background_tasks: BackgroundTasks = None):
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
            result = {
                "id": upload_id,
                "status": "completed",
                "results": data_results
            }
            
            # Add cleanup task to run after response is sent
            if background_tasks:
                background_tasks.add_task(cleanup_after_response)
            
            return result
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
        
        # Step 1.5: Extract text from PDF
        await log_to_client(upload_id, f"📖 Extracting text from PDF...")
        try:
            extracted_text = extract_text_from_pdf(file_path)
            await log_to_client(upload_id, f"✅ Text extraction completed, {len(extracted_text)} characters extracted")
        except Exception as text_error:
            await log_to_client(upload_id, f"⚠️  Text extraction failed: {text_error}", "warning")
        
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
    # Railway provides PORT environment variable
    port = int(os.environ.get("PORT", 5001))
    print(f"🚀 Starting server on port {port}")
    print(f"🌐 Environment: {os.environ.get('RAILWAY_ENVIRONMENT', 'local')}")
    uvicorn.run(app, host="0.0.0.0", port=port)

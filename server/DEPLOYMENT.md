# Railway Deployment Guide

This guide explains how to deploy the AI-Takeoff server to Railway with all necessary system dependencies.

## Issues Fixed

The following dependency issues have been resolved:

1. **Tesseract OCR Error**: `tesseract is not installed or it's not in your PATH`
2. **Fontconfig Error**: `Cannot load default config file: No such file: (null)`
3. **OpenGL Error**: `libGL.so.1: cannot open shared object file: No such file or directory`

## Solution Overview

### 1. Nixpacks Configuration (`nixpacks.toml`)

The `nixpacks.toml` file configures Railway to install all required system dependencies:

```toml
[phases.setup]
nixPkgs = [
    "tesseract",           # OCR engine
    "tesseract-data-eng",  # English language data
    "fontconfig",          # Font configuration
    "libGL",               # OpenGL libraries
    "mesa",                # Mesa OpenGL implementation
    "xorg.libX11",         # X11 libraries
    "xorg.libXext",        # X11 extensions
    "xorg.libXrender",     # X11 rendering
    "xorg.libXi",          # X11 input
    "xorg.libXrandr",      # X11 randr extension
    "xorg.libXcursor",     # X11 cursor
    "xorg.libXinerama",    # X11 inerama
    "xorg.libXxf86vm",     # X11 xf86vmode
    "libglvnd",            # OpenGL vendor neutral dispatch
    "glib",                # GLib library
    "cairo",               # Cairo graphics library
    "pango",               # Pango text rendering
    "gdk-pixbuf",          # GDK pixbuf
    "gtk+3",               # GTK+ 3
    "poppler",             # PDF rendering
    "poppler_utils"        # PDF utilities
]
```

### 2. Python Dependencies (`requirements.txt`)

Updated to use `opencv-python-headless` instead of `opencv-python` for headless operation:

```
opencv-python-headless>=4.8.0
```

### 3. Environment Configuration

#### `setup_environment.py`
- Configures environment variables for headless operation
- Sets up font configuration paths
- Checks system dependencies availability

#### Environment Variables Set:
- `QT_QPA_PLATFORM=offscreen`
- `MPLBACKEND=Agg`
- `DISPLAY=:99`
- `FONTCONFIG_PATH=/etc/fonts`
- `OPENCV_IO_ENABLE_OPENEXR=1`

### 4. Code Updates

#### Tesseract Configuration (`api/pdf_text_extractor.py`)
- Automatic tesseract path detection
- Fallback to system PATH
- Better error handling and diagnostics

#### OpenCV Configuration (`processors/Step5.py`)
- Headless mode configuration
- Error handling for missing OpenGL libraries
- Graceful degradation

#### CairoSVG Configuration (`processors/Step4.py`, `api/cloudinary_manager.py`)
- Fontconfig path configuration
- Error handling for missing font dependencies
- Better error messages

## Deployment Steps

### 1. Deploy to Railway

1. Connect your GitHub repository to Railway
2. Railway will automatically detect the `nixpacks.toml` file
3. The build process will install all system dependencies
4. The application will start with proper environment configuration

### 2. Environment Variables

Set these environment variables in Railway dashboard:

```
CONVERTIO_API_KEY=your_convertio_api_key
CLOUDINARY_CLOUD_NAME=dvord9edi
CLOUDINARY_API_KEY=323184262698784
CLOUDINARY_API_SECRET=V92mnHScgdYhjeQMWI5Dw63e8Fg
```

### 3. Verify Deployment

After deployment, test the following endpoints:

- `GET /` - Health check
- `GET /health` - Detailed health check
- `GET /AI-Takeoff/{upload_id}` - Main processing endpoint

## Troubleshooting

### If Tesseract Still Fails:
1. Check Railway logs for tesseract installation
2. Verify the tesseract path in logs
3. Ensure `tesseract-data-eng` is installed

### If Fontconfig Still Fails:
1. Check if `/etc/fonts` exists in the container
2. Verify fontconfig package installation
3. Check environment variable `FONTCONFIG_PATH`

### If OpenGL Still Fails:
1. Verify all X11 and OpenGL packages are installed
2. Check if `opencv-python-headless` is being used
3. Ensure headless environment variables are set

### If Cloudinary Uploads Fail:
1. Verify Cloudinary credentials
2. Check network connectivity
3. Ensure file paths are correct

## Dependency Verification

### Automatic Verification

The application now includes comprehensive dependency verification:

1. **Build-time verification** in Dockerfile
2. **Startup verification** in main.py
3. **Health check endpoint** at `/health`
4. **Comprehensive verification script** (`verify_dependencies.py`)

### Manual Testing

#### Local Testing
```bash
# Test dependencies locally
python test_dependencies.py

# Run comprehensive verification
python verify_dependencies.py
```

#### Remote Testing
```bash
# Check health endpoint
curl https://your-railway-app.railway.app/health

# The response will include dependency status:
{
  "status": "healthy",
  "dependencies": {
    "opencv": {"status": "ok", "version": "4.8.0"},
    "tesseract": {"status": "ok"},
    "cairosvg": {"status": "ok"},
    "cloudinary": {"status": "ok"}
  }
}
```

## Monitoring

Monitor the following in Railway logs:

1. **Docker Build**: Look for dependency verification messages
2. **Environment Setup**: Look for "Environment setup completed"
3. **Dependency Verification**: Look for "All dependencies verified successfully"
4. **Tesseract**: Look for "Tesseract OCR is available"
5. **Health Checks**: Monitor `/health` endpoint responses
6. **Processing**: Monitor step-by-step processing logs

### Build Log Monitoring

Watch for these success messages in Railway build logs:
```
🔍 Verifying system dependencies...
✅ System dependencies verified
🔍 Verifying Python packages...
✅ Python packages verified
🎉 ALL DEPENDENCIES VERIFIED SUCCESSFULLY!
```

## Performance Notes

- The initial build may take longer due to system dependency installation
- Subsequent deployments will be faster with cached dependencies
- Memory usage may be higher due to additional system libraries
- Consider upgrading Railway plan if memory issues occur

## Support

If you encounter issues:

1. Check Railway build logs for dependency installation errors
2. Verify all environment variables are set correctly
3. Test individual components (tesseract, opencv, cairosvg) separately
4. Check the application logs for specific error messages

The application should now work correctly on Railway with all system dependencies properly installed and configured.

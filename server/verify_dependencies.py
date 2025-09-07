#!/usr/bin/env python3
"""
Comprehensive dependency verification script
Checks all system and Python dependencies required for the application
"""

import os
import sys
import subprocess
import importlib
import glob
from pathlib import Path

def check_system_command(command, name, alternative_paths=None):
    """Check if a system command is available"""
    try:
        result = subprocess.run(['which', command], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ {name} found at: {result.stdout.strip()}")
            return True
        else:
            print(f"❌ {name} not found in PATH")
            
            # Check alternative paths
            if alternative_paths:
                for alt_path in alternative_paths:
                    if os.path.exists(alt_path):
                        print(f"✅ {name} found at alternative path: {alt_path}")
                        return True
            
            return False
    except Exception as e:
        print(f"❌ Error checking {name}: {e}")
        return False

def check_python_package(package_name, import_name=None):
    """Check if a Python package is installed and importable"""
    if import_name is None:
        import_name = package_name
    
    try:
        module = importlib.import_module(import_name)
        version = getattr(module, '__version__', 'unknown')
        print(f"✅ {package_name} installed (version: {version})")
        return True
    except ImportError:
        print(f"❌ {package_name} not installed or not importable")
        return False
    except Exception as e:
        print(f"❌ Error importing {package_name}: {e}")
        return False

def check_library_file(pattern, name):
    """Check if a library file exists"""
    files = glob.glob(pattern)
    if files:
        print(f"✅ {name} found: {files}")
        return True
    else:
        print(f"❌ {name} not found (pattern: {pattern})")
        return False

def check_environment_variables():
    """Check if required environment variables are set"""
    required_vars = [
        'QT_QPA_PLATFORM',
        'MPLBACKEND',
        'FONTCONFIG_PATH'
    ]
    
    print("\n🔧 Environment Variables:")
    all_set = True
    
    for var in required_vars:
        value = os.environ.get(var)
        if value:
            print(f"✅ {var} = {value}")
        else:
            print(f"❌ {var} not set")
            all_set = False
    
    return all_set

def test_tesseract():
    """Test tesseract functionality"""
    try:
        result = subprocess.run(['tesseract', '--version'], capture_output=True, text=True)
        if result.returncode == 0:
            print(f"✅ Tesseract working: {result.stdout.strip().split()[1]}")
            return True
        else:
            print(f"❌ Tesseract not working: {result.stderr}")
            return False
    except Exception as e:
        print(f"❌ Error testing tesseract: {e}")
        return False

def test_opencv():
    """Test OpenCV functionality"""
    try:
        import cv2
        print(f"✅ OpenCV working (version: {cv2.__version__})")
        
        # Test basic functionality
        import numpy as np
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        print("✅ OpenCV color conversion working")
        return True
    except Exception as e:
        print(f"❌ OpenCV test failed: {e}")
        return False

def test_cairosvg():
    """Test CairoSVG functionality"""
    try:
        import cairosvg
        print("✅ CairoSVG import successful")
        
        # Test basic SVG to PNG conversion
        test_svg = '''<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="red"/>
        </svg>'''
        
        png_data = cairosvg.svg2png(bytestring=test_svg.encode())
        if len(png_data) > 0:
            print("✅ CairoSVG conversion working")
            return True
        else:
            print("❌ CairoSVG conversion failed")
            return False
    except Exception as e:
        print(f"❌ CairoSVG test failed: {e}")
        return False

def test_pytesseract():
    """Test pytesseract functionality"""
    try:
        import pytesseract
        from PIL import Image
        import numpy as np
        
        # Create a simple test image with text
        img = Image.new('RGB', (200, 50), color='white')
        # Note: This is just testing the import and basic functionality
        print("✅ Pytesseract import successful")
        
        # Test tesseract path
        try:
            version = pytesseract.get_tesseract_version()
            print(f"✅ Pytesseract can access tesseract (version: {version})")
            return True
        except Exception as e:
            print(f"❌ Pytesseract cannot access tesseract: {e}")
            return False
    except Exception as e:
        print(f"❌ Pytesseract test failed: {e}")
        return False

def main():
    """Main verification function"""
    print("🔍 AI-Takeoff Dependency Verification")
    print("=" * 50)
    
    all_good = True
    
    # System Commands
    print("\n📋 System Commands:")
    system_checks = [
        ('tesseract', 'Tesseract OCR', ['/usr/bin/tesseract', '/usr/local/bin/tesseract']),
        ('fontconfig', 'Fontconfig', ['/usr/bin/fontconfig']),
    ]
    
    for cmd, name, alt_paths in system_checks:
        if not check_system_command(cmd, name, alt_paths):
            all_good = False
    
    # Library Files
    print("\n📚 Library Files:")
    library_checks = [
        ('/usr/lib*/libGL*', 'OpenGL Libraries'),
        ('/usr/lib*/libcairo*', 'Cairo Libraries'),
        ('/usr/lib*/libfontconfig*', 'Fontconfig Libraries'),
        ('/usr/lib*/libpango*', 'Pango Libraries'),
        ('/usr/lib*/libgdk-pixbuf*', 'GDK Pixbuf Libraries'),
    ]
    
    for pattern, name in library_checks:
        if not check_library_file(pattern, name):
            all_good = False
    
    # Python Packages
    print("\n🐍 Python Packages:")
    python_checks = [
        ('fastapi', 'fastapi'),
        ('uvicorn', 'uvicorn'),
        ('pydantic', 'pydantic'),
        ('opencv-python-headless', 'cv2'),
        ('numpy', 'numpy'),
        ('Pillow', 'PIL'),
        ('cairosvg', 'cairosvg'),
        ('cloudinary', 'cloudinary'),
        ('pdf2image', 'pdf2image'),
        ('pytesseract', 'pytesseract'),
        ('requests', 'requests'),
        ('httpx', 'httpx'),
    ]
    
    for package, import_name in python_checks:
        if not check_python_package(package, import_name):
            all_good = False
    
    # Environment Variables
    env_ok = check_environment_variables()
    if not env_ok:
        all_good = False
    
    # Functionality Tests
    print("\n🧪 Functionality Tests:")
    
    if not test_tesseract():
        all_good = False
    
    if not test_opencv():
        all_good = False
    
    if not test_cairosvg():
        all_good = False
    
    if not test_pytesseract():
        all_good = False
    
    # Summary
    print("\n" + "=" * 50)
    if all_good:
        print("🎉 ALL DEPENDENCIES VERIFIED SUCCESSFULLY!")
        print("✅ Your application should work correctly on Railway")
    else:
        print("❌ SOME DEPENDENCIES ARE MISSING OR NOT WORKING")
        print("⚠️  Check the errors above and ensure proper installation")
    
    return all_good

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

#!/usr/bin/env python3
"""
Quick dependency test script
Run this locally to test if all dependencies are working
"""

import sys
import os

def test_imports():
    """Test all critical imports"""
    print("🧪 Testing Python imports...")
    
    tests = [
        ("fastapi", "FastAPI"),
        ("uvicorn", "Uvicorn"),
        ("cv2", "OpenCV"),
        ("numpy", "NumPy"),
        ("PIL", "Pillow"),
        ("cairosvg", "CairoSVG"),
        ("pytesseract", "Pytesseract"),
        ("cloudinary", "Cloudinary"),
        ("pdf2image", "PDF2Image"),
        ("requests", "Requests"),
    ]
    
    all_good = True
    
    for module, name in tests:
        try:
            __import__(module)
            print(f"✅ {name} - OK")
        except ImportError as e:
            print(f"❌ {name} - FAILED: {e}")
            all_good = False
    
    return all_good

def test_system_commands():
    """Test system commands"""
    print("\n🔧 Testing system commands...")
    
    import subprocess
    
    commands = [
        ("tesseract", "Tesseract OCR"),
        ("fontconfig", "Fontconfig"),
    ]
    
    all_good = True
    
    for cmd, name in commands:
        try:
            result = subprocess.run(['which', cmd], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ {name} - Found at: {result.stdout.strip()}")
            else:
                print(f"❌ {name} - Not found in PATH")
                all_good = False
        except Exception as e:
            print(f"❌ {name} - Error: {e}")
            all_good = False
    
    return all_good

def test_functionality():
    """Test basic functionality"""
    print("\n⚙️  Testing functionality...")
    
    all_good = True
    
    # Test OpenCV
    try:
        import cv2
        import numpy as np
        img = np.zeros((100, 100, 3), dtype=np.uint8)
        cv2.cvtColor(img, cv2.COLOR_BGR2HSV)
        print("✅ OpenCV color conversion - OK")
    except Exception as e:
        print(f"❌ OpenCV test - FAILED: {e}")
        all_good = False
    
    # Test CairoSVG
    try:
        import cairosvg
        test_svg = '''<svg width="100" height="100" xmlns="http://www.w3.org/2000/svg">
            <rect width="100" height="100" fill="red"/>
        </svg>'''
        png_data = cairosvg.svg2png(bytestring=test_svg.encode())
        if len(png_data) > 0:
            print("✅ CairoSVG conversion - OK")
        else:
            print("❌ CairoSVG conversion - FAILED: No output")
            all_good = False
    except Exception as e:
        print(f"❌ CairoSVG test - FAILED: {e}")
        all_good = False
    
    # Test Tesseract
    try:
        import pytesseract
        version = pytesseract.get_tesseract_version()
        print(f"✅ Tesseract - OK (version: {version})")
    except Exception as e:
        print(f"❌ Tesseract test - FAILED: {e}")
        all_good = False
    
    return all_good

def main():
    """Main test function"""
    print("🔍 Quick Dependency Test")
    print("=" * 40)
    
    imports_ok = test_imports()
    commands_ok = test_system_commands()
    functionality_ok = test_functionality()
    
    print("\n" + "=" * 40)
    if imports_ok and commands_ok and functionality_ok:
        print("🎉 ALL TESTS PASSED!")
        print("✅ Your local environment is ready")
    else:
        print("❌ SOME TESTS FAILED")
        print("⚠️  Check the errors above")
    
    return imports_ok and commands_ok and functionality_ok

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)

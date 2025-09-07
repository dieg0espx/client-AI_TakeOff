#!/usr/bin/env python3
"""
Environment setup script for Railway deployment
Configures system dependencies and environment variables
"""

import os
import sys
import subprocess

def setup_environment():
    """Setup environment variables and check system dependencies"""
    
    print("🔧 Setting up environment for Railway deployment...")
    
    # Set environment variables for headless operation
    os.environ['QT_QPA_PLATFORM'] = 'offscreen'
    os.environ['MPLBACKEND'] = 'Agg'
    os.environ['DISPLAY'] = ':99'
    
    # Configure OpenCV for headless operation
    os.environ['OPENCV_IO_ENABLE_OPENEXR'] = '1'
    
    # Set font configuration
    if not os.environ.get('FONTCONFIG_PATH'):
        os.environ['FONTCONFIG_PATH'] = '/etc/fonts'
    
    print("✅ Environment variables configured")
    
    # Check system dependencies
    dependencies = [
        ('tesseract', 'Tesseract OCR'),
        ('fontconfig', 'Font configuration'),
    ]
    
    for cmd, name in dependencies:
        try:
            result = subprocess.run(['which', cmd], capture_output=True, text=True)
            if result.returncode == 0:
                print(f"✅ {name} found at: {result.stdout.strip()}")
            else:
                print(f"⚠️  {name} not found in PATH")
        except Exception as e:
            print(f"⚠️  Error checking {name}: {e}")
    
    # Check OpenGL libraries
    opengl_libs = [
        '/usr/lib/x86_64-linux-gnu/libGL.so.1',
        '/usr/lib/libGL.so.1',
        '/nix/store',
    ]
    
    opengl_found = False
    for lib_path in opengl_libs:
        if os.path.exists(lib_path):
            print(f"✅ OpenGL library found at: {lib_path}")
            opengl_found = True
            break
    
    if not opengl_found:
        print("⚠️  OpenGL libraries not found - using headless mode")
    
    print("🎉 Environment setup completed!")

if __name__ == "__main__":
    setup_environment()

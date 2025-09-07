#!/usr/bin/env python3
"""
Environment setup script for Railway deployment
Configures system dependencies and environment variables
"""

import os
import sys
import subprocess
import glob

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
    fontconfig_paths = ['/etc/fonts', '/usr/share/fontconfig', '/nix/store']
    for path in fontconfig_paths:
        if os.path.exists(path):
            os.environ['FONTCONFIG_PATH'] = path
            print(f"✅ Fontconfig path set to: {path}")
            break
    else:
        os.environ['FONTCONFIG_PATH'] = '/etc/fonts'
        print("⚠️  Using default fontconfig path: /etc/fonts")
    
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
                # Try to find alternative paths
                if cmd == 'tesseract':
                    alt_paths = ['/usr/bin/tesseract', '/usr/local/bin/tesseract']
                    for alt_path in alt_paths:
                        if os.path.exists(alt_path):
                            print(f"✅ Found {name} at alternative path: {alt_path}")
                            break
        except Exception as e:
            print(f"⚠️  Error checking {name}: {e}")
    
    # Check OpenGL libraries
    opengl_libs = [
        '/usr/lib/x86_64-linux-gnu/libGL.so.1',
        '/usr/lib/libGL.so.1',
        '/usr/lib64/libGL.so.1',
        '/nix/store',
    ]
    
    opengl_found = False
    for lib_path in opengl_libs:
        if os.path.exists(lib_path):
            print(f"✅ OpenGL library found at: {lib_path}")
            opengl_found = True
            break
    
    # Also check for any libGL files
    if not opengl_found:
        gl_files = glob.glob('/usr/lib*/libGL*')
        if gl_files:
            print(f"✅ Found OpenGL libraries: {gl_files}")
            opengl_found = True
    
    if not opengl_found:
        print("⚠️  OpenGL libraries not found - using headless mode")
    
    # Check Cairo libraries
    cairo_libs = ['/usr/lib/x86_64-linux-gnu/libcairo.so*', '/usr/lib/libcairo.so*']
    cairo_found = False
    for pattern in cairo_libs:
        if glob.glob(pattern):
            print(f"✅ Cairo library found: {glob.glob(pattern)}")
            cairo_found = True
            break
    
    if not cairo_found:
        print("⚠️  Cairo libraries not found - SVG conversion may fail")
    
    print("🎉 Environment setup completed!")

if __name__ == "__main__":
    setup_environment()

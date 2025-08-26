import os
import json
from pdf2image import convert_from_path
import pytesseract

def extract_text_from_pdf(pdf_path: str = None) -> str:
    """
    Extract text from a PDF file using OCR and print it to console
    
    Args:
        pdf_path (str): Path to the PDF file. If None, uses 'files/original.pdf'
    
    Returns:
        str: Extracted text from the PDF
    """
    global extracted_text
    
    # Default to the original.pdf file if no path provided
    if pdf_path is None:
        pdf_path = os.path.join('files', 'original.pdf')
    
    # Check if file exists
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found: {pdf_path}")
        return ""
    
    try:
        print(f"📄 Extracting text from: {pdf_path}")
        
        # Convert PDF to images
        print("🔄 Converting PDF to images for OCR processing...")
        images = convert_from_path(pdf_path)
        
        print(f"📊 PDF has {len(images)} pages")
        extracted_text = ""
        
        # Extract text from each page using OCR
        for i, image in enumerate(images):
            print(f"📖 Processing page {i + 1}/{len(images)} with OCR...")
            
            # Extract text from image using pytesseract
            text = pytesseract.image_to_string(image)
            
            if text.strip():
                print(f"📄 Page {i + 1} extracted text:")
                print("-" * 50)
                print(text)
                print("-" * 50)
                extracted_text += f"\n--- Page {i + 1} ---\n{text}\n"
            else:
                print(f"⚠️  Page {i + 1} appears to be empty or contains no extractable text")
        
        # Print summary
        total_chars = len(extracted_text)
        print(f"\n📊 OCR Text extraction summary:")
        print(f"   - Total pages: {len(images)}")
        print(f"   - Total characters extracted: {total_chars}")
        print(f"   - File size: {os.path.getsize(pdf_path)} bytes")
        
        if total_chars == 0:
            print("⚠️  No text was extracted. This might be a scanned document with poor quality.")
        
        return extracted_text
        
    except Exception as e:
        print(f"❌ Error extracting text from PDF: {str(e)}")
        return ""

def main():
    """Main function to run text extraction"""
    print("🔍 PDF Text Extractor (OCR)")
    print("=" * 50)
    
    # Extract text from the original.pdf file
    text = extract_text_from_pdf()
    
    if text:
        print("\n✅ OCR text extraction completed successfully!")
    else:
        print("\n❌ OCR text extraction failed or no text found.")

if __name__ == "__main__":
    main()

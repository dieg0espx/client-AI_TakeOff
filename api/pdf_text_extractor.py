import os
import PyPDF2
from pathlib import Path

def extract_text_from_pdf(pdf_path: str = None) -> str:
    """
    Extract text from a PDF file and print it to console
    
    Args:
        pdf_path (str): Path to the PDF file. If None, uses 'files/original.pdf'
    
    Returns:
        str: Extracted text from the PDF
    """
    # Default to the original.pdf file if no path provided
    if pdf_path is None:
        pdf_path = os.path.join('files', 'original.pdf')
    
    # Check if file exists
    if not os.path.exists(pdf_path):
        print(f"❌ PDF file not found: {pdf_path}")
        return ""
    
    try:
        print(f"📄 Extracting text from: {pdf_path}")
        
        # Open the PDF file
        with open(pdf_path, 'rb') as file:
            # Create PDF reader object
            pdf_reader = PyPDF2.PdfReader(file)
            
            # Get number of pages
            num_pages = len(pdf_reader.pages)
            print(f"📊 PDF has {num_pages} pages")
            
            extracted_text = ""
            
            # Extract text from each page
            for page_num in range(num_pages):
                print(f"📖 Processing page {page_num + 1}/{num_pages}")
                
                # Get the page
                page = pdf_reader.pages[page_num]
                
                # Extract text from the page
                page_text = page.extract_text()
                
                if page_text.strip():
                    print(f"📄 Page {page_num + 1} text:")
                    print("-" * 50)
                    print(page_text)
                    print("-" * 50)
                    extracted_text += f"\n--- Page {page_num + 1} ---\n{page_text}\n"
                else:
                    print(f"⚠️  Page {page_num + 1} appears to be empty or contains no extractable text")
            
            # Print summary
            total_chars = len(extracted_text)
            print(f"\n📊 Text extraction summary:")
            print(f"   - Total pages: {num_pages}")
            print(f"   - Total characters extracted: {total_chars}")
            print(f"   - File size: {os.path.getsize(pdf_path)} bytes")
            
            if total_chars == 0:
                print("⚠️  No text was extracted. This might be a scanned document or image-based PDF.")
            
            return extracted_text
            
    except Exception as e:
        print(f"❌ Error extracting text from PDF: {str(e)}")
        return ""

def main():
    """Main function to run text extraction"""
    print("🔍 PDF Text Extractor")
    print("=" * 50)
    
    # Extract text from the original.pdf file
    text = extract_text_from_pdf()
    
    if text:
        print("\n✅ Text extraction completed successfully!")
    else:
        print("\n❌ Text extraction failed or no text found.")

if __name__ == "__main__":
    main()

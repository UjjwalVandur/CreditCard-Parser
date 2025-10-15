from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pdfplumber
import re
import tempfile
import os
from typing import Optional
from datetime import datetime

app = FastAPI(
    title="Credit Card Statement Parser API",
    description="Extract key data from credit card statements",
    version="1.0.0"
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Update with your Next.js domain in production
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supported banks configuration
SUPPORTED_BANKS = {
    "HDFC": ["HDFC", "HDFC BANK"],
    "ICICI": ["ICICI", "ICICI BANK"],
    "SBI": ["SBI", "STATE BANK OF INDIA"],
    "AXIS": ["AXIS", "AXIS BANK"],
    "AMEX": ["AMERICAN EXPRESS", "AMEX"]
}

def extract_text(file_path: str) -> str:
    """Extract text from PDF using pdfplumber"""
    try:
        with pdfplumber.open(file_path) as pdf:
            text_parts = []
            for page in pdf.pages:
                page_text = page.extract_text()
                if page_text:
                    text_parts.append(page_text)
            return "\n".join(text_parts)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error reading PDF: {str(e)}")

def detect_bank(text: str) -> str:
    """Detect bank from statement text"""
    text_upper = text.upper()
    
    for bank, keywords in SUPPORTED_BANKS.items():
        if any(keyword in text_upper for keyword in keywords):
            return bank
    
    return "UNKNOWN"

def extract_field(text: str, patterns: list, default: str = "Not Found") -> str:
    """Try multiple regex patterns to extract a field"""
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE | re.MULTILINE)
        if match:
            result = match.group(1).strip()
            # Clean up extra whitespace
            result = re.sub(r'\s+', ' ', result)
            return result
    return default

def parse_statement_data(text: str, bank: str) -> dict:
    """Parse statement data with bank-specific patterns"""
    
    # Common patterns for all banks
    name_patterns = [
        r"Name\s*:\s*([A-Z\s]+?)(?:\n|$)",
        r"Cardholder\s*Name\s*:\s*([A-Z\s]+?)(?:\n|$)",
        r"Card\s*Member\s*:\s*([A-Z\s]+?)(?:\n|$)",
        r"Dear\s+([A-Z\s]+?)(?:,|\n)"
    ]
    
    card_patterns = [
        r"(?:XXXX|xxxx|\*{4})[\s-]*(?:XXXX|xxxx|\*{4})[\s-]*(?:XXXX|xxxx|\*{4})[\s-]*(\d{4})",
        r"Card\s*(?:Number|No\.?)\s*:?\s*(?:XXXX|xxxx|\*{4})[\s-]*(\d{4})",
        r"ending\s*(?:in\s*)?(\d{4})"
    ]
    
    billing_patterns = [
        r"Statement\s*Period\s*:?\s*([^\n]+)",
        r"Billing\s*(?:Period|Cycle)\s*:?\s*([^\n]+)",
        r"Statement\s*Date\s*:?\s*([^\n]+)"
    ]
    
    due_date_patterns = [
        r"Payment\s*Due\s*Date\s*:?\s*([^\n]+)",
        r"Due\s*Date\s*:?\s*([^\n]+)",
        r"Pay\s*By\s*:?\s*([^\n]+)"
    ]
    
    amount_patterns = [
        r"Total\s*Amount\s*Due\s*:?\s*₹?\s*([\d,]+\.?\d{0,2})",
        r"Total\s*Due\s*:?\s*₹?\s*([\d,]+\.?\d{0,2})",
        r"Amount\s*Payable\s*:?\s*₹?\s*([\d,]+\.?\d{0,2})",
        r"Closing\s*Balance\s*:?\s*₹?\s*([\d,]+\.?\d{0,2})"
    ]
    
    # Extract data
    cardholder_name = extract_field(text, name_patterns)
    card_last4 = extract_field(text, card_patterns)
    billing_cycle = extract_field(text, billing_patterns)
    payment_due_date = extract_field(text, due_date_patterns)
    total_amount_due = extract_field(text, amount_patterns)
    
    # Format amount with currency symbol
    if total_amount_due != "Not Found":
        if not total_amount_due.startswith("₹"):
            total_amount_due = f"₹{total_amount_due}"
    
    return {
        "bank": bank,
        "cardholder_name": cardholder_name,
        "card_last4": card_last4,
        "billing_cycle": billing_cycle,
        "payment_due_date": payment_due_date,
        "total_amount_due": total_amount_due
    }

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "active",
        "service": "Credit Card Statement Parser",
        "supported_banks": list(SUPPORTED_BANKS.keys()),
        "timestamp": datetime.now().isoformat()
    }

@app.get("/supported-banks")
async def get_supported_banks():
    """Get list of supported banks"""
    return {
        "banks": list(SUPPORTED_BANKS.keys()),
        "total": len(SUPPORTED_BANKS)
    }

@app.post("/parse")
async def parse_pdf(file: UploadFile = File(...)):
    """
    Parse credit card statement PDF and extract key information
    
    - **file**: PDF file of credit card statement
    
    Returns extracted data including:
    - Bank name
    - Cardholder name
    - Last 4 digits of card
    - Billing cycle
    - Payment due date
    - Total amount due
    """
    
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=400, 
            detail="Only PDF files are supported"
        )
    
    # Check file size (10MB limit)
    file_content = await file.read()
    if len(file_content) > 10 * 1024 * 1024:
        raise HTTPException(
            status_code=400,
            detail="File size exceeds 10MB limit"
        )
    
    # Create temporary file
    try:
        with tempfile.NamedTemporaryFile(delete=False, suffix='.pdf') as tmp:
            tmp.write(file_content)
            tmp_path = tmp.name
        
        # Extract text from PDF
        text = extract_text(tmp_path)
        
        if not text or len(text.strip()) < 50:
            raise HTTPException(
                status_code=400,
                detail="Unable to extract text from PDF. File may be corrupted or empty."
            )
        
        # Detect bank
        bank = detect_bank(text)
        
        if bank == "UNKNOWN":
            raise HTTPException(
                status_code=400,
                detail=f"Bank not recognized. Supported banks: {', '.join(SUPPORTED_BANKS.keys())}"
            )
        
        # Parse statement data
        data = parse_statement_data(text, bank)
        
        # Check if critical data was found
        missing_fields = [
            field for field, value in data.items() 
            if value == "Not Found" and field != "bank"
        ]
        
        if len(missing_fields) >= 3:
            return JSONResponse(
                status_code=206,  # Partial content
                content={
                    **data,
                    "warning": f"Some fields could not be extracted: {', '.join(missing_fields)}",
                    "status": "partial"
                }
            )
        
        return {
            **data,
            "status": "success",
            "timestamp": datetime.now().isoformat()
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error processing statement: {str(e)}"
        )
    finally:
        # Clean up temporary file
        try:
            if os.path.exists(tmp_path):
                os.unlink(tmp_path)
        except:
            pass

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    """Global exception handler"""
    return JSONResponse(
        status_code=500,
        content={
            "error": "Internal server error",
            "detail": str(exc)
        }
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
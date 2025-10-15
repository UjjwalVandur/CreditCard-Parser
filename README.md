# 💳 Credit Card Statement Parser

A full-stack web application that parses PDF credit card statements and extracts key financial data points (like billing cycle, total amount due, transactions, etc.) using **Python FastAPI** on the backend and a **Next.js (JavaScript)** frontend styled with **Tailwind CSS**.

---

## 🚀 Features

- 🧾 Upload PDF credit card statements from 5 major issuers  
- 🤖 Automatic data extraction using a Python-based parser (pdfplumber + regex)  
- 📊 Extracts 5 key fields (customizable)  
  - Card last 4 digits  
  - Billing cycle  
  - Total amount due  
  - Payment due date  
  - Transaction summary  
- 🌐 Modern responsive frontend built with Next.js + Tailwind CSS  
- ⚙️ FastAPI backend for PDF parsing and data delivery via REST API  

---

## 🧠 Tech Stack

| Layer | Technology |
|:------|:------------|
| **Frontend** | Next.js (JavaScript), Tailwind CSS |
| **Backend** | FastAPI (Python) |
| **PDF Parsing** | pdfplumber, regex |
| **Communication** | REST API (JSON) |
| **Deployment Ready** | Works locally and can be deployed to Vercel (frontend) + Render / Railway (backend) |

---

## Backend Setup
cd backend<br>
python -m venv venv
### Activate virtual environment
## Windows:
venv\Scripts\activate
## macOS/Linux:
source venv/bin/activate

## install dependencies
pip install -r requirements.txt

## run server
uvicorn main:app --reload --port 8000

---
## Frontend Setup
cd ../frontend<br>
npm install<br>
npm run dev<br>




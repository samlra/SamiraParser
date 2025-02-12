from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import PyPDF2
import io
import spacy
import numpy as np
import json

app = FastAPI()

# Load the German language model
try:
    nlp = spacy.load("de_core_news_lg")
except OSError:
    raise RuntimeError(
        "The German language model is not installed. Please run: python -m spacy download de_core_news_lg"
    )

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class Requirement(BaseModel):
    text: str

def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text.lower()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Error extracting text from PDF: {str(e)}")

def calculate_semantic_similarity(cv_text: str, requirement: str) -> float:
    try:
        # Process the texts with spaCy
        cv_doc = nlp(cv_text)
        req_doc = nlp(requirement)
        
        # Calculate similarity score
        similarity = cv_doc.similarity(req_doc)
        
        # Normalize score to percentage (0-100)
        score = max(min(similarity * 100, 100), 0)
        
        return score
    except Exception as e:
        print(f"Error calculating similarity: {str(e)}")
        return 0.0

@app.post("/analyze-cv")
async def analyze_cv(
    file: UploadFile = File(...),
    requirements: str = Query(None, description="JSON string of requirements array")
):
    if not file.filename.lower().endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    
    if not requirements:
        raise HTTPException(status_code=400, detail="No requirements provided")
    
    try:
        # Parse requirements from query parameter
        requirements_list = json.loads(requirements)
        if not isinstance(requirements_list, list):
            raise ValueError("Requirements must be an array")
        
        # Validate requirements format
        if not all(isinstance(req, dict) and 'text' in req for req in requirements_list):
            raise ValueError("Each requirement must be an object with a 'text' field")
        
        # Read the file content
        file_content = await file.read()
        
        # Extract text from PDF
        cv_text = extract_text_from_pdf(file_content)
        
        if not cv_text.strip():
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")
        
        # Calculate similarity scores for each requirement
        scores = []
        for req in requirements_list:
            score = calculate_semantic_similarity(cv_text, req['text'])
            scores.append({
                "requirement": req['text'],
                "score": round(score, 1)
            })
        
        # Calculate overall score (average of all scores)
        overall_score = round(np.mean([s["score"] for s in scores]), 1) if scores else 0.0
        
        return {
            "overall_score": overall_score,
            "requirement_scores": scores,
            "cv_text": cv_text[:200] + "..." if len(cv_text) > 200 else cv_text
        }
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for requirements")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 
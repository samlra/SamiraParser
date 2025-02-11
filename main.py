from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import PyPDF2
from transformers import pipeline
from sentence_transformers import SentenceTransformer, util
import torch
import io
import json

app = FastAPI(title="CV Parser API")

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load the German BERT model
model = SentenceTransformer('deutsche-telekom/gbert-large')

class JobRequirements(BaseModel):
    requirements: List[str]

def extract_text_from_pdf(file_content: bytes) -> str:
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(file_content))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        raise HTTPException(status_code=400, detail="Fehler beim PDF-Parsing")

def calculate_similarity_score(cv_text: str, requirements: List[str]) -> dict:
    # Encode CV text
    cv_embedding = model.encode(cv_text, convert_to_tensor=True)
    
    scores = []
    matches = []
    
    # Calculate similarity for each requirement
    for req in requirements:
        req_embedding = model.encode(req, convert_to_tensor=True)
        similarity = util.pytorch_cos_sim(cv_embedding, req_embedding)
        score = float(similarity[0][0])
        scores.append(score)
        matches.append({
            "requirement": req,
            "score": round(score * 100, 2)
        })
    
    # Calculate overall score
    overall_score = sum(scores) / len(scores) * 100
    
    return {
        "overall_score": round(overall_score, 2),
        "detailed_matches": matches
    }

@app.post("/analyze-cv")
async def analyze_cv(file: UploadFile = File(...), requirements: JobRequirements = None):
    if not file.filename.endswith('.pdf'):
        raise HTTPException(status_code=400, detail="Nur PDF-Dateien sind erlaubt")
    
    if not requirements or not requirements.requirements:
        raise HTTPException(status_code=400, detail="Keine Anforderungen angegeben")
    
    # Read and extract text from PDF
    file_content = await file.read()
    cv_text = extract_text_from_pdf(file_content)
    
    # Calculate similarity scores
    result = calculate_similarity_score(cv_text, requirements.requirements)
    
    return result

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 
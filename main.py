from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List
import PyPDF2
import io
import spacy
import numpy as np
import json
import openai
import os
from dotenv import load_dotenv
from openai import OpenAI
import re

app = FastAPI()

# Load environment variables
load_dotenv()

# Initialize OpenRouter client
client = OpenAI(
    base_url="https://openrouter.ai/api/v1",
    api_key=os.getenv("OPENAI_API_KEY"),
)

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

def get_ai_analysis(cv_text: str, requirements: List[dict]) -> dict:
    try:
        print(f"\n=== Starting AI Analysis ===")
        print(f"CV Text length: {len(cv_text)} characters")
        
        # Prepare the prompt for AI analysis
        requirements_text = "\n".join([f"- {req['text']}" for req in requirements])
        
        # Create a more structured prompt in German
        prompt = f"""Du bist ein KI-Assistent für CV-Analyse. Analysiere den folgenden Lebenslauf anhand der Stellenanforderungen.

Lebenslauf Text:
{cv_text}

Stellenanforderungen:
{requirements_text}

Bitte liefere eine detaillierte Analyse im folgenden JSON-Format (Antworten auf Deutsch):
{{
    "requirement_matches": [
        {{
            "requirement": "<Anforderungstext>",
            "match_percentage": <Zahl zwischen 0-100>,
            "explanation": "<Detaillierte Erklärung, warum der Kandidat die Anforderung erfüllt oder nicht erfüllt>"
        }}
    ],
    "overall_score": <Gesamtbewertung 0-100>,
    "summary": "<Ausführliche Gesamtbeurteilung des Kandidaten, inkl. Stärken und Schwächen>",
    "key_strengths": ["<Stärke 1>", "<Stärke 2>", ...],
    "improvement_areas": ["<Verbesserungsbereich 1>", "<Verbesserungsbereich 2>", ...]
}}"""

        try:
            print("\n=== Making OpenRouter API Call ===")
            
            completion = client.chat.completions.create(
                extra_headers={
                    "HTTP-Referer": "https://github.com/OpenRouterTeam/openrouter-python",
                    "X-Title": "CV Parser"
                },
                extra_body={},
                model="meta-llama/llama-4-maverick:free",
                messages=[
                    {
                        "role": "system",
                        "content": "Du bist ein deutscher CV-Analyse-Assistent. Antworte stets auf Deutsch und im korrekten JSON-Format."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.7,
                max_tokens=2000
            )
            
            if not completion.choices or not completion.choices[0].message:
                raise ValueError("Keine gültige Antwort von der API erhalten")
            
            response_content = completion.choices[0].message.content
            print("\nReceived response from API:", response_content[:200])
            
            try:
                # Try to extract JSON from the response, even if wrapped in text or code block
                # Remove code block markers if present
                response_content_clean = re.sub(r'```json|```', '', response_content, flags=re.IGNORECASE).strip()
                # Find the first '{' and last '}'
                start = response_content_clean.find('{')
                end = response_content_clean.rfind('}')
                if start != -1 and end != -1 and end > start:
                    json_str = response_content_clean[start:end+1]
                else:
                    json_str = response_content_clean
                ai_response = json.loads(json_str)
                required_fields = ["requirement_matches", "overall_score", "summary", "key_strengths", "improvement_areas"]
                for field in required_fields:
                    if field not in ai_response:
                        ai_response[field] = [] if field in ["requirement_matches", "key_strengths", "improvement_areas"] else (0 if field == "overall_score" else "Keine Analyse verfügbar")
                return ai_response
                
            except json.JSONDecodeError as e:
                print(f"\nJSON Parsing Error: {str(e)}")
                print("Raw response:", response_content)
                
                return {
                    "requirement_matches": [],
                    "overall_score": 0,
                    "summary": "Fehler bei der Analyse der AI-Antwort. Bitte versuchen Sie es erneut.",
                    "key_strengths": [],
                    "improvement_areas": []
                }
                
        except Exception as api_error:
            print(f"\nAPI Error: {str(api_error)}")
            if hasattr(api_error, 'response'):
                print("API Response:", api_error.response)
            
            return {
                "requirement_matches": [],
                "overall_score": 0,
                "summary": f"API-Fehler: {str(api_error)}",
                "key_strengths": [],
                "improvement_areas": []
            }
            
    except Exception as e:
        print(f"\nGeneral Error: {str(e)}")
        return {
            "requirement_matches": [],
            "overall_score": 0,
            "summary": f"Analysefehler: {str(e)}",
            "key_strengths": [],
            "improvement_areas": []
        }

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
        
        # Get AI analysis
        results = get_ai_analysis(cv_text, requirements_list)
        
        # Add the CV text to the response
        results["cv_text"] = cv_text[:200] + "..." if len(cv_text) > 200 else cv_text
        
        return results
        
    except json.JSONDecodeError:
        raise HTTPException(status_code=400, detail="Invalid JSON format for requirements")
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"An error occurred: {str(e)}")

@app.get("/health")
async def health_check():
    return {"status": "healthy"} 
# CV Parser and Rating System

A web-based application that parses CVs and rates them based on job requirements.

## Requirements
- Python 3.11.6
- All dependencies listed in requirements.txt

## Setup
1. Create a virtual environment:
```bash
python -m venv venv
```

2. Activate the virtual environment:
- Windows:
```bash
.\venv\Scripts\activate
```
- Unix/MacOS:
```bash
source venv/bin/activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Run the application:
```bash
python app.py
```

5. Open your browser and navigate to `http://localhost:5000`

## Features
- Upload and parse PDF/DOCX CVs
- Define and manage job requirements
- Automatic CV scoring based on requirement matching
- Clean and modern web interface
- Detailed analysis of CV-requirement matches

## Usage
1. Start by defining job requirements through the web interface
2. Upload CVs in PDF or DOCX format
3. View automatic ratings and detailed matching analysis
4. Export results if needed 
import os
from flask import Flask, render_template, request, jsonify, flash, redirect, url_for
from flask_bootstrap import Bootstrap5
from werkzeug.utils import secure_filename
import PyPDF2
from docx import Document
import nltk
from nltk.tokenize import word_tokenize
from nltk.corpus import stopwords
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import json
import sqlite3
from datetime import datetime

# NLTK-Daten herunterladen
nltk.download('punkt')
nltk.download('stopwords')
nltk.download('averaged_perceptron_tagger')

app = Flask(__name__)
app.config['SECRET_KEY'] = os.urandom(24)
app.config['UPLOAD_FOLDER'] = 'uploads'
app.config['MAX_CONTENT_LENGTH'] = 16 * 1024 * 1024  # Maximale Dateigröße: 16MB
ALLOWED_EXTENSIONS = {'pdf', 'docx'}

bootstrap = Bootstrap5(app)

# Datenbankinitialisierung
def init_db():
    conn = sqlite3.connect('jobs.db')
    c = conn.cursor()
    c.execute('''CREATE TABLE IF NOT EXISTS job_descriptions
                 (id INTEGER PRIMARY KEY AUTOINCREMENT,
                  title TEXT NOT NULL,
                  description TEXT NOT NULL,
                  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP)''')
    conn.commit()
    conn.close()

# Upload-Verzeichnis erstellen, falls es nicht existiert
os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
init_db()

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def extract_text_from_pdf(file_path):
    text = ""
    with open(file_path, 'rb') as file:
        pdf_reader = PyPDF2.PdfReader(file)
        for page in pdf_reader.pages:
            text += page.extract_text()
    return text

def extract_text_from_docx(file_path):
    doc = Document(file_path)
    text = ""
    for paragraph in doc.paragraphs:
        text += paragraph.text + "\n"
    return text

def parse_cv(file_path):
    file_extension = file_path.split('.')[-1].lower()
    if file_extension == 'pdf':
        return extract_text_from_pdf(file_path)
    elif file_extension == 'docx':
        return extract_text_from_docx(file_path)
    return ""

def save_job_description(title, description):
    conn = sqlite3.connect('jobs.db')
    c = conn.cursor()
    c.execute('INSERT INTO job_descriptions (title, description) VALUES (?, ?)',
              (title, description))
    job_id = c.lastrowid
    conn.commit()
    conn.close()
    return job_id

def get_job_descriptions():
    conn = sqlite3.connect('jobs.db')
    c = conn.cursor()
    c.execute('SELECT id, title, description FROM job_descriptions ORDER BY created_at DESC')
    jobs = c.fetchall()
    conn.close()
    return jobs

def get_job_description(job_id):
    conn = sqlite3.connect('jobs.db')
    c = conn.cursor()
    c.execute('SELECT title, description FROM job_descriptions WHERE id = ?', (job_id,))
    job = c.fetchone()
    conn.close()
    return job

def analyze_cv_with_job_description(cv_text, job_description):
    """
    TODO: Hier sollte die KI-Integration erfolgen.
    Aktuell verwenden wir noch die einfache TF-IDF-Analyse, 
    aber dies sollte durch einen KI-basierten Ansatz ersetzt werden.
    """
    # Lebenslauf-Text vorverarbeiten
    cv_tokens = word_tokenize(cv_text.lower())
    stop_words = set(stopwords.words('german'))
    cv_tokens = [token for token in cv_tokens if token not in stop_words]
    processed_cv = ' '.join(cv_tokens)

    # Stellenbeschreibung verarbeiten
    job_tokens = word_tokenize(job_description.lower())
    job_tokens = [token for token in job_tokens if token not in stop_words]
    processed_job = ' '.join(job_tokens)

    # TF-IDF und Ähnlichkeit berechnen
    vectorizer = TfidfVectorizer()
    tfidf_matrix = vectorizer.fit_transform([processed_cv, processed_job])
    
    # Ähnlichkeitswert berechnen
    similarity = cosine_similarity(tfidf_matrix[0:1], tfidf_matrix[1:2])[0][0]
    
    # Hier würde später die KI-Analyse kommen
    # Beispiel für strukturierte Rückgabe:
    return {
        'overall_score': float(similarity * 100),
        'detailed_analysis': {
            'qualifications_match': float(similarity * 100),
            'experience_match': float(similarity * 100),
            'skills_match': float(similarity * 100),
            'education_match': float(similarity * 100)
        },
        'recommendations': [
            'Basierend auf der aktuellen Analyse ohne KI können keine detaillierten Empfehlungen gegeben werden.',
            'Für eine genaue Analyse wird eine KI-Integration empfohlen.'
        ]
    }

@app.route('/')
def index():
    jobs = get_job_descriptions()
    return render_template('index.html', jobs=jobs)

@app.route('/job/new', methods=['POST'])
def new_job():
    title = request.form.get('job_title')
    description = request.form.get('job_description')
    
    if not title or not description:
        flash('Bitte geben Sie einen Titel und eine Beschreibung ein')
        return redirect(url_for('index'))
    
    job_id = save_job_description(title, description)
    flash('Stellenbeschreibung wurde erfolgreich gespeichert')
    return redirect(url_for('index'))

@app.route('/upload', methods=['POST'])
def upload_cv():
    try:
        if 'cv' not in request.files:
            return jsonify({'error': 'Keine Datei hochgeladen'}), 400
        
        file = request.files['cv']
        job_id = request.form.get('job_id')
        
        if file.filename == '':
            return jsonify({'error': 'Keine Datei ausgewählt'}), 400
        
        if not job_id:
            return jsonify({'error': 'Bitte wählen Sie eine Stellenbeschreibung aus'}), 400
        
        job = get_job_description(job_id)
        if not job:
            return jsonify({'error': 'Stellenbeschreibung nicht gefunden'}), 404
        
        if not allowed_file(file.filename):
            return jsonify({'error': 'Ungültiger Dateityp'}), 400
        
        filename = secure_filename(file.filename)
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(file_path)
        
        try:
            cv_text = parse_cv(file_path)
            if not cv_text.strip():
                return jsonify({'error': 'Konnte keinen Text aus der Datei extrahieren'}), 400
                
            analysis_results = analyze_cv_with_job_description(cv_text, job[1])
            
            return jsonify(analysis_results)
        except Exception as e:
            app.logger.error(f'Fehler bei der Analyse: {str(e)}')
            return jsonify({'error': f'Fehler bei der Analyse: {str(e)}'}), 500
        finally:
            # Aufräumen der hochgeladenen Datei
            if os.path.exists(file_path):
                os.remove(file_path)
    
    except Exception as e:
        app.logger.error(f'Unerwarteter Fehler: {str(e)}')
        return jsonify({'error': f'Unerwarteter Fehler: {str(e)}'}), 500

if __name__ == '__main__':
    app.run(debug=True) 
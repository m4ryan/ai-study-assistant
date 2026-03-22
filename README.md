# AI Study Assistant for Visual Learners

An AI powered tool that turns textbook pages into mind maps, study questions and audio summaries. Built for my CM3020 AI module at University of London.

## What It Does

Upload a photo of your textbook page and get:
- Extracted text with confidence scores
- Auto-generated mind maps 
- Study questions
- AI chat that answers questions about your content
- Text-to-speech audio

## Tech Stack

**Backend:** Python, FastAPI, EasyOCR, Ollama (Llama 3.2:3b)  
**Frontend:** React, Tailwind CSS

All processing happens locally on your machine, so your study materials stay private.

## Quick Start

### 1. Prerequisites

You need:
- Python 3.11+
- Node.js 16+
- [Ollama](https://ollama.com) installed

### 2. Clone & Install

```bash
git clone https://github.com/m4rya/ai-study-assistant.git
cd ai-study-assistant

# Backend
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt

# Get Llama model
ollama pull llama3.2:3b

# Frontend
cd ../frontend
npm install
```

### 3. Run It

**Terminal 1 - Backend:**
```bash
cd backend
python main.py
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

App opens at `http://localhost:3000`

## How to Use

1. Upload an image (try the ones in `/documents` folder)
2. Click "Extract Text" 
3. Generate mind maps or questions
4. Chat with AI about the content
5. Use "Read Aloud" for audio

## Project Structure

```
ai-study-assistant/
├── backend/
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   └── index.css
│   ├── package.json
│   └── tailwind.config.js
├── documents/          # Sample textbook pages for testing
└── README.md
```

## Known Issues

- Mind maps take 1-2 minutes to generate (using smaller Llama model for speed)
- Math equations don't extract as well as plain text
- No save/export yet (everything's session based)
- Works best with clear, well-lit photos

## Why I Built This

Visual learners (65% of students) struggle with text-heavy materials. This orchestrates 3 AI models to transform static documents into multimodal learning experiences. It's my attempt at making studying less painful for people who learn better with visuals and audio.

## Troubleshooting

**"ModuleNotFoundError"** → Activate venv and `pip install -r requirements.txt`

**"Ollama not found"** → Run `ollama pull llama3.2:3b` first

**CORS errors** → Make sure backend runs on `http://127.0.0.1:8000`

**Slow extraction** → Normal, EasyOCR takes 12 seconds per image

## Author

Maryam Ibrahim - CM3020 Final Project

## Note

This is academic coursework, not production software. Use at your own risk!

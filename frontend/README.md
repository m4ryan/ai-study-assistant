# AI-Powered Study Assistant for Visual Learners

A multimodal learning tool that orchestrates three AI models to transform static educational documents into interactive study materials with mind maps, questions, and audio narration.

## Overview

This project addresses the needs of visual learners (approximately 65% of the population) who struggle with traditional text-heavy educational materials. By combining computer vision, natural language processing, and text-to-speech technologies, the system creates a comprehensive multimodal learning experience.

## Features

- **Text Extraction**: Upload images of textbook pages and extract text using EasyOCR with confidence scoring
- **Mind Map Generation**: Automatically create hierarchical mind maps from extracted text using Llama 3.2
- **Study Questions**: Generate comprehension and application questions for self-testing
- **AI Chat Assistant**: Ask questions about your documents or get general homework help
- **Text-to-Speech**: Listen to extracted text with browser-based audio narration

## System Architecture

The system uses a client-server architecture:
- **Backend**: Python FastAPI server orchestrating AI models locally
- **Frontend**: React web application with Tailwind CSS
- **Models**: EasyOCR (vision), Llama 3.2:3b (language), Web Speech API (audio)

## Technologies Used

### Backend
- Python 3.11
- FastAPI 0.104.1
- EasyOCR 1.7.0
- Ollama 0.1.7
- Pillow 10.1.0
- OpenCV 4.8.1.78

### Frontend
- React 18
- Tailwind CSS 3
- Lucide React (icons)

## Prerequisites

Before you begin, ensure you have the following installed:

- Python 3.11 or higher
- Node.js 16 or higher
- Ollama (for running Llama locally)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/m4rya/ai-study-assistant.git
cd ai-study-assistant
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Install and Setup Ollama

Download Ollama from [ollama.com](https://ollama.com)

Pull the Llama model:
```bash
ollama pull llama3.2:3b
```

### 4. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install
```

## Running the Application

### 1. Start Ollama (if not running automatically)

```bash
ollama serve
```

### 2. Start the Backend Server

Open a new terminal:
```bash
cd backend
python main.py
```

The backend will run on `http://localhost:8000`

### 3. Start the Frontend

Open another terminal:
```bash
cd frontend
npm start
```

The app will open in your browser at `http://localhost:3000`

## Usage

1. **Upload a Document**: Click the upload area and select an image of a textbook page, lecture slide, or study material
2. **Extract Text**: Click "Extract Text" and wait for the OCR processing (confidence score will be displayed)
3. **Generate Mind Map**: Click "Generate Mind Map" to create a visual summary of the content
4. **Create Questions**: Click "Study Questions" to generate practice questions
5. **Use AI Chat**: Ask questions about the document or get homework help in the chat panel
6. **Listen to Audio**: Click "Read Aloud" to hear the extracted text

## Project Structure

```
ai-study-assistant/
├── backend/
│   ├── main.py              # FastAPI server and endpoints
│   └── requirements.txt     # Python dependencies
├── frontend/
│   ├── src/
│   │   ├── App.js          # Main React component
│   │   └── index.css       # Tailwind styles
│   ├── package.json        # Node dependencies
│   └── tailwind.config.js  # Tailwind configuration
└── README.md
```

## API Endpoints

- `POST /extract` - Extract text from uploaded image
- `POST /generate-mindmap` - Generate mind map from text
- `POST /generate-questions` - Generate study questions
- `POST /chat` - Chat with AI assistant

## Limitations

- **Model Size**: Uses Llama 3.2:3b for resource efficiency; larger models would improve quality
- **Mathematical Content**: OCR accuracy on equations is lower (81.9%) compared to plain text (91.3%)
- **Processing Speed**: Mind map generation takes 3-5 seconds per request
- **No Persistence**: Generated content is not saved (session-based only)
- **Single User**: System designed for individual use, not multi-user concurrent sessions

## Privacy

All processing occurs locally on your machine. No data is sent to external servers or APIs. This ensures:
- Complete privacy for copyrighted educational materials
- No data leakage or unauthorized access
- Compliance with educational data protection requirements

## License

This project is for educational purposes as part of university coursework.

## Author

Maryam Ibrahim

## Troubleshooting

**Backend won't start:**
- Ensure Python virtual environment is activated
- Check all dependencies are installed: `pip install -r requirements.txt`

**Ollama errors:**
- Verify Ollama is running: `ollama list`
- Ensure Llama 3.2:3b is downloaded: `ollama pull llama3.2:3b`

**Frontend errors:**
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Check if backend is running on port 8000

**CORS errors:**
- Ensure backend is running on `http://127.0.0.1:8000`
- Check CORS middleware is configured in `main.py`

**Text extraction fails:**
- Check image quality (well-lit, high resolution works best)
- Ensure image format is supported (JPG, PNG)
- EasyOCR requires ~4GB RAM during processing
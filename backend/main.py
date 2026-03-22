from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from PIL import Image
import easyocr
import io
import time
import cv2
import numpy as np
import ollama
import json
import re

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # allow all origins
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

print("Loading EasyOCR model...")
reader = easyocr.Reader(['en'], gpu=False)
print("EasyOCR ready!")

# store document context for chat
document_context = {"text": "", "mindmap": ""}

class ChatRequest(BaseModel):
    message: str
    use_context: bool = True

class MindMapRequest(BaseModel):
    text: str

def extract_text_easyocr(image):
    """Extract text using EasyOCR"""
    start_time = time.time()
    
    img_array = np.array(image)
    
    if len(img_array.shape) == 2:
        img_array = cv2.cvtColor(img_array, cv2.COLOR_GRAY2RGB)
    elif img_array.shape[2] == 4:
        img_array = cv2.cvtColor(img_array, cv2.COLOR_RGBA2RGB)
    
    results = reader.readtext(img_array)
    
    words = []
    confidences = []
    for (bbox, text, conf) in results:
        words.append(text)
        confidences.append(conf)
    
    full_text = ' '.join(words)
    avg_confidence = sum(confidences) / len(confidences) if confidences else 0
    processing_time = time.time() - start_time
    
    return {
        "text": full_text,
        "confidence": round(avg_confidence, 3),
        "processing_time": round(processing_time, 2),
        "word_count": len(full_text.split())
    }

@app.post("/extract")
async def extract_text(file: UploadFile = File(...)):
    """Extract text from uploaded image"""
    try:
        contents = await file.read()
        image = Image.open(io.BytesIO(contents))
        
        if image.mode != 'RGB':
            image = image.convert('RGB')
        
        result = extract_text_easyocr(image)
        
        # store for context
        document_context["text"] = result["text"]
        
        return {
            "success": True,
            "result": result
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/generate-mindmap")
async def generate_mindmap(request: MindMapRequest):
    """Generate mind map from text using Llama"""
    try:
        prompt = f"""You are an educational assistant. Convert the following text into a hierarchical mind map structure.

Text: {request.text}

Create a mind map with:
- A central topic
- Main branches (3-5 key concepts)
- Sub-branches (2-4 details per main branch)

Return ONLY valid JSON in this exact format:
{{
  "central": "Main Topic",
  "branches": [
    {{
      "title": "Branch 1",
      "children": ["Detail 1", "Detail 2"]
    }}
  ]
}}

Do not include any other text, explanations or markdown. Only the JSON."""

        response = ollama.chat(
            model='llama3.2:3b',
            messages=[{'role': 'user', 'content': prompt}]
        )
        
        content = response['message']['content'].strip()
        
        # clean up response
        content = re.sub(r'^```json\s*', '', content)
        content = re.sub(r'\s*```$', '', content)
        content = content.strip()
        
        mindmap_data = json.loads(content)
        
        # store for context
        document_context["mindmap"] = json.dumps(mindmap_data)
        
        return {
            "success": True,
            "mindmap": mindmap_data
        }
    
    except json.JSONDecodeError as e:
        return {
            "success": False,
            "error": f"Failed to parse mindmap: {str(e)}",
            "raw_response": content
        }
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/chat")
async def chat(request: ChatRequest):
    """Chat with AI about homework/document"""
    try:
        if request.use_context and document_context["text"]:
            context = f"\n\nDocument Context:\n{document_context['text'][:2000]}"
            prompt = f"{request.message}{context}\n\nProvide a helpful, clear explanation suitable for a student."
        else:
            prompt = f"{request.message}\n\nProvide a helpful, clear explanation suitable for a student."
        
        response = ollama.chat(
            model='llama3.2:3b',
            messages=[
                {'role': 'system', 'content': 'You are a helpful educational assistant. Explain concepts clearly and provide study help.'},
                {'role': 'user', 'content': prompt}
            ]
        )
        
        return {
            "success": True,
            "response": response['message']['content']
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.post("/generate-questions")
async def generate_questions(request: MindMapRequest):
    """Generate study questions from text"""
    try:
        prompt = f"""Based on this text, generate 5 study questions that test understanding.

Text: {request.text}

Return ONLY a JSON array of questions:
["Question 1?", "Question 2?", "Question 3?", "Question 4?", "Question 5?"]

No explanations, just the JSON array."""

        response = ollama.chat(
            model='llama3.2:3b',
            messages=[{'role': 'user', 'content': prompt}]
        )
        
        content = response['message']['content'].strip()
        content = re.sub(r'^```json\s*', '', content)
        content = re.sub(r'\s*```$', '', content)
        content = content.strip()
        
        questions = json.loads(content)
        
        return {
            "success": True,
            "questions": questions
        }
    
    except Exception as e:
        return {
            "success": False,
            "error": str(e)
        }

@app.get("/")
async def root():
    return {"message": "AI Study Assistant API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
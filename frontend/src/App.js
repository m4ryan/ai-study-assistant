import React, { useState, useRef } from 'react';
import { Upload, FileText, MessageSquare, Brain, Volume2, Book, Sparkles, Play, Pause } from 'lucide-react';

export default function AIStudyAssistant() {
  const [activeTab, setActiveTab] = useState('upload');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [extractedText, setExtractedText] = useState('');
  const [mindmap, setMindmap] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [speaking, setSpeaking] = useState(false);
  const [confidence, setConfidence] = useState(0);
  
  const fileInputRef = useRef(null);
  const speechSynthesis = window.speechSynthesis;

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
      setExtractedText('');
      setMindmap(null);
      setQuestions([]);
    }
  };

  const handleExtract = async () => {
    if (!selectedFile) return;
    
    setLoading(true);
    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:8000/extract', {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      
      console.log('Response:', data); // Debug log
      
      if (data.success) {
        setExtractedText(data.result.text);
        setConfidence(data.result.confidence);
        setActiveTab('text');
        alert('Text extracted successfully!');
      } else {
        alert('Extraction failed: ' + (data.error || 'Unknown error'));
      }
    } catch (err) {
      console.error('Extract error:', err);
      alert('Failed to extract text. Error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateMindmap = async () => {
    if (!extractedText) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/generate-mindmap', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText }),
      });
      const data = await response.json();
      
      if (data.success) {
        setMindmap(data.mindmap);
        setActiveTab('mindmap');
      }
    } catch (err) {
      alert('Failed to generate mindmap');
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateQuestions = async () => {
    if (!extractedText) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: extractedText }),
      });
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.questions);
      }
    } catch (err) {
      alert('Failed to generate questions');
    } finally {
      setLoading(false);
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim()) return;
    
    const userMessage = chatInput;
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setChatInput('');
    
    try {
      const response = await fetch('http://localhost:8000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage,
          use_context: !!extractedText 
        }),
      });
      const data = await response.json();
      
      if (data.success) {
        setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
      }
    } catch (err) {
      setChatMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get response' }]);
    }
  };

  const handleSpeak = (text) => {
    if (speaking) {
      speechSynthesis.cancel();
      setSpeaking(false);
    } else {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setSpeaking(false);
      speechSynthesis.speak(utterance);
      setSpeaking(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-2 rounded-lg">
              <Brain className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-gray-900">AI Study Assistant</h1>
              <p className="text-xs text-gray-500">For Visual Learners</p>
            </div>
          </div>
          
          <div className="flex gap-2">
            {extractedText && (
              <>
                <button
                  onClick={handleGenerateMindmap}
                  disabled={loading}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <Sparkles className="h-4 w-4" />
                  Generate Mind Map
                </button>
                <button
                  onClick={handleGenerateQuestions}
                  disabled={loading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-50 flex items-center gap-2"
                >
                  <Book className="h-4 w-4" />
                  Study Questions
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Panel - Upload & Text */}
          <div className="lg:col-span-2 space-y-6">
            {/* Tabs */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200">
              <div className="flex border-b border-gray-200">
                <TabButton
                  active={activeTab === 'upload'}
                  onClick={() => setActiveTab('upload')}
                  icon={<Upload className="h-4 w-4" />}
                  label="Upload"
                />
                <TabButton
                  active={activeTab === 'text'}
                  onClick={() => setActiveTab('text')}
                  icon={<FileText className="h-4 w-4" />}
                  label="Extracted Text"
                  disabled={!extractedText}
                />
                <TabButton
                  active={activeTab === 'mindmap'}
                  onClick={() => setActiveTab('mindmap')}
                  icon={<Brain className="h-4 w-4" />}
                  label="Mind Map"
                  disabled={!mindmap}
                />
              </div>

              <div className="p-6">
                {activeTab === 'upload' && (
                  <div>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                    
                    {!previewUrl ? (
                      <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-gray-300 rounded-xl p-12 text-center cursor-pointer hover:border-blue-400 transition"
                      >
                        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-600 font-medium mb-1">
                          Click to upload document
                        </p>
                        <p className="text-sm text-gray-500">
                          PNG, JPG, or PDF
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="w-full rounded-lg border border-gray-200"
                        />
                        <button
                          onClick={handleExtract}
                          disabled={loading}
                          className="w-full bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {loading ? 'Extracting...' : 'Extract Text'}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'text' && extractedText && (
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">Confidence:</span>
                        <span className="font-semibold text-green-600">
                          {(confidence * 100).toFixed(1)}%
                        </span>
                      </div>
                      <button
                        onClick={() => handleSpeak(extractedText)}
                        className="flex items-center gap-2 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm"
                      >
                        {speaking ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                        {speaking ? 'Stop' : 'Read Aloud'}
                      </button>
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
                      <p className="text-gray-800 whitespace-pre-wrap">{extractedText}</p>
                    </div>
                  </div>
                )}

                {activeTab === 'mindmap' && mindmap && (
                  <div>
                    <MindMapView data={mindmap} />
                  </div>
                )}
              </div>
            </div>

            {/* Study Questions */}
            {questions.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <Book className="h-5 w-5 text-blue-600" />
                  Study Questions
                </h3>
                <div className="space-y-3">
                  {questions.map((q, i) => (
                    <div key={i} className="flex gap-3">
                      <span className="flex-shrink-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-medium">
                        {i + 1}
                      </span>
                      <p className="text-gray-700">{q}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Panel - Chat */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col h-[calc(100vh-12rem)] sticky top-6">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <MessageSquare className="h-5 w-5 text-purple-600" />
                  AI Homework Help
                </h3>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {chatMessages.length === 0 && (
                  <div className="text-center text-gray-500 text-sm py-8">
                    Ask me anything about your document or homework!
                  </div>
                )}
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        msg.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t border-gray-200">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleChat()}
                    placeholder="Ask a question..."
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={handleChat}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition ${
        active
          ? 'border-blue-600 text-blue-600'
          : 'border-transparent text-gray-600 hover:text-gray-900'
      } ${disabled ? 'opacity-40 cursor-not-allowed' : ''}`}
    >
      {icon}
      {label}
    </button>
  );
}

function MindMapView({ data }) {
  return (
    <div className="space-y-6">
      {/* Central Topic */}
      <div className="text-center">
        <div className="inline-block bg-gradient-to-br from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl shadow-lg">
          <h3 className="text-xl font-bold">{data.central}</h3>
        </div>
      </div>

      {/* Branches */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {data.branches?.map((branch, i) => (
          <div key={i} className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-4 border border-purple-200">
            <h4 className="font-semibold text-purple-900 mb-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-purple-600 rounded-full" />
              {branch.title}
            </h4>
            <ul className="space-y-2 ml-4">
              {branch.children?.map((child, j) => (
                <li key={j} className="text-sm text-gray-700 flex items-start gap-2">
                  <span className="text-purple-400 mt-1">•</span>
                  <span>{child}</span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
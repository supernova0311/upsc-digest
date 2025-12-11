import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenAI } from "@google/genai";

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || process.env.GEMINI_API_KEY || '';

export const AIAssistant: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: 'Hello! 👋 I\'m your UPSC Study Assistant. I\'m here to help you understand conceptual topics for your Civil Services preparation. Ask me anything about history, geography, economics, polity, or any GS subject!',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateSystemPrompt = () => {
    return `You are an expert UPSC (Union Public Service Commission) tutor and mentor. Your role is to help Indian Civil Services examination aspirants understand complex conceptual topics clearly and effectively.

Guidelines:
1. Explain concepts in simple, clear language with real-world examples
2. Use bullet points and structured formatting for clarity
3. Connect topics to current affairs and UPSC-relevant context
4. For each concept, provide:
   - Simple definition
   - Key points (2-3 bullet points)
   - Real-world example
   - Connection to UPSC/Governance
5. Always relate to GS subjects: History, Geography, Polity, Economics, Science & Technology, Environment, International Relations, and Ethics
6. Encourage critical thinking with follow-up questions when appropriate
7. Keep responses concise but comprehensive (max 200-300 words)
8. Use formatting with headers, bold text, and bullet points
9. If a question is outside UPSC scope, politely redirect to relevant UPSC topics
10. Maintain an encouraging and supportive tone

Remember: You are helping students prepare for one of the toughest exams in the world. Be encouraging, clear, and thorough.`;
  };

  const handleSendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: input,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);
    setError('');

    try {
      if (!apiKey) {
        throw new Error('API Key not configured. Please check your environment variables.');
      }

      const ai = new GoogleGenAI({ apiKey });
      
      // Build conversation context
      const conversationHistory = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }));

      // Add current user message
      conversationHistory.push({
        role: 'user',
        parts: [{ text: input }]
      });

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        systemInstruction: generateSystemPrompt(),
        contents: conversationHistory
      });

      const botResponse = response.text || 'I apologize, but I couldn\'t generate a response. Please try again.';

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: botResponse,
        sender: 'bot',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (err: any) {
      console.error('Error:', err);
      setError(err.message || 'Failed to get response. Please try again.');
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: `Sorry, I encountered an error: ${err.message || 'Unknown error'}. Please check if your API key is configured correctly.`,
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        text: 'Hello! 👋 I\'m your UPSC Study Assistant. I\'m here to help you understand conceptual topics for your Civil Services preparation. Ask me anything about history, geography, economics, polity, or any GS subject!',
        sender: 'bot',
        timestamp: new Date()
      }
    ]);
    setError('');
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => navigate('/')}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg transition-all duration-300 z-40 flex items-center justify-center bg-indigo-600 hover:bg-indigo-700 animate-bounce`}
        title="Go to Home"
      >
        <MessageCircle className="w-6 h-6 text-white" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[600px] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col z-40 animate-in slide-in-from-bottom-5">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-t-2xl">
            <div className="flex justify-between items-center mb-1">
              <h3 className="font-bold text-lg">UPSC Study Assistant</h3>
              <button
                onClick={() => setIsOpen(false)}
                className="hover:bg-indigo-500 p-1 rounded"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-indigo-100 text-sm">Ask me about any GS concept</p>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar bg-gray-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-4 py-2 rounded-lg text-sm leading-relaxed ${
                    message.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-br-none'
                      : 'bg-white text-gray-800 border border-gray-200 rounded-bl-none'
                  }`}
                >
                  {message.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 px-4 py-3 rounded-lg rounded-bl-none flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-indigo-600" />
                  <span className="text-sm text-gray-600">Thinking...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border-t border-red-200 p-3 flex items-start space-x-2">
              <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-gray-200 p-3 space-y-2">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask about any GS concept..."
                disabled={loading}
                className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-gray-100"
              />
              <button
                onClick={handleSendMessage}
                disabled={loading || !input.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-300 text-white p-2 rounded-lg transition-colors"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <button
              onClick={clearChat}
              className="w-full text-xs text-gray-600 hover:text-gray-800 py-1 border border-gray-300 rounded hover:bg-gray-100 transition-colors"
            >
              Clear Chat
            </button>
          </div>
        </div>
      )}
    </>
  );
};

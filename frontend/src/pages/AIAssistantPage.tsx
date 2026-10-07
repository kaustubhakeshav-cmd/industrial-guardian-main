import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import GlobalShell from '../components/shell/GlobalShell';
import { Send, Bot, User, Loader, Sparkles, BookOpen, AlertCircle } from 'lucide-react';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  sources?: string[];
  confidence?: number;
  timestamp: Date;
}

const SUGGESTIONS = [
  "What is the safe pressure for P-101?",
  "Why did T-201 temperature spike?",
  "What is the protocol for critical anomalies?",
  "What does high vibration on V-401 mean?",
  "How do I calibrate F-301?",
  "What are the emergency shutdown procedures?"
];

export default function AIAssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: 'assistant',
      content: "Hello! I am your Industrial AI Assistant. I can answer questions about sensor limits, anomaly causes, and plant protocols. What would you like to know?",
      sources: ['System Initialization'],
      confidence: 1.0,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async (query: string) => {
    if (!query.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now(),
      role: 'user',
      content: query,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ai-assistant/query', { query });
      
      const aiMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: res.data.response,
        sources: res.data.sources,
        confidence: res.data.confidence,
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      const errorMsg: Message = {
        id: Date.now() + 1,
        role: 'assistant',
        content: "I'm sorry, I encountered an error processing your request. Please try again.",
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'text-status-good';
    if (conf >= 0.5) return 'text-status-warning';
    return 'text-status-critical';
  };

  return (
    <GlobalShell>
      <div className="flex flex-col h-[calc(100vh-140px)]">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-text-primary flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-accent-primary" /> AI Plant Assistant
          </h1>
          <p className="text-text-muted text-sm mt-1">Ask questions about sensor limits, protocols, or anomaly history.</p>
        </div>

        {/* Chat Container */}
        <div className="flex-1 bg-bg-panel border border-border-panel rounded-xl flex flex-col overflow-hidden">
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-4 h-4 text-accent-primary" />
                  </div>
                )}
                
                <div className={`max-w-[70%] ${msg.role === 'user' ? 'order-first' : ''}`}>
                  <div className={`p-4 rounded-xl ${
                    msg.role === 'user' 
                      ? 'bg-accent-primary text-white' 
                      : 'bg-bg-page border border-border-panel'
                  }`}>
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                  </div>
                  
                  {/* AI Sources & Confidence */}
                  {msg.role === 'assistant' && msg.sources && (
                    <div className="mt-2 ml-1 space-y-1">
                      <div className="flex items-center gap-2 text-[10px] text-text-muted">
                        <BookOpen className="w-3 h-3" />
                        <span className="font-semibold uppercase">Sources:</span>
                      </div>
                      <ul className="text-[10px] text-text-muted space-y-0.5 ml-4">
                        {msg.sources.map((src, i) => (
                          <li key={i} className="flex items-center gap-1">
                            <span className="w-1 h-1 rounded-full bg-text-muted"></span>
                            {src}
                          </li>
                        ))}
                      </ul>
                      {msg.confidence !== undefined && (
                        <div className="flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3 h-3 text-text-muted" />
                          <span className={`text-[10px] font-bold ${getConfidenceColor(msg.confidence)}`}>
                            Confidence: {Math.round(msg.confidence * 100)}%
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-bg-page border border-border-panel flex items-center justify-center flex-shrink-0">
                    <User className="w-4 h-4 text-text-muted" />
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-accent-primary" />
                </div>
                <div className="bg-bg-page border border-border-panel rounded-xl p-4">
                  <Loader className="w-4 h-4 text-accent-primary animate-spin" />
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Suggestions */}
          {messages.length <= 1 && (
            <div className="px-6 pb-4">
              <p className="text-xs text-text-muted mb-2 font-semibold uppercase">Suggested Questions</p>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    className="text-xs px-3 py-1.5 bg-bg-page border border-border-panel rounded-full text-text-muted hover:border-accent-primary hover:text-accent-primary transition-colors"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Input Area */}
          <div className="border-t border-border-panel p-4 bg-bg-page/30">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about sensors, protocols, or anomalies..."
                disabled={isLoading}
                className="flex-1 bg-bg-panel border border-border-panel rounded-lg px-4 py-2.5 text-sm text-text-primary placeholder:text-text-muted focus:ring-2 focus:ring-accent-primary outline-none disabled:opacity-50"
              />
              <button
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
                className="px-4 py-2.5 bg-accent-primary text-white rounded-lg hover:bg-accent-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </GlobalShell>
  );
}
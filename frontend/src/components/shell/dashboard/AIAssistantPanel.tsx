import { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { Bot, Send, Loader, BookOpen, Sparkles } from 'lucide-react';

interface Message {
  role: 'user' | 'ai';
  text: string;
  sources?: string[];
}

const SUGGESTED_QUERIES = [
  "What is the safe pressure for P-101?",
  "Why did T-201 temperature spike?",
  "What is the protocol for critical anomalies?",
  "What does high vibration on V-401 mean?"
];

export default function AIAssistantPanel() {
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      text: "Hello! I am your Industrial AI Assistant. I can answer questions about sensor limits, anomaly causes, and plant protocols. What would you like to know?",
      sources: ["System Initialization"]
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (queryText: string = input) => {
    if (!queryText.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', text: queryText };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const res = await axios.post('http://127.0.0.1:8000/api/ai-assistant/query', {
        query: queryText
      });
      
      const aiMessage: Message = {
        role: 'ai',
        text: res.data.response,
        sources: res.data.sources
      };
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Failed to query AI assistant:", error);
      setMessages(prev => [...prev, { 
        role: 'ai', 
        text: "I'm having trouble connecting to the knowledge base. Please try again.",
        sources: ["System Error"]
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-[500px] flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="w-5 h-5 text-accent-primary" />
        <h2 className="text-lg font-semibold text-text-primary">AI Plant Assistant (RAG)</h2>
      </div>

      {/* Chat Messages Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2 custom-scrollbar">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] rounded-lg p-3 ${
              msg.role === 'user' 
                ? 'bg-accent-primary text-white' 
                : 'bg-bg-page border border-border-panel text-text-primary'
            }`}>
              {msg.role === 'ai' && (
                <div className="flex items-center gap-1.5 mb-1.5">
                  <Bot className="w-3.5 h-3.5 text-accent-primary" />
                  <span className="text-[10px] font-semibold text-accent-primary uppercase">AI Assistant</span>
                </div>
              )}
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.text}</p>
              
              {/* Sources Citation */}
              {msg.role === 'ai' && msg.sources && (
                <div className="mt-2 pt-2 border-t border-border-panel/50">
                  <p className="text-[9px] text-text-muted uppercase font-semibold mb-1 flex items-center gap-1">
                    <BookOpen className="w-3 h-3" /> Sources:
                  </p>
                  <ul className="space-y-1">
                    {msg.sources.map((source, sIdx) => (
                      <li key={sIdx} className="text-[10px] text-text-muted italic flex items-start gap-1">
                        <span className="text-accent-primary mt-0.5">•</span> {source}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-bg-page border border-border-panel rounded-lg p-3 flex items-center gap-2 text-text-muted">
              <Loader className="w-4 h-4 animate-spin text-accent-primary" />
              <span className="text-sm">Retrieving from knowledge base...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Queries */}
      {messages.length <= 1 && (
        <div className="mb-3 grid grid-cols-1 gap-2">
          {SUGGESTED_QUERIES.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              className="text-left text-xs text-text-muted bg-bg-page border border-border-panel rounded-lg p-2 hover:border-accent-primary/50 hover:text-text-primary transition-colors"
            >
              "{q}"
            </button>
          ))}
        </div>
      )}

      {/* Input Area */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Ask about sensors, protocols, or anomalies..."
          className="w-full bg-bg-page border border-border-panel rounded-lg pl-3 pr-10 py-2.5 text-sm text-text-primary placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
          disabled={isLoading}
        />
        <button
          onClick={() => handleSend()}
          disabled={!input.trim() || isLoading}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-md bg-accent-primary text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-accent-primary/90 transition-colors"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
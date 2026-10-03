import { Bot, Send, Sparkles } from 'lucide-react';
import { useState } from 'react';

const quickActions = [
  "Explain this anomaly",
  "Check plant status",
  "Compare with last week",
  "Show affected sensors",
];

const chatHistory = [
  {
    role: 'ai',
    content: 'Anomaly detected in Heat Exchanger (Unit 2). The flow rate dropped 42% compared to normal operation. This may indicate a partial blockage or valve issue. Recommend checking valve V-23 and flow sensors.',
    sources: ['Sensor Log', 'Model Explanation']
  }
];

export default function AIAssistantPanel() {
  const [input, setInput] = useState('');

  return (
    <div className="bg-bg-panel border border-border-panel rounded-xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4 pb-4 border-b border-border-panel">
        <div className="bg-accent-primary/20 p-2 rounded-lg">
          <Bot className="w-5 h-5 text-accent-primary" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-text-primary flex items-center gap-2">
            AI Assistant
            <span className="text-[10px] font-medium bg-accent-primary/20 text-accent-primary px-2 py-0.5 rounded-full">Advanced Model</span>
          </h2>
          <p className="text-xs text-text-muted">Evidence-grounded insights</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
        {chatHistory.map((msg, idx) => (
          <div key={idx} className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-accent-primary/10 flex items-center justify-center flex-shrink-0">
              <Sparkles className="w-4 h-4 text-accent-primary" />
            </div>
            <div className="flex-1">
              <div className="bg-bg-page border border-border-panel rounded-lg p-3 text-sm text-text-primary leading-relaxed">
                {msg.content}
              </div>
              {msg.sources && (
                <div className="flex gap-2 mt-2">
                  {msg.sources.map((source, sIdx) => (
                    <span key={sIdx} className="text-[10px] text-text-muted bg-bg-page px-2 py-1 rounded border border-border-panel">
                      {source}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2 mb-4">
        {quickActions.map((action) => (
          <button 
            key={action}
            className="text-xs px-3 py-1.5 rounded-full bg-bg-page border border-border-panel text-text-muted hover:text-text-primary hover:border-accent-primary/50 transition-all"
          >
            {action}
          </button>
        ))}
      </div>

      {/* Input Area */}
      <div className="relative">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask a question about the system..."
          className="w-full bg-bg-page border border-border-panel rounded-lg pl-4 pr-12 py-3 text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-accent-primary/50 transition-all placeholder:text-text-muted/50"
        />
        <button className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-accent-primary hover:text-accent-primary/80 transition-colors">
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
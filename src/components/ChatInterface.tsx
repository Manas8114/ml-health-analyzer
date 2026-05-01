import React, { useState, useRef, useEffect } from 'react';
import type { ModelStats, DiagnosisResponse } from '../lib/types';
import { streamChat } from '../lib/api-service';
import { Send, User, Bot, Loader2 } from 'lucide-react';

interface ChatInterfaceProps {
  stats: ModelStats | null;
  diagnosis: DiagnosisResponse | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ stats, diagnosis }) => {
  const [messages, setMessages] = useState<{role: 'user' | 'assistant', content: string}[]>([
    { 
      role: 'assistant', 
      content: "Hello. I've processed your model health report. You can ask me to explain specific findings, provide Pytorch/Tensorflow implementations for any fix, or simulate architectural changes. What would you like to explore?" 
    }
  ]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const apiKey = localStorage.getItem('ANTHROPIC_API_KEY') || '';

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;
    
    const userMsg = { role: 'user' as const, content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsStreaming(true);

    let assistantContent = '';
    setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

    await streamChat(
      input,
      messages,
      stats!,
      diagnosis,
      apiKey,
      (chunk) => {
        assistantContent += chunk;
        setMessages(prev => {
          const last = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...last, content: assistantContent }];
        });
      }
    );
    
    setIsStreaming(false);
  };

  const suggestions = [
    "What if I add more data?",
    "Show me fix code in PyTorch",
    "Explain why I'm overfitting",
    "Is my regularization strength okay?"
  ];

  return (
    <div className="flex flex-col h-[600px] bg-[#0F0F0F] border border-[#222] rounded-xl overflow-hidden">
      {/* Chat History */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-6 space-y-6"
      >
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : ''}`}>
            {msg.role === 'assistant' && (
              <div className="w-8 h-8 rounded bg-amber-500/10 flex items-center justify-center text-amber-500 border border-amber-500/30 flex-shrink-0">
                <Bot size={16} />
              </div>
            )}
            <div className={`max-w-[80%] p-4 rounded-lg text-xs leading-relaxed ${
              msg.role === 'user' 
                ? 'bg-blue-500/10 text-blue-200 border border-blue-500/30' 
                : 'bg-[#161616] text-zinc-300 border border-[#222]'
            }`}>
              {msg.content || (isStreaming && i === messages.length - 1 ? <Loader2 size={14} className="animate-spin text-zinc-500" /> : null)}
            </div>
            {msg.role === 'user' && (
              <div className="w-8 h-8 rounded bg-blue-500/10 flex items-center justify-center text-blue-500 border border-blue-500/30 flex-shrink-0">
                <User size={16} />
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="p-6 bg-[#0A0A0A] border-t border-[#222]">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2 scrollbar-hide">
          {suggestions.map((s, i) => (
            <button
              key={i}
              onClick={() => setInput(s)}
              className="whitespace-nowrap px-3 py-1.5 bg-[#161616] border border-[#222] text-[10px] font-bold text-zinc-500 hover:text-amber-500 hover:border-amber-500/50 transition-all rounded uppercase tracking-wider"
            >
              {s}
            </button>
          ))}
        </div>
        
        <div className="flex gap-4">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query the diagnostic model (e.g., 'Optimize for low latency')..."
            className="flex-1 bg-[#050505] border-[#333] text-sm"
          />
          <button
            onClick={handleSend}
            disabled={isStreaming}
            aria-label="Send message"
            className="px-6 bg-amber-500 text-black font-bold flex items-center gap-2 hover:bg-amber-400 disabled:opacity-50"
          >
            <Send size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatInterface;

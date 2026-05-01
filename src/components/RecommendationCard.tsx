import React, { useState } from 'react';
import type { Fix } from '../lib/types';
import { ChevronDown, ChevronUp, Copy, Check, Star, Zap } from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { atomDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface RecommendationCardProps {
  fix: Fix;
  index: number;
}

const RecommendationCard: React.FC<RecommendationCardProps> = ({ fix, index }) => {
  const [isExpanded, setIsExpanded] = useState(index === 0);
  const [copied, setCopied] = useState(false);

  const copyCode = () => {
    navigator.clipboard.writeText(fix.code_snippet);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-[#0F0F0F] border border-[#222] rounded-xl overflow-hidden hover:border-[#333] transition-colors">
      {/* Header */}
      <div 
        className="p-5 flex items-center justify-between cursor-pointer group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-6">
          <div className="flex flex-col items-center">
            <span className="text-[10px] text-zinc-600 font-bold mb-1">PRIORITY</span>
            <div className="flex gap-0.5">
              {[1, 2, 3].map(i => (
                <Star key={i} size={10} className={i <= fix.priority ? "text-amber-500 fill-amber-500" : "text-zinc-800"} />
              ))}
            </div>
          </div>
          
          <div className="h-8 w-[1px] bg-[#222]" />

          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-tight flex items-center gap-2">
              {fix.name}
              {fix.priority === 3 && <Zap size={14} className="text-amber-500 animate-pulse" />}
            </h3>
            <div className="flex gap-2 mt-1">
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                fix.estimated_impact === 'High' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 
                fix.estimated_impact === 'Medium' ? 'bg-blue-500/10 text-blue-500 border border-blue-500/30' : 
                'bg-zinc-500/10 text-zinc-500 border border-zinc-500/30'
              }`}>
                IMPACT: {fix.estimated_impact.toUpperCase()}
              </span>
              <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                fix.cost === 'Low' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' : 
                fix.cost === 'Medium' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/30' : 
                'bg-red-500/10 text-red-500 border border-red-500/30'
              }`}>
                COST: {fix.cost.toUpperCase()}
              </span>
            </div>
          </div>
        </div>

        <div className="text-zinc-500 group-hover:text-white transition-colors">
          {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </div>
      </div>

      {/* Expandable Content */}
      {isExpanded && (
        <div className="px-5 pb-5 border-t border-[#222] pt-5 bg-[#0A0A0A]/50">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Description</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {fix.explanation}
              </p>
            </div>
            <div>
              <h4 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-2">Technical Rationale</h4>
              <p className="text-xs text-zinc-400 leading-relaxed italic border-l-2 border-[#222] pl-3">
                {fix.why_it_works}
              </p>
            </div>
          </div>

          <div className="relative group/code">
            <div className="absolute top-3 right-3 z-10 flex gap-2">
              <button 
                onClick={copyCode}
                className="p-1.5 bg-[#111] border border-[#333] text-zinc-400 hover:text-white hover:bg-[#222] rounded transition-all"
                title="Copy Code"
              >
                {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
              </button>
            </div>
            <div className="rounded-lg overflow-hidden border border-[#222]">
              <SyntaxHighlighter 
                language="python" 
                style={atomDark}
                customStyle={{ 
                  margin: 0, 
                  padding: '24px', 
                  fontSize: '11px', 
                  backgroundColor: '#050505',
                  fontFamily: 'JetBrains Mono, monospace'
                }}
              >
                {fix.code_snippet}
              </SyntaxHighlighter>
            </div>
          </div>
          
          <div className="mt-4 flex items-center justify-between p-3 bg-[#111] rounded border border-[#222]">
             <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Fix Simulator Heuristic</span>
             </div>
              <div className="flex items-center gap-4">
                <input type="range" aria-label="Estimated accuracy improvement" className="w-32 accent-amber-500" />
                <span className="text-[10px] font-mono text-emerald-500 font-bold">+4.2% Est. Acc</span>
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecommendationCard;

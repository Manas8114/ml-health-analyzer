import React, { useState } from 'react';
import type { ModelStats, DiagnosisResponse, DeterministicResult } from '../lib/types';
import SeverityGauge from './SeverityGauge';
import RecommendationCard from './RecommendationCard';
import Visualizer from './Visualizer';
import ChatInterface from './ChatInterface';
import { 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  BarChart3, 
  MessageSquare, 
  ShieldCheck, 
  Zap,
  Layers,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface DashboardProps {
  stats: ModelStats;
  diagnosis: DiagnosisResponse | null;
  deterministicResults: DeterministicResult[];
}

const Dashboard: React.FC<DashboardProps> = ({ stats, diagnosis, deterministicResults }) => {
  const [activeTab, setActiveTab] = useState('DIAGNOSIS');

  const tabs = [
    { id: 'DIAGNOSIS', label: 'Diagnosis', icon: Activity },
    { id: 'FIXES', label: 'Recommendations', icon: Zap },
    { id: 'VISUALS', label: 'Visualizations', icon: BarChart3 },
    { id: 'CHAT', label: 'Health Chat', icon: MessageSquare },
  ];

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex gap-1 p-1 bg-[#111] border border-[#222] rounded-lg w-fit">
        {tabs.map(tab => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-[10px] font-bold uppercase tracking-widest transition-all rounded-md ${activeTab === tab.id ? 'bg-amber-500 text-black' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'DIAGNOSIS' && (
            <div className="grid grid-cols-12 gap-6">
              {/* Left Column: Severity & Diagnosis */}
              <div className="col-span-8 space-y-6">
                <div className="bg-[#0F0F0F] border border-[#222] p-6 rounded-xl flex items-center gap-8">
                  <div className="flex flex-col items-center border-r border-[#222] pr-8">
                    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Severity Index</span>
                    <SeverityGauge score={diagnosis?.severity_score ?? 5} />
                  </div>
                  
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      {diagnosis ? (
                        <span className={`badge ${diagnosis.diagnosis === 'Well-Fitted' ? 'badge-emerald' : 'badge-amber'}`}>
                          {diagnosis.diagnosis}
                        </span>
                      ) : (
                        <span className="badge border border-zinc-700 text-zinc-500 bg-zinc-900">
                          STATISTICAL ONLY
                        </span>
                      )}
                      <div className="flex-1 h-[2px] bg-[#222]" />
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {diagnosis ? `Confidence: ${diagnosis.confidence}%` : 'AI LAYER OFFLINE'}
                      </span>
                    </div>
                    <h2 className="text-2xl font-black italic tracking-tighter mb-4 text-white uppercase">
                      {diagnosis ? 
                        (diagnosis.diagnosis === 'Well-Fitted' ? 'Optimal Performance Bound' : 'Model Health Impairment Detected') :
                        'Statistical Diagnostic Report'
                      }
                    </h2>
                    <div className="bg-[#050505] p-4 border border-[#222] rounded font-mono text-xs text-amber-500 leading-relaxed relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                      <p className="opacity-80 leading-relaxed">
                        {diagnosis?.root_cause || 'Advanced cognitive analysis skipped. Deterministic layer suggests reviewing the flagged pre-checks on the right for potential optimization paths.'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                   <div className="bg-[#0F0F0F] border border-[#222] p-6 rounded-xl">
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <ShieldCheck size={14} className="text-blue-500" /> Deployment Readiness
                      </h3>
                      <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-lg border-2 ${diagnosis?.deployment_ready ? 'border-emerald-500 bg-emerald-500/5' : 'border-red-500 bg-red-500/5'}`}>
                           {diagnosis?.deployment_ready ? <CheckCircle2 className="text-emerald-500" size={32} /> : <XCircle className="text-red-500" size={32} />}
                        </div>
                        <div>
                          <p className={`text-lg font-black uppercase italic ${diagnosis?.deployment_ready ? 'text-emerald-500' : (diagnosis === null ? 'text-zinc-500' : 'text-red-500')}`}>
                            {diagnosis ? (diagnosis.deployment_ready ? 'READY FOR PRODUCTION' : 'NEEDS OPTIMIZATION') : 'GOVERNANCE UNKNOWN'}
                          </p>
                          <p className="text-[10px] text-zinc-500 font-mono">Risk Score: {diagnosis?.risk_score ?? '??'}/100</p>
                        </div>
                      </div>
                   </div>
                   
                   <div className="bg-[#0F0F0F] border border-[#222] p-6 rounded-xl">
                      <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Zap size={14} className="text-amber-500" /> Projected Improvement
                      </h3>
                      <p className="text-xs text-zinc-300 leading-relaxed italic">
                        "{diagnosis?.improvement_prediction || 'Run full diagnostic to generate projected improvement metrics.'}"
                      </p>
                   </div>
                </div>
              </div>

              {/* Right Column: Deterministic Checklist */}
              <div className="col-span-4 space-y-6">
                <div className="bg-[#0F0F0F] border border-[#222] p-6 rounded-xl h-full">
                  <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6 border-b border-[#222] pb-4 flex items-center gap-2">
                    <Layers size={14} /> Deterministic Pre-Checks
                  </h3>
                  <div className="space-y-4">
                    {deterministicResults.map((check, idx) => (
                      <div key={idx} className="group relative">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-zinc-400 font-bold uppercase">{check.label}</span>
                          <span className={`text-[10px] font-mono ${check.status === 'healthy' ? 'text-emerald-500' : check.status === 'warning' ? 'text-amber-500' : 'text-red-500'}`}>
                            {check.value}
                          </span>
                        </div>
                        <div className="flex items-start gap-2">
                          <div className={`mt-0.5 p-0.5 rounded-full ${check.status === 'healthy' ? 'bg-emerald-500/20 text-emerald-500' : check.status === 'warning' ? 'bg-amber-500/20 text-amber-500' : 'bg-red-500/20 text-red-500'}`}>
                            {check.status === 'healthy' ? <CheckCircle2 size={10} /> : <AlertTriangle size={10} />}
                          </div>
                          <p className="text-[9px] text-zinc-500 leading-tight">
                            {check.description}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'FIXES' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between mb-2">
                 <h2 className="text-xl font-black italic tracking-tighter text-white uppercase flex items-center gap-3">
                   <Zap className="text-amber-500" /> Ranked Remediation Path
                 </h2>
                 <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Priority based on estimated ROI</p>
              </div>
              <div className="grid grid-cols-1 gap-4">
                {diagnosis?.fixes.map((fix, idx) => (
                  <RecommendationCard key={idx} fix={fix} index={idx} />
                )) || (
                  <div className="p-12 text-center text-zinc-600 border border-dashed border-[#222] rounded-xl font-mono text-sm">
                    No recommendations generated yet.
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'VISUALS' && (
            <Visualizer stats={stats} diagnosis={diagnosis} />
          )}

          {activeTab === 'CHAT' && (
            <ChatInterface stats={stats} diagnosis={diagnosis} />
          )}
        </motion.div>
      </AnimatePresence>

      <footer className="mt-12 flex justify-between items-center pt-8 border-t border-[#222]">
        <button className="flex items-center gap-2 px-4 py-2 bg-[#111] border border-[#333] text-[10px] font-bold text-zinc-500 hover:text-white uppercase tracking-widest">
           <Download size={14} /> Export Technical Report
        </button>
        <p className="text-[9px] text-zinc-600 uppercase font-mono tracking-widest">
          Authored by Antigravity v1.0 • Built for Performance Integrity
        </p>
      </footer>
    </div>
  );
};

export default Dashboard;

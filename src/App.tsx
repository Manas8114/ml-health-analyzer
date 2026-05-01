import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import type { ModelStats, DiagnosisResponse, DeterministicResult } from './lib/types';
import { runDeterministicChecks, runFullDeterministicDiagnostic } from './lib/deterministic-engine';
import { analyzeModelHealth } from './lib/api-service';
import { Loader2, Zap, ShieldAlert, Key } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const App: React.FC = () => {
  const [stats, setStats] = useState<ModelStats | null>(null);
  const [diagnosis, setDiagnosis] = useState<DiagnosisResponse | null>(null);
  const [deterministicResults, setDeterministicResults] = useState<DeterministicResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [apiKey, setApiKey] = useState(localStorage.getItem('ANTHROPIC_API_KEY') || '');
  const [showKeyModal, setShowKeyModal] = useState(!apiKey);

  const handleAnalyze = async (newStats: ModelStats) => {
    setStats(newStats);
    setIsLoading(true);
    
    // Layer 1 - Deterministic (Always runs, providing core logic)
    const deterministicResults = runDeterministicChecks(newStats);
    const coreDiagnosis = runFullDeterministicDiagnostic(newStats);
    
    setDeterministicResults(deterministicResults);
    setDiagnosis(coreDiagnosis); // Set initial diagnosis from rules

    try {
      // Layer 2 - Cognitive Enrichment (Optional)
      if (apiKey) {
        // AI can override/enrich the deterministic diagnosis with more nuance
        const enrichedDiagnosis = await analyzeModelHealth(newStats, apiKey, deterministicResults);
        setDiagnosis(enrichedDiagnosis);
      }
    } catch (error) {
      console.error('AI Enrichment failed, falling back to deterministic results', error);
      // We already set coreDiagnosis, so no need to do anything here
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = (key: string) => {
    localStorage.setItem('ANTHROPIC_API_KEY', key);
    setApiKey(key);
    setShowKeyModal(false);
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#050505]">
      {/* Sidebar */}
      <Sidebar onAnalyze={handleAnalyze} isLoading={isLoading} />

      {/* Main Content */}
      <main className="flex-1 relative overflow-y-auto p-6">
        <header className="flex justify-between items-center mb-8 pb-4 border-b border-[#222]">
          <div className="flex items-center gap-3">
            <Zap className="text-amber-500" size={24} />
            <div>
              <h1 className="text-xl font-bold tracking-tighter uppercase italic">ML Health Analyzer <span className="text-xs font-normal not-italic text-zinc-500">v1.0.0</span></h1>
              <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Deterministic Diagnostic Engine (AI Enrichment Optional)</p>
            </div>
          </div>
          
          <button 
            onClick={() => setShowKeyModal(true)}
            className={`flex items-center gap-2 px-3 py-1.5 border text-xs transition-all ${apiKey ? 'bg-amber-500/10 border-amber-500/50 text-amber-500' : 'bg-[#111] border-[#333] text-zinc-400 hover:bg-[#222]'}`}
          >
            <Key size={14} />
            {apiKey ? 'AI ENRICHMENT ACTIVE' : 'ACTIVATE AI (OPTIONAL)'}
          </button>
        </header>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
            <Loader2 className="animate-spin text-amber-500" size={48} />
            <div className="text-center">
              <p className="text-amber-500 font-bold uppercase tracking-widest text-sm mb-1">Synthesizing Diagnostic Data</p>
              <p className="text-zinc-500 text-xs font-mono">
                {apiKey ? 'Running deterministic checks + querying cognitive layer...' : 'Running high-fidelity deterministic heuristics...'}
              </p>
            </div>
          </div>
        ) : diagnosis || deterministicResults.length > 0 ? (
          <Dashboard 
            stats={stats!} 
            diagnosis={diagnosis} 
            deterministicResults={deterministicResults} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-[60vh] text-center border-2 border-dashed border-[#222] rounded-xl">
            <ShieldAlert className="text-zinc-700 mb-4" size={64} />
            <h2 className="text-zinc-400 font-bold uppercase mb-2">No Model Data Detected</h2>
            <p className="text-zinc-600 text-sm max-w-md">Configure your model parameters in the sidebar and initiate analysis to generate a health report.</p>
          </div>
        )}
      </main>

      {/* API Key Modal */}
      <AnimatePresence>
        {showKeyModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[2000] flex items-center justify-center bg-black/80 backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-[#111] border border-[#333] p-8 rounded-lg w-[450px] shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-6">
                <Key className="text-amber-500" size={32} />
                <h3 className="text-xl font-bold uppercase italic">Diagnostic Mode</h3>
              </div>
              <p className="text-zinc-400 text-xs mb-4 leading-relaxed">
                This analyzer uses a high-fidelity <span className="text-white font-bold">Deterministic Engine</span> by default. 
                Providing an Anthropic API Key enables the <span className="text-amber-500 font-bold">Cognitive Layer</span> for deeper model reasoning and custom code generation.
              </p>
              <input 
                type="password" 
                placeholder="sk-ant-api03-..." 
                className="w-full bg-[#050505] border-[#333] text-sm mb-6 font-mono"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowKeyModal(false)}
                  className="flex-1 py-3 border border-[#333] text-[10px] font-bold text-zinc-500 hover:text-white hover:bg-[#1a1a1a] uppercase tracking-widest transition-all"
                >
                  Use Deterministic Only
                </button>
                <button 
                  onClick={() => saveApiKey(apiKey)}
                  className="flex-1 py-3 bg-amber-500 text-black text-[10px] font-bold uppercase tracking-widest hover:bg-amber-400 transition-all"
                >
                  Activate AI Layer
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;

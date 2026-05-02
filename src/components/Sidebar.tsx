import React, { useState } from 'react';
import type { ModelStats, ModelType, TaskType, RegularizationType } from '../lib/types';
import { Settings, ChevronDown, ChevronUp, Play, Loader2, Sparkles } from 'lucide-react';
import ModelUpload from './ModelUpload';

interface SidebarProps {
  onAnalyze: (stats: ModelStats) => void;
  isLoading: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ onAnalyze, isLoading }) => {
  const [stats, setStats] = useState<ModelStats>({
    modelType: 'XGBoost/GBM',
    taskType: 'Classification',
    trainAccuracy: 95,
    valAccuracy: 82,
    trainLoss: [0.9, 0.7, 0.5, 0.3, 0.2],
    valLoss: [0.95, 0.8, 0.7, 0.65, 0.68],
    samples: 5000,
    features: 450,
    regularization: 'L2',
    regStrength: 0.1,
    augmentation: false,
    crossVal: true,
    hyperTuning: true,
    depth: 6,
    parameters: 150000
  });

  const [isExtracted, setIsExtracted] = useState(false);
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAnalyze(stats);
  };

  const updateStats = <K extends keyof ModelStats>(key: K, value: ModelStats[K]) => {
    setStats(prev => ({ ...prev, [key]: value }));
  };

  const handleExtractedData = (data: Partial<ModelStats>) => {
    setStats(prev => ({ ...prev, ...data }));
    setIsExtracted(true);
    // Automatically open advanced section if hidden metrics were extracted
    if (data.depth || data.parameters || data.trainLoss) {
      setAdvancedOpen(true);
    }
  };

  const handleLossInput = (key: 'trainLoss' | 'valLoss', value: string) => {
    const arr = value.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
    updateStats(key, arr);
  };

  return (
    <aside className="w-[320px] h-full bg-[#0F0F0F] border-r border-[#222] flex flex-col">
      <div className="p-6 border-b border-[#222]">
        <h2 className="text-xs font-bold text-zinc-500 uppercase tracking-widest flex items-center gap-2">
          <Settings size={14} /> Model Configuration
        </h2>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {/* Smart Upload Mode */}
        <ModelUpload onDataExtracted={handleExtractedData} />

        <form onSubmit={handleSubmit} className="space-y-8">
          {isExtracted && (
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded flex items-center gap-2 animate-in fade-in zoom-in-95">
              <Sparkles size={12} className="text-amber-500" />
              <span className="text-[9px] font-bold text-amber-200 uppercase tracking-tight">Parameters pre-filled from model</span>
            </div>
          )}

          {/* Basic Section */}
          <section className="space-y-4">
            <label className="block text-[10px] font-bold text-amber-500 uppercase tracking-widest mb-4">01. Basic Parameters</label>
            
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Model Type</span>
              <select 
                value={stats.modelType}
                onChange={(e) => updateStats('modelType', e.target.value as ModelType)}
                aria-label="Model Type"
                className="text-sm w-full bg-[#111] border-[#222] text-zinc-300 focus:border-amber-500 transition-colors rounded p-2"
              >
                <option>Linear Regression</option>
                <option>Logistic Regression</option>
                <option>Decision Tree</option>
                <option>Random Forest</option>
                <option>XGBoost/GBM</option>
                <option>SVM</option>
                <option>Neural Network</option>
                <option>Transformer</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Task Type</span>
              <div className="flex gap-2">
                {(['Classification', 'Regression'] as TaskType[]).map(t => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => updateStats('taskType', t)}
                    className={`flex-1 py-1.5 text-[10px] font-bold uppercase border transition-all ${stats.taskType === t ? 'border-amber-500 text-amber-500 bg-amber-500/10 shadow-[0_0_10px_rgba(245,158,11,0.1)]' : 'border-[#333] text-zinc-500 hover:border-[#444]'}`}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Train Acc (%)</span>
                <input 
                  type="number" 
                  value={stats.trainAccuracy}
                  onChange={(e) => updateStats('trainAccuracy', parseFloat(e.target.value))}
                  aria-label="Training Accuracy Percentage"
                  className="text-sm w-full bg-[#111] border-[#222] text-zinc-300 focus:border-amber-500 transition-colors rounded p-2"
                />
              </div>
              <div className="space-y-1.5">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Val Acc (%)</span>
                <input 
                  type="number" 
                  value={stats.valAccuracy}
                  onChange={(e) => updateStats('valAccuracy', parseFloat(e.target.value))}
                  aria-label="Validation Accuracy Percentage"
                  className="text-sm w-full bg-[#111] border-[#222] text-zinc-300 focus:border-amber-500 transition-colors rounded p-2"
                />
              </div>
            </div>
          </section>

          {/* Dataset Section */}
          <section className="space-y-4">
            <label className="block text-[10px] font-bold text-emerald-500 uppercase tracking-widest mb-4">02. Dataset Characteristics</label>
            
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Training Samples</span>
              <input 
                type="number" 
                value={stats.samples}
                onChange={(e) => updateStats('samples', parseInt(e.target.value))}
                aria-label="Number of Training Samples"
                className="text-sm w-full bg-[#111] border-[#222] text-zinc-300 focus:border-emerald-500 transition-colors rounded p-2"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Number of Features</span>
              <input 
                type="number" 
                value={stats.features}
                onChange={(e) => updateStats('features', parseInt(e.target.value))}
                aria-label="Number of Features"
                className="text-sm w-full bg-[#111] border-[#222] text-zinc-300 focus:border-emerald-500 transition-colors rounded p-2"
              />
            </div>

            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Class Imbalance (e.g. 1:5)</span>
              <input 
                type="text" 
                placeholder="None"
                value={stats.imbalanceRatio || ''}
                onChange={(e) => updateStats('imbalanceRatio', e.target.value)}
                aria-label="Class Imbalance Ratio"
                className="text-sm w-full bg-[#111] border-[#222] text-zinc-300 focus:border-emerald-500 transition-colors rounded p-2"
              />
            </div>
          </section>

          {/* Regularization Section */}
          <section className="space-y-4">
            <label className="block text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-4">03. Regularization</label>
            
            <div className="space-y-1.5">
              <span className="text-[10px] text-zinc-500 uppercase font-bold">Strategy</span>
              <select 
                value={stats.regularization}
                onChange={(e) => updateStats('regularization', e.target.value as RegularizationType)}
                aria-label="Regularization Strategy"
                className="text-sm w-full bg-[#111] border-[#222] text-zinc-300 focus:border-blue-500 transition-colors rounded p-2"
              >
                <option>None</option>
                <option>L1</option>
                <option>L2</option>
                <option>L1+L2</option>
                <option>Dropout</option>
                <option>Early Stopping</option>
                <option>Batch Norm</option>
                <option>Other</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between">
                <span className="text-[10px] text-zinc-500 uppercase font-bold">Strength</span>
                <span className="text-[10px] text-amber-500 font-mono">{stats.regStrength}</span>
              </div>
              <input 
                type="range" 
                min="0.0001" 
                max="1.0" 
                step="0.0001"
                disabled={stats.regularization === 'None'}
                value={stats.regStrength}
                onChange={(e) => updateStats('regStrength', parseFloat(e.target.value))}
                aria-label="Regularization Strength"
                className="w-full accent-amber-500"
              />
            </div>
          </section>

          {/* Advanced Section */}
          <section>
            <button 
              type="button"
              onClick={() => setAdvancedOpen(!advancedOpen)}
              className="flex items-center justify-between w-full text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4 hover:text-zinc-300 transition-colors"
            >
              04. Advanced Metrics {advancedOpen ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            
            {advancedOpen && (
              <div className="space-y-4 pt-4 border-t border-[#222] animate-in slide-in-from-top-2 duration-200">
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Model Depth / Layers</span>
                  <input 
                    type="number" 
                    value={stats.depth || 0}
                    onChange={(e) => updateStats('depth', parseInt(e.target.value))}
                    aria-label="Model Depth or Layers"
                    className="text-sm w-full bg-[#111] border-[#222] text-zinc-300 focus:border-amber-500 transition-colors rounded p-2"
                  />
                </div>
                <div className="space-y-1.5">
                   <span className="text-[10px] text-zinc-500 uppercase font-bold">Total Parameters</span>
                   <input 
                    type="number" 
                    value={stats.parameters || 0}
                    onChange={(e) => updateStats('parameters', parseInt(e.target.value))}
                    aria-label="Total Model Parameters"
                    className="text-sm w-full bg-[#111] border-[#222] text-zinc-300 focus:border-amber-500 transition-colors rounded p-2"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Augmentation</span>
                  <input 
                    type="checkbox" 
                    checked={stats.augmentation}
                    onChange={(e) => updateStats('augmentation', e.target.checked)}
                    aria-label="Enable Data Augmentation"
                    className="w-4 h-4 accent-amber-500 rounded border-[#333] bg-[#111]"
                  />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Cross-Validation</span>
                  <input 
                    type="checkbox" 
                    checked={stats.crossVal}
                    onChange={(e) => updateStats('crossVal', e.target.checked)}
                    aria-label="Enable Cross-Validation"
                    className="w-4 h-4 accent-amber-500 rounded border-[#333] bg-[#111]"
                  />
                </div>
                <div className="space-y-1.5">
                  <span className="text-[10px] text-zinc-500 uppercase font-bold">Loss History (Comma Separated)</span>
                  <textarea 
                    rows={2}
                    className="text-[10px] font-mono w-full bg-[#111] border-[#222] text-zinc-300 focus:border-amber-500 transition-colors rounded p-2"
                    placeholder="0.9, 0.7, 0.5..."
                    value={stats.trainLoss?.join(', ')}
                    onChange={(e) => handleLossInput('trainLoss', e.target.value)}
                  />
                </div>
              </div>
            )}
          </section>
        </form>
      </div>

      <div className="p-6 border-t border-[#222] bg-[#0A0A0A]">
        <button
          onClick={handleSubmit}
          disabled={isLoading}
          className="w-full py-4 bg-amber-500 text-black font-bold uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-amber-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Play size={18} />}
          {isLoading ? 'Processing...' : 'Run Diagnostics'}
        </button>
      </div>
    </aside>
  );
};


export default Sidebar;

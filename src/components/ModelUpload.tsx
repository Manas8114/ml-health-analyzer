import React, { useState, useRef } from 'react';
import { Upload, FileJson, Cpu, Database, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import * as ort from 'onnxruntime-web';
import type { ModelStats } from '../lib/types';

interface ModelUploadProps {
  onDataExtracted: (data: Partial<ModelStats>) => void;
}

const ModelUpload: React.FC<ModelUploadProps> = ({ onDataExtracted }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);
    setSuccess(null);

    try {
      const extension = file.name.split('.').pop()?.toLowerCase();

      if (extension === 'json') {
        await handleJsonFile(file);
      } else if (extension === 'onnx') {
        await handleOnnxFile(file);
      } else if (extension === 'h5') {
        // Limited support for raw .h5 in browser without converter
        setError("Raw .h5 files require server-side parsing. Please use the Python extractor script to generate a JSON report instead.");
      } else {
        setError(`Unsupported file type: .${extension}. Use .json (from extractor) or .onnx`);
      }
    } catch (err) {
      console.error("Extraction error:", err);
      setError(`Failed to extract data: ${err instanceof Error ? err.message : String(err)}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleJsonFile = async (file: File) => {
    const text = await file.text();
    const data = JSON.parse(text);

    // Check if it's a TF.js model.json or our custom extractor JSON
    if (data.modelTopology || data.format === 'layers-model') {
       await handleTfjsModel(file);
    } else {
      // Custom Extractor JSON
      onDataExtracted(data as Partial<ModelStats>);
      setSuccess(`Successfully imported metadata for ${data.modelType || 'model'}`);
    }
  };

  const handleTfjsModel = async (file: File) => {
    try {
      // tf.loadLayersModel requires a URL. For local files, we'd need the weights too.
      // However, we can inspect the JSON directly for architecture.
      const text = await file.text();
      const modelJson = JSON.parse(text);
      
      const stats: Partial<ModelStats> = {
        modelType: 'Neural Network',
        parameters: 0,
        regularization: 'None',
        depth: 0
      };

      if (modelJson.modelTopology?.model_config?.config?.layers) {
        const layers = modelJson.modelTopology.model_config.config.layers;
        stats.depth = layers.length;
        
        // Check for dropout
        const hasDropout = layers.some((l: any) => l.class_name === 'Dropout');
        if (hasDropout) stats.regularization = 'Dropout';
      }

      onDataExtracted(stats);
      setSuccess("Extracted Neural Network architecture from TF.js model.json");
    } catch (err) {
      setError("Failed to parse TF.js model JSON.");
    }
  };

  const handleOnnxFile = async (file: File) => {
    const buffer = await file.arrayBuffer();
    const session = await ort.InferenceSession.create(new Uint8Array(buffer));
    
    const stats: Partial<ModelStats> = {
      features: session.inputNames.length > 0 ? 0 : 0, // Placeholder
    };

    // Try to find input features from metadata/shape
    try {
        // This is simplified; real ONNX parsing for features depends on the graph
        console.log("ONNX Session:", session);
    } catch (e) {}

    onDataExtracted(stats);
    setSuccess(`Loaded ONNX model: ${session.inputNames.length} inputs detected.`);
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-4 mb-8">
      <div
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative border-2 border-dashed rounded-xl p-6 transition-all cursor-pointer group
          ${isDragging ? 'border-amber-500 bg-amber-500/10' : 'border-[#222] bg-[#0A0A0A] hover:border-[#444]'}
          ${isProcessing ? 'opacity-50 pointer-events-none' : ''}
        `}
      >
        <input
          type="file"
          title="Upload Model File"
          ref={fileInputRef}
          onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          className="hidden"
          accept=".json,.onnx,.h5"
        />

        <div className="flex flex-col items-center text-center space-y-3">
          <div className={`p-3 rounded-full ${isDragging ? 'bg-amber-500 text-black' : 'bg-[#111] text-zinc-500 group-hover:text-zinc-300'}`}>
            {isProcessing ? <Loader2 className="animate-spin" /> : <Upload size={20} />}
          </div>
          
          <div>
            <p className="text-[10px] font-bold text-white uppercase tracking-widest">
              {isProcessing ? 'Analyzing Model...' : 'Smart Model Upload'}
            </p>
            <p className="text-[9px] text-zinc-500 mt-1">
              Drop .onnx, TF.js model.json, or extractor JSON
            </p>
          </div>

          <div className="flex gap-4 pt-2">
             <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-600 uppercase">
                <FileJson size={10} /> JSON
             </div>
             <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-600 uppercase">
                <Cpu size={10} /> ONNX
             </div>
             <div className="flex items-center gap-1 text-[8px] font-bold text-zinc-600 uppercase">
                <Database size={10} /> TF.JS
             </div>
          </div>
        </div>

        {isDragging && (
          <div className="absolute inset-0 bg-amber-500/5 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
            <span className="text-amber-500 font-black italic uppercase tracking-tighter text-xl">Release to Analyze</span>
          </div>
        )}
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
          <AlertCircle size={14} className="text-red-500 shrink-0 mt-0.5" />
          <p className="text-[9px] text-red-200 leading-tight">{error}</p>
        </div>
      )}

      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded flex items-start gap-2 animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
          <p className="text-[9px] text-emerald-200 leading-tight">{success}</p>
        </div>
      )}
    </div>
  );
};

export default ModelUpload;

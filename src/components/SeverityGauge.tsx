import React from 'react';
import { motion } from 'framer-motion';

interface SeverityGaugeProps {
  score: number; // 0-10
}

const SeverityGauge: React.FC<SeverityGaugeProps> = ({ score }) => {
  // score is 0-10, we need to map it to degrees for the needle
  // -90deg is 0, 90deg is 10
  const rotation = (score / 10) * 180 - 90;

  const getColor = (s: number) => {
    if (s < 3) return '#10B981'; // Emerald
    if (s < 7) return '#F59E0B'; // Amber
    return '#EF4444'; // Red
  };

  return (
    <div className="relative w-48 h-24 overflow-hidden flex flex-col items-center">
      {/* Semi-circle track */}
      <svg width="200" height="100" viewBox="0 0 200 100">
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke="#222"
          strokeWidth="12"
          strokeLinecap="round"
        />
        <path
          d="M 20 100 A 80 80 0 0 1 180 100"
          fill="none"
          stroke={getColor(score)}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={`${(score / 10) * 251} 251`}
          className="transition-all duration-1000 ease-out"
        />
      </svg>

      {/* Needle */}
      <motion.div 
        className="absolute bottom-0 w-1 h-20 bg-white origin-bottom rounded-full shadow-[0_0_10px_rgba(255,255,255,0.5)]"
        initial={{ rotate: -90 }}
        animate={{ rotate: rotation }}
        transition={{ type: 'spring', stiffness: 50, damping: 15 }}
      />
      
      {/* Pivot point */}
      <div className="absolute bottom-0 w-4 h-4 bg-zinc-800 border-2 border-white rounded-full z-10 translate-y-1/2" />
      
      <div className={`mt-2 text-2xl font-black italic tracking-tighter ${score < 3 ? 'text-emerald-500' : score < 7 ? 'text-amber-500' : 'text-red-500'}`}>
        {score.toFixed(1)}
      </div>
    </div>
  );
};

export default SeverityGauge;

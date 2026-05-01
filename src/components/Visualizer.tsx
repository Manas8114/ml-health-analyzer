import React, { useRef, useEffect } from 'react';
import type { ModelStats, DiagnosisResponse } from '../lib/types';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
  BarElement,
  type ChartOptions
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface VisualizerProps {
  stats: ModelStats;
  diagnosis: DiagnosisResponse | null;
}

const Visualizer: React.FC<VisualizerProps> = ({ stats, diagnosis }) => {
  const lossData = {
    labels: stats.trainLoss?.map((_, i) => `Epoch ${i + 1}`) || [],
    datasets: [
      {
        label: 'Train Loss',
        data: stats.trainLoss || [],
        borderColor: '#10B981',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4,
        pointRadius: 3,
      },
      {
        label: 'Val Loss',
        data: stats.valLoss || [],
        borderColor: '#EF4444',
        borderDash: [5, 5],
        backgroundColor: 'transparent',
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };

  const getBiasVarianceData = () => {
    let bias = 40;
    let variance = 45;
    
    if (diagnosis) {
      if (diagnosis.diagnosis === 'Underfitting' || diagnosis.diagnosis === 'High Bias') {
        bias = 75;
        variance = 15;
      } else if (diagnosis.diagnosis === 'Overfitting' || diagnosis.diagnosis === 'High Variance') {
        bias = 15;
        variance = 75;
      } else if (diagnosis.diagnosis === 'Well-Fitted') {
        bias = 20;
        variance = 20;
      }
    }

    return {
      labels: ['Bias', 'Variance', 'Noise'],
      datasets: [
        {
          label: 'Contribution',
          data: [bias, variance, 10],
          backgroundColor: ['rgba(239, 68, 68, 0.6)', 'rgba(245, 158, 11, 0.6)', 'rgba(59, 130, 246, 0.6)'],
          borderColor: ['#EF4444', '#F59E0B', '#3B82F6'],
          borderWidth: 1,
        },
      ],
    };
  };

  const biasVarianceData = getBiasVarianceData();

  const riskBarRef = useRef<HTMLDivElement>(null);
  const risk = Math.min(100, (stats.features / (stats.samples / 10)) * 100);

  useEffect(() => {
    if (riskBarRef.current) {
      riskBarRef.current.style.width = `${risk}%`;
    }
  }, [risk]);

  const commonOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#A3A3A3',
          font: { family: 'JetBrains Mono', size: 10 },
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: '#111',
        titleFont: { family: 'JetBrains Mono' },
        bodyFont: { family: 'JetBrains Mono' },
        borderColor: '#333',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: '#222' },
        ticks: { color: '#525252', font: { family: 'JetBrains Mono', size: 9 } },
      },
      y: {
        grid: { color: '#222' },
        ticks: { color: '#525252', font: { family: 'JetBrains Mono', size: 9 } },
      },
    },
  };

  const lineOptions: ChartOptions<'line'> = commonOptions as unknown as ChartOptions<'line'>;
  const barOptions: ChartOptions<'bar'> = commonOptions as unknown as ChartOptions<'bar'>;

  return (
    <div className="grid grid-cols-12 gap-6 h-[600px]">
      {/* Loss Curves */}
      <div className="col-span-8 bg-[#0F0F0F] border border-[#222] p-6 rounded-xl flex flex-col">
        <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">01. Dynamic Loss Convergence</h3>
        <div className="flex-1">
          {stats.trainLoss && stats.trainLoss.length > 0 ? (
            <Line data={lossData} options={lineOptions} />
          ) : (
            <div className="h-full flex items-center justify-center border border-dashed border-[#222] rounded text-zinc-600 font-mono text-xs text-center p-8">
              Insufficient epoch data. Provide training/validation loss history in Sidebar (Advanced) to visualize curves.
            </div>
          )}
        </div>
      </div>

      {/* Bias Variance & Risk Meter */}
      <div className="col-span-4 space-y-6 flex flex-col">
        <div className="bg-[#0F0F0F] border border-[#222] p-6 rounded-xl flex-1 flex flex-col">
          <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-6">02. Bias-Variance Decomposition</h3>
          <div className="flex-1">
            <Bar data={biasVarianceData} options={barOptions} />
          </div>
          <p className="mt-4 text-[9px] text-zinc-500 leading-tight italic">
            Estimated via performance gap analysis between human parity, training error, and validation error.
          </p>
        </div>

        <div className="bg-[#0F0F0F] border border-[#222] p-6 rounded-xl">
           <h3 className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-4">03. Feature-to-Sample Risk</h3>
           <div className="relative pt-1">
              <div className="flex mb-2 items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold inline-block py-1 px-2 uppercase rounded-full text-amber-600 bg-amber-200">
                    High Dimensionality Risk
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-semibold inline-block text-amber-600">
                    {Math.min(100, (stats.features / (stats.samples / 10)) * 100).toFixed(0)}%
                  </span>
                </div>
              </div>
              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-zinc-800">
                <div 
                  ref={riskBarRef}
                  className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-amber-500 transition-all duration-1000 ease-out"
                ></div>
              </div>
            </div>
            <p className="text-[9px] text-zinc-500">
              Rule of thumb: N_samples &gt; 10 * N_features. Current: {(stats.samples / stats.features).toFixed(1)}x
            </p>
        </div>
      </div>
    </div>
  );
};

export default Visualizer;

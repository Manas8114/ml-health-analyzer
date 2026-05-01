import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Dashboard from './Dashboard';
import type { ModelStats, DiagnosisResponse, DeterministicResult } from '../lib/types';

// Mock components that might be complex or contain canvas (Visualizer)
vi.mock('./Visualizer', () => ({
  default: () => <div data-testid="visualizer-mock">Visualizer Mock</div>
}));

vi.mock('./ChatInterface', () => ({
  default: () => <div data-testid="chat-mock">Chat Mock</div>
}));

describe('Dashboard Component', () => {
  const mockStats: ModelStats = {
    modelType: 'Neural Network',
    taskType: 'Classification',
    trainAccuracy: 90,
    valAccuracy: 85,
    samples: 1000,
    features: 20,
    regularization: 'None',
    regStrength: 0,
    augmentation: false,
    crossVal: false,
    hyperTuning: false
  };

  const mockDiagnosis: DiagnosisResponse = {
    diagnosis: 'Well-Fitted',
    confidence: 95,
    severity_score: 2,
    root_cause: 'Optimal parameters.',
    deployment_ready: true,
    risk_score: 10,
    improvement_prediction: 'Minimal',
    fixes: [],
    metrics_to_monitor: ['val_loss']
  };

  const mockDeterministic: DeterministicResult[] = [
    { label: 'Overfitting', value: 'Healthy', status: 'healthy', description: 'No gap' }
  ];

  it('renders diagnosis report by default', () => {
    render(
      <Dashboard 
        stats={mockStats} 
        diagnosis={mockDiagnosis} 
        deterministicResults={mockDeterministic} 
      />
    );
    
    expect(screen.getByText('Well-Fitted')).toBeInTheDocument();
    expect(screen.getByText('READY FOR PRODUCTION')).toBeInTheDocument();
  });

  it('switches tabs correctly', async () => {
    render(
      <Dashboard 
        stats={mockStats} 
        diagnosis={mockDiagnosis} 
        deterministicResults={mockDeterministic} 
      />
    );

    // Initial state: Diagnosis tab
    expect(screen.getByText('Optimal Performance Bound')).toBeInTheDocument();

    // Click Visualizations tab
    const visualTab = screen.getByText('Visualizations');
    fireEvent.click(visualTab);

    // Use findBy to wait for potential motion transitions
    expect(await screen.findByTestId('visualizer-mock')).toBeInTheDocument();

    // Click Health Chat tab
    const chatTab = screen.getByText('Health Chat');
    fireEvent.click(chatTab);

    expect(await screen.findByTestId('chat-mock')).toBeInTheDocument();
  });

  it('handles null diagnosis (Deterministic Only mode)', () => {
    render(
      <Dashboard 
        stats={mockStats} 
        diagnosis={null} 
        deterministicResults={mockDeterministic} 
      />
    );

    expect(screen.getByText('STATISTICAL ONLY')).toBeInTheDocument();
    expect(screen.getByText('Statistical Diagnostic Report')).toBeInTheDocument();
    expect(screen.getByText('AI LAYER OFFLINE')).toBeInTheDocument();
  });
});

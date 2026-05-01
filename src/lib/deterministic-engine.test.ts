import { describe, it, expect } from 'vitest';
import { runDeterministicChecks, runFullDeterministicDiagnostic } from './deterministic-engine';
import type { ModelStats } from './types';

describe('Deterministic Engine', () => {
  const baseStats: ModelStats = {
    modelType: 'Random Forest',
    taskType: 'Classification',
    trainAccuracy: 95,
    valAccuracy: 90,
    trainLoss: [0.5, 0.4, 0.3, 0.2, 0.1],
    valLoss: [0.55, 0.45, 0.35, 0.25, 0.15],
    samples: 1000,
    features: 50,
    regularization: 'None',
    regStrength: 0,
    augmentation: false,
    crossVal: false,
    hyperTuning: false
  };

  describe('runDeterministicChecks', () => {
    it('should detect warning gap when gap is > 7', () => {
      const stats = { ...baseStats, trainAccuracy: 90, valAccuracy: 82 };
      const results = runDeterministicChecks(stats);
      const gapCheck = results.find(r => r.label === 'Train/Val Gap');
      expect(gapCheck?.status).toBe('warning');
    });

    it('should detect critical gap when gap is > 15', () => {
      const stats = { ...baseStats, trainAccuracy: 95, valAccuracy: 75 };
      const results = runDeterministicChecks(stats);
      const gapCheck = results.find(r => r.label === 'Train/Val Gap');
      expect(gapCheck?.status).toBe('critical');
    });

    it('should detect sample density risk', () => {
      const stats = { ...baseStats, samples: 100, features: 60 }; // Ratio 0.6 > 0.5
      const results = runDeterministicChecks(stats);
      const densityCheck = results.find(r => r.label === 'Sample Density');
      expect(densityCheck?.status).toBe('critical');
    });

    it('should flag loss divergence', () => {
      const stats = { 
        ...baseStats, 
        trainLoss: [0.2, 0.1], 
        valLoss: [0.2, 0.4] 
      };
      const results = runDeterministicChecks(stats);
      const divergenceCheck = results.find(r => r.label === 'Loss Divergence');
      expect(divergenceCheck?.status).toBe('critical');
    });
  });

  describe('runFullDeterministicDiagnostic', () => {
    it('should provide a deployment_ready status of true for well-fitted models', () => {
      const stats = { ...baseStats, trainAccuracy: 90, valAccuracy: 89 };
      const diagnosis = runFullDeterministicDiagnostic(stats);
      expect(diagnosis.diagnosis).toBe('Well-Fitted');
      expect(diagnosis.deployment_ready).toBe(true);
      expect(diagnosis.severity_score).toBeLessThan(4);
    });

    it('should suggest relevant fixes for overfitting', () => {
      const stats = { ...baseStats, trainAccuracy: 98, valAccuracy: 80 };
      const diagnosis = runFullDeterministicDiagnostic(stats);
      expect(diagnosis.diagnosis).toContain('Overfitting');
      expect(diagnosis.fixes.some(f => f.name.toLowerCase().includes('depth') || f.name.toLowerCase().includes('regularization'))).toBe(true);
    });
  });
});

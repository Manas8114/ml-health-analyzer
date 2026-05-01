import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeModelHealth } from './api-service';
import type { ModelStats, DeterministicResult } from './types';

describe('API Service', () => {
  const mockStats: ModelStats = {
    modelType: 'Neural Network',
    taskType: 'Classification',
    trainAccuracy: 90,
    valAccuracy: 80,
    trainLoss: [0.1],
    valLoss: [0.2],
    samples: 1000,
    features: 10,
    regularization: 'None',
    regStrength: 0,
    augmentation: false,
    crossVal: false,
    hyperTuning: false
  };

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should call Anthropic API and parse response correctly', async () => {
    const mockResponse = {
      content: [
        {
          text: JSON.stringify({
            diagnosis: 'Overfitting',
            confidence: 85,
            severity_score: 7,
            root_cause: 'Model is too complex for data.',
            deployment_ready: false,
            risk_score: 65,
            improvement_prediction: '8% accuracy gain',
            fixes: []
          })
        }
      ]
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockResponse)
    });

    const mockDeterministic: DeterministicResult[] = [];
    const result = await analyzeModelHealth(mockStats, 'fake-key', mockDeterministic);
    
    expect(fetch).toHaveBeenCalledWith(
      'https://api.anthropic.com/v1/messages',
      expect.objectContaining({
        headers: expect.objectContaining({
          'x-api-key': 'fake-key'
        })
      })
    );
    expect(result?.diagnosis).toBe('Overfitting');
  });

  it('should handle API errors gracefully', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ error: { message: 'Unauthorized' } })
    });

    const mockDeterministic: DeterministicResult[] = [];
    await expect(analyzeModelHealth(mockStats, 'wrong-key', mockDeterministic)).rejects.toThrow('Unauthorized');
  });
});

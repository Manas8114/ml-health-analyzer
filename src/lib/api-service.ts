import type { ModelStats, DiagnosisResponse, DeterministicResult } from './types';

const SYSTEM_PROMPT = `
You are a senior Machine Learning Architect and Diagnostic Specialist. 
Your task is to analyze ML model performance stats and provide a precise, technical diagnosis.

INPUT CONTEXT:
- Model architecture and task details
- Statistical performance metrics (Accuracies, Loss trends)
- Dataset characteristics
- Regularization and optimization settings
- Layer 1 Deterministic signals (computed via JS heuristics)

OUTPUT REQUIREMENTS:
- Respond ONLY with a valid JSON object.
- NO markdown preamble, NO conversational filler.
- If unsure, provide your best technical assessment based on the numbers.
- For code_snippets, ensure they are high-quality, idiomatic code (Python/Scikit-learn/PyTorch/XGBoost) specific to the user's model type.

SCHEMA:
{
  "diagnosis": "Overfitting" | "Underfitting" | "High Variance" | "High Bias" | "Well-Fitted",
  "confidence": number (0-100),
  "severity_score": number (0-10),
  "root_cause": string (2-3 sentences),
  "fixes": [
    {
      "name": string,
      "explanation": string,
      "why_it_works": string,
      "priority": number (1-3),
      "estimated_impact": "High" | "Medium" | "Low",
      "cost": "Low" | "Medium" | "High",
      "code_snippet": string
    }
  ],
  "metrics_to_monitor": string[],
  "risk_score": number (0-100),
  "deployment_ready": boolean,
  "improvement_prediction": string
}
`;

export async function analyzeModelHealth(
  stats: ModelStats, 
  apiKey: string,
  deterministicSignals: DeterministicResult[]
): Promise<DiagnosisResponse | null> {
  if (!apiKey || apiKey.trim() === '') {
    console.warn('No API key provided. Skipping cognitive layer.');
    return null;
  }

  const userPrompt = `
  Analyze this model state:
  MODEL_STATS: ${JSON.stringify(stats, null, 2)}
  DETERMINISTIC_SIGNALS: ${JSON.stringify(deterministicSignals, null, 2)}
  
  Provide full diagnosis in JSON format.
  `;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true'
      } as Record<string, string>,
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 4096,
        system: SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userPrompt }]
      })
    });

    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    const text = data.content[0].text;
    // Strip possible markdown code blocks
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

export async function streamChat(
  message: string,
  _history: { role: 'user' | 'assistant', content: string }[],
  stats: ModelStats,
  diagnosis: DiagnosisResponse | null,
  apiKey: string,
  onChunk: (chunk: string) => void
) {
  const context = `
    Context:
    Model Stats: ${JSON.stringify(stats)}
    Diagnosis: ${JSON.stringify(diagnosis)}
  `;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'dangerously-allow-browser': 'true'
      } as Record<string, string>,
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20240620',
        max_tokens: 2048,
        stream: true,
        messages: [
          { role: 'user', content: `${context}\n\nUser Question: ${message}` }
        ]
      })
    });

    if (!response.body) return;
    const reader = response.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value);
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.slice(6));
            if (data.type === 'content_block_delta') {
              onChunk(data.delta.text);
            }
          } catch (err) {
            console.error('Error parsing stream chunk:', err);
          }
        }
      }
    }
  } catch (error) {
    console.error('Chat Error:', error);
  }
}

export type ModelType = 
  | 'Linear Regression' 
  | 'Logistic Regression' 
  | 'Decision Tree' 
  | 'Random Forest' 
  | 'XGBoost/GBM' 
  | 'SVM' 
  | 'Neural Network' 
  | 'Transformer' 
  | 'Other';

export type TaskType = 'Classification' | 'Regression';

export type RegularizationType = 
  | 'None' 
  | 'L1' 
  | 'L2' 
  | 'L1+L2' 
  | 'Dropout' 
  | 'Early Stopping' 
  | 'Batch Norm' 
  | 'Other';

export interface ModelStats {
  modelType: ModelType;
  taskType: TaskType;
  trainAccuracy: number;
  valAccuracy: number;
  trainLoss?: number[];
  valLoss?: number[];
  samples: number;
  features: number;
  imbalanceRatio?: string;
  missingValues?: number;
  regularization: RegularizationType;
  regStrength: number;
  depth?: number;
  parameters?: number;
  augmentation: boolean;
  crossVal: boolean;
  hyperTuning: boolean;
}

export interface DeterministicResult {
  label: string;
  value: string | number;
  status: 'healthy' | 'warning' | 'critical';
  description: string;
}

export interface Fix {
  name: string;
  explanation: string;
  why_it_works: string;
  priority: number;
  estimated_impact: 'High' | 'Medium' | 'Low';
  cost: 'Low' | 'Medium' | 'High';
  code_snippet: string;
}

export interface DiagnosisResponse {
  diagnosis: 
    | 'Severe Overfitting' | 'Mild Overfitting' | 'Slight Overfitting' | 'Overfitting'
    | 'Severe Underfitting' | 'Underfitting' 
    | 'High Variance' | 'High Bias' | 'Well-Fitted';
  confidence: number;
  severity_score: number;
  root_cause: string;
  fixes: Fix[];
  metrics_to_monitor: string[];
  risk_score: number;
  deployment_ready: boolean;
  improvement_prediction: string;
}

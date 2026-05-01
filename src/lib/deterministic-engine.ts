import type { ModelStats, DeterministicResult, DiagnosisResponse, Fix } from './types';

/**
 * Encoded ML Theory & Best Practices
 * Deterministic Diagnostic Engine
 */

export function runDeterministicChecks(stats: ModelStats): DeterministicResult[] {
  const checks: DeterministicResult[] = [];

  // 1. Train/Val Gap
  const gap = Math.abs(stats.trainAccuracy - stats.valAccuracy);
  let gapStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (gap > 15) gapStatus = 'critical';
  else if (gap > 7) gapStatus = 'warning';
  
  checks.push({
    label: 'Train/Val Gap',
    value: `${gap.toFixed(1)}%`,
    status: gapStatus,
    description: gap > 10 ? 'Significant divergence detected between training and validation performance.' : 'Healthy generalization gap.'
  });

  // 2. Feature-to-Sample Ratio
  const ratio = stats.features / stats.samples;
  let ratioStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
  if (ratio > 0.5) ratioStatus = 'critical';
  else if (ratio > 0.1) ratioStatus = 'warning';

  checks.push({
    label: 'Sample Density',
    value: ratio.toFixed(3),
    status: ratioStatus,
    description: ratio > 0.1 ? 'High risk of overfitting due to high feature-to-sample ratio.' : 'Sufficient data for the feature space.'
  });

  // 3. Loss Trend Analysis
  if (stats.trainLoss && stats.valLoss && stats.trainLoss.length > 1) {
    const lastIdx = stats.valLoss.length - 1;
    const valDelta = stats.valLoss[lastIdx] - stats.valLoss[lastIdx - 1];
    const trainDelta = stats.trainLoss[lastIdx] - stats.trainLoss[lastIdx - 1];
    
    let lossStatus: 'healthy' | 'warning' | 'critical' = 'healthy';
    if (valDelta > 0 && trainDelta < 0) lossStatus = 'critical';
    else if (valDelta > 0) lossStatus = 'warning';

    checks.push({
      label: 'Loss Divergence',
      value: valDelta > 0 ? 'Diverging' : 'Converging',
      status: lossStatus,
      description: valDelta > 0 ? 'Validation loss is increasing while training loss decreases.' : 'Loss curves are tracking well.'
    });
  }

  return checks;
}

export function runFullDeterministicDiagnostic(stats: ModelStats): DiagnosisResponse {
  const trainAcc = stats.trainAccuracy / 100;
  const valAcc = stats.valAccuracy / 100;
  const gap = trainAcc - valAcc;
  const features = stats.features;
  const samples = stats.samples;
  const featureRatio = features / samples;
  const checks = runDeterministicChecks(stats);

  // 1. Diagnosis Logic
  let diagnosis: DiagnosisResponse['diagnosis'] = "Well-Fitted";
  
  // Overfitting Detection
  if (gap > 0.15) diagnosis = "Severe Overfitting";
  else if (gap > 0.08) diagnosis = "Mild Overfitting";
  else if (gap > 0.04) diagnosis = "Slight Overfitting";
  
  // Underfitting Detection
  if (trainAcc < 0.70 && valAcc < 0.70) {
    diagnosis = "Underfitting";
    if (trainAcc < 0.60) diagnosis = "Severe Underfitting";
  }

  // High Variance Check (Loss Divergence)
  if (stats.trainLoss && stats.valLoss && stats.trainLoss.length > 0) {
    const lastTrainLoss = stats.trainLoss[stats.trainLoss.length - 1];
    const lastValLoss = stats.valLoss[stats.valLoss.length - 1];
    if (lastValLoss > lastTrainLoss * 1.5) {
      diagnosis = "High Variance";
    }
  }

  // 2. Risk & Flags
  const metrics_to_monitor: string[] = ["Validation Loss", "Generalization Gap"];
  
  // Feature-to-Sample Ratio Risk
  let featureRisk = "Low";
  if (featureRatio > 0.5) featureRisk = "Critical";
  else if (featureRatio > 0.1) featureRisk = "High";
  else if (featureRatio > 0.05) featureRisk = "Moderate";
  if (featureRisk !== "Low") metrics_to_monitor.push("Feature Importance");

  // Regularization Adequacy
  if (gap > 0.08 && stats.regularization === "None") {
    metrics_to_monitor.push("Regularization Audit Required");
  }

  // Class Imbalance Risk
  let imbalanceRisk = 0;
  if (stats.imbalanceRatio) {
    const [majority, minority] = stats.imbalanceRatio.split(":").map(Number);
    const imbRatio = majority / minority;
    if (imbRatio > 10) imbalanceRisk = 1.5;
    else if (imbRatio > 5) imbalanceRisk = 1.0;
    else if (imbRatio > 3) imbalanceRisk = 0.5;
  }

  // 3. Severity Score Formula
  let severity = 0;
  severity += gap * 30;                          // train/val gap contributes most
  severity += (featureRatio > 0.1 ? 2 : 0);     // feature risk
  severity += (stats.regularization === "None" ? 1.5 : 0); // no regularization
  severity += imbalanceRisk;                    // class imbalance
  severity = Math.min(10, severity);             // cap at 10

  // 4. Fix Recommendation Engine
  const fixes: Fix[] = [];
  const d = diagnosis.toString();

  if (d.includes("Overfitting") || d === "High Variance") {
    if (stats.modelType === "Random Forest") {
      fixes.push({
        name: "Reduce max_depth",
        explanation: "Deep trees can capture noise in the training set.",
        why_it_works: "Limiting depth reduces model capacity to memorize outliers.",
        priority: 1,
        estimated_impact: "High",
        cost: "Low",
        code_snippet: "RandomForestClassifier(max_depth=10, min_samples_leaf=5)"
      });
    }
    if (stats.modelType === "Neural Network" || stats.modelType === "Transformer") {
      fixes.push({
        name: "Add Dropout",
        explanation: "Randomly deactivating neurons prevents co-adaptation.",
        why_it_works: "Forces the network to learn redundant, robust representations.",
        priority: 1,
        estimated_impact: "High",
        cost: "Low",
        code_snippet: "model.add(Dropout(0.3))"
      });
      fixes.push({
        name: "L2 Regularization",
        explanation: "Penalizes large weights to simplify the decision boundary.",
        why_it_works: "Prevents weights from exploding to fit complex noise.",
        priority: 2,
        estimated_impact: "Medium",
        cost: "Medium",
        code_snippet: "kernel_regularizer=regularizers.l2(0.01)"
      });
    }
    if (stats.modelType === "Decision Tree") {
      fixes.push({
        name: "Limit tree depth",
        explanation: "Decision trees are highly prone to overfitting when deep.",
        why_it_works: "Pruning or limiting depth prevents the tree from creating leaf nodes for every data point.",
        priority: 1,
        estimated_impact: "High",
        cost: "Low",
        code_snippet: "DecisionTreeClassifier(max_depth=5, min_samples_split=10)"
      });
    }
    if (stats.modelType.includes("XGBoost") || stats.modelType.includes("GBM")) {
      fixes.push({
        name: "Add regularization terms",
        explanation: "Boosting models can easily overfit if learning rate is too high or depth is unconstrained.",
        why_it_works: "Gamma, alpha, and lambda parameters penalize complexity.",
        priority: 1,
        estimated_impact: "High",
        cost: "Low",
        code_snippet: "XGBClassifier(max_depth=4, reg_alpha=0.1, reg_lambda=1.0, subsample=0.8)"
      });
    }
    
    fixes.push({
      name: "Get more training data",
      explanation: "More samples help the model generalize.",
      why_it_works: "Denser sampling reduces the probability of fitting spurious correlations.",
      priority: 1,
      estimated_impact: "High",
      cost: "High",
      code_snippet: "# Requires data acquisition or synthetic generation"
    });
    fixes.push({
      name: "Apply k-fold cross validation",
      explanation: "Provides a more robust estimate of model performance.",
      why_it_works: "Reduces variance in the performance estimate by training on different subsets.",
      priority: 2,
      estimated_impact: "Medium",
      cost: "Medium",
      code_snippet: "cross_val_score(model, X, y, cv=5)"
    });
  }

  if (d.includes("Underfitting") || d === "High Bias") {
    fixes.push({
      name: "Increase model complexity",
      explanation: "The model is too simple to capture the underlying data patterns.",
      why_it_works: "Adding more parameters (layers, depth, units) allows for fitting non-linear signals.",
      priority: 1,
      estimated_impact: "High",
      cost: "Low",
      code_snippet: "# Add layers, increase depth, or switch to a non-linear kernel"
    });
    fixes.push({
      name: "Reduce regularization strength",
      explanation: "The current constraints are preventing the model from fitting the data.",
      why_it_works: "Loosening penalties allows the optimizer to reach a lower training loss.",
      priority: 2,
      estimated_impact: "Medium",
      cost: "Low",
      code_snippet: "# Decrease L2/L1 lambda or Dropout rate"
    });
    fixes.push({
      name: "Engineer more features",
      explanation: "The current feature set lacks predictive power.",
      why_it_works: "Domain-specific feature engineering can uncover signals that raw data misses.",
      priority: 2,
      estimated_impact: "Medium",
      cost: "High",
      code_snippet: "# Create interactions, polynomials, or use domain knowledge"
    });
    fixes.push({
      name: "Train for more epochs",
      explanation: "The model may not have converged yet.",
      why_it_works: "More iterations allow the optimizer to find a better local minimum.",
      priority: 3,
      estimated_impact: "Low",
      cost: "Low",
      code_snippet: "model.fit(X, y, epochs=100) # Increase from current"
    });
  }

  // 5. Root Cause Generator
  function generateRootCause(trainAcc: number, valAcc: number, features: number, samples: number, modelType: string) {
    const gapVal = ((trainAcc - valAcc) * 100).toFixed(1);
    const ratioVal = (features / samples).toFixed(3);

    if (trainAcc - valAcc > 0.08) {
      return `Train accuracy is ${(trainAcc*100).toFixed(1)}% while validation 
      is ${(valAcc*100).toFixed(1)}% — a ${gapVal}% gap strongly indicates 
      overfitting. With ${features} features and only ${samples} samples 
      (ratio: ${ratioVal}), your ${modelType} has too much capacity relative 
      to available data and is memorizing noise instead of patterns.`;
    }
    if (trainAcc < 0.70) {
      return `Both train (${(trainAcc*100).toFixed(1)}%) and validation 
      (${(valAcc*100).toFixed(1)}%) scores are low, indicating the model 
      hasn't learned the underlying patterns. Your ${modelType} may be 
      too simple, undertrained, or the features may not capture the signal.`;
    }
    return `Model shows balanced train/val performance with a ${gapVal}% gap — 
    within acceptable range. Monitor for drift as data distribution changes.`;
  }

  // 6. Projection
  function projectAccuracy(currentAcc: number, currentSamples: number, targetSamples: number) {
    const scalingFactor = Math.log(targetSamples) / Math.log(currentSamples);
    const projected = 1 - (1 - currentAcc) * (1 / scalingFactor);
    return Math.min(0.99, projected);
  }

  const projectedVal = projectAccuracy(valAcc, samples, samples * 2);

  const isCritical = checks.some(c => c.status === 'critical');

  return {
    diagnosis,
    confidence: 100,
    severity_score: severity,
    root_cause: generateRootCause(trainAcc, valAcc, features, samples, stats.modelType),
    fixes,
    metrics_to_monitor,
    risk_score: Math.round(severity * 10),
    deployment_ready: severity < 4 && !isCritical,
    improvement_prediction: `Adding 2x data may improve val accuracy to ~${(projectedVal * 100).toFixed(1)}%`
  };
}

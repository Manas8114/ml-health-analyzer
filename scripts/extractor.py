import joblib
import json
import numpy as np
import os
import sys

def extract_model_info(model_path):
    print(f"Loading model from {model_path}...")
    
    # Check extension
    _, ext = os.path.splitext(model_path)
    
    if ext in ['.pkl', '.joblib']:
        try:
            model = joblib.load(model_path)
            return extract_sklearn(model)
        except Exception as e:
            return {"error": f"Failed to load sklearn model: {str(e)}"}
    
    elif ext in ['.pt', '.pth']:
        try:
            import torch
            model = torch.load(model_path, map_location=torch.device('cpu'))
            return extract_pytorch(model)
        except ImportError:
            return {"error": "torch not installed. Cannot extract PyTorch model."}
        except Exception as e:
            return {"error": f"Failed to load PyTorch model: {str(e)}"}
    
    else:
        return {"error": f"Unsupported file extension: {ext}"}

def extract_sklearn(model):
    info = {
        "modelType": type(model).__name__,
        "features": getattr(model, "n_features_in_", 0),
        "samples": 0, # Cannot be reliably extracted from saved model alone
        "regularization": "None",
        "regStrength": 0.0,
        "depth": getattr(model, "max_depth", None),
        "parameters": None
    }
    
    # Try to determine task type
    if hasattr(model, "predict_proba") or hasattr(model, "classes_"):
        info["taskType"] = "Classification"
    else:
        info["taskType"] = "Regression"
        
    # Map model types to our supported types
    model_name = type(model).__name__.lower()
    if "randomforest" in model_name:
        info["modelType"] = "Random Forest"
    elif "xgboost" in model_name or "gbm" in model_name or "lgbm" in model_name:
        info["modelType"] = "XGBoost/GBM"
    elif "logistic" in model_name:
        info["modelType"] = "Logistic Regression"
    elif "linear" in model_name and "regression" in model_name:
        info["modelType"] = "Linear Regression"
    elif "svc" in model_name or "svr" in model_name or "svm" in model_name:
        info["modelType"] = "SVM"
    elif "decisiontree" in model_name:
        info["modelType"] = "Decision Tree"
        
    # Extract Regularization
    if hasattr(model, "C"):
        info["regularization"] = "L2" # Default for many SVM/LogReg
        info["regStrength"] = model.C
    elif hasattr(model, "alpha"):
        info["regularization"] = "L2" # Or L1 depending on model
        info["regStrength"] = model.alpha
        
    # Extract depth/estimators for ensemble
    if hasattr(model, "n_estimators"):
        info["parameters"] = model.n_estimators # Using parameters field to store n_estimators for now
        
    return info

def extract_pytorch(model):
    # PyTorch models can be architecture classes or state_dicts
    # This is a basic extraction
    total_params = sum(p.numel() for p in model.parameters()) if hasattr(model, "parameters") else 0
    
    info = {
        "modelType": "Neural Network",
        "taskType": "Classification", # Assumption
        "parameters": total_params,
        "regularization": "Dropout" if "dropout" in str(model).lower() else "None",
        "features": 0,
        "depth": len(list(model.children())) if hasattr(model, "children") else 0
    }
    
    return info

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python extractor.py <model_file>")
        sys.exit(1)
        
    model_path = sys.argv[1]
    if not os.path.exists(model_path):
        print(f"File not found: {model_path}")
        sys.exit(1)
        
    result = extract_model_info(model_path)
    
    output_file = "model_info.json"
    with open(output_file, "w") as f:
        json.dump(result, f, indent=2)
        
    print(f"\nExtraction complete! Data saved to {output_file}")
    print(json.dumps(result, indent=2))

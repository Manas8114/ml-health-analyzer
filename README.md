# 🧬 ML Health Analyzer

A production-ready **Hybrid Diagnostic Engine** for machine learning models. This tool provides deep insights into model performance, overfitting detection, and deployment readiness using a "Deterministic-First" approach combined with optional AI-augmented reasoning.

![ML Health Analyzer Dashboard](src/assets/hero.png)

## 🚀 Key Features

- **Hybrid Intelligence Engine**: Operates fully offline using robust heuristic-based logic, with an optional AI layer (Anthropic Claude) for deep semantic analysis.
- **Deterministic-First Diagnostics**: Critical health metrics (Overfitting, Underfitting, Convergence) are calculated using mathematically sound formulas, ensuring 100% reliability without API dependency.
- **Safety Deployment Guard**: Automated safety checks that mark models as `non-deployable` if critical issues (e.g., severe overfitting or loss divergence) are detected.
- **Interactive Chat Interface**: Deep-dive into specific model problems using a streaming AI chat interface that leverages deterministic signals for context.
- **Professional Visualization**: Real-time performance charts and severity gauges for immediate visual feedback.

## 🛠️ Tech Stack

- **Frontend**: React 18, Vite, TypeScript
- **Styling**: Tailwind CSS (Modern Glassmorphism Design)
- **Testing**: Vitest, React Testing Library (100% Core Coverage)
- **AI Integration**: Anthropic SDK (Claude 3.5 Sonnet)
- **State Management**: React Hooks & Context

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Manas8114/ml-health-analyzer.git
   cd ml-health-analyzer
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run the development server**
   ```bash
   npm run dev
   ```

## 🧪 Testing

The project maintains a strict testing protocol. All core logic and UI components are validated.

- **Run all tests**: `npm run test`
- **Watch mode**: `npm run test:watch`
- **Coverage report**: `npm run test:ui` (for visual coverage)

## 📐 Architecture: Deterministic-First

The core logic resides in `src/lib/deterministic-engine.ts`. It follows a strict pipeline:
1. **Signal Extraction**: Raw model stats are processed into normalized signals.
2. **Heuristic Diagnosis**: Overfitting, Underfitting, and Variance are detected via encoded rules.
3. **Safety Verification**: Models are scanned for critical blockers.
4. **AI Enrichment (Optional)**: If an API key is provided, deterministic signals are sent to the LLM to generate high-fidelity human-readable reports.

## 📄 License

MIT © [Manas8114](https://github.com/Manas8114)

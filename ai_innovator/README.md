# MediCare AI — Intelligent Healthcare Platform

MediCare AI is a comprehensive healthcare platform that combines Machine Learning and Generative AI to provide users with instant health insights, symptom analysis, and a detailed disease repository.

## 🌟 Key Features
- **🧠 Hybrid AI Analysis**: Combines Random Forest ML models with Gemini 1.5 Flash for accurate condition prediction.
- **📚 Disease Library**: Detailed information on 100+ conditions including treatments, medications, and diet.
- **🏥 Facility Discovery**: Locate nearby hospitals and emergency services.
- **📜 Health History**: Keep track of your past assessments securely on the cloud.
- **🔐 Secure Auth**: Built on Supabase for enterprise-grade security.

## 🏗️ Architecture
- **Frontend**: React 18, Vite, TypeScript, Ant Design, Tailwind CSS, Zustand.
- **Backend**: Node.js, Express, TypeScript, Supabase Client.
- **ML Services**: Python, Flask, Scikit-Learn (Random Forest), FuzzyWuzzy.
- **AI**: Google Gemini 1.5 Flash (Generative-AI SDK).

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- Supabase Account
- Google Gemini API Key

### Quick Start
1. **Clone the repo**
2. **Setup Backend**:
   ```bash
   cd backend
   cp .env.example .env # Add your Supabase and Gemini keys
   npm install
   npm run dev
   ```
3. **Setup ML Service**:
   ```bash
   cd ml_service
   python -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   flask run --port=5002
   ```
4. **Setup Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Running All Services
Use the provided shell script (Mac/Linux):
```bash
./run_services.sh
```

## 📖 Documentation
- [Requirements](./REQUIREMENTS.md)
- [Implementation Plan](./IMPLEMENTATION_PLAN.md)
- [Task Tracking](./TASKS.md)
- [Database Schema](./frontend/medicare-ai-schema.sql)

## ⚖️ Disclaimer
This application is for informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.

<div align="center">
  <h1>🏥 Medicare AI</h1>
  <p><strong>Intelligent Healthcare Platform Powered by Machine Learning & Generative AI</strong></p>
  <img src="https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/MongoDB-4EA94B?style=for-the-badge&logo=mongodb&logoColor=white" />
  <img src="https://img.shields.io/badge/Python-FFD43B?style=for-the-badge&logo=python&logoColor=blue" />
</div>

<br />

Medicare AI is a comprehensive healthcare platform that combines **Machine Learning (Random Forest)** and **Generative AI (Google Gemini 1.5)** to provide users with instant health insights, symptom analysis, and a detailed disease repository. 

Designed with a modern architecture, it is fully optimized for cloud deployment (Render & Vercel) and handles intensive predictive analytics with minimal memory footprint.

## 🌟 Key Features
- **🧠 Hybrid AI Analysis**: Combines highly-optimized Scikit-Learn ML models with Gemini 1.5 Flash for pinpoint accurate condition prediction.
- **📚 Disease Library**: In-depth medical repository covering 100+ conditions including treatments, medications, and specialized diets.
- **🏥 Facility Discovery**: Geospatial integration to locate nearby hospitals and emergency services instantly.
- **📜 Secure Health History**: Secure cloud storage of past assessments utilizing MongoDB.
- **🔐 JWT Authentication**: Robust custom authentication system using bcrypt and JSON Web Tokens.

## 🏗️ Architecture Stack
- **Frontend**: React 18, Vite, TypeScript, Tailwind CSS, Zustand.
- **Backend**: Node.js, Express, TypeScript, Mongoose.
- **ML Services**: Python, Flask, Scikit-Learn (Random Forest), FuzzyWuzzy.
- **AI Engine**: Google Gemini 1.5 Flash.

## 🚀 Deployment (Render & Vercel)

This repository is structured for zero-configuration deployments.

### 1. ML Service (Render)
Create a new Python Web Service on Render:
- **Root Directory:** `ml_service`
- **Build Command:** `pip install -r requirements.txt`
- **Start Command:** `gunicorn -w 1 -b 0.0.0.0:$PORT app:app`

### 2. Backend & Frontend (Render)
Create a Node Web Service on Render to serve the API and compile the UI:
- **Root Directory:** `backend`
- **Build Command:** `npm install && npm run build`
- **Start Command:** `npm start`
- *(Add your Environment Variables: `MONGO_URI`, `JWT_SECRET`, `GEMINI_API_KEY`, etc.)*

*(Optional)* You can also deploy the **Frontend** independently on **Vercel** by selecting the `frontend` folder and injecting the Backend URL as `VITE_API_URL`.

## 💻 Local Development

### Prerequisites
- Node.js (v18+)
- Python (v3.10+)
- MongoDB (Local or Atlas)
- Google Gemini API Key

### Quick Start
To run the entire platform locally, simply execute the build script from the root folder:

```bash
chmod +x build.sh
./build.sh
```
This script cleanly builds the React app, prepares the Python virtual environment, and merges the stack.

Then, start the servers:
```bash
# Start ML Service
cd ml_service && source venv/bin/activate && python app.py

# Start Node Backend (serves API & Frontend on port 5001)
cd backend && npm start
```

## ⚖️ Disclaimer
*This application is for informational purposes only. It is NOT a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.*

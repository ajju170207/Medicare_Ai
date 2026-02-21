# MedicareAI Requirements

## Overview
MedicareAI is an AI-powered healthcare platform designed to provide instant symptom analysis, disease library access, and medical facility discovery.

## Functional Requirements

### 1. User Authentication
- Sign up with email, password, and full name.
- Secure login using Supabase Auth.
- Profile management (age, gender, location).

### 2. AI Symptom Checker
- Natural language input for describing symptoms.
- Multi-step analysis flow (Information -> Symptoms -> Result).
- Integrated Machine Learning (Random Forest) for disease prediction.
- Integrated Gemini 1.5 Flash for deep medical context and recommendations.
- Emergency detection and high-urgency alerts.

### 3. Disease Library
- Comprehensive database of medical conditions.
- Search and filter by body system (e.g., Respiratory, Gastrointestinal).
- Detailed view for each disease including:
  - Description and symptoms.
  - Recommended specialist.
  - Medications and diet.
  - Precautions and health tips.

### 4. Health History
- Secure storage of all previous symptom analyses.
- Detailed report retrieval for past checks.
- Option to delete history items.

### 5. Medical Facility Finder (Hospital Finder)
- Geographic discovery of nearby hospitals (Planned/Mocked).
- Emergency contact links.

## Technical Requirements

### Backend
- **Node.js & TypeScript**: Core server logic.
- **Express**: REST API framework.
- **Supabase (PostgreSQL)**: Database and Authentication.
- **Gemini 1.5 Flash API**: AI-powered analysis.
- **Flask (Python)**: ML Microservice for disease prediction.

### Frontend
- **React & TypeScript**: UI framework.
- **Vite**: Build tool.
- **Ant Design & Tailwind CSS**: Styling and UI components.
- **Lucide & Ant Design Icons**: Visual elements.
- **Zustand**: State management.

### ML Service
- **Python (Scikit-Learn)**: Random Forest Classifier.
- **FuzzyWuzzy**: For symptom matching and spell correction.
- **Pandas/NumPy**: Data processing.

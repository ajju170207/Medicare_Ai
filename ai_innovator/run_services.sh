#!/bin/bash

# Function to kill all background processes on exit
cleanup() {
    echo "Stopping all services..."
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT

echo "🚀 Starting MedicareAI Services..."

# 1. Start ML Microservice (Python)
echo "🐍 Starting ML Service (Port 5002)..."
cd ml_service
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi
source venv/bin/activate
pip install -r requirements.txt > /dev/null 2>&1
export FLASK_APP=app.py
flask run --port=5002 &
ML_PID=$!
cd ..

# 2. Start Backend (Node/Express)
echo "⚙️  Starting Backend (Port 5001)..."
cd backend
npm run dev &
BACKEND_PID=$!
cd ..

# 3. Start Frontend (Vite)
echo "🌐 Starting Frontend..."
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo "✅ All services started!"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend: http://localhost:5001"
echo "   - ML Service: http://localhost:5002"
echo "Press Ctrl+C to stop all services."

wait

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
echo "Installing Python dependencies..."
# pip install -r requirements.txt
export FLASK_APP=app.py
# Use nohup or similar to ensure it stays in background correctly
nohup python app.py > ml_output.log 2>&1 &
ML_PID=$!
echo "ML Service started (PID: $ML_PID)"
cd ..

# 2. Start Backend (Node/Express)
echo "⚙️  Starting Backend (Port 5001)..."
cd backend
# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies for backend..."
    npm install
fi
nohup npm run dev > backend_output.log 2>&1 &
BACKEND_PID=$!
echo "Backend started (PID: $BACKEND_PID)"
cd ..

# 3. Start Frontend (Vite)
echo "🌐 Starting Frontend..."
cd frontend
if [ ! -d "node_modules" ]; then
    echo "Installing Node dependencies for frontend..."
    npm install
fi
nohup npm run dev > frontend_output.log 2>&1 &
FRONTEND_PID=$!
echo "Frontend started (PID: $FRONTEND_PID)"
cd ..

echo "✅ All services starting in background!"
echo "   - Frontend: http://localhost:5173"
echo "   - Backend: http://localhost:5001"
echo "   - ML Service: http://localhost:5002"
echo "Logs are being written to *_output.log files."
echo "Press Ctrl+C to stop all services (if running in this terminal)."

wait

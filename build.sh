#!/bin/bash
set -e

echo "Cleaning up..."
rm -rf frontend/node_modules backend/node_modules ml_service/venv backend/public

echo "Building Frontend..."
cd frontend
npm install
npm run build
cd ..

echo "Moving Frontend to Backend..."
mv frontend/dist backend/public

echo "Installing Backend Dependencies..."
cd backend
npm install
cd ..

echo "Setting up ML Service..."
cd ml_service
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cd ..

echo "Build complete! Ready for deployment."

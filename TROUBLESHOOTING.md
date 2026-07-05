# 🛠️ MedicareAI Troubleshooting Guide

It looks like your MedicareAI platform is facing issues. Follow these steps to resolve common problems.

## 🗄️ Database (Supabase)

This app uses **Supabase** (not MongoDB). 
1. Ensure your `backend/.env` has valid `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY`.
2. Check your internet connection as Supabase is a cloud service.

## 🐍 ML Microservice (Python)

If the ML service (Port 5002) is not responding:
1. Ensure you have **Python 3.10 to 3.13** installed. (Avoid 3.14+ for compatibility with some older ML libraries).
2. Recreate the virtual environment if dependencies are broken:
   ```bash
   cd ml_service
   rm -rf venv
   python3 -m venv venv
   source venv/bin/activate
   pip install -r requirements.txt
   ```
3. Run it manually to see errors: `python app.py`

## ⚙️ Backend (Node/Express)

If the backend (Port 5001) hangs on startup:
1. Ensure all packages are installed: `npm install` in the `backend` folder.
2. If using `npm run dev` and it hangs, try running directly with `npx ts-node src/server.ts` to see immediate output.

## 🌐 Frontend (Vite)

- Port: `5173`
- If you see a blank page, check the browser console for API connection errors.

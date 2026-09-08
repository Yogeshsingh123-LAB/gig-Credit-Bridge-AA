@echo off
TITLE CredBridge Full-Stack Application Launcher
echo ============================================================
echo                    CRED BRIDGE LAUNCHER
echo        "Turn gig income into trusted financial evidence."
echo ============================================================
echo.

echo [1/2] Starting FastAPI Backend on http://localhost:8001 ...
start "CredBridge Backend (FastAPI)" cmd /k "cd backend && set PYTHONPATH=..;backend;. && python -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

echo [2/2] Starting React Frontend on http://localhost:5173 ...
start "CredBridge Frontend (Vite)" cmd /k "cd frontend && set VITE_API_URL=http://localhost:8001 && npm run dev"

echo.
echo ============================================================
echo CredBridge services are starting up!
echo.
echo Backend API Docs:  http://localhost:8001/docs
echo Frontend Web App:  http://localhost:5173
echo.
echo Demo Credentials:
echo   - Worker:  ravi.worker@example.com / Password123!
echo   - Lender:  priya.lender@example.com / Password123!
echo   - Admin:   admin@credbridge.com     / Admin@123456
echo ============================================================
echo.

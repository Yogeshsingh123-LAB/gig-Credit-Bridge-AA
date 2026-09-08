@echo off
TITLE CredBridge Master Launcher
echo ============================================================
echo                    CRED BRIDGE LAUNCHER
echo        "Turn gig income into trusted financial evidence."
echo ============================================================
echo.

set "PY_CMD=python"
if exist "%~dp0backend\.venv\Scripts\python.exe" set "PY_CMD=%~dp0backend\.venv\Scripts\python.exe"
if exist "%~dp0..\backend\.venv\Scripts\python.exe" set "PY_CMD=%~dp0..\backend\.venv\Scripts\python.exe"

if "%1"=="docker" goto launch_docker
if "%1"=="local" goto launch_local
if "%1"=="test" goto run_tests

echo Please select launch mode:
echo   [1] Standard Local Launch (Python Uvicorn + Vite Dev Server)
echo   [2] Docker Compose Launch (PostgreSQL + FastAPI + Vite Containers)
echo   [3] Run Full Automated Pytest Suite (45 Tests)
echo.
set /p choice="Enter your choice (1, 2, or 3) [Default: 1]: "

if "%choice%"=="2" goto launch_docker
if "%choice%"=="3" goto run_tests
goto launch_local

:launch_local
echo.
echo Launching CredBridge in Local Mode...
echo [1/2] Starting FastAPI Backend on http://localhost:8001 ...
start "CredBridge Backend (FastAPI)" cmd /k "cd backend && set PYTHONPATH=..;backend;. && ^"%PY_CMD%^" -m uvicorn app.main:app --host 0.0.0.0 --port 8001 --reload"

echo [2/2] Starting React Frontend on http://localhost:5173 ...
start "CredBridge Frontend (Vite)" cmd /k "cd frontend && set VITE_API_URL=http://localhost:8001 && npm run dev"

goto summary

:launch_docker
echo.
echo Launching CredBridge via Docker Compose...
docker compose up --build
goto end

:run_tests
echo.
echo Running Full Pytest Suite...
cmd /c "set PYTHONPATH=..;backend;. && ^"%PY_CMD%^" -m pytest backend/tests intelligence/tests"
pause
goto end

:summary
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

:end

# CredBridge Setup and Running Guide

## Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- Docker & Docker Compose (optional for containerized deployment)

---

## 1. Local Development Setup

### Backend (FastAPI)
```bash
cd backend
python -m venv .venv
# Windows: .venv\Scripts\activate | Linux/macOS: source .venv/bin/activate
pip install -r requirements.txt

# Start FastAPI Uvicorn Server (Port 8001)
uvicorn app.main:app --reload --port 8001
```
- API Docs (Swagger): `http://localhost:8001/docs`
- Healthcheck: `http://localhost:8001/api/v1/health`

### Frontend (React + Vite)
```bash
cd frontend
npm install
npm run dev
```
The frontend Vite server runs on `http://localhost:5173`.

---

## 2. Running Automated Tests

### Backend Test Suite (29 Tests)
```bash
cd backend
$env:PYTHONPATH=".;../credbridge"
python -m pytest tests -v
```

### Frontend Typecheck & Production Build
```bash
cd frontend
npm run build
```

---

## 3. Docker Compose Deployment

```bash
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API & Swagger: `http://localhost:8001/docs`
- PostgreSQL Database: `localhost:5432`

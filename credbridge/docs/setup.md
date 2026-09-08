# CredBridge Setup and Running Guide

## Prerequisites
- Python 3.11+
- Node.js 18+ & npm
- Docker & Docker Compose (optional for containerized deployment)

---

## 1. Local Development Setup

### Backend (FastAPI)
```bash
cd credbridge/backend
python -m venv venv
# Windows: venv\Scripts\activate | Linux/macOS: source venv/bin/activate
pip install -r requirements.txt

# Run database migrations
alembic upgrade head

# Start FastAPI Uvicorn Server
uvicorn app.main:app --reload --port 8001
```

### Frontend (React + Vite)
```bash
cd credbridge/frontend
npm install
npm run dev
```
The frontend Vite server runs on `http://localhost:5173`.

---

## 2. Running Automated Tests

### Backend & Intelligence Unit/Integration Tests
```bash
cd credbridge
$env:PYTHONPATH="backend;."
python -m pytest backend/tests intelligence/tests
```

### Frontend Typecheck & Production Build
```bash
cd credbridge/frontend
npm run build
```

---

## 3. Docker Compose Deployment

```bash
cd credbridge
docker compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API & Swagger: `http://localhost:8001/docs`
- PostgreSQL Database: `localhost:5432`

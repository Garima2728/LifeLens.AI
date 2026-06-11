# LifeLens AI

AI-powered personal wellness assistant — daily routine tracking, facial emotion detection, and Claude/GPT-4o-driven insights.

> **Disclaimer:** LifeLens AI provides wellness suggestions only — NOT medical advice. Always consult a qualified healthcare professional for medical decisions.

## Structure
```
lifelens-ai/
├── frontend/   Next.js 14 + TypeScript + Tailwind + Framer Motion + R3F
└── backend/    FastAPI + MongoDB + DeepFace + Claude/OpenAI
```

## Quick start (Docker)
```bash
cp backend/.env.example backend/.env       # add OPENAI_API_KEY or ANTHROPIC_API_KEY
cp frontend/.env.local.example frontend/.env.local
docker-compose up -d
```
Frontend: http://localhost:3000  ·  Backend: http://localhost:8000

## Manual setup

### Backend
```bash
cd backend
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # edit values
uvicorn main:app --reload --port 8000
```

### Frontend
```bash
cd frontend
npm install
cp .env.local.example .env.local
npm run dev
```

## Features
- JWT auth (register/login) + demo mode
- Daily routine tracker (sleep, meals, exercise, screen time, stress, social)
- Webcam-based facial emotion detection (DeepFace) — no video stored, only scores
- AI insights via Claude (preferred) or GPT-4o, with rule-based fallback
- Dashboard: mood/health/productivity/sleep/diet trends, radar chart, streaks
- Habit tracker with streaks + points/gamification
- Daily / weekly / monthly views

## Key environment variables

**backend/.env**
- `SECRET_KEY` — JWT signing secret (32+ chars)
- `MONGODB_URL` — MongoDB connection string
- `ANTHROPIC_API_KEY` / `OPENAI_API_KEY` — at least one for AI insights

**frontend/.env.local**
- `NEXT_PUBLIC_API_URL` — backend base URL

## API overview
```
POST /api/v1/auth/register | login | logout      GET /me
POST /api/v1/logs                                 GET /logs/date/{date} | recent | chart
POST /api/v1/insights/generate                    GET /insights/latest | history
POST /api/v1/emotion/analyze | summary            GET /emotion/history
GET/PUT /api/v1/users/me                          GET /users/stats
GET/POST/DELETE /api/v1/habits  POST /habits/{id}/complete
```

## Privacy
- Emotion frames processed in memory only, never persisted
- Camera requires explicit per-session consent
- All AI output carries a "not medical advice" disclaimer

## Deployment
- Frontend → Vercel (`NEXT_PUBLIC_API_URL` env var)
- Backend → Render/Railway (`uvicorn main:app --host 0.0.0.0 --port $PORT`)
- Database → MongoDB Atlas

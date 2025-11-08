# 🚀 Quick Start Commands

## Start Backend

```bash
cd Vibeathon/backend
./start_server.sh
```

**Expected Output:**
```
🚀 Starting FastAPI server...
✅ Starting server on http://0.0.0.0:8000
📊 API docs available at http://0.0.0.0:8000/docs

INFO:     Uvicorn running on http://0.0.0.0:8000
INFO:     Application startup complete.
```

## Start Frontend

```bash
cd Vibeathon/frontend
npm run dev
```

**Expected Output:**
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 2.5s
```

## Test Backend Health

```bash
curl http://localhost:8000/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-11-08T...",
  "services": {
    "alert_engine": "operational",
    "emotion_analyzer": "operational",
    "database": "operational"
  }
}
```

## Test Emotion API

```bash
# Replace USER_ID with actual user ID
curl http://localhost:8000/api/emotions/stats/USER_ID
```

## Open Application

```bash
# macOS
open http://localhost:3000/dashboard

# Linux
xdg-open http://localhost:3000/dashboard

# Or just paste in browser:
http://localhost:3000/dashboard
```

## Stop Services

**Backend:** Press `Ctrl+C` in terminal

**Frontend:** Press `Ctrl+C` in terminal

## Troubleshooting

### Backend won't start?
```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
./start_server.sh
```

### Frontend errors?
```bash
cd frontend
rm -rf .next
npm run dev
```

### Port already in use?
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Kill process on port 3000
lsof -ti:3000 | xargs kill -9
```

---

**Ready to go! 🎉**

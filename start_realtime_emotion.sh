#!/bin/bash

# 🎭 Real-Time Emotion Analyzer - Quick Start Script
# This script starts both backend and frontend for testing

echo "🎭 Starting Real-Time Emotion Analyzer..."
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if backend .env exists
if [ ! -f "backend/.env" ]; then
    echo -e "${YELLOW}⚠️  Warning: backend/.env not found${NC}"
    echo "Create backend/.env with:"
    echo "  SUPABASE_URL=your_url"
    echo "  SUPABASE_SERVICE_KEY=your_key"
    echo ""
fi

# Check if frontend .env.local exists
if [ ! -f "frontend/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Warning: frontend/.env.local not found${NC}"
    echo "Create frontend/.env.local with:"
    echo "  NEXT_PUBLIC_SUPABASE_URL=your_url"
    echo "  NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key"
    echo "  NEXT_PUBLIC_BACKEND_URL=http://localhost:8000"
    echo ""
fi

# Start backend
echo -e "${BLUE}🚀 Starting Backend API...${NC}"
cd backend
python3 -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000 &
BACKEND_PID=$!
cd ..

# Wait for backend to start
echo "Waiting for backend to start..."
sleep 3

# Start frontend
echo -e "${BLUE}🚀 Starting Frontend...${NC}"
cd frontend
npm run dev &
FRONTEND_PID=$!
cd ..

echo ""
echo -e "${GREEN}✅ Services Started!${NC}"
echo ""
echo "📊 Backend API: http://localhost:8000"
echo "📊 API Docs: http://localhost:8000/docs"
echo "🌐 Frontend: http://localhost:3000"
echo "🎭 Dashboard: http://localhost:3000/dashboard"
echo ""
echo "Press Ctrl+C to stop all services"
echo ""

# Wait for Ctrl+C
trap "echo ''; echo 'Stopping services...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait

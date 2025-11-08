#!/bin/bash

# Start FastAPI server with proper virtual environment

echo "🚀 Starting FastAPI server..."

# Get the directory where this script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Activate virtual environment and run uvicorn
cd "$SCRIPT_DIR"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "❌ Virtual environment not found. Creating one..."
    python3 -m venv venv
    source venv/bin/activate
    pip install -r requirements.txt
else
    source venv/bin/activate
fi

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  Warning: .env file not found"
    echo "Create .env with:"
    echo "  SUPABASE_URL=your_url"
    echo "  SUPABASE_SERVICE_KEY=your_key"
    echo ""
fi

# Start uvicorn
echo "✅ Starting server on http://0.0.0.0:8000"
echo "📊 API docs available at http://0.0.0.0:8000/docs"
echo ""

uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

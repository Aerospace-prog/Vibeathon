@echo off
echo ========================================
echo   Video Call System - Quick Start
echo ========================================
echo.
echo This will start the backend server with signaling support
echo.
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

cd backend
python -m uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

pause

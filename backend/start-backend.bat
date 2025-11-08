@echo off
echo Starting Arogya-AI Backend Server...
echo.

REM Change to backend directory
cd /d "%~dp0"

REM Activate virtual environment
echo Activating virtual environment...
call venv\Scripts\activate

REM Check if activation worked
if not defined VIRTUAL_ENV (
    echo ERROR: Virtual environment not found!
    echo Please run: python -m venv venv
    pause
    exit /b 1
)

echo Virtual environment activated: %VIRTUAL_ENV%
echo.

REM Start the backend server
echo Starting server on http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
python run.py

pause

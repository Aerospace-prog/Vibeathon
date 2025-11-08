@echo off
echo ========================================
echo   Arogya-AI Backend Server Startup
echo ========================================
echo.

REM Check if virtual environment exists
if not exist "venv\Scripts\activate.bat" (
    echo [ERROR] Virtual environment not found!
    echo Creating virtual environment...
    python -m venv venv
    echo.
)

REM Activate virtual environment
echo [1/3] Activating virtual environment...
call venv\Scripts\activate.bat

REM Install/Update dependencies
echo.
echo [2/3] Installing dependencies...
pip install -r requirements.txt

REM Start the server
echo.
echo [3/3] Starting FastAPI server...
echo.
echo Server will be available at: http://localhost:8000
echo API Documentation: http://localhost:8000/docs
echo.
echo Press CTRL+C to stop the server
echo.
python run.py

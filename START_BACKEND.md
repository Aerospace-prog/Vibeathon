# How to Start Backend Correctly

## The Error You're Seeing

```
ModuleNotFoundError: No module named 'app'
```

This means Python can't find the `app` module because:
1. You're not in the `backend` directory
2. Virtual environment isn't activated
3. Or you're running the wrong command

## ✅ Correct Way to Start Backend

### Step 1: Open Terminal in Backend Directory

```bash
cd C:\Users\LENOVO\OneDrive\Desktop\Vibeathon\backend
```

### Step 2: Activate Virtual Environment

```bash
venv\Scripts\activate
```

You should see `(venv)` at the start of your prompt:
```
(venv) PS C:\Users\LENOVO\OneDrive\Desktop\Vibeathon\backend>
```

### Step 3: Run Backend

```bash
python run.py
```

## Expected Output

You should see:
```
INFO:     Will watch for changes in these directories: ['C:\\Users\\LENOVO\\OneDrive\\Desktop\\Vibeathon\\backend']
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process [xxxxx] using WatchFiles
INFO:     Started server process [xxxxx]
INFO:     Waiting for application startup.
INFO:     STT pipeline initialized successfully
WARNING:  Database client unavailable, transcripts won't be saved
INFO:     Application startup complete.
```

## Troubleshooting

### Issue: "venv\Scripts\activate" not found

**Solution**: Create virtual environment first
```bash
cd backend
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
python run.py
```

### Issue: Still getting ModuleNotFoundError

**Solution**: Make sure you're in the backend directory
```bash
# Check current directory
pwd

# Should show: .../Vibeathon/backend
# If not, navigate there:
cd backend
```

### Issue: "python: command not found"

**Solution**: Use `python3` or check Python installation
```bash
python3 run.py
# or
py run.py
```

## Quick Start Script

Save this as `start-backend.bat` in the backend folder:

```batch
@echo off
cd /d "%~dp0"
call venv\Scripts\activate
python run.py
pause
```

Then just double-click `start-backend.bat` to start the backend!

## Verify Backend is Running

1. Open browser: http://localhost:8000/docs
2. You should see FastAPI Swagger documentation
3. Check health: http://localhost:8000/health

## Common Mistakes

❌ Running from root directory
❌ Not activating virtual environment
❌ Using `uvicorn main:app` instead of `python run.py`
❌ Running `uvicorn app.main:app` from wrong directory

✅ Always run from `backend` directory
✅ Always activate venv first
✅ Use `python run.py`

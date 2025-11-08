# Quick Start Guide - Backend Setup

## Step 1: Activate Virtual Environment

**On Windows (Command Prompt):**
```cmd
cd backend
venv\Scripts\activate
```

**On Windows (PowerShell):**
```powershell
cd backend
venv\Scripts\Activate.ps1
```

**On Mac/Linux:**
```bash
cd backend
source venv/bin/activate
```

## Step 2: Install Dependencies

Once the virtual environment is activated (you'll see `(venv)` in your prompt):

```cmd
pip install -r requirements.txt
```

## Step 3: Run the Backend Server

```cmd
python run.py
```

Or using uvicorn directly:
```cmd
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

## Troubleshooting

### Issue: "No module named 'uvicorn'"
**Solution:** You forgot to activate the virtual environment. Go back to Step 1.

### Issue: Virtual environment doesn't exist
**Solution:** Create a new one:
```cmd
python -m venv venv
```
Then go to Step 1.

### Issue: pip install fails
**Solution:** Upgrade pip first:
```cmd
python -m pip install --upgrade pip
```
Then try Step 2 again.

### Issue: Port 8000 already in use
**Solution:** Kill the process or use a different port:
```cmd
uvicorn app.main:app --reload --port 8001
```

## Expected Output

When the server starts successfully, you should see:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Waiting for application startup.
INFO:     Application startup complete.
```

## Testing the API

Open your browser and go to:
- API Docs: http://localhost:8000/docs
- Health Check: http://localhost:8000/health

## Next Steps

Once the backend is running:
1. Open a new terminal
2. Navigate to the frontend directory
3. Run `npm run dev`
4. Test the Razorpay payment integration!

# Google Cloud Setup Guide

## What You Need

Google Cloud credentials are required for:
- **Speech-to-Text** (converting audio to text)
- **Translation API** (translating between languages)

## Step-by-Step Setup

### Step 1: Create Google Cloud Account

1. Go to: https://console.cloud.google.com/
2. Sign in with your Google account
3. Accept terms and conditions
4. You get **$300 free credits** for 90 days

### Step 2: Create a New Project

1. Click the project dropdown at the top (says "Select a project")
2. Click **"NEW PROJECT"**
3. Enter project name: `arogya-ai-telehealth`
4. Click **"CREATE"**
5. Wait for project to be created (takes ~30 seconds)
6. Select your new project from the dropdown

### Step 3: Enable Required APIs

1. Go to: https://console.cloud.google.com/apis/library
2. Search for and enable these APIs:

**Enable Speech-to-Text API:**
- Search: "Cloud Speech-to-Text API"
- Click on it
- Click **"ENABLE"**
- Wait for it to enable

**Enable Translation API:**
- Search: "Cloud Translation API"
- Click on it
- Click **"ENABLE"**
- Wait for it to enable

### Step 4: Create Service Account

1. Go to: https://console.cloud.google.com/iam-admin/serviceaccounts
2. Click **"+ CREATE SERVICE ACCOUNT"**
3. Fill in details:
   - **Service account name**: `arogya-ai-backend`
   - **Service account ID**: (auto-filled)
   - **Description**: `Backend service for Arogya-AI telehealth`
4. Click **"CREATE AND CONTINUE"**

5. **Grant permissions** (Step 2):
   - Click "Select a role"
   - Search and add: **"Cloud Speech Client"**
   - Click "+ ADD ANOTHER ROLE"
   - Search and add: **"Cloud Translation API User"**
   - Click **"CONTINUE"**

6. **Grant users access** (Step 3):
   - Skip this step (click **"DONE"**)

### Step 5: Create and Download Key

1. Find your service account in the list
2. Click on the **email** (looks like: arogya-ai-backend@...)
3. Go to **"KEYS"** tab
4. Click **"ADD KEY"** → **"Create new key"**
5. Select **"JSON"** format
6. Click **"CREATE"**
7. A JSON file will download automatically
8. **IMPORTANT**: Save this file securely!

### Step 6: Move Key File to Project

1. Rename the downloaded file to: `google-credentials.json`
2. Move it to your backend folder:
   ```
   backend/google-credentials.json
   ```
3. **IMPORTANT**: Add to `.gitignore` so it's not committed to Git

### Step 7: Update backend/.env

Open `backend/.env` and update these lines:

```env
# Google Cloud Configuration
GOOGLE_CLOUD_PROJECT_ID=arogya-ai-telehealth
GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json
```

Replace `arogya-ai-telehealth` with your actual project ID if different.

### Step 8: Add to .gitignore

Make sure `backend/.gitignore` includes:
```
google-credentials.json
*.json
.env
```

### Step 9: Restart Backend

```bash
# Stop backend (Ctrl+C)
cd backend
venv\Scripts\activate
python run.py
```

You should see:
```
INFO: STT pipeline initialized successfully
INFO: Uvicorn running on http://0.0.0.0:8000
```

## Verify Setup

### Test 1: Check Health Endpoint

Go to: http://localhost:8000/health

Should show:
```json
{
  "status": "healthy",
  "dependencies": {
    "database": "healthy",
    "stt_pipeline": "healthy"
  }
}
```

### Test 2: Try Video Call

1. Go to http://localhost:3000
2. Sign in
3. Click "Start New Call"
4. Allow camera/microphone
5. WebSocket should connect successfully!

## Troubleshooting

### Error: "Could not load credentials"

**Solution**: Check file path in `.env`
```env
# If file is in backend folder, use:
GOOGLE_APPLICATION_CREDENTIALS=google-credentials.json

# If file is elsewhere, use full path:
GOOGLE_APPLICATION_CREDENTIALS=C:/path/to/google-credentials.json
```

### Error: "API not enabled"

**Solution**: Make sure you enabled both APIs:
- Cloud Speech-to-Text API
- Cloud Translation API

Go to: https://console.cloud.google.com/apis/dashboard

### Error: "Permission denied"

**Solution**: Check service account has correct roles:
- Cloud Speech Client
- Cloud Translation API User

### Error: "Quota exceeded"

**Solution**: You're using free tier. Check quotas at:
https://console.cloud.google.com/iam-admin/quotas

Free tier limits:
- Speech-to-Text: 60 minutes/month
- Translation: 500,000 characters/month

## Alternative: Use Mock Mode (For Testing Only)

If you want to test without Google Cloud:

1. Add to `backend/.env`:
```env
MOCK_MODE=true
```

2. This will skip real STT/translation but allow video call to work

## Cost Information

**Free Tier (First 90 days):**
- $300 credit
- More than enough for development

**After Free Tier:**
- Speech-to-Text: $0.006 per 15 seconds
- Translation: $20 per 1M characters
- Very affordable for testing

## Security Best Practices

1. ✅ Never commit `google-credentials.json` to Git
2. ✅ Add to `.gitignore`
3. ✅ Don't share the JSON file
4. ✅ Use service accounts (not personal credentials)
5. ✅ Rotate keys periodically in production

## Need Help?

If you get stuck:
1. Check Google Cloud Console for errors
2. Look at backend terminal for detailed error messages
3. Verify all APIs are enabled
4. Make sure service account has correct permissions

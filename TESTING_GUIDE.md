# Testing Guide - Error Handling and Loading States

This guide provides step-by-step instructions for testing the error handling and loading states implementation.

## Prerequisites

Before testing, ensure you have:
- Node.js installed
- Backend server configured
- Frontend dependencies installed
- Environment variables set up

## Setup

### 1. Install Dependencies

```bash
# Frontend
cd frontend
npm install

# Backend (if not already done)
cd ../backend
pip install -r requirements.txt
```

### 2. Environment Variables

Ensure these files are configured:

**frontend/.env.local**
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
```

**backend/.env**
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
OPENAI_API_KEY=your_openai_key
```

## Running the Application

### Option 1: Run Both Services Separately

**Terminal 1 - Backend:**
```bash
cd backend
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:8000

### Option 2: Using Process Manager (Recommended for Testing)

You can use a process manager like `concurrently` or run them in separate terminal windows.

## Testing Scenarios

### Test 1: Toast Notifications

**Purpose**: Verify toast notifications work correctly

**Steps:**
1. Open http://localhost:3000
2. Navigate to the authentication page
3. Try to sign in with invalid credentials
4. **Expected**: Red error toast appears in top-right corner
5. Sign in with valid credentials
6. **Expected**: Green success toast appears

**What to Look For:**
- ✅ Toast appears in top-right corner
- ✅ Toast auto-dismisses after 4 seconds
- ✅ Toast has close button
- ✅ Correct color for error (red) and success (green)

---

### Test 2: Error Boundary

**Purpose**: Verify Error Boundary catches component errors

**Steps:**
1. Open browser DevTools Console
2. Navigate to any page
3. Manually trigger an error (you can modify a component temporarily to throw an error)
4. **Expected**: Error boundary fallback UI appears with:
   - Error icon
   - "Something went wrong" message
   - Error details
   - "Refresh Page" button
   - "Go Back" button

**What to Look For:**
- ✅ Error is caught and doesn't crash the app
- ✅ User-friendly error message displayed
- ✅ Stack trace visible in development mode
- ✅ Refresh button works
- ✅ Go back button works

---

### Test 3: Loading States - Authentication

**Purpose**: Verify loading spinners during authentication

**Steps:**
1. Navigate to http://localhost:3000/auth
2. Enter valid credentials
3. Click "Sign In"
4. **Expected**: 
   - Button shows spinner
   - Button text changes to "Signing in..."
   - Button is disabled during loading

**What to Look For:**
- ✅ Spinner appears in button
- ✅ Button text updates
- ✅ Button is disabled
- ✅ Form inputs are disabled

---

### Test 4: Loading States - Dashboard

**Purpose**: Verify loading states when starting a call

**Steps:**
1. Sign in to the dashboard
2. Click "Start New Call" button
3. **Expected**:
   - Button shows spinner
   - Button text changes to "Starting..."
   - Toast notification: "Creating demo patient..." (if no patients exist)
   - Toast notification: "Starting consultation..."
   - Toast notification: "Consultation started!"

**What to Look For:**
- ✅ Button loading state
- ✅ Sequential toast notifications
- ✅ Smooth transition to video call room

---

### Test 5: WebSocket Retry Logic

**Purpose**: Verify WebSocket automatically retries with exponential backoff

**Steps:**
1. Start the backend server
2. Start a video call from the dashboard
3. Wait for the video call room to load
4. **Stop the backend server** (Ctrl+C in backend terminal)
5. **Expected**:
   - Toast warning: "Connection lost. Retrying in 2s... (1/3)"
   - After 2s: "Connection lost. Retrying in 4s... (2/3)"
   - After 4s: "Connection lost. Retrying in 8s... (3/3)"
   - After 8s: Toast error: "Failed to connect after multiple attempts"
   - Red alert banner: "Translation service disconnected" with "Reconnect" button
6. **Restart the backend server**
7. Click the "Reconnect" button
8. **Expected**:
   - Toast success: "Reconnected successfully"
   - Green alert banner: "Live translation active"

**What to Look For:**
- ✅ Automatic retry attempts with increasing delays
- ✅ Toast notifications for each retry
- ✅ Connection status indicators (red/green alerts)
- ✅ Manual reconnect button works
- ✅ Successful reconnection after backend restart

---

### Test 6: Media Device Errors

**Purpose**: Verify proper handling of camera/microphone errors

**Steps:**

**Test 6a: Permission Denied**
1. Open browser settings
2. Block camera and microphone permissions for localhost
3. Navigate to dashboard and start a new call
4. **Expected**:
   - Red error alert: "Camera/microphone access denied. Please grant permissions and refresh."
   - Toast error with same message
   - "Refresh Page" button in alert

**Test 6b: No Devices Found**
1. Disconnect or disable camera/microphone (if possible)
2. Start a new call
3. **Expected**:
   - Error message: "No camera or microphone found. Please connect devices and refresh."

**Test 6c: Device Already in Use**
1. Open another application using camera (e.g., Zoom, Teams)
2. Try to start a call
3. **Expected**:
   - Error message: "Camera/microphone is already in use by another application."

**What to Look For:**
- ✅ Specific error messages for each scenario
- ✅ Toast notifications
- ✅ Alert banners with error details
- ✅ Recovery instructions provided
- ✅ Refresh button available

---

### Test 7: SOAP Note Loading States

**Purpose**: Verify loading and error states for SOAP note review

**Steps:**

**Test 7a: Normal Loading**
1. Complete a video call
2. Click "End Call & Review Notes"
3. **Expected**:
   - Full-screen loading overlay with spinner
   - Message: "Loading SOAP note..."
   - Smooth transition to SOAP note form

**Test 7b: Loading Error**
1. Stop the backend server
2. Try to access a SOAP note review page directly
3. **Expected**:
   - Error card with:
     - Error icon
     - "Failed to Load SOAP Note" title
     - Error message
     - "Retry" button
     - "Back to Dashboard" button

**Test 7c: Save Loading**
1. Load a SOAP note successfully
2. Click "Approve and Save Record"
3. **Expected**:
   - Button shows "Saving..."
   - Button is disabled
   - Toast success: "SOAP note approved and saved successfully!"
   - Redirect to dashboard after 1.5s

**What to Look For:**
- ✅ Loading overlay displays correctly
- ✅ Error fallback screen appears on failure
- ✅ Retry button works
- ✅ Save button shows loading state
- ✅ Success toast appears
- ✅ Automatic redirect after save

---

### Test 8: Network Resilience

**Purpose**: Verify application handles network issues gracefully

**Steps:**
1. Start the application normally
2. Open browser DevTools > Network tab
3. Set throttling to "Slow 3G" or "Offline"
4. Try various operations:
   - Sign in
   - Load dashboard
   - Start a call
   - Load SOAP notes
5. **Expected**:
   - Loading states persist longer
   - Appropriate error messages appear
   - Retry options available
   - No application crashes

**What to Look For:**
- ✅ Application doesn't crash
- ✅ Loading states show during slow operations
- ✅ Error messages appear for failed operations
- ✅ Retry mechanisms work
- ✅ User can recover from errors

---

### Test 9: Lexicon Contribution

**Purpose**: Verify error handling for community lexicon submission

**Steps:**
1. Navigate to SOAP note review page
2. Click "Suggest Better Term" button
3. Fill in the form with valid data
4. Click "Submit"
5. **Expected**:
   - Button shows "Submitting..."
   - Button is disabled
   - Toast success: "Thank you! Your term has been added to the Community Lexicon."
   - Modal closes
   - Form resets

**Test with Backend Down:**
1. Stop backend server
2. Try to submit a term
3. **Expected**:
   - Toast error with specific error message
   - Modal stays open
   - Form data preserved
   - User can retry

**What to Look For:**
- ✅ Loading state in submit button
- ✅ Success toast on successful submission
- ✅ Error toast on failure
- ✅ Form validation works
- ✅ Modal behavior correct

---

### Test 10: Connection Status Indicators

**Purpose**: Verify real-time connection status indicators

**Steps:**
1. Start a video call
2. Observe the connection status alerts
3. **Expected Initial State**:
   - Blue alert: "Connecting to video call..."
   - Blue alert: "Connecting to translation service..."
4. **Expected Connected State**:
   - Green alert: "Live translation active"
5. **Stop backend server**
6. **Expected Disconnected State**:
   - Red alert: "Translation service disconnected" with "Reconnect" button
7. **Restart backend and click Reconnect**
8. **Expected Reconnected State**:
   - Green alert: "Live translation active"

**What to Look For:**
- ✅ Color-coded alerts (blue=connecting, green=connected, red=error)
- ✅ Icons match status (Spinner, Wifi, WifiOff)
- ✅ Status updates in real-time
- ✅ Reconnect button appears when disconnected
- ✅ Manual reconnect works

---

## Common Issues and Solutions

### Issue: Toast notifications not appearing
**Solution**: 
- Check that ToastProvider is in the layout
- Verify `sonner` package is installed
- Check browser console for errors

### Issue: WebSocket not connecting
**Solution**:
- Verify backend is running on port 8000
- Check NEXT_PUBLIC_BACKEND_URL in .env.local
- Ensure WebSocket endpoint is correct

### Issue: Media devices not accessible
**Solution**:
- Check browser permissions
- Ensure HTTPS or localhost (required for getUserMedia)
- Verify devices are not in use by other apps

### Issue: Build errors
**Solution**:
```bash
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

## Performance Testing

### Load Time Testing
1. Open DevTools > Network tab
2. Disable cache
3. Reload pages and measure:
   - Initial page load
   - Time to interactive
   - Loading state duration

**Expected:**
- Initial load: < 3s
- Time to interactive: < 5s
- Loading states visible for operations > 500ms

### Memory Testing
1. Open DevTools > Performance tab
2. Start recording
3. Perform various operations
4. Check for memory leaks

**Expected:**
- No significant memory growth
- Proper cleanup on component unmount
- WebSocket connections closed properly

## Automated Testing (Future)

For automated testing, consider:
- Jest for unit tests
- React Testing Library for component tests
- Playwright/Cypress for E2E tests
- Mock WebSocket connections
- Mock media devices

## Reporting Issues

When reporting issues, include:
1. Steps to reproduce
2. Expected behavior
3. Actual behavior
4. Browser and version
5. Console errors
6. Network tab screenshots

## Success Criteria

All tests pass when:
- ✅ All toast notifications appear correctly
- ✅ Error boundaries catch errors
- ✅ Loading states show for all async operations
- ✅ WebSocket retries work with exponential backoff
- ✅ Media device errors handled gracefully
- ✅ Connection status indicators update in real-time
- ✅ Users can recover from all error states
- ✅ No application crashes
- ✅ Build completes without errors

## Next Steps After Testing

1. Document any bugs found
2. Create tickets for improvements
3. Add automated tests
4. Monitor error rates in production
5. Gather user feedback

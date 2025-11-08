# Video Call System - How It Works

## Overview
The video call system allows doctors and patients to join consultation rooms for real-time video consultations with live translation.

## How to Join a Call

### For Patients:
1. **From Patient Dashboard:**
   - View upcoming appointments in the "Upcoming Appointments" section
   - Click the "Join" button next to any scheduled appointment
   - You'll be redirected to: `/consultation/{appointmentId}/room?userType=patient`

2. **From Appointments Page:**
   - Navigate to "My Appointments" from the menu
   - Find scheduled appointments
   - Click "Join Call" button
   - You'll be redirected to: `/consultation/{appointmentId}/room?userType=patient`

### For Doctors:
1. **From Doctor Dashboard:**
   - View upcoming appointments in the "My Appointments" section
   - Click the "Join" button next to any consultation
   - You'll be redirected to: `/consultation/{appointmentId}/room?userType=doctor`

2. **From Appointments Page:**
   - Navigate to "My Appointments" from the menu
   - Find scheduled appointments
   - Click "Join Call" button
   - You'll be redirected to: `/consultation/{appointmentId}/room?userType=doctor`

## URL Structure
```
/consultation/{appointmentId}/room?userType={doctor|patient}
```

**Parameters:**
- `appointmentId`: The unique ID of the appointment
- `userType`: Either "doctor" or "patient" - determines the user's role in the call

## Current Implementation

### Join Call Links:

**Patient Dashboard:**
```tsx
<Link href={`/consultation/${appointment.id}/room?userType=patient`}>
  <Button>Join</Button>
</Link>
```

**Patient Appointments Page:**
```tsx
<Link href={`/consultation/${appointment.id}/room?userType=patient`}>
  <Button>Join Call</Button>
</Link>
```

**Doctor Dashboard:**
```tsx
<Link href={`/consultation/${consultation.id}/room?userType=doctor`}>
  <Button>Join</Button>
</Link>
```

**Doctor Appointments Page:**
```tsx
<Link href={`/consultation/${appointment.id}/room?userType=doctor`}>
  <Button>Join Call</Button>
</Link>
```

## Video Call Room Features

### 1. Authentication
- Checks if user is logged in
- Redirects to `/auth` if not authenticated

### 2. User Type Validation
- Validates `userType` parameter (doctor or patient)
- Defaults to "doctor" if invalid

### 3. VideoCallRoom Component
The main component handles:
- **WebRTC Connection**: Peer-to-peer video/audio streaming
- **Local Video**: User's camera feed
- **Remote Video**: Other participant's camera feed
- **WebSocket**: Real-time translation service
- **Audio Streaming**: Sends audio for translation
- **Captions**: Displays translated text in real-time

### 4. Media Permissions
- Requests camera and microphone access
- Handles permission errors gracefully
- Shows error messages if access is denied

## Technical Flow

### When a User Joins:
1. **Page Load**: `/consultation/[id]/room?userType=patient`
2. **Authentication Check**: Verifies user session
3. **Component Mount**: VideoCallRoom component loads
4. **Media Access**: Requests camera/microphone permissions
5. **WebRTC Setup**: Establishes peer connection
6. **WebSocket Connect**: Connects to translation service
7. **Call Active**: Video/audio streaming begins

### Connection Process:
```
User Clicks "Join" 
  → Navigate to consultation room
  → Check authentication
  → Request media permissions
  → Setup WebRTC connection
  → Connect WebSocket for translation
  → Start video/audio streaming
  → Display local and remote video
  → Stream audio for translation
  → Display captions
```

## Current Status

✅ **Working:**
- Patient can join from dashboard (max 3 appointments shown)
- Patient can join from appointments page
- Doctor can join from dashboard (shows consultations)
- Doctor can join from appointments page
- URL includes correct userType parameter
- Authentication is enforced
- VideoCallRoom component handles both user types

⚠️ **Note:**
- The system uses the existing `consultations` table for doctor dashboard
- The system uses the new `appointments` table for patient dashboard and appointments pages
- Both doctors and patients can join using their respective appointment IDs

## Testing the System

### To Test as Patient:
1. Book an appointment through the booking flow
2. Go to Patient Dashboard
3. See the appointment in "Upcoming Appointments"
4. Click "Join" button
5. Allow camera/microphone permissions
6. Wait for doctor to join

### To Test as Doctor:
1. Check for appointments in Doctor Dashboard
2. See appointments in "My Appointments" section
3. Click "Join" button
4. Allow camera/microphone permissions
5. Wait for patient to join

## Troubleshooting

### If Join Button Doesn't Work:
- Check if appointment status is "scheduled"
- Verify appointment ID exists in database
- Check browser console for errors
- Ensure camera/microphone permissions are granted

### If Video Doesn't Show:
- Check browser permissions for camera/microphone
- Verify WebRTC is supported in browser
- Check if another app is using the camera
- Try refreshing the page

### If Translation Doesn't Work:
- Check WebSocket connection status
- Verify backend is running on port 8000
- Check browser console for WebSocket errors
- Ensure audio is being captured

## Environment Variables Required

```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
NEXT_PUBLIC_DEBUG_MODE=false
```

## Summary

Both doctors and patients can join video calls through:
1. Their respective dashboards (quick access to upcoming appointments)
2. Their appointments pages (full list of all appointments)

The system automatically identifies the user type through the URL parameter and configures the video call room accordingly. The VideoCallRoom component handles all the WebRTC, media streaming, and translation functionality for both user types.

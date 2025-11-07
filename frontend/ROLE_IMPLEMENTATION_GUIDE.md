# 👥 User Role Implementation Guide

## Problem
Currently, the system doesn't differentiate between doctors and patients. Everyone is treated as a doctor.

## Solution Overview

### 1. Database Schema Changes

#### Option A: Using Supabase Profiles Table (Recommended)
```sql
-- Create profiles table
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT NOT NULL CHECK (role IN ('doctor', 'patient')),
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
```

#### Option B: Using Supabase User Metadata (Simpler)
```typescript
// During signup, add metadata
await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: 'doctor', // or 'patient'
      full_name: 'Dr. John Doe'
    }
  }
})
```

---

### 2. Update Auth Page

Add role selection during signup:

```typescript
// app/(auth)/auth/page.tsx

const [role, setRole] = useState<'doctor' | 'patient'>('doctor')

// In the signup form:
<div className="space-y-2">
  <label className="text-sm font-semibold">I am a:</label>
  <div className="grid grid-cols-2 gap-3">
    <button
      type="button"
      onClick={() => setRole('doctor')}
      className={`p-4 border-2 rounded-lg transition-all ${
        role === 'doctor'
          ? 'border-teal-500 bg-teal-50 dark:bg-teal-950/30'
          : 'border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <Stethoscope className="w-6 h-6 mx-auto mb-2" />
      <div className="font-semibold">Doctor</div>
    </button>
    <button
      type="button"
      onClick={() => setRole('patient')}
      className={`p-4 border-2 rounded-lg transition-all ${
        role === 'patient'
          ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-950/30'
          : 'border-zinc-200 dark:border-zinc-800'
      }`}
    >
      <Heart className="w-6 h-6 mx-auto mb-2" />
      <div className="font-semibold">Patient</div>
    </button>
  </div>
</div>

// During signup:
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: {
      role: role,
      full_name: name // if you collect name
    }
  }
})
```

---

### 3. Create Middleware for Role-Based Routing

```typescript
// middleware.ts

export async function middleware(request: NextRequest) {
  const supabase = createServerClient(...)
  
  const { data: { session } } = await supabase.auth.getSession()
  
  if (session) {
    const userRole = session.user.user_metadata?.role
    
    // Redirect based on role
    if (request.nextUrl.pathname.startsWith('/dashboard')) {
      if (userRole === 'patient') {
        return NextResponse.redirect(new URL('/patient/dashboard', request.url))
      }
    }
    
    if (request.nextUrl.pathname.startsWith('/patient')) {
      if (userRole === 'doctor') {
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }
    }
  }
  
  return response
}
```

---

### 4. Create Patient Dashboard

```typescript
// app/patient/dashboard/page.tsx

export default async function PatientDashboard() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  // Verify user is a patient
  if (session?.user.user_metadata?.role !== 'patient') {
    redirect('/dashboard')
  }
  
  return (
    <div>
      <h1>Patient Dashboard</h1>
      {/* Patient-specific features */}
      <div>
        <h2>My Appointments</h2>
        <h2>My Medical Records</h2>
        <h2>Book Consultation</h2>
      </div>
    </div>
  )
}
```

---

### 5. Update Dashboard to Check Role

```typescript
// app/dashboard/page.tsx

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { session } } = await supabase.auth.getSession()
  
  if (!session) {
    redirect('/auth')
  }
  
  // Check if user is a doctor
  const userRole = session.user.user_metadata?.role
  
  if (userRole === 'patient') {
    redirect('/patient/dashboard')
  }
  
  // Rest of doctor dashboard code...
}
```

---

## Implementation Steps

### Step 1: Choose Database Approach
- **Option A**: Create profiles table (more flexible, recommended)
- **Option B**: Use user metadata (simpler, faster to implement)

### Step 2: Update Auth Page
- Add role selection UI
- Update signup logic to include role

### Step 3: Create Patient Dashboard
- Create `app/patient/dashboard/page.tsx`
- Design patient-specific features
- Show appointments, medical records, etc.

### Step 4: Add Role-Based Routing
- Update middleware to redirect based on role
- Add role checks in dashboard pages

### Step 5: Update Landing Page
- Add separate CTAs for doctors and patients
- "Sign Up as Doctor" vs "Sign Up as Patient"

---

## Quick Implementation (Using Metadata)

### 1. Update Auth Page
Add this to the signup form:

```typescript
const [role, setRole] = useState<'doctor' | 'patient'>('doctor')

// In signup handler:
const { data, error } = await supabase.auth.signUp({
  email,
  password,
  options: {
    data: { role }
  }
})
```

### 2. Create Patient Dashboard
```bash
mkdir -p app/patient/dashboard
# Create page.tsx with patient features
```

### 3. Add Role Check in Doctor Dashboard
```typescript
const userRole = session.user.user_metadata?.role
if (userRole === 'patient') {
  redirect('/patient/dashboard')
}
```

---

## Features by Role

### Doctor Dashboard
- ✅ Start consultations
- ✅ View patient records
- ✅ Review SOAP notes
- ✅ Manage appointments
- ✅ Community lexicon contributions

### Patient Dashboard
- 📅 Book appointments
- 👨‍⚕️ View my doctors
- 📋 View my medical records
- 💊 View prescriptions
- 📞 Join video consultations
- 📝 View consultation history

---

## Current Status

### ✅ Implemented
- Doctor authentication
- Doctor dashboard
- Basic auth flow

### ❌ Not Implemented Yet
- Role selection during signup
- Patient dashboard
- Role-based routing
- Patient-specific features

---

## Recommendation

**For MVP/Hackathon:**
Use **Option B (User Metadata)** because:
1. Faster to implement
2. No database migrations needed
3. Built into Supabase Auth
4. Easy to upgrade later

**For Production:**
Use **Option A (Profiles Table)** because:
1. More flexible
2. Can store additional user data
3. Better for complex role systems
4. Easier to query and manage

---

## Next Steps

1. Decide on approach (Metadata vs Profiles table)
2. Update auth page with role selection
3. Create patient dashboard
4. Add role-based routing
5. Test both user flows

Would you like me to implement this now?

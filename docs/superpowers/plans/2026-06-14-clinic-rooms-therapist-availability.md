# Clinic Rooms & Therapist Availability Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add clinic room capacity tracking and therapist availability scheduling with 7-day calendar UI.

**Architecture:** Two independent features: (1) simple number input for clinic rooms in edit modal, (2) therapist availability modal with working day checkboxes and exceptions. Backend uses existing `therapist_availability` table + new `therapist_exceptions` table for vacation/day-off tracking.

**Tech Stack:** Next.js 14 App Router, TypeScript, React, Supabase, Tailwind CSS.

---

## File Structure

**New Files:**
- `app/dashboard/admin/clinics/ClinicRoomsTab.tsx` — Room count input component
- `app/dashboard/clinical/therapists/TherapistAvailabilityCalendar.tsx` — 7-day calendar display (read-only)
- `app/dashboard/clinical/therapists/ScheduleAvailabilityModal.tsx` — Modal for editing availability
- `app/dashboard/clinical/therapists/AddExceptionForm.tsx` — Sub-form for adding exceptions
- `app/api/admin/therapists/[id]/exceptions/route.ts` — Exception CRUD endpoints
- `migrations/add_number_of_rooms_to_clinics.sql` — Database migration
- `migrations/create_therapist_exceptions.sql` — Database migration

**Modified Files:**
- `app/dashboard/admin/clinics/ClinicsList.tsx` — Add "Rooms" tab to modal
- `app/dashboard/clinical/therapists/TherapistsList.tsx` — Integrate calendar + Schedule button
- `app/api/admin/clinics/[id]/route.ts` — Accept `number_of_rooms` in PUT request

---

## Task 1: Database Migrations

### Files
- Create: `migrations/add_number_of_rooms_to_clinics.sql`
- Create: `migrations/create_therapist_exceptions.sql`

- [ ] **Step 1: Create migration file for clinics table**

Create `/Users/haythamhussein/Downloads/sama-wellness/migrations/add_number_of_rooms_to_clinics.sql`:

```sql
-- Add number_of_rooms column to clinics table
ALTER TABLE clinics ADD COLUMN number_of_rooms INTEGER;

-- Add comment for clarity
COMMENT ON COLUMN clinics.number_of_rooms IS 'Total number of therapy rooms at this clinic';
```

- [ ] **Step 2: Create migration file for therapist_exceptions table**

Create `/Users/haythamhussein/Downloads/sama-wellness/migrations/create_therapist_exceptions.sql`:

```sql
-- Create therapist_exceptions table for vacation/day-off tracking
CREATE TABLE therapist_exceptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  therapist_id UUID NOT NULL REFERENCES therapists(id) ON DELETE CASCADE,
  clinic_id UUID NOT NULL REFERENCES clinics(id) ON DELETE CASCADE,
  exception_type TEXT NOT NULL CHECK (exception_type IN ('vacation', 'day_off')),
  start_date DATE NOT NULL,
  end_date DATE,
  notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create index for faster queries
CREATE INDEX idx_therapist_exceptions_therapist_clinic 
  ON therapist_exceptions(therapist_id, clinic_id);

-- Add RLS policy (if using Supabase RLS)
ALTER TABLE therapist_exceptions ENABLE ROW LEVEL SECURITY;
```

- [ ] **Step 3: Apply migrations to Supabase**

Run these migrations in Supabase SQL editor:
- Copy contents of `add_number_of_rooms_to_clinics.sql` and execute
- Copy contents of `create_therapist_exceptions.sql` and execute

Expected: Both statements complete without errors.

- [ ] **Step 4: Commit migrations**

```bash
git add migrations/
git commit -m "feat: add number_of_rooms to clinics and create therapist_exceptions table"
```

---

## Task 2: Update Clinics API to Support number_of_rooms

### Files
- Modify: `app/api/admin/clinics/[id]/route.ts`

- [ ] **Step 1: Read the current clinic API**

Read `app/api/admin/clinics/[id]/route.ts` to understand the current PUT handler structure.

- [ ] **Step 2: Update PUT handler to accept number_of_rooms**

Modify the PUT request handler in `app/api/admin/clinics/[id]/route.ts` to include `number_of_rooms`:

Find the section where clinic data is extracted from the request body and add:

```typescript
const body = await request.json();
const { name, location, phone, email, number_of_rooms } = body;

// Validate number_of_rooms if provided
if (number_of_rooms !== undefined && number_of_rooms !== null) {
  if (typeof number_of_rooms !== 'number' || number_of_rooms < 1) {
    return NextResponse.json(
      { error: 'number_of_rooms must be a number >= 1' },
      { status: 400 }
    );
  }
}

// Update the insert/update statement to include number_of_rooms
const { data, error } = await supabase
  .from('clinics')
  .update({
    name,
    location: location || null,
    phone: phone || null,
    email: email || null,
    number_of_rooms: number_of_rooms || null,
  })
  .eq('id', clinicId)
  .select();
```

- [ ] **Step 3: Test the API with curl**

```bash
curl -X PUT http://localhost:3000/api/admin/clinics/{clinic_id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Main Clinic",
    "location": "Cairo",
    "phone": "+20123456789",
    "email": "clinic@example.com",
    "number_of_rooms": 5
  }'
```

Expected: Returns updated clinic with `number_of_rooms: 5` in response.

- [ ] **Step 4: Commit changes**

```bash
git add app/api/admin/clinics/[id]/route.ts
git commit -m "feat: add number_of_rooms support to clinics API"
```

---

## Task 3: Create Therapist Exceptions API Endpoints

### Files
- Create: `app/api/admin/therapists/[id]/exceptions/route.ts`

- [ ] **Step 1: Create exceptions route handler**

Create `app/api/admin/therapists/[id]/exceptions/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT, getJWTFromCookie, type JWTPayload } from '@/lib/auth';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
);

async function checkAdminPermission(
  request: NextRequest
): Promise<
  | { authorized: false; error: string; statusCode: number }
  | { authorized: true; user: JWTPayload }
> {
  const cookieHeader = request.headers.get('cookie');
  const token = getJWTFromCookie(cookieHeader || undefined);

  if (!token) {
    return { authorized: false, error: 'No authentication token found', statusCode: 401 };
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    return { authorized: false, error: 'Invalid or expired token', statusCode: 401 };
  }

  if (!payload.permissions.includes('manage_users')) {
    return { authorized: false, error: 'Insufficient permissions', statusCode: 403 };
  }

  return { authorized: true, user: payload };
}

/**
 * GET /api/admin/therapists/[id]/exceptions
 * Fetch all exceptions for a therapist at a specific clinic
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.statusCode }
    );
  }

  try {
    const therapistId = params.id;
    const { searchParams } = new URL(request.url);
    const clinicId = searchParams.get('clinic_id');

    if (!clinicId) {
      return NextResponse.json(
        { error: 'clinic_id query parameter is required' },
        { status: 400 }
      );
    }

    const { data: exceptions, error } = await supabase
      .from('therapist_exceptions')
      .select('*')
      .eq('therapist_id', therapistId)
      .eq('clinic_id', clinicId)
      .order('start_date', { ascending: false });

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: exceptions || [],
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error fetching therapist exceptions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch exceptions' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/admin/therapists/[id]/exceptions
 * Create a new exception (vacation or day off)
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.statusCode }
    );
  }

  try {
    const therapistId = params.id;
    const body = await request.json();
    const { clinic_id, exception_type, start_date, end_date, notes } = body;

    // Validate required fields
    if (!clinic_id || !exception_type || !start_date) {
      return NextResponse.json(
        { error: 'clinic_id, exception_type, and start_date are required' },
        { status: 400 }
      );
    }

    // Validate exception_type
    if (!['vacation', 'day_off'].includes(exception_type)) {
      return NextResponse.json(
        { error: 'exception_type must be "vacation" or "day_off"' },
        { status: 400 }
      );
    }

    // For vacation, end_date is required; for day_off, it's optional (defaults to start_date)
    const finalEndDate = end_date || (exception_type === 'day_off' ? start_date : null);

    if (exception_type === 'vacation' && !finalEndDate) {
      return NextResponse.json(
        { error: 'end_date is required for vacation exceptions' },
        { status: 400 }
      );
    }

    // Validate date order
    if (finalEndDate && start_date > finalEndDate) {
      return NextResponse.json(
        { error: 'start_date must be before or equal to end_date' },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from('therapist_exceptions')
      .insert([
        {
          therapist_id: therapistId,
          clinic_id,
          exception_type,
          start_date,
          end_date: finalEndDate,
          notes: notes || null,
        },
      ])
      .select();

    if (error) throw error;

    return NextResponse.json(
      {
        success: true,
        data: data[0],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error creating exception:', error);
    return NextResponse.json(
      { error: 'Failed to create exception' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/therapists/[id]/exceptions/[exceptionId]
 * Delete an exception
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const auth = await checkAdminPermission(request);
  if (!auth.authorized) {
    return NextResponse.json(
      { error: auth.error },
      { status: auth.statusCode }
    );
  }

  try {
    const therapistId = params.id;
    const { searchParams } = new URL(request.url);
    const exceptionId = searchParams.get('exception_id');

    if (!exceptionId) {
      return NextResponse.json(
        { error: 'exception_id query parameter is required' },
        { status: 400 }
      );
    }

    // Verify the exception belongs to this therapist
    const { data: exception, error: fetchError } = await supabase
      .from('therapist_exceptions')
      .select('id')
      .eq('id', exceptionId)
      .eq('therapist_id', therapistId)
      .single();

    if (fetchError || !exception) {
      return NextResponse.json(
        { error: 'Exception not found' },
        { status: 404 }
      );
    }

    const { error: deleteError } = await supabase
      .from('therapist_exceptions')
      .delete()
      .eq('id', exceptionId);

    if (deleteError) throw deleteError;

    return NextResponse.json(
      {
        success: true,
        message: 'Exception deleted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting exception:', error);
    return NextResponse.json(
      { error: 'Failed to delete exception' },
      { status: 500 }
    );
  }
}
```

- [ ] **Step 2: Test the exceptions endpoints**

Test GET:
```bash
curl "http://localhost:3000/api/admin/therapists/{therapist_id}/exceptions?clinic_id={clinic_id}" \
  -H "Cookie: auth_token={valid_jwt}"
```

Test POST:
```bash
curl -X POST "http://localhost:3000/api/admin/therapists/{therapist_id}/exceptions" \
  -H "Content-Type: application/json" \
  -H "Cookie: auth_token={valid_jwt}" \
  -d '{
    "clinic_id": "clinic-123",
    "exception_type": "vacation",
    "start_date": "2026-06-15",
    "end_date": "2026-06-25",
    "notes": "Summer vacation"
  }'
```

Expected: POST returns created exception with id. GET returns list of exceptions.

- [ ] **Step 3: Commit**

```bash
git add app/api/admin/therapists/[id]/exceptions/route.ts
git commit -m "feat: add therapist exceptions API endpoints"
```

---

## Task 4: Create ClinicRoomsTab Component

### Files
- Create: `app/dashboard/admin/clinics/ClinicRoomsTab.tsx`

- [ ] **Step 1: Create the component**

Create `app/dashboard/admin/clinics/ClinicRoomsTab.tsx`:

```typescript
'use client';

interface ClinicRoomsTabProps {
  numberOfRooms: number | null | undefined;
  onChange: (value: number | null) => void;
}

export default function ClinicRoomsTab({ numberOfRooms, onChange }: ClinicRoomsTabProps) {
  return (
    <div className="clinics-form-group">
      <label>Total Number of Rooms</label>
      <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '0.75rem' }}>
        How many therapy rooms does this clinic have?
      </p>
      <input
        type="number"
        min="1"
        value={numberOfRooms || ''}
        onChange={(e) => {
          const value = e.target.value ? parseInt(e.target.value, 10) : null;
          onChange(value);
        }}
        placeholder="e.g., 5"
        style={{ width: '120px' }}
      />
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/admin/clinics/ClinicRoomsTab.tsx
git commit -m "feat: create ClinicRoomsTab component"
```

---

## Task 5: Modify ClinicsList to Add Rooms Tab

### Files
- Modify: `app/dashboard/admin/clinics/ClinicsList.tsx`

- [ ] **Step 1: Read the current ClinicsList component**

Read `app/dashboard/admin/clinics/ClinicsList.tsx` to understand the structure and form handling.

- [ ] **Step 2: Add state for tabs**

In the component's state, add:

```typescript
const [activeTab, setActiveTab] = useState<'basic' | 'rooms'>('basic');
```

- [ ] **Step 3: Update formData state**

Update the formData state to include `number_of_rooms`:

```typescript
const [formData, setFormData] = useState({
  name: '',
  location: '',
  phone: '',
  email: '',
  number_of_rooms: null as number | null,
});
```

- [ ] **Step 4: Update handleEdit function**

When editing, populate the `number_of_rooms`:

```typescript
function handleEdit(clinic: Clinic) {
  setEditingClinic(clinic);
  setFormData({
    name: clinic.name,
    location: clinic.location || '',
    phone: clinic.phone || '',
    email: clinic.email || '',
    number_of_rooms: (clinic as any).number_of_rooms || null,
  });
  setShowForm(true);
  setActiveTab('basic'); // Start with basic tab
}
```

- [ ] **Step 5: Update handleSubmit**

Include `number_of_rooms` in the request body:

```typescript
const clinicData = {
  name: formData.name,
  location: formData.location,
  phone: formData.phone,
  email: formData.email,
  number_of_rooms: formData.number_of_rooms,
};
```

- [ ] **Step 6: Update handleCancel**

Reset the tab to 'basic':

```typescript
function handleCancel() {
  setShowForm(false);
  setEditingClinic(null);
  setFormData({ name: '', location: '', phone: '', email: '', number_of_rooms: null });
  setActiveTab('basic');
}
```

- [ ] **Step 7: Replace the form JSX with tabs**

In the form section (inside the `{showForm && ...}` block), replace the fields with tab UI:

```typescript
{showForm && (
  <div className="clinics-form-container">
    <div className="clinics-form">
      <div className="clinics-form-header">
        <h2>{editingClinic ? 'Edit Clinic' : 'Add New Clinic'}</h2>
        <button
          className="clinics-btn clinics-btn--close"
          onClick={handleCancel}
          type="button"
        >
          <X size={20} />
        </button>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #eee', paddingBottom: '0.75rem' }}>
        <button
          type="button"
          onClick={() => setActiveTab('basic')}
          style={{
            padding: '0.5rem 1rem',
            borderBottom: activeTab === 'basic' ? '3px solid #007bff' : 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'basic' ? 'bold' : 'normal',
          }}
        >
          Basic Info
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('rooms')}
          style={{
            padding: '0.5rem 1rem',
            borderBottom: activeTab === 'rooms' ? '3px solid #007bff' : 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontWeight: activeTab === 'rooms' ? 'bold' : 'normal',
          }}
        >
          Rooms
        </button>
      </div>

      <form onSubmit={handleSubmit}>
        {activeTab === 'basic' && (
          <>
            <div className="clinics-form-group">
              <label>Clinic Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                placeholder="e.g., Main Clinic, Branch Clinic"
              />
            </div>

            <div className="clinics-form-group">
              <label>Location</label>
              <input
                type="text"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                placeholder="Cairo, Alexandria, etc."
              />
            </div>

            <div className="clinics-form-group">
              <label>Phone</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+20 XXX XXXX XXXX"
              />
            </div>

            <div className="clinics-form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="clinic@example.com"
              />
            </div>
          </>
        )}

        {activeTab === 'rooms' && (
          <ClinicRoomsTab
            numberOfRooms={formData.number_of_rooms}
            onChange={(value) => setFormData({ ...formData, number_of_rooms: value })}
          />
        )}

        <div className="clinics-form-actions">
          <button
            type="submit"
            className="clinics-btn clinics-btn--primary"
            disabled={loadingCreate || loadingEdit}
          >
            {loadingCreate || loadingEdit ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            className="clinics-btn clinics-btn--secondary"
            onClick={handleCancel}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  </div>
)}
```

- [ ] **Step 8: Import the ClinicRoomsTab component**

Add at the top of the file:

```typescript
import ClinicRoomsTab from './ClinicRoomsTab';
```

- [ ] **Step 9: Update the Clinic type interface**

Extend the `Clinic` interface to include `number_of_rooms`:

```typescript
interface Clinic {
  id: string;
  name: string;
  location: string;
  phone: string;
  email: string;
  number_of_rooms?: number | null;
  created_at: string;
}
```

- [ ] **Step 10: Test in browser**

1. Go to `/dashboard/admin/clinics`
2. Click "Edit" on a clinic
3. Verify two tabs appear: "Basic Info" and "Rooms"
4. Click "Rooms" tab
5. Enter a number and click "Save"
6. Edit again and verify the number is persisted

Expected: Tabs switch, rooms value persists after save.

- [ ] **Step 11: Commit**

```bash
git add app/dashboard/admin/clinics/ClinicsList.tsx app/dashboard/admin/clinics/ClinicRoomsTab.tsx
git commit -m "feat: add rooms tab to clinic edit modal"
```

---

## Task 6: Create TherapistAvailabilityCalendar Component

### Files
- Create: `app/dashboard/clinical/therapists/TherapistAvailabilityCalendar.tsx`

- [ ] **Step 1: Create the calendar component**

Create `app/dashboard/clinical/therapists/TherapistAvailabilityCalendar.tsx`:

```typescript
'use client';

interface AvailabilityDay {
  day: string; // Mon, Tue, etc.
  status: 'working' | 'off' | 'vacation';
}

interface TherapistAvailabilityCalendarProps {
  days: AvailabilityDay[];
  clinicName?: string;
}

const DAY_ABBREVIATIONS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

export default function TherapistAvailabilityCalendar({ days, clinicName }: TherapistAvailabilityCalendarProps) {
  const dayOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  
  // Create a map of day -> status
  const statusMap = new Map(days.map(d => [d.day, d.status]));
  
  // Get status for each day of week
  const statuses = dayOfWeek.map(day => statusMap.get(day) || 'off');

  return (
    <div style={{ marginTop: '0.75rem' }}>
      {clinicName && (
        <p style={{ fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.5rem' }}>
          Availability at {clinicName}:
        </p>
      )}
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {DAY_ABBREVIATIONS.map((abbr, idx) => {
          const status = statuses[idx];
          const isWorking = status === 'working';
          const bgColor = isWorking ? '#4CAF50' : '#f0f0f0';
          const textColor = isWorking ? 'white' : '#999';
          const borderStyle = isWorking ? 'none' : '1px solid #ddd';

          return (
            <div
              key={abbr}
              style={{
                display: 'inline-block',
                width: '2rem',
                height: '2rem',
                backgroundColor: bgColor,
                borderRadius: '4px',
                textAlign: 'center',
                lineHeight: '2rem',
                fontSize: '0.7rem',
                color: textColor,
                fontWeight: 'bold',
                border: borderStyle,
              }}
              title={`${['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][idx]}: ${status}`}
            >
              {abbr}
            </div>
          );
        })}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/clinical/therapists/TherapistAvailabilityCalendar.tsx
git commit -m "feat: create TherapistAvailabilityCalendar component"
```

---

## Task 7: Create AddExceptionForm Component

### Files
- Create: `app/dashboard/clinical/therapists/AddExceptionForm.tsx`

- [ ] **Step 1: Create the form component**

Create `app/dashboard/clinical/therapists/AddExceptionForm.tsx`:

```typescript
'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

interface AddExceptionFormProps {
  onSubmit: (exception: { exception_type: string; start_date: string; end_date?: string }) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AddExceptionForm({ onSubmit, onCancel, isLoading }: AddExceptionFormProps) {
  const [exceptionType, setExceptionType] = useState<'vacation' | 'day_off'>('vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!startDate) {
      setError('Start date is required');
      return;
    }

    if (exceptionType === 'vacation' && !endDate) {
      setError('End date is required for vacation');
      return;
    }

    if (endDate && startDate > endDate) {
      setError('Start date must be before end date');
      return;
    }

    onSubmit({
      exception_type: exceptionType,
      start_date: startDate,
      end_date: endDate || undefined,
    });
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000,
    }}>
      <div style={{
        backgroundColor: 'white',
        padding: '1.5rem',
        borderRadius: '8px',
        maxWidth: '500px',
        width: '90%',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ margin: 0 }}>Add Exception</h3>
          <button
            type="button"
            onClick={onCancel}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <X size={20} />
          </button>
        </div>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            color: '#c00',
            padding: '0.75rem',
            borderRadius: '4px',
            marginBottom: '1rem',
            fontSize: '0.9rem',
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Exception Type *
            </label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="radio"
                  value="vacation"
                  checked={exceptionType === 'vacation'}
                  onChange={(e) => setExceptionType(e.target.value as 'vacation' | 'day_off')}
                />
                Vacation
              </label>
              <label style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                <input
                  type="radio"
                  value="day_off"
                  checked={exceptionType === 'day_off'}
                  onChange={(e) => setExceptionType(e.target.value as 'vacation' | 'day_off')}
                />
                Day Off
              </label>
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
              Start Date *
            </label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
              required
            />
          </div>

          {exceptionType === 'vacation' && (
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '600' }}>
                End Date *
              </label>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '4px', border: '1px solid #ddd', boxSizing: 'border-box' }}
                required
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.5rem' }}>
            <button
              type="submit"
              disabled={isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              {isLoading ? 'Adding...' : 'Add'}
            </button>
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/clinical/therapists/AddExceptionForm.tsx
git commit -m "feat: create AddExceptionForm component"
```

---

## Task 8: Create ScheduleAvailabilityModal Component

### Files
- Create: `app/dashboard/clinical/therapists/ScheduleAvailabilityModal.tsx`

- [ ] **Step 1: Create the modal component**

Create `app/dashboard/clinical/therapists/ScheduleAvailabilityModal.tsx`:

```typescript
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import AddExceptionForm from './AddExceptionForm';

interface AvailabilityData {
  [day: string]: boolean; // true = working, false = off
}

interface ExceptionData {
  id: string;
  exception_type: 'vacation' | 'day_off';
  start_date: string;
  end_date: string | null;
}

interface ScheduleAvailabilityModalProps {
  therapistId: string;
  therapistName: string;
  clinicId: string;
  clinicName: string;
  onClose: () => void;
  onSave: () => void;
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function ScheduleAvailabilityModal({
  therapistId,
  therapistName,
  clinicId,
  clinicName,
  onClose,
  onSave,
}: ScheduleAvailabilityModalProps) {
  const [availability, setAvailability] = useState<AvailabilityData>({});
  const [exceptions, setExceptions] = useState<ExceptionData[]>([]);
  const [showExceptionForm, setShowExceptionForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Fetch current availability and exceptions
  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch availability
        const availRes = await fetch(
          `/api/admin/therapists/${therapistId}/availability?clinic_id=${clinicId}`
        );
        if (!availRes.ok) throw new Error('Failed to fetch availability');
        const availData = await availRes.json();

        // Initialize availability object
        const availMap: AvailabilityData = {};
        DAYS.forEach(day => {
          availMap[day] = false;
        });

        // Set working days
        if (availData.data) {
          availData.data.forEach((record: any) => {
            if (record.status === 'working') {
              availMap[record.day_of_week] = true;
            }
          });
        }
        setAvailability(availMap);

        // Fetch exceptions
        const excRes = await fetch(
          `/api/admin/therapists/${therapistId}/exceptions?clinic_id=${clinicId}`
        );
        if (!excRes.ok) throw new Error('Failed to fetch exceptions');
        const excData = await excRes.json();
        setExceptions(excData.data || []);

        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load availability');
        setLoading(false);
      }
    };

    fetchData();
  }, [therapistId, clinicId]);

  const handleToggleDay = (day: string) => {
    setAvailability(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const handleAddException = async (exception: any) => {
    try {
      const res = await fetch(`/api/admin/therapists/${therapistId}/exceptions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clinic_id: clinicId,
          ...exception,
        }),
      });

      if (!res.ok) throw new Error('Failed to add exception');
      const data = await res.json();
      setExceptions([...exceptions, data.data]);
      setShowExceptionForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add exception');
    }
  };

  const handleDeleteException = async (exceptionId: string) => {
    try {
      const res = await fetch(
        `/api/admin/therapists/${therapistId}/exceptions?exception_id=${exceptionId}`,
        { method: 'DELETE' }
      );

      if (!res.ok) throw new Error('Failed to delete exception');
      setExceptions(exceptions.filter(e => e.id !== exceptionId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete exception');
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');

    try {
      // Build availability array
      const availArray = DAYS.map(day => ({
        day_of_week: day,
        clinic_id: clinicId,
        status: availability[day] ? 'working' : 'off',
      }));

      const res = await fetch(`/api/admin/therapists/${therapistId}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availArray),
      });

      if (!res.ok) throw new Error('Failed to save availability');

      setSaving(false);
      onSave();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save availability');
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{ backgroundColor: 'white', padding: '2rem', borderRadius: '8px' }}>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <>
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999,
      }}>
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          maxWidth: '500px',
          width: '90%',
          maxHeight: '80vh',
          overflowY: 'auto',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ margin: 0 }}>
              Set Availability for {therapistName} at {clinicName}
            </h3>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: 0,
              }}
            >
              <X size={20} />
            </button>
          </div>

          {error && (
            <div style={{
              backgroundColor: '#fee',
              color: '#c00',
              padding: '0.75rem',
              borderRadius: '4px',
              marginBottom: '1rem',
            }}>
              {error}
            </div>
          )}

          {/* Working Days */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginTop: 0 }}>Select Working Days:</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {DAYS.map(day => (
                <label key={day} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <input
                    type="checkbox"
                    checked={availability[day] || false}
                    onChange={() => handleToggleDay(day)}
                  />
                  {day}
                </label>
              ))}
            </div>
          </div>

          <hr style={{ margin: '2rem 0' }} />

          {/* Exceptions */}
          <div style={{ marginBottom: '2rem' }}>
            <h4 style={{ marginTop: 0 }}>Exceptions (Vacation, Days Off):</h4>

            {exceptions.length > 0 ? (
              <div style={{ marginBottom: '1rem' }}>
                {exceptions.map(exc => (
                  <div
                    key={exc.id}
                    style={{
                      backgroundColor: '#f9f9f9',
                      padding: '0.75rem',
                      borderRadius: '4px',
                      marginBottom: '0.75rem',
                      fontSize: '0.9rem',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <span>
                      {exc.exception_type === 'vacation' ? 'Vacation' : 'Day Off'}: {exc.start_date}
                      {exc.end_date && exc.end_date !== exc.start_date ? ` - ${exc.end_date}` : ''}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteException(exc.id)}
                      style={{
                        fontSize: '0.8rem',
                        padding: '0.25rem 0.75rem',
                        backgroundColor: '#f0f0f0',
                        border: '1px solid #ddd',
                        borderRadius: '4px',
                        cursor: 'pointer',
                      }}
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p style={{ fontSize: '0.9rem', color: '#666' }}>No exceptions yet</p>
            )}

            <button
              type="button"
              onClick={() => setShowExceptionForm(true)}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              + Add Exception
            </button>
          </div>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '2rem', paddingTop: '1rem', borderTop: '1px solid #eee' }}>
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                fontWeight: '600',
              }}
            >
              {saving ? 'Saving...' : 'Save'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '0.75rem 1.5rem',
                backgroundColor: '#f0f0f0',
                border: '1px solid #ddd',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {showExceptionForm && (
        <AddExceptionForm
          onSubmit={handleAddException}
          onCancel={() => setShowExceptionForm(false)}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/dashboard/clinical/therapists/ScheduleAvailabilityModal.tsx
git commit -m "feat: create ScheduleAvailabilityModal component"
```

---

## Task 9: Modify TherapistsList to Add Calendar and Schedule Button

### Files
- Modify: `app/dashboard/clinical/therapists/TherapistsList.tsx`

- [ ] **Step 1: Read the current TherapistsList component**

Read the file to understand its structure.

- [ ] **Step 2: Add state for modal and clinic selection**

Add to the component state:

```typescript
const [selectedTherapistForAvailability, setSelectedTherapistForAvailability] = useState<Therapist | null>(null);
const [selectedClinicId, setSelectedClinicId] = useState<string | null>(null);
const [clinics, setClinics] = useState<any[]>([]);
const [therapistAvailability, setTherapistAvailability] = useState<Map<string, any>>(new Map());
```

- [ ] **Step 3: Fetch clinics on mount**

Add useEffect to fetch clinics:

```typescript
useEffect(() => {
  fetchClinics();
}, []);

async function fetchClinics() {
  try {
    const res = await fetch('/api/admin/clinics');
    if (!res.ok) throw new Error('Failed to fetch clinics');
    const data = await res.json();
    setClinics(data.clinics || []);
  } catch (error) {
    console.error('Error fetching clinics:', error);
  }
}
```

- [ ] **Step 4: Fetch availability for each therapist**

Add useEffect to fetch availability:

```typescript
useEffect(() => {
  therapists.forEach(therapist => {
    if (clinics.length > 0) {
      const primaryClinic = clinics[0];
      fetch(`/api/admin/therapists/${therapist.id}/availability?clinic_id=${primaryClinic.id}`)
        .then(res => res.json())
        .then(data => {
          setTherapistAvailability(prev => new Map(prev).set(therapist.id, data.data || []));
        })
        .catch(err => console.error('Error fetching availability:', err));
    }
  });
}, [therapists, clinics]);
```

- [ ] **Step 5: Add function to open schedule modal**

```typescript
function handleScheduleClick(therapist: Therapist) {
  if (clinics.length > 0) {
    setSelectedTherapistForAvailability(therapist);
    setSelectedClinicId(clinics[0].id);
  }
}
```

- [ ] **Step 6: Add function to handle save**

```typescript
function handleAvailabilitySaved() {
  // Refresh availability for all therapists
  if (selectedTherapistForAvailability && selectedClinicId) {
    fetch(`/api/admin/therapists/${selectedTherapistForAvailability.id}/availability?clinic_id=${selectedClinicId}`)
      .then(res => res.json())
      .then(data => {
        setTherapistAvailability(prev => new Map(prev).set(selectedTherapistForAvailability.id, data.data || []));
      });
  }
}
```

- [ ] **Step 7: Update therapist row in table to show calendar**

In the table body, find where therapist rows are rendered and update to include calendar:

```typescript
{paginatedTherapists.map((therapist) => {
  const availability = therapistAvailability.get(therapist.id) || [];
  const clinicName = clinics.length > 0 ? clinics[0].name : 'Main Clinic';
  
  return (
    <tr key={therapist.id}>
      <td>
        <div>
          <strong>{therapist.name}</strong>
          <div style={{ fontSize: '0.85rem', color: '#666' }}>
            {therapist.email}
            {therapist.hourly_rate && ` • ${therapist.hourly_rate} EGP/hr`}
          </div>
          
          {/* Add Calendar Here */}
          <div style={{ marginTop: '0.75rem' }}>
            <TherapistAvailabilityCalendar
              days={availability.map((av: any) => ({
                day: av.day_of_week,
                status: av.status,
              }))}
              clinicName={clinicName}
            />
          </div>
        </div>
      </td>
      <td className="therapists-actions">
        <button
          className="therapists-btn therapists-btn--icon"
          onClick={() => handleEdit(therapist)}
          title="Edit"
        >
          <Edit2 size={18} />
        </button>
        <button
          className="therapists-btn therapists-btn--icon"
          onClick={() => handleScheduleClick(therapist)}
          title="Schedule Availability"
          style={{ backgroundColor: '#17a2b8', color: 'white' }}
        >
          📅
        </button>
        <button
          className="therapists-btn therapists-btn--icon therapists-btn--danger"
          onClick={() => handleDelete(therapist)}
          disabled={loadingDelete}
          title="Delete"
        >
          <Trash2 size={18} />
        </button>
      </td>
    </tr>
  );
})}
```

- [ ] **Step 8: Add Schedule Modal rendering**

Before the closing div of the component, add:

```typescript
{selectedTherapistForAvailability && selectedClinicId && (
  <ScheduleAvailabilityModal
    therapistId={selectedTherapistForAvailability.id}
    therapistName={selectedTherapistForAvailability.name}
    clinicId={selectedClinicId}
    clinicName={clinics.find(c => c.id === selectedClinicId)?.name || 'Clinic'}
    onClose={() => setSelectedTherapistForAvailability(null)}
    onSave={handleAvailabilitySaved}
  />
)}
```

- [ ] **Step 9: Import the new components**

Add at the top:

```typescript
import TherapistAvailabilityCalendar from './TherapistAvailabilityCalendar';
import ScheduleAvailabilityModal from './ScheduleAvailabilityModal';
```

- [ ] **Step 10: Simplify table structure if needed**

Update the table header to accommodate the calendar display:

```typescript
<tr>
  <th>Therapist & Availability</th>
  <th>Actions</th>
</tr>
```

And adjust the colspan in the empty state if needed.

- [ ] **Step 11: Test in browser**

1. Go to `/dashboard/clinical/therapists`
2. Each therapist should show a 7-day calendar below their name
3. Click the "📅" button next to a therapist
4. Modal should open with working day checkboxes
5. Change days and click "Save"
6. Calendar grid should update

Expected: Calendar displays, modal opens/closes, changes persist.

- [ ] **Step 12: Commit**

```bash
git add app/dashboard/clinical/therapists/TherapistsList.tsx
git commit -m "feat: integrate therapist availability calendar and modal into therapist list"
```

---

## Task 10: Test Full Flow

- [ ] **Step 1: Test clinic rooms feature**

1. Navigate to `/dashboard/admin/clinics`
2. Click "Edit" on a clinic
3. Click "Rooms" tab
4. Enter a number (e.g., 5) and click "Save"
5. Edit again and verify number persists

Expected: Rooms tab works, value persists.

- [ ] **Step 2: Test therapist availability feature**

1. Navigate to `/dashboard/clinical/therapists`
2. Verify each therapist shows a 7-day calendar
3. Click "📅" button next to a therapist
4. Modal opens with working day checkboxes
5. Select working days (e.g., Mon-Fri)
6. Click "+ Add Exception"
7. Add a vacation (2026-06-15 to 2026-06-25)
8. Click "Save"
9. Modal closes, list refreshes
10. Calendar should show green for Mon-Fri, gray for Sat-Sun

Expected: All interactions work smoothly.

- [ ] **Step 3: Verify database entries**

In Supabase, check:
- `clinics` table: `number_of_rooms` column populated
- `therapist_availability` table: records with correct `day_of_week` and `status`
- `therapist_exceptions` table: vacation and day off records

Expected: Data correctly persisted.

- [ ] **Step 4: Test error cases**

1. Try setting no working days → should show error "at least one working day required"
2. Try vacation with invalid date range → should show error
3. Close browser dev tools and refresh page → data should persist

Expected: Errors handled gracefully.

- [ ] **Step 5: Final commit**

```bash
git status
git log --oneline | head -20
```

Verify all commits are present. No uncommitted changes.

---

## Summary

**Features Implemented:**
- ✅ Clinic room capacity tracking (UI + API + DB)
- ✅ Therapist availability scheduling with 7-day calendar (UI + API + DB)
- ✅ Exception management (vacation, day off)
- ✅ Error handling and validation
- ✅ Data persistence

**Files Created:** 8  
**Files Modified:** 3  
**Migrations:** 2  
**Total Commits:** ~12

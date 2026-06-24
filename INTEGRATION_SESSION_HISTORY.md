# Integration Guide: Session History Modal

This guide shows how to integrate the SessionHistory component into the existing client management UI.

## Quick Integration

### 1. Update ClientActionButton.tsx

Import the SessionHistory component at the top:

```typescript
import SessionHistory from './SessionHistory';
```

Add state to track the modal:

```typescript
const [activeModal, setActiveModal] = useState<string | null>(null);
// Add this alongside other state variables:
const [showSessionHistory, setShowSessionHistory] = useState(false);
```

Add a button to open session history (in the return JSX, after the existing modals):

```typescript
{/* View Session History Button */}
<button
  className="modal-btn modal-btn--secondary"
  onClick={() => setShowSessionHistory(true)}
  style={{ marginTop: '0.5rem' }}
>
  📋 View Session History
</button>
```

Add the modal component (after other modals in the return):

```typescript
{/* Session History Modal */}
{showSessionHistory && (
  <SessionHistory
    clientId={clientId}
    clientName={clientName}
    therapistName={therapistName || undefined}
    onClose={() => setShowSessionHistory(false)}
  />
)}
```

### 2. Complete Example

Here's the minimal change to `ClientActionButton.tsx`:

```typescript
'use client';

import React, { useState } from 'react';
import AssessmentEntryModal from './AssessmentEntryModal';
import PaymentVerificationModal from './PaymentVerificationModal';
import TherapistSelectionModal from './TherapistSelectionModal';
import BookingCalendarModal from './BookingCalendarModal';
import SessionHistory from './SessionHistory'; // ← ADD THIS

// ... rest of component code ...

export default function ClientActionButton({
  // ... props ...
}: ClientActionButtonProps) {
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [showSessionHistory, setShowSessionHistory] = useState(false); // ← ADD THIS

  // ... rest of component ...

  return (
    <>
      <button
        className={`client-next-action-btn ${!isDisabled ? 'active' : 'disabled'}`}
        onClick={handleActionClick}
        title={`Next action: ${nextAction.label}`}
        disabled={isDisabled}
      >
        {nextAction.label}
      </button>

      {/* ADD THIS BUTTON */}
      <button
        className="modal-btn modal-btn--secondary"
        onClick={() => setShowSessionHistory(true)}
        style={{ marginTop: '0.5rem', marginLeft: '0.5rem' }}
      >
        📋 View History
      </button>

      {/* ... existing modals ... */}

      {/* ADD THIS MODAL */}
      {showSessionHistory && (
        <SessionHistory
          clientId={clientId}
          clientName={clientName}
          therapistName={therapistName || undefined}
          onClose={() => setShowSessionHistory(false)}
        />
      )}
    </>
  );
}
```

### 3. Styling (Optional)

Add this to `modal.css` for better button styling:

```css
.session-history-btn {
  padding: 0.5rem 1rem;
  background-color: #f0f0f0;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.875rem;
  transition: all 0.2s ease;
}

.session-history-btn:hover {
  background-color: #e0e0e0;
  border-color: #999;
}

.session-history-btn:active {
  background-color: #d0d0d0;
}
```

## Alternative: Add to Client Row

If you want to show session history directly in the clients table, add a "History" action button:

```typescript
// In the clients list page, in the action column:
<button
  onClick={() => {
    setSelectedClientForHistory(client.id);
    setShowHistoryModal(true);
  }}
  className="action-btn"
>
  📋 History
</button>

{/* Then render the modal: */}
{showHistoryModal && selectedClientForHistory && (
  <SessionHistory
    clientId={selectedClientForHistory}
    clientName={/* client name */}
    onClose={() => setShowHistoryModal(false)}
  />
)}
```

## Data Flow

```
Client Page
    ↓
ClientActionButton
    ↓
[View History Button Click]
    ↓
SessionHistory Component
    ↓
[useEffect - Fetch Data]
    ↓
/api/admin/clients/[id]/sessions (past sessions)
/api/admin/clients/[id]/bookings?status=scheduled (future sessions)
    ↓
Display in UI
```

## Testing the Integration

1. **Generate test data:**
   ```bash
   npx tsx lib/test-data-generator.ts
   ```

2. **Find test client** in the clients list

3. **Click "View History"** button

4. **Verify you see:**
   - Past completed sessions with notes
   - Future scheduled sessions
   - Progress scores as stars
   - Session outcomes
   - Therapist notes

## Features Available

✅ View completed sessions with notes
✅ View future scheduled sessions  
✅ See progress scores (1-5 stars)
✅ View session outcomes (positive/neutral/negative)
✅ Filter by completed vs. scheduled
✅ Pagination support
✅ Responsive design

## Next Features to Add

- [ ] Mark sessions as completed directly from history view
- [ ] Add/edit session notes from history view
- [ ] Export session history as PDF
- [ ] Session progress charts
- [ ] Therapist notes comments/replies
- [ ] Session attendance tracking
- [ ] Client feedback/ratings

## Troubleshooting

### Modal doesn't appear
- Check browser console for errors
- Verify component is imported correctly
- Check that clientId and clientName are passed

### No sessions show
- Run test data generator: `npx tsx lib/test-data-generator.ts`
- Check API responses in Network tab
- Verify client has sessions in Supabase

### Styling looks off
- Import modal.css in the component
- Check CSS specificity conflicts
- Use browser dev tools to inspect elements

## Files Referenced

- `app/dashboard/clinical/clients/SessionHistory.tsx` - The modal component
- `app/dashboard/clinical/clients/ClientActionButton.tsx` - Where to integrate
- `app/api/admin/clients/[id]/sessions/route.ts` - Completed sessions API
- `app/api/admin/clients/[id]/bookings/route.ts` - Future bookings API

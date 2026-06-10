# Payment Modal Integration Guide

## Overview

The `clinic-payment-modal.js` file provides a complete payment verification modal system for your clinic app. It handles:

- Detecting bookings awaiting payment/cancellation confirmation
- Showing a modal when a hold expires
- Processing receptionist confirmation (payment confirmed or cancel)
- Displaying alert banner on dashboard

---

## Installation

### Step 1: Include the Script

Add this line to your `clinic.html` file, in the `<head>` or before closing `</body>`:

```html
<!-- Payment Modal System -->
<script src="/clinic-payment-modal.js"></script>
```

### Step 2: Initialize on Page Load

After your clinic app initializes, call the payment modal setup:

```html
<script>
  // After your clinic app initializes...
  
  // Initialize payment modal system
  PaymentModal.initialize();
  
  // Optional: Set receptionist name (from logged-in user)
  PaymentModal.setReceptionist('Fatima');
  
  // Check for pending expiries
  PaymentModal.checkForPendingExpiries();
</script>
```

### Step 3: Check Periodically

For the best UX, check for pending expiries periodically (every 30 seconds) or when the user returns to the dashboard:

```javascript
// Check every 30 seconds
setInterval(() => {
  PaymentModal.checkForPendingExpiries();
}, 30000);

// Or check when page becomes visible
document.addEventListener('visibilitychange', () => {
  if (!document.hidden) {
    PaymentModal.checkForPendingExpiries();
  }
});
```

---

## Full Integration Example

Here's how to integrate into your existing `clinic.html`:

```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>SWT Psychology - Clinic Management</title>
  
  <!-- Your existing styles -->
  <style>
    /* ... your styles ... */
  </style>
</head>
<body>
  <!-- Your clinic app HTML -->
  <div id="clinicApp">
    <!-- Your navigation -->
    <nav id="navbar">
      <!-- ... -->
    </nav>
    
    <!-- Your main content -->
    <main id="mainContent">
      <!-- Dashboard content goes here -->
    </main>
  </div>

  <!-- Your existing scripts -->
  <script>
    // Your clinic app initialization code
    // ...
  </script>

  <!-- Payment Modal System -->
  <script src="/clinic-payment-modal.js"></script>
  
  <script>
    // Initialize payment modal after clinic app is ready
    document.addEventListener('DOMContentLoaded', () => {
      // Wait for clinic app to initialize
      setTimeout(() => {
        PaymentModal.initialize();
        PaymentModal.setReceptionist('Fatima'); // Set logged-in receptionist name
        PaymentModal.checkForPendingExpiries();
        
        // Check every 30 seconds for new pending expiries
        setInterval(() => {
          PaymentModal.checkForPendingExpiries();
        }, 30000);
        
        // Check when page becomes visible (user returns from another tab)
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) {
            PaymentModal.checkForPendingExpiries();
          }
        });
      }, 1000);
    });
  </script>
</body>
</html>
```

---

## API

### `PaymentModal.initialize()`

Sets up the modal system:
- Extracts JWT token from cookies
- Creates modal HTML and injects into page
- Sets up event listeners

**Usage:**
```javascript
PaymentModal.initialize();
```

---

### `PaymentModal.checkForPendingExpiries()`

Checks for bookings awaiting confirmation:
- Calls `GET /api/clinic/bookings/check-expiry`
- Shows alert banner if any pending
- Shows modal if any urgent (past 24h)

**Usage:**
```javascript
await PaymentModal.checkForPendingExpiries();
```

---

### `PaymentModal.setReceptionist(name)`

Sets the receptionist name for audit trail.

**Usage:**
```javascript
PaymentModal.setReceptionist('Fatima'); // Gets sent to API on confirmation
```

**Best Practice:** Set this from your auth system:
```javascript
const currentUser = getLoggedInUser();
PaymentModal.setReceptionist(currentUser.name);
```

---

### `PaymentModal.showModal(booking)`

Manually show the modal for a specific booking.

**Usage:**
```javascript
PaymentModal.showModal({
  booking_id: 'uuid',
  client_name: 'Amira Hassan',
  therapist_name: 'Sama Eissa',
  session_date: '2026-06-20T15:00:00',
  hold_created_at: '2026-06-10T14:30:00',
  hours_held: 23.5,
  time_until_expiry_hours: 0.5,
  needs_confirmation: true,
  status: 'H'
});
```

---

### `PaymentModal.hideModal()`

Manually hide the modal.

**Usage:**
```javascript
PaymentModal.hideModal();
```

---

## Visual Appearance

### Modal Dialog

When a booking needs confirmation, this modal appears:

```
┌─────────────────────────────────────────┐
│ ⚠️ CONFIRM BOOKING HOLD                 │
│ Payment verification required           │
├─────────────────────────────────────────┤
│                                         │
│ Client: Amira Hassan                    │
│ Therapist: Sama Eissa                   │
│ Date & Time: Thu 20 Jun 2026, 15:00     │
│ Status: HOLD                            │
│ Held Since: 10 Jun 2026, 14:30          │
│ Time Until Expiry: ⚠️ EXPIRED           │
│                                         │
├─────────────────────────────────────────┤
│                                         │
│ [💳 PAYMENT CONFIRMED] [✗ CONFIRM CANCEL]│
│                                         │
└─────────────────────────────────────────┘
```

### Alert Banner

Alert appears on dashboard if any pending:

```
🔔 2 booking(s) awaiting payment confirmation [1 URGENT] [×]
```

---

## Event Handling

The modal emits custom events that you can listen to:

```javascript
// Listen for payment confirmation
window.addEventListener('paymentConfirmed', (event) => {
  console.log('Booking confirmed:', event.detail);
  // Refresh bookings, update UI, etc.
});

// Listen for booking cancellation
window.addEventListener('bookingCancelled', (event) => {
  console.log('Booking cancelled:', event.detail);
  // Refresh calendar, update UI, etc.
});
```

---

## Styling Customization

All modal styles are self-contained in the injected HTML. To customize colors or fonts:

### Edit Button Colors

In `clinic-payment-modal.js`, find the CSS for buttons:

```css
.btn-payment-confirmed {
  background: #27ae60;  /* Change this color */
  color: white;
}

.btn-confirm-cancel {
  background: #e74c3c;  /* Change this color */
  color: white;
}
```

### Edit Modal Width

Find this in the CSS:

```css
.payment-modal-content {
  max-width: 600px;  /* Change this for wider/narrower modal */
}
```

### Edit Alert Banner Style

Find this in the CSS:

```css
.payment-alert-banner {
  background: #fff3cd;  /* Change background color */
  border-left: 4px solid #ffc107;  /* Change border color */
}
```

---

## Troubleshooting

### Modal Doesn't Appear

**Check 1:** Verify modal HTML is injected
```javascript
console.log(document.getElementById('paymentExpiryModal'));
// Should show the modal element, not null
```

**Check 2:** Verify JWT token is present
```javascript
console.log(document.cookie);
// Should contain: auth_token=...
```

**Check 3:** Test the API endpoint manually
```bash
curl http://localhost:3000/api/clinic/bookings/check-expiry \
  -H "Cookie: auth_token=YOUR_TOKEN"
```

### Buttons Don't Work

**Check 1:** Verify auth token is extracted
```javascript
PaymentModal.initialize();
// Check browser console for any errors
```

**Check 2:** Verify API endpoint is accessible
```javascript
// Open browser DevTools → Network tab
// Click button and check the POST request
// Should show 200 response
```

**Check 3:** Check browser console for errors
```javascript
// Press F12, go to Console tab
// Look for any error messages
```

### Modal Overlaps with Content

If modal appears behind other elements:

```css
/* Increase z-index in clinic-payment-modal.js */
.payment-modal-overlay {
  z-index: 10000;  /* Increase this number */
}
```

---

## Testing Checklist

- [ ] Modal HTML injected into page on load
- [ ] `PaymentModal.initialize()` runs without errors
- [ ] Alert banner appears when there are pending expiries
- [ ] Modal appears when clicking alert or at 24h expiry
- [ ] "PAYMENT CONFIRMED" button sends POST to API
- [ ] "CONFIRM CANCELLATION" button shows confirmation and sends POST
- [ ] Booking status updates after confirmation
- [ ] Dashboard refreshes after action
- [ ] Multiple concurrent modals handled correctly
- [ ] Modal closes properly and restores scroll

---

## Integration Checklist

Before deploying to production:

- [ ] Added `<script src="/clinic-payment-modal.js"></script>` to clinic.html
- [ ] Called `PaymentModal.initialize()` on page load
- [ ] Called `PaymentModal.setReceptionist(name)` with logged-in user
- [ ] Set up periodic checks with `setInterval`
- [ ] Tested all modal interactions
- [ ] Tested API endpoints are reachable
- [ ] Tested with multiple concurrent bookings
- [ ] Verified JWT token is properly passed
- [ ] Styled modal to match clinic app theme (optional)

---

## Support

If the modal isn't working:

1. Check browser DevTools Console (F12 → Console)
2. Check Network tab to see API requests
3. Verify auth token exists in cookies
4. Verify API endpoints are returning data
5. Check that booking records exist in Supabase
6. Verify `pending_expiry` table has records

See `PAYMENT_VERIFICATION_TESTING.md` for detailed API testing.

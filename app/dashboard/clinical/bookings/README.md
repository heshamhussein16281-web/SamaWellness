# Booking & Payment Components

This directory contains the components for booking confirmation and payment instructions display.

## Components

### BookingConfirmation.tsx
A comprehensive booking confirmation modal/page that displays booking details and handles booking confirmation with payment deadline information.

**Props:**
```typescript
interface BookingConfirmationProps {
  booking: {
    id?: string;
    client_id: string;
    client_name?: string;
    therapist_id: string;
    therapist_name?: string;
    session_date: string;
    duration_minutes: number;
    session_type: 'single' | 'group' | 'couple';
    room_id?: string;
    room_name?: string;
    notes?: string;
    payment_amount?: number;
    payment_deadline?: string;
  };
  onConfirm: (bookingData: BookingData) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
  error?: string;
}
```

**Features:**
- ✓ Displays complete booking summary with client, therapist, and session details
- ✓ Shows payment information with deadline and time-remaining status
- ✓ Color-coded status indicators (pending, urgent, overdue)
- ✓ Confirm button triggers booking creation via API
- ✓ Cancel button with confirmation modal
- ✓ Transitions to PaymentInstructions display on successful confirmation
- ✓ Error handling and display
- ✓ Loading states
- ✓ Responsive design (desktop, tablet, mobile)
- ✓ Print-friendly styling

**Usage:**
```tsx
<BookingConfirmation
  booking={{
    client_id: '123',
    client_name: 'John Doe',
    therapist_id: '456',
    therapist_name: 'Dr. Smith',
    session_date: '2024-06-15T14:00:00Z',
    duration_minutes: 60,
    session_type: 'single',
    room_name: 'Room A',
    payment_amount: 2000,
    payment_deadline: '2024-06-16T14:00:00Z',
  }}
  onConfirm={async (booking) => {
    const response = await fetch('/api/admin/bookings', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(booking),
    });
    return response.json();
  }}
  onCancel={() => navigate('/bookings')}
/>
```

### PaymentInstructions.tsx
A reusable component that displays payment instructions with countdown timer and payment methods.

**Props:**
```typescript
interface PaymentInstructionsProps {
  bookingId: string;
  clientName: string;
  amount: number;
  deadline: string;
  sessionDate: string;
  showCopyButtons?: boolean;
  showPrintButton?: boolean;
}
```

**Features:**
- ✓ Real-time countdown timer to payment deadline
- ✓ Status indicators (pending, urgent, overdue)
- ✓ Three payment methods: Instapay, Bank Transfer, Cash
- ✓ Copy-to-clipboard functionality for payment details
- ✓ Print-friendly layout
- ✓ Formatted dates and times
- ✓ Responsive grid layout
- ✓ Accessible buttons and links
- ✓ Mobile-optimized display

**Usage:**
```tsx
<PaymentInstructions
  bookingId="BOOKING-001"
  clientName="John Doe"
  amount={2000}
  deadline="2024-06-16T14:00:00Z"
  sessionDate="2024-06-15T14:00:00Z"
  showCopyButtons={true}
  showPrintButton={true}
/>
```

## Styling

Both components follow the **3-Layer CSS Architecture**:

1. **Layer 1: Design Tokens** - CSS variables for colors, spacing, typography, transitions
2. **Layer 2: Layout Containers** - Flex/grid layouts with padding, margins, positioning
3. **Layer 3: Components** - Self-contained visual units with full styling (colors, borders, shadows)

### Key Design Tokens

#### Colors
- Primary (Burgundy): `#7b2d3e`
- Success (Olive): `#4a6741`
- Warning (Orange): `#ff9800`
- Error (Red): `#d32f2f`
- Info (Blue): `#2196f3`

#### Spacing Scale
- xs: 4px
- sm: 8px
- md: 16px
- lg: 24px
- xl: 32px

#### Typography
- Display: Gilda Display (serif)
- Body: Nunito Sans (sans-serif)
- UI: Josefin Sans (sans-serif)
- Mono: Courier New (monospace)

### Responsive Breakpoints
- Desktop: Full layout
- Tablet (≤768px): Adjusted grid columns and button layout
- Mobile (≤480px): Single column, full-width buttons, reduced padding

## State Management

### BookingConfirmation State
```typescript
- showCancelModal: boolean       // Show/hide cancellation confirmation
- showPaymentInstructions: boolean // Transition to payment display
- confirmError: string           // Error message from confirmation
- loading: boolean               // (passed as prop)
```

### PaymentInstructions State
```typescript
- timeRemaining: {
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isOverdue: boolean;
  }
- copied: string | null          // Track which button was copied
```

## API Integration

The `BookingConfirmation` component expects the `onConfirm` callback to:

1. Call `POST /api/admin/bookings` with booking data
2. Expect 201 response with booking details including:
   - `id`: Booking ID (assigned by API)
   - `payment_deadline`: 24-hour deadline (ISO string)
   - `payment_amount`: 2000 EGP
   - `booking_status`: 'scheduled'
   - `payment_status`: 'pending'

## Accessibility

- ✓ Semantic HTML structure
- ✓ ARIA labels on interactive elements
- ✓ Keyboard navigation support
- ✓ Color not sole indicator of status (icons + text)
- ✓ Sufficient color contrast ratios
- ✓ Focus visible on buttons

## TypeScript

- Fully typed components with interfaces
- No `any` types used
- Type-safe event handlers
- Strict null checking enabled

## CSS Classes

### BookingConfirmation Classes
```
.booking-confirmation-container
.booking-confirmation-header
.booking-confirmation-title
.booking-confirmation-subtitle
.booking-confirmation-error
.booking-confirmation-info
.booking-summary-card
.booking-summary-section
.booking-summary-grid
.booking-summary-item
.booking-summary-label
.booking-summary-value
.booking-confirmation-actions
.booking-confirmation-button
.booking-confirmation-button--primary
.booking-confirmation-button--secondary
.booking-confirmation-button--danger
.booking-confirmation-modal-overlay
.booking-confirmation-modal
```

### PaymentInstructions Classes
```
.payment-instructions-container
.payment-instructions-header
.payment-instructions-title
.payment-status
.payment-status--pending
.payment-status--urgent
.payment-status--overdue
.payment-methods-grid
.payment-method-card
.payment-method-detail
.payment-instructions-actions
.payment-instructions-button
```

## Success Criteria

- ✓ Displays booking details correctly
- ✓ Confirm button creates booking (POST call)
- ✓ Cancel button works with confirmation
- ✓ Payment instructions clear and readable
- ✓ Deadline timer counts down correctly
- ✓ Print-friendly layout for payment instructions
- ✓ Error handling and user feedback
- ✓ Mobile responsive design
- ✓ TypeScript: no errors
- ✓ Build succeeds

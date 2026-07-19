# Reschedule Calendar: Highlight Current Slot & Existing Bookings

## Problem

The reschedule calendar (`RescheduleModal.tsx`) shows three logically different
things with the exact same plain-grey `—` "disabled" cell:

1. A slot outside the therapist's working hours, or in the past.
2. A slot booked by a **different** client/therapist (a real conflict).
3. The slot the booking being rescheduled **currently occupies** — which, since
   PR #3, is deliberately excluded from conflict data (`notSelf`) so it renders
   as plain **green "free"**, indistinguishable from any other open slot.

Reception has no visual way to see, at a glance, where the session is moving
*from*, or to tell "not available" apart from "someone else is booked there."

## Goals

- Mark the booking's current date/time/room distinctly on the grid.
- Mark slots booked by other bookings distinctly from "outside hours"/"past."
- No new API endpoints; reuse data already fetched.

## Non-goals

- Changing `BookingCalendarModal` (the create-booking calendar) — this is
  reschedule-only, since only reschedule has a "current slot" concept.
- Changing conflict-detection logic (`isTherapistBooked`/`isRoomBooked`) —
  those already work correctly (per PR #3 + prior session). This is a
  presentation-only change.

## Design

### Data: new `currentRoomId` prop

`RescheduleModal` already receives `currentSessionDate` but not the room the
booking currently occupies. Thread it through:

1. **`app/api/admin/clients/[id]/bookings/route.ts`**: the query already joins
   `clinic_rooms:room_id (id, room_name)` (line ~85) but the mapped response
   object only returns `room_name`. Add `room_id: room?.id || null` alongside
   the existing `room_name: room?.room_name || null` (~line 140).
2. **`ClientActionButton.tsx`**: `currentBooking` is typed `any` and already
   holds the full booking object from that endpoint, so `currentBooking.room_id`
   is available with no further change there. Pass it to `RescheduleModal` as
   a new prop: `currentRoomId={currentBooking?.room_id ?? undefined}`.
3. **`RescheduleModal.tsx`**: add `currentRoomId?: string` to
   `RescheduleModalProps` and destructure it in the component signature.

### Deriving the current cell

Inside `RescheduleModal`, derive once (not per-render-loop-iteration):

```ts
const currentDateStr = currentSessionDate ? formatDate2(new Date(currentSessionDate)) : null;
const currentHour = currentSessionDate ? new Date(currentSessionDate).getHours() : null;
```

Reuses the existing `formatDate2` (local-date, no timezone shift — same
helper already used for grid dates) for consistency with how grid cells key
their date strings.

### Rendering: three visual states

In the room-slot render loop (`clinicRooms.map(...)`), for each room button,
evaluate in this order:

1. **Current slot**: `dateStr === currentDateStr && hour === currentHour &&
   room.id === currentRoomId` → render a non-interactive `<div>` (not a
   `<button>` — this is not a valid reschedule target since it's the same
   slot) with a new class `legacy-room-btn current`, label text `Current`
   (small, replacing the room-initial letter), `title` = `"${room.room_name} — current session"`.
2. **Booked by another booking**: existing `isRoomBooked(dateStr, hour, room.id)`
   true (and not the current-slot case above, which it won't be, since PR #3
   already excludes the current booking from `clinicBookings`/`therapistBookings`)
   → same disabled `<div>`, but swap the class from `legacy-room-btn disabled`
   to the existing-but-unused `legacy-room-btn booked` style. Keep the existing
   `title` text (`"${room.room_name} is already booked at this time"`).
3. **Free**: unchanged — clickable green `.free` button.

The whole-cell "therapist booked" branch (`therapistBooked` — blocks all
rooms in that cell) gets the same `current` vs `booked` distinction per room,
mirroring the per-room logic above, since the current booking's own therapist
will otherwise show as "therapist booked" (amber) at their own current time —
which should instead show as the teal "current" state for the matching room
and plain "booked" (amber) for any other room in that same cell if occupied
by a different booking. Concretely: within the "therapist booked" branch,
still map over `clinicRooms` and apply the same three-way per-room check
(current / booked / — in this branch there is no free option, since the
therapist is unavailable — so it's current vs. booked only) rather than a
single flat "—" for every room.

### CSS

`modal.css` already defines `.legacy-room-btn.booked` (amber, `#FFF3CD` /
`#856404`, `cursor: not-allowed`) — currently unused; wire it in as described
above.

Add one new class for the current-slot state, teal-toned to match the
project's `--color-nav-text` (`rgb(45, 74, 70)`) design token family:

```css
.legacy-room-btn.current {
  background: #D6ECEA;
  color: #1F4E49;
  border-color: #A9D6D1;
  cursor: not-allowed;
  font-weight: 700;
}
```

(Exact values are a starting point; visually confirm against the live modal
during implementation and adjust for contrast/consistency if needed — no
functional impact either way.)

## Data flow summary

```
clients/[id]/bookings route
  └─ add room_id to response  ──────────────┐
                                             ▼
ClientActionButton (currentBooking.room_id) ──currentRoomId prop──▶ RescheduleModal
                                                                        │
                                                            derive currentDateStr/currentHour
                                                                        │
                                                     grid render: current / booked / free
```

## Testing / verification

No test suite exists in this repo (per CLAUDE.md). Verify manually in the
browser preview:

1. Open reschedule for a booking with a known current date/time/room (e.g.
   the therapist-87 booking at clinic 12, 2026-07-20 17:00, Horizon).
2. Navigate to that week — the Horizon cell at 17:00 should show the new
   **teal "Current"** state, not green/free.
3. A different room/time booked by another therapist (e.g. Serenity 18:00,
   therapist 94) should show the **amber "booked"** state, distinguishable
   from grey "outside hours" cells.
4. Confirm the current-slot cell is not clickable (no `selectedRoom`/`selectedTime`
   change on click).
5. Confirm booking a *different* free slot still works end-to-end (no
   regression to the reschedule submit flow).

## Files touched

- `app/api/admin/clients/[id]/bookings/route.ts` — add `room_id` to response.
- `app/dashboard/clinical/clients/ClientActionButton.tsx` — pass `currentRoomId` prop.
- `app/dashboard/clinical/clients/RescheduleModal.tsx` — new prop, derived current-cell values, three-way render logic.
- `app/dashboard/clinical/clients/modal.css` — one new `.legacy-room-btn.current` rule; wire in existing unused `.booked` rule.

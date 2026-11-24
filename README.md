# Puja Booking Workflow & Notifications

Prototype for the Aaradhya Setu SDE Intern assignment (Option 3). An admin moves a booking through
**Booking Confirmed → Puja Started → Puja Completed → Video Available**. Every status change generates a templated
(mock) WhatsApp notification that is saved and shown as history.

**Stack:** Node.js, Express, MongoDB (Mongoose), React (Vite), axios, react-router-dom.

## Setup
Requires Node 18+ and a running MongoDB (local or Atlas).

```bash
# Server
cd server
cp .env.example .env        # set MONGO_URI if needed
npm install
npm run seed                # inserts 10 dummy bookings with notification history
npm run dev                 # http://localhost:5000

# Client (new terminal)
cd client
cp .env.example .env
npm install
npm run dev                 # http://localhost:5173
```

## API
| Method | Route | Purpose |
|---|---|---|
| GET | `/api/bookings?search=&status=&sortBy=&order=` | List with search, status filter, sort (`pujaDate`, `amount`, `createdAt`) |
| GET | `/api/bookings/:bookingId` | Booking + notification history + next allowed status |
| PATCH | `/api/bookings/:bookingId/status` | Body `{ "status": "<next status>" }`. Moves the booking one step and sends a notification |

## Workflow rules
- A booking can only move to the **next** status. Skipping, going back or repeating returns `400`.
- The check is on the server, not just the UI.
- The update is conditional on the current status, so two simultaneous clicks cannot both advance the same step (`409` for the loser).

## Design decisions
- **Server-enforced transitions:** the UI can be bypassed, so the backend is the source of truth.
- **Notification failure never blocks the status change:** the puja state is the core fact. A failed send is stored with `deliveryStatus: "failed"`. In production this would be a queue with retries.
- **Mock is one function:** `mockSendWhatsApp` in `services/notificationService.js`. Swap it for the WhatsApp Business Cloud API or Twilio and nothing else changes.
- **Templates live in code** (`constants/workflow.js`) for simplicity. In production they would be stored in the DB and, for WhatsApp, pre-approved by Meta.
- **Human-readable `bookingId`** (e.g. `AS-1001`) is used in URLs and messages instead of Mongo's `_id`.
- **Indexes** on `Booking.status` and `Notification.bookingId` for the filter and history queries.
- **Out of scope (prototype):** authentication, pagination, payments, deployment.

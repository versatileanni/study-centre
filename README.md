# StudyCentre – Premium Library Management System

A full-stack web app to manage a 50-seat study centre with slot-based bookings, payments, and real-time seat availability.

## Tech Stack
- **Next.js 16** (App Router) + **TypeScript**
- **Tailwind CSS v4**
- **localStorage** for data persistence (no backend setup needed)
- **QRCode** for student QR generation

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Demo Login
| Role    | Username  | Password    |
|---------|-----------|-------------|
| Admin   | `admin`   | `admin123`  |
| Student | `student` | `student123`|

## Features
- **Dashboard** – KPIs, slot utilization bars, seat overview grid
- **Students** – Add/edit/delete, QR code generation per student
- **Bookings** – Slot-based booking with double-booking prevention, check-in/out
- **Seat Map** – Live visual grid with 4 slot indicators per seat (🟢🔴🟡), waitlist
- **Payments** – Track paid/pending/overdue, mark as paid
- **Analytics** – Slot popularity, daily trends, revenue breakdown

## Seat Layout
| Type         | IDs       | Count |
|--------------|-----------|-------|
| Premium      | C1–C10    | 10    |
| Semi-Private | S1–S15    | 15    |
| Standard     | A1–A25    | 25    |

## Time Slots
| Slot      | Time             |
|-----------|------------------|
| Morning   | 9:00 AM – 12:00 PM |
| Midday    | 12:00 PM – 3:00 PM |
| Afternoon | 3:00 PM – 6:00 PM  |
| Evening   | 6:00 PM – 9:00 PM  |

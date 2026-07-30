# StudyCentre

A full-stack study centre management web app built with **Next.js 16**, **React 19**, and **Tailwind CSS v4**.

It supports two roles — **Admin** and **Student** — each with their own dedicated portal.

---

## Features

### Admin
- Manage students — add, edit, and delete records
- Track seat bookings across 4 daily time slots (Morning, Midday, Afternoon, Evening)
- View an interactive seat map with real-time occupancy
- Record and monitor payments (paid, pending, overdue)
- Analytics dashboard with slot utilization charts
- Waitlist management

### Student
- View assigned seat and booked time slots
- Check in / check out of sessions
- Track payment status
- Access account credentials and QR code

### Chatbot Assistant
A built-in chat assistant available to both roles:
- **Students** can ask about their bookings, seat, payment status, slot timings, and account details
- **Admins** can query live data in plain English — student counts, revenue, occupancy rates, overdue payments, and more

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19, Tailwind CSS v4 |
| Animations | Framer Motion |
| Icons | Lucide React |
| Notifications | React Hot Toast |
| Data | localStorage (with seed data) |
| Language | TypeScript |

---

## Getting Started

```bash
# Install dependencies
npm install

# Run the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Default Login Credentials

| Role | Username | Password |
|---|---|---|
| Admin | `admin` | `admin123` |
| Student | phone number (e.g. `9876543210`) | `SC@` + last 4 digits (e.g. `SC@3210`) |

---

## Project Structure

```
app/
  (app)/          # Authenticated routes (dashboard, students, bookings, etc.)
  login/          # Login page
components/
  ChatBot.tsx     # Role-aware chat assistant
  Sidebar.tsx     # Navigation sidebar
  Modal.tsx       # Reusable modal
  StatCard.tsx    # Dashboard stat cards
  SlotBadge.tsx   # Time slot badges
lib/
  auth.tsx        # Auth context and login logic
  store.ts        # Central data store (localStorage)
  useStore.ts     # React hook for store
  types.ts        # Shared TypeScript types
  seats.ts        # Seat layout data
```

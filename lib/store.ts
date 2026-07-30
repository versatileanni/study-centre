"use client";
import { Student, Booking, Payment, WaitlistEntry, SlotKey } from "./types";
import { SEATS } from "./seats";
import { format } from "date-fns";

// ── Seed Data ──────────────────────────────────────────────────────────────────
const today = format(new Date(), "yyyy-MM-dd");

const SEED_STUDENTS: Student[] = [
  { id: "st1", name: "Arjun Sharma",   phone: "9876543210", email: "arjun@example.com",  planType: "monthly",    seatId: "C1", slots: ["morning", "midday"],    joinDate: "2026-03-01", paymentStatus: "paid",    username: "9876543210", password: "SC@3210" },
  { id: "st2", name: "Priya Patel",    phone: "9876543211", email: "priya@example.com",  planType: "monthly",    seatId: "C2", slots: ["afternoon", "evening"],  joinDate: "2026-03-05", paymentStatus: "pending", username: "9876543211", password: "SC@3211" },
  { id: "st3", name: "Rahul Verma",    phone: "9876543212", email: "rahul@example.com",  planType: "slot-based", seatId: "S1", slots: ["morning"],               joinDate: "2026-03-10", paymentStatus: "paid",    username: "9876543212", password: "SC@3212" },
  { id: "st4", name: "Sneha Gupta",    phone: "9876543213", email: "sneha@example.com",  planType: "monthly",    seatId: "S2", slots: ["midday", "afternoon"],   joinDate: "2026-03-12", paymentStatus: "overdue", username: "9876543213", password: "SC@3213" },
  { id: "st5", name: "Vikram Singh",   phone: "9876543214", email: "vikram@example.com", planType: "slot-based", seatId: "A1", slots: ["evening"],               joinDate: "2026-03-15", paymentStatus: "paid",    username: "9876543214", password: "SC@3214" },
  { id: "st6", name: "Ananya Reddy",   phone: "9876543215", email: "ananya@example.com", planType: "monthly",    seatId: "A2", slots: ["morning", "evening"],    joinDate: "2026-03-18", paymentStatus: "paid",    username: "9876543215", password: "SC@3215" },
  { id: "st7", name: "Karan Mehta",    phone: "9876543216", email: "karan@example.com",  planType: "slot-based", seatId: "C3", slots: ["midday"],                joinDate: "2026-03-20", paymentStatus: "pending", username: "9876543216", password: "SC@3216" },
  { id: "st8", name: "Divya Nair",     phone: "9876543217", email: "divya@example.com",  planType: "monthly",    seatId: "S3", slots: ["morning", "midday", "afternoon"], joinDate: "2026-03-22", paymentStatus: "paid", username: "9876543217", password: "SC@3217" },
];

const SEED_BOOKINGS: Booking[] = [
  { id: "b1", studentId: "st1", seatId: "C1", slot: "morning",   date: today, status: "active", checkedIn: true,  checkInTime: "09:05" },
  { id: "b2", studentId: "st1", seatId: "C1", slot: "midday",    date: today, status: "active", checkedIn: false },
  { id: "b3", studentId: "st2", seatId: "C2", slot: "afternoon", date: today, status: "active", checkedIn: false },
  { id: "b4", studentId: "st2", seatId: "C2", slot: "evening",   date: today, status: "active", checkedIn: false },
  { id: "b5", studentId: "st3", seatId: "S1", slot: "morning",   date: today, status: "active", checkedIn: true,  checkInTime: "09:10" },
  { id: "b6", studentId: "st4", seatId: "S2", slot: "midday",    date: today, status: "active", checkedIn: false },
  { id: "b7", studentId: "st4", seatId: "S2", slot: "afternoon", date: today, status: "active", checkedIn: false },
  { id: "b8", studentId: "st5", seatId: "A1", slot: "evening",   date: today, status: "active", checkedIn: false },
  { id: "b9", studentId: "st6", seatId: "A2", slot: "morning",   date: today, status: "active", checkedIn: true,  checkInTime: "09:02" },
  { id: "b10",studentId: "st7", seatId: "C3", slot: "midday",    date: today, status: "active", checkedIn: false },
  { id: "b11",studentId: "st8", seatId: "S3", slot: "morning",   date: today, status: "active", checkedIn: true,  checkInTime: "09:08" },
  { id: "b12",studentId: "st8", seatId: "S3", slot: "midday",    date: today, status: "active", checkedIn: false },
  { id: "b13",studentId: "st8", seatId: "S3", slot: "afternoon", date: today, status: "active", checkedIn: false },
];

const SEED_PAYMENTS: Payment[] = [
  { id: "p1", studentId: "st1", amount: 2500, date: "2026-03-01", status: "paid",    description: "Monthly Plan - March", month: "2026-03" },
  { id: "p2", studentId: "st2", amount: 2500, date: "2026-03-05", status: "pending", description: "Monthly Plan - March", month: "2026-03" },
  { id: "p3", studentId: "st3", amount: 800,  date: "2026-03-10", status: "paid",    description: "Morning Slot - March", month: "2026-03" },
  { id: "p4", studentId: "st4", amount: 2500, date: "2026-03-12", status: "overdue", description: "Monthly Plan - March", month: "2026-03" },
  { id: "p5", studentId: "st5", amount: 600,  date: "2026-03-15", status: "paid",    description: "Evening Slot - March", month: "2026-03" },
  { id: "p6", studentId: "st6", amount: 2500, date: "2026-03-18", status: "paid",    description: "Monthly Plan - March", month: "2026-03" },
  { id: "p7", studentId: "st7", amount: 700,  date: "2026-03-20", status: "pending", description: "Midday Slot - March",  month: "2026-03" },
  { id: "p8", studentId: "st8", amount: 2500, date: "2026-03-22", status: "paid",    description: "Monthly Plan - March", month: "2026-03" },
];

// ── LocalStorage helpers ───────────────────────────────────────────────────────
function load<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch { return fallback; }
}

function save<T>(key: string, data: T) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(data));
}

// ── Store class ────────────────────────────────────────────────────────────────
class StudyStore {
  private _students: Student[] = [];
  private _bookings: Booking[] = [];
  private _payments: Payment[] = [];
  private _waitlist: WaitlistEntry[] = [];
  private listeners: Set<() => void> = new Set();

  init() {
    const hasData = typeof window !== "undefined" && localStorage.getItem("sc_students");
    this._students = load("sc_students", hasData ? [] : SEED_STUDENTS);
    this._bookings = load("sc_bookings", hasData ? [] : SEED_BOOKINGS);
    this._payments = load("sc_payments", hasData ? [] : SEED_PAYMENTS);
    this._waitlist = load("sc_waitlist", []);
    if (!hasData) {
      save("sc_students", this._students);
      save("sc_bookings", this._bookings);
      save("sc_payments", this._payments);
    }
  }

  subscribe(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => { this.listeners.delete(fn); };
  }

  private notify() { this.listeners.forEach(fn => fn()); }

  // ── Students ──
  get students() { return this._students; }

  addStudent(s: Omit<Student, "id" | "username" | "password">) {
    // Auto-generate credentials: username = phone, password = SC@ + last 4 digits
    const username = s.phone;
    const password = `SC@${s.phone.slice(-4)}`;
    const student: Student = { ...s, id: `st${Date.now()}`, username, password };
    this._students = [...this._students, student];
    save("sc_students", this._students);
    this.notify();
    return student;
  }

  updateStudent(id: string, updates: Partial<Student>) {
    this._students = this._students.map(s => s.id === id ? { ...s, ...updates } : s);
    save("sc_students", this._students);
    this.notify();
  }

  deleteStudent(id: string) {
    this._students = this._students.filter(s => s.id !== id);
    this._bookings = this._bookings.filter(b => b.studentId !== id);
    save("sc_students", this._students);
    save("sc_bookings", this._bookings);
    this.notify();
  }

  // ── Bookings ──
  get bookings() { return this._bookings; }

  getBookingsForDate(date: string) {
    return this._bookings.filter(b => b.date === date && b.status !== "cancelled");
  }

  isSlotOccupied(seatId: string, slot: SlotKey, date: string, excludeBookingId?: string) {
    return this._bookings.some(
      b => b.seatId === seatId && b.slot === slot && b.date === date &&
           b.status !== "cancelled" && b.id !== excludeBookingId
    );
  }

  addBooking(booking: Omit<Booking, "id">) {
    if (this.isSlotOccupied(booking.seatId, booking.slot, booking.date)) {
      throw new Error(`Seat ${booking.seatId} is already booked for this slot.`);
    }
    const b = { ...booking, id: `b${Date.now()}` };
    this._bookings = [...this._bookings, b];
    save("sc_bookings", this._bookings);
    this.notify();
    return b;
  }

  cancelBooking(id: string) {
    this._bookings = this._bookings.map(b => b.id === id ? { ...b, status: "cancelled" as const } : b);
    save("sc_bookings", this._bookings);
    this.notify();
  }

  checkIn(bookingId: string) {
    const now = format(new Date(), "HH:mm");
    this._bookings = this._bookings.map(b =>
      b.id === bookingId ? { ...b, checkedIn: true, checkInTime: now } : b
    );
    save("sc_bookings", this._bookings);
    this.notify();
  }

  checkOut(bookingId: string) {
    const now = format(new Date(), "HH:mm");
    this._bookings = this._bookings.map(b =>
      b.id === bookingId ? { ...b, checkOutTime: now } : b
    );
    save("sc_bookings", this._bookings);
    this.notify();
  }

  // ── Payments ──
  get payments() { return this._payments; }

  addPayment(p: Omit<Payment, "id">) {
    const payment = { ...p, id: `p${Date.now()}` };
    this._payments = [...this._payments, payment];
    save("sc_payments", this._payments);
    this.notify();
    return payment;
  }

  updatePayment(id: string, updates: Partial<Payment>) {
    this._payments = this._payments.map(p => p.id === id ? { ...p, ...updates } : p);
    save("sc_payments", this._payments);
    this.notify();
  }

  // ── Waitlist ──
  get waitlist() { return this._waitlist; }

  addToWaitlist(entry: Omit<WaitlistEntry, "id" | "createdAt">) {
    const e = { ...entry, id: `w${Date.now()}`, createdAt: new Date().toISOString() };
    this._waitlist = [...this._waitlist, e];
    save("sc_waitlist", this._waitlist);
    this.notify();
  }

  removeFromWaitlist(id: string) {
    this._waitlist = this._waitlist.filter(w => w.id !== id);
    save("sc_waitlist", this._waitlist);
    this.notify();
  }
}

export const store = new StudyStore();

export type SeatType = "premium" | "semi-private" | "standard";
export type SlotKey = "morning" | "midday" | "afternoon" | "evening";
export type BookingStatus = "active" | "cancelled" | "completed";
export type PaymentStatus = "paid" | "pending" | "overdue";
export type SlotStatus = "available" | "occupied" | "reserved";

export const TIME_SLOTS: Record<SlotKey, { label: string; time: string; start: number; end: number }> = {
  morning:   { label: "Morning",   time: "9:00 AM – 12:00 PM", start: 9,  end: 12 },
  midday:    { label: "Midday",    time: "12:00 PM – 3:00 PM", start: 12, end: 15 },
  afternoon: { label: "Afternoon", time: "3:00 PM – 6:00 PM",  start: 15, end: 18 },
  evening:   { label: "Evening",   time: "6:00 PM – 9:00 PM",  start: 18, end: 21 },
};

export const SLOT_KEYS: SlotKey[] = ["morning", "midday", "afternoon", "evening"];

export interface Student {
  id: string;
  name: string;
  phone: string;
  email?: string;
  planType: "monthly" | "slot-based";
  seatId?: string;
  slots: SlotKey[];
  joinDate: string;
  paymentStatus: PaymentStatus;
  username: string;   // auto-generated: phone number
  password: string;   // auto-generated: e.g. SC@1234
  qrCode?: string;
  waitlist?: { seatId: string; slot: SlotKey }[];
}

export interface Seat {
  id: string;
  type: SeatType;
  row: number;
  col: number;
}

export interface Booking {
  id: string;
  studentId: string;
  seatId: string;
  slot: SlotKey;
  date: string; // YYYY-MM-DD
  status: BookingStatus;
  checkedIn?: boolean;
  checkInTime?: string;
  checkOutTime?: string;
}

export interface Payment {
  id: string;
  studentId: string;
  amount: number;
  date: string;
  status: PaymentStatus;
  description: string;
  month?: string;
}

export interface WaitlistEntry {
  id: string;
  studentId: string;
  seatId: string;
  slot: SlotKey;
  date: string;
  createdAt: string;
}

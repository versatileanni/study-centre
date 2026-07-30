import { Seat, SeatType } from "./types";

// Generate 50 seats: 10 Premium (C1-C10), 15 Semi-Private (S1-S15), 25 Standard (A1-A25)
export const SEATS: Seat[] = [
  // Premium Cabins - C1 to C10
  ...Array.from({ length: 10 }, (_, i) => ({
    id: `C${i + 1}`,
    type: "premium" as SeatType,
    row: Math.floor(i / 5),
    col: i % 5,
  })),
  // Semi-Private - S1 to S15
  ...Array.from({ length: 15 }, (_, i) => ({
    id: `S${i + 1}`,
    type: "semi-private" as SeatType,
    row: Math.floor(i / 5),
    col: i % 5,
  })),
  // Standard - A1 to A25
  ...Array.from({ length: 25 }, (_, i) => ({
    id: `A${i + 1}`,
    type: "standard" as SeatType,
    row: Math.floor(i / 5),
    col: i % 5,
  })),
];

export const SEAT_TYPE_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  premium:      { label: "Premium Cabin",  color: "text-amber-700",  bg: "bg-amber-50",   border: "border-amber-300" },
  "semi-private": { label: "Semi-Private", color: "text-purple-700", bg: "bg-purple-50",  border: "border-purple-300" },
  standard:     { label: "Standard",       color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-300" },
};

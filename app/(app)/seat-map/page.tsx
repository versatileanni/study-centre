"use client";
import { useState } from "react";
import { useStore } from "@/lib/useStore";
import { SLOT_KEYS, TIME_SLOTS, SlotKey } from "@/lib/types";
import { SEATS, SEAT_TYPE_CONFIG } from "@/lib/seats";
import Modal from "@/components/Modal";
import SlotBadge from "@/components/SlotBadge";
import { CalendarDays, Info, UserPlus, Clock } from "lucide-react";
import { format } from "date-fns";
import toast from "react-hot-toast";

export default function SeatMapPage() {
  const { students, store } = useStore();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [selected, setSelected] = useState<string | null>(null);
  const [waitlistModal, setWaitlistModal] = useState<{ open: boolean; seatId: string; slot: SlotKey } | null>(null);
  const [wlStudentId, setWlStudentId] = useState("");

  const dayBookings = store.getBookingsForDate(date);

  const getSlotStatus = (seatId: string, slot: SlotKey) => {
    const booking = dayBookings.find(b => b.seatId === seatId && b.slot === slot);
    if (!booking) return { status: "available" as const, booking: null };
    return { status: booking.checkedIn ? "occupied" as const : "reserved" as const, booking };
  };

  const slotDotColor = (status: "available" | "occupied" | "reserved") => {
    if (status === "available") return "bg-green-500";
    if (status === "occupied") return "bg-red-500";
    return "bg-yellow-400";
  };

  const seatBgColor = (seatId: string) => {
    const statuses = SLOT_KEYS.map(slot => getSlotStatus(seatId, slot).status);
    const allAvail = statuses.every(s => s === "available");
    const allOccupied = statuses.every(s => s !== "available");
    if (allAvail) return "bg-green-50 border-green-200 hover:border-green-400";
    if (allOccupied) return "bg-red-50 border-red-200 hover:border-red-400";
    return "bg-yellow-50 border-yellow-200 hover:border-yellow-400";
  };

  const selectedSeat = selected ? SEATS.find(s => s.id === selected) : null;
  const selectedBookings = selected ? SLOT_KEYS.map(slot => ({
    slot,
    ...getSlotStatus(selected, slot),
  })) : [];

  const premiumSeats = SEATS.filter(s => s.type === "premium");
  const semiSeats = SEATS.filter(s => s.type === "semi-private");
  const standardSeats = SEATS.filter(s => s.type === "standard");

  const addToWaitlist = () => {
    if (!waitlistModal || !wlStudentId) return toast.error("Select a student");
    store.addToWaitlist({ studentId: wlStudentId, seatId: waitlistModal.seatId, slot: waitlistModal.slot, date });
    toast.success("Added to waitlist");
    setWaitlistModal(null);
    setWlStudentId("");
  };

  const SeatGrid = ({ seats, label }: { seats: typeof SEATS; label: string }) => (
    <div className="mb-6">
      <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-3">{label}</h3>
      <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
        {seats.map(seat => (
          <button key={seat.id} onClick={() => setSelected(seat.id === selected ? null : seat.id)}
            className={`relative p-2 rounded-xl border-2 transition-all ${seatBgColor(seat.id)} ${selected === seat.id ? "ring-2 ring-indigo-500 ring-offset-1" : ""}`}>
            <p className="text-xs font-bold text-slate-700 text-center mb-1.5">{seat.id}</p>
            {/* 4 slot indicators */}
            <div className="grid grid-cols-2 gap-0.5">
              {SLOT_KEYS.map(slot => {
                const { status } = getSlotStatus(seat.id, slot);
                return (
                  <div key={slot} title={`${TIME_SLOTS[slot].label}: ${status}`}
                    className={`h-1.5 rounded-full ${slotDotColor(status)}`} />
                );
              })}
            </div>
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Live Seat Map</h1>
          <p className="text-slate-500 text-sm">Real-time slot availability for all 50 seats</p>
        </div>
        <div className="relative">
          <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-4 text-xs text-slate-600 bg-white rounded-xl p-3 border border-slate-100">
        <span className="flex items-center gap-1.5 font-medium">Slot indicators:</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-green-500 rounded-full" /> Available</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-yellow-400 rounded-full" /> Reserved</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-1.5 bg-red-500 rounded-full" /> Occupied</span>
        <span className="ml-auto text-slate-400">Click a seat for details</span>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Seat grid */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <SeatGrid seats={premiumSeats} label="Premium Cabins (C1–C10)" />
          <SeatGrid seats={semiSeats} label="Semi-Private (S1–S15)" />
          <SeatGrid seats={standardSeats} label="Standard (A1–A25)" />
        </div>

        {/* Detail panel */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          {!selectedSeat ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <Info size={32} className="text-slate-300 mb-3" />
              <p className="text-slate-400 text-sm">Select a seat to view slot details</p>
            </div>
          ) : (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg border-2 ${SEAT_TYPE_CONFIG[selectedSeat.type].bg} ${SEAT_TYPE_CONFIG[selectedSeat.type].border} ${SEAT_TYPE_CONFIG[selectedSeat.type].color}`}>
                  {selectedSeat.id}
                </div>
                <div>
                  <p className="font-bold text-slate-900">{selectedSeat.id}</p>
                  <p className={`text-xs font-medium ${SEAT_TYPE_CONFIG[selectedSeat.type].color}`}>
                    {SEAT_TYPE_CONFIG[selectedSeat.type].label}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {selectedBookings.map(({ slot, status, booking }) => {
                  const student = booking ? students.find(s => s.id === booking.studentId) : null;
                  return (
                    <div key={slot} className={`p-3 rounded-xl border ${
                      status === "available" ? "bg-green-50 border-green-200" :
                      status === "occupied" ? "bg-red-50 border-red-200" : "bg-yellow-50 border-yellow-200"
                    }`}>
                      <div className="flex items-center justify-between mb-1">
                        <SlotBadge slot={slot} status={status} size="sm" />
                        <span className={`text-xs font-medium capitalize ${
                          status === "available" ? "text-green-600" :
                          status === "occupied" ? "text-red-600" : "text-yellow-600"
                        }`}>{status}</span>
                      </div>
                      <p className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock size={10} />{TIME_SLOTS[slot].time}
                      </p>
                      {student && (
                        <p className="text-xs font-medium text-slate-700 mt-1">{student.name}</p>
                      )}
                      {status === "available" && (
                        <button
                          onClick={() => setWaitlistModal({ open: true, seatId: selectedSeat.id, slot })}
                          className="mt-2 flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800">
                          <UserPlus size={11} /> Add to waitlist
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {SLOT_KEYS.map(slot => {
          const occupied = SEATS.filter(s => getSlotStatus(s.id, slot).status !== "available").length;
          const pct = Math.round((occupied / 50) * 100);
          return (
            <div key={slot} className="bg-white rounded-xl p-4 border border-slate-100 shadow-sm">
              <SlotBadge slot={slot} size="sm" />
              <p className="text-2xl font-bold text-slate-900 mt-2">{50 - occupied}<span className="text-sm font-normal text-slate-400">/50</span></p>
              <p className="text-xs text-slate-400">available</p>
              <div className="h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                <div className={`h-full rounded-full ${pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-green-500"}`}
                  style={{ width: `${pct}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Waitlist Modal */}
      <Modal open={!!waitlistModal?.open} onClose={() => setWaitlistModal(null)} title="Add to Waitlist" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Seat <strong>{waitlistModal?.seatId}</strong> – <strong>{waitlistModal ? TIME_SLOTS[waitlistModal.slot].label : ""}</strong> slot
          </p>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Student</label>
            <select value={wlStudentId} onChange={e => setWlStudentId(e.target.value)}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setWaitlistModal(null)}
              className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={addToWaitlist}
              className="flex-1 bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700">Add</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

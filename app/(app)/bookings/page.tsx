"use client";
import { useState } from "react";
import { useStore } from "@/lib/useStore";
import { Booking, SLOT_KEYS, TIME_SLOTS, SlotKey } from "@/lib/types";
import { SEATS } from "@/lib/seats";
import Modal from "@/components/Modal";
import SlotBadge from "@/components/SlotBadge";
import { Plus, Search, LogIn, LogOut, X, CalendarDays, Filter } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

export default function BookingsPage() {
  const { students, bookings, store } = useStore();
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [search, setSearch] = useState("");
  const [slotFilter, setSlotFilter] = useState<SlotKey | "all">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ studentId: "", seatId: "", slots: [] as SlotKey[], date });

  const dayBookings = store.getBookingsForDate(date);
  const filtered = dayBookings.filter(b => {
    const student = students.find(s => s.id === b.studentId);
    const matchSearch = !search ||
      student?.name.toLowerCase().includes(search.toLowerCase()) ||
      b.seatId.toLowerCase().includes(search.toLowerCase());
    const matchSlot = slotFilter === "all" || b.slot === slotFilter;
    return matchSearch && matchSlot;
  });

  const handleBook = () => {
    if (!form.studentId || !form.seatId || form.slots.length === 0)
      return toast.error("Fill all fields and select at least one slot");
    let booked = 0;
    for (const slot of form.slots) {
      try {
        store.addBooking({ studentId: form.studentId, seatId: form.seatId, slot, date: form.date, status: "active", checkedIn: false });
        booked++;
      } catch (e: unknown) {
        toast.error(e instanceof Error ? e.message : "Booking failed");
      }
    }
    if (booked > 0) { toast.success(`${booked} slot(s) booked`); setModalOpen(false); }
  };

  const toggleSlot = (slot: SlotKey) => {
    setForm(f => ({
      ...f,
      slots: f.slots.includes(slot) ? f.slots.filter(s => s !== slot) : [...f.slots, slot]
    }));
  };

  const isSlotAvailable = (seatId: string, slot: SlotKey) =>
    !store.isSlotOccupied(seatId, slot, form.date);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Bookings</h1>
          <p className="text-slate-500 text-sm">{dayBookings.length} bookings on {format(new Date(date + "T00:00:00"), "MMM d, yyyy")}</p>
        </div>
        <button onClick={() => { setForm({ studentId: "", seatId: "", slots: [], date }); setModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> New Booking
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative">
          <CalendarDays size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input type="date" value={date} onChange={e => setDate(e.target.value)}
            className="pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student or seat..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1 py-1">
          <Filter size={14} className="text-slate-400 ml-2" />
          {(["all", ...SLOT_KEYS] as const).map(s => (
            <button key={s} onClick={() => setSlotFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${slotFilter === s ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
              {s === "all" ? "All" : TIME_SLOTS[s].label}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings grid */}
      <div className="grid gap-3">
        {filtered.length === 0 && (
          <div className="bg-white rounded-2xl p-10 text-center text-slate-400 border border-slate-100">No bookings found</div>
        )}
        {filtered.map(b => {
          const student = students.find(s => s.id === b.studentId);
          return (
            <div key={b.id} className="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center text-indigo-700 font-bold flex-shrink-0">
                {student?.name[0] ?? "?"}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="font-semibold text-slate-900">{student?.name ?? "Unknown"}</p>
                  <span className="font-mono text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md">{b.seatId}</span>
                  <SlotBadge slot={b.slot} status={b.checkedIn ? "occupied" : "active"} size="sm" />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">{TIME_SLOTS[b.slot].time}</p>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                {b.checkedIn ? (
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-green-600 font-medium">In {b.checkInTime}</span>
                    <button onClick={() => { store.checkOut(b.id); toast.success("Checked out"); }}
                      className="flex items-center gap-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-600 px-2.5 py-1.5 rounded-lg transition-colors">
                      <LogOut size={12} /> Check Out
                    </button>
                  </div>
                ) : (
                  <button onClick={() => { store.checkIn(b.id); toast.success("Checked in"); }}
                    className="flex items-center gap-1 text-xs bg-green-100 hover:bg-green-200 text-green-700 px-2.5 py-1.5 rounded-lg transition-colors font-medium">
                    <LogIn size={12} /> Check In
                  </button>
                )}
                <button onClick={() => { store.cancelBooking(b.id); toast.success("Booking cancelled"); }}
                  className="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-500 rounded-lg transition-colors">
                  <X size={15} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* New Booking Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="New Booking" size="lg">
        <div className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Student *</label>
              <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">Select student</option>
                {students.map(s => <option key={s.id} value={s.id}>{s.name} – {s.phone}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Select Seat *</label>
            <div className="grid grid-cols-5 sm:grid-cols-8 gap-1.5 max-h-40 overflow-y-auto p-1">
              {SEATS.map(seat => (
                <button key={seat.id} type="button" onClick={() => setForm(f => ({ ...f, seatId: seat.id, slots: [] }))}
                  className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                    form.seatId === seat.id
                      ? "bg-indigo-600 text-white border-indigo-600"
                      : seat.type === "premium"
                        ? "bg-amber-50 border-amber-200 text-amber-700 hover:bg-amber-100"
                        : seat.type === "semi-private"
                          ? "bg-purple-50 border-purple-200 text-purple-700 hover:bg-purple-100"
                          : "bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                  }`}>
                  {seat.id}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-2 text-xs text-slate-400">
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-100 border border-amber-200 rounded" />Premium</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-purple-100 border border-purple-200 rounded" />Semi-Private</span>
              <span className="flex items-center gap-1"><span className="w-3 h-3 bg-blue-100 border border-blue-200 rounded" />Standard</span>
            </div>
          </div>

          {form.seatId && (
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-2">Select Time Slots * (for seat {form.seatId})</label>
              <div className="grid grid-cols-2 gap-2">
                {SLOT_KEYS.map(slot => {
                  const available = isSlotAvailable(form.seatId, slot);
                  const selected = form.slots.includes(slot);
                  return (
                    <button key={slot} type="button"
                      disabled={!available}
                      onClick={() => available && toggleSlot(slot)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl border text-sm transition-all ${
                        !available
                          ? "bg-red-50 border-red-200 text-red-400 cursor-not-allowed"
                          : selected
                            ? "bg-indigo-600 border-indigo-600 text-white"
                            : "border-slate-200 text-slate-600 hover:border-indigo-300 hover:bg-indigo-50"
                      }`}>
                      <span className="font-medium">{TIME_SLOTS[slot].label}</span>
                      <span className="text-xs opacity-75">{available ? TIME_SLOTS[slot].time : "Occupied"}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)}
              className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleBook}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              Confirm Booking
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

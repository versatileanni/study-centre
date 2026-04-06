"use client";
import { useStore } from "@/lib/useStore";
import { useAuth } from "@/lib/auth";
import { SLOT_KEYS, TIME_SLOTS, SlotKey } from "@/lib/types";
import SlotBadge from "@/components/SlotBadge";
import { format } from "date-fns";
import { Armchair, CreditCard, Clock, CheckCircle, QrCode, LogIn, LogOut } from "lucide-react";
import { useState } from "react";
import QRCode from "qrcode";
import Modal from "@/components/Modal";
import toast from "react-hot-toast";

export default function MyPortalPage() {
  const { user } = useAuth();
  const { students, bookings, payments, store } = useStore();
  const [qrUrl, setQrUrl] = useState("");
  const [qrOpen, setQrOpen] = useState(false);

  // Get studentId from auth context (set at login)
  const studentId = user?.studentId ?? students[0]?.id;
  const student = students.find(s => s.id === studentId);
  const today = format(new Date(), "yyyy-MM-dd");

  const todayBookings = bookings.filter(
    b => b.studentId === studentId && b.date === today && b.status !== "cancelled"
  );

  const allBookings = bookings
    .filter(b => b.studentId === studentId && b.status !== "cancelled")
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 10);

  const myPayments = payments
    .filter(p => p.studentId === studentId)
    .sort((a, b) => b.date.localeCompare(a.date));

  const showQR = async () => {
    if (!student) return;
    const data = JSON.stringify({ id: student.id, name: student.name, seat: student.seatId });
    const url = await QRCode.toDataURL(data, { width: 256, margin: 2 });
    setQrUrl(url);
    setQrOpen(true);
  };

  const payBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      overdue: "bg-red-100 text-red-700",
    };
    return map[status] ?? "bg-slate-100 text-slate-600";
  };

  if (!student) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-400">
        No student profile linked to this account.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Portal</h1>
          <p className="text-slate-500 text-sm">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
        </div>
        <button onClick={showQR}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors">
          <QrCode size={16} /> My QR Code
        </button>
      </div>

      {/* Profile card */}
      <div className="bg-gradient-to-br from-indigo-600 to-purple-700 rounded-2xl p-6 text-white">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center text-3xl font-bold">
            {student.name[0]}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-bold">{student.name}</h2>
            <p className="text-indigo-200 text-sm">{student.phone}</p>
            <div className="flex items-center gap-3 mt-2 flex-wrap">
              <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-medium">
                <Armchair size={12} /> Seat {student.seatId || "Not assigned"}
              </span>
              <span className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-medium capitalize">
                {student.planType} plan
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize ${
                student.paymentStatus === "paid" ? "bg-green-400/30 text-green-100" :
                student.paymentStatus === "overdue" ? "bg-red-400/30 text-red-100" :
                "bg-yellow-400/30 text-yellow-100"
              }`}>
                {student.paymentStatus}
              </span>
            </div>
          </div>
        </div>

        {/* My slots */}
        <div className="mt-4 pt-4 border-t border-white/20">
          <p className="text-xs text-indigo-200 mb-2">My booked slots</p>
          <div className="flex flex-wrap gap-2">
            {student.slots.map(slot => (
              <span key={slot} className="bg-white/20 px-3 py-1.5 rounded-xl text-xs font-medium">
                {TIME_SLOTS[slot].label} · {TIME_SLOTS[slot].time}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Today's sessions */}
      <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-indigo-600" />
          <h2 className="font-semibold text-slate-900">Today's Sessions</h2>
        </div>
        {todayBookings.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-6">No sessions booked for today</p>
        ) : (
          <div className="space-y-3">
            {SLOT_KEYS.filter(slot => todayBookings.some(b => b.slot === slot)).map(slot => {
              const booking = todayBookings.find(b => b.slot === slot)!;
              return (
                <div key={slot} className={`flex items-center justify-between p-4 rounded-xl border ${
                  booking.checkedIn ? "bg-green-50 border-green-200" : "bg-slate-50 border-slate-200"
                }`}>
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                      booking.checkedIn ? "bg-green-500" : "bg-slate-300"
                    }`}>
                      {booking.checkedIn
                        ? <CheckCircle size={18} className="text-white" />
                        : <Clock size={18} className="text-white" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <SlotBadge slot={slot} size="sm" />
                        <span className="text-xs text-slate-500">{TIME_SLOTS[slot].time}</span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Seat {booking.seatId}
                        {booking.checkedIn && booking.checkInTime && ` · Checked in at ${booking.checkInTime}`}
                        {booking.checkOutTime && ` · Out at ${booking.checkOutTime}`}
                      </p>
                    </div>
                  </div>
                  <div>
                    {booking.checkedIn ? (
                      <button onClick={() => { store.checkOut(booking.id); toast.success("Checked out"); }}
                        className="flex items-center gap-1 text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 px-3 py-1.5 rounded-lg transition-colors">
                        <LogOut size={12} /> Check Out
                      </button>
                    ) : (
                      <button onClick={() => { store.checkIn(booking.id); toast.success("Checked in!"); }}
                        className="flex items-center gap-1 text-xs bg-green-500 hover:bg-green-600 text-white px-3 py-1.5 rounded-lg transition-colors font-medium">
                        <LogIn size={12} /> Check In
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Recent bookings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Armchair size={18} className="text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Recent Bookings</h2>
          </div>
          <div className="space-y-2">
            {allBookings.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No bookings yet</p>}
            {allBookings.map(b => (
              <div key={b.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <div className="flex items-center gap-2">
                    <SlotBadge slot={b.slot} size="sm" />
                    <span className="font-mono text-xs text-slate-500">{b.seatId}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">{b.date}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  b.checkedIn ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-500"
                }`}>
                  {b.checkedIn ? "Attended" : "Booked"}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment history */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard size={18} className="text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Payment History</h2>
          </div>
          <div className="space-y-2">
            {myPayments.length === 0 && <p className="text-slate-400 text-sm text-center py-4">No payments yet</p>}
            {myPayments.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                <div>
                  <p className="text-sm font-medium text-slate-800">{p.description}</p>
                  <p className="text-xs text-slate-400">{p.date}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-slate-900">₹{p.amount.toLocaleString()}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${payBadge(p.status)}`}>
                    {p.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* QR Modal */}
      <Modal open={qrOpen} onClose={() => setQrOpen(false)} title="My QR Code" size="sm">
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-500 text-sm">Show this at the desk to check in</p>
          {qrUrl && <img src={qrUrl} alt="My QR" className="w-48 h-48 rounded-xl border border-slate-200" />}
          <p className="text-xs text-slate-400 text-center font-medium">{student.name} · Seat {student.seatId}</p>
          <a href={qrUrl} download="my-qr.png"
            className="w-full text-center bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
            Download QR
          </a>
        </div>
      </Modal>
    </div>
  );
}

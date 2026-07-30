"use client";
import { useStore } from "@/lib/useStore";
import { useAuth } from "@/lib/auth";
import StatCard from "@/components/StatCard";
import SlotBadge from "@/components/SlotBadge";
import { Users, Armchair, CheckCircle, CreditCard, TrendingUp, Clock } from "lucide-react";
import { SLOT_KEYS, TIME_SLOTS, SlotKey } from "@/lib/types";
import { SEATS } from "@/lib/seats";
import { format } from "date-fns";
import Link from "next/link";

export default function DashboardPage() {
  const { user } = useAuth();
  const { students, bookings, payments } = useStore();
  const today = format(new Date(), "yyyy-MM-dd");
  const todayBookings = bookings.filter(b => b.date === today && b.status !== "cancelled");

  const totalRevenue = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingRevenue = payments.filter(p => p.status !== "paid").reduce((s, p) => s + p.amount, 0);
  const checkedIn = todayBookings.filter(b => b.checkedIn).length;

  const slotStats = SLOT_KEYS.map(slot => {
    const count = todayBookings.filter(b => b.slot === slot).length;
    return { slot, count, pct: Math.round((count / 50) * 100) };
  });

  const recent = [...todayBookings].slice(-5).reverse();
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "morning" : hour < 17 ? "afternoon" : "evening";

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Good {greeting}, {user?.username} 👋</h1>
        <p className="text-slate-500 text-sm mt-1">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Students" value={students.length} icon={Users} color="indigo" sub={`${students.filter(s => s.paymentStatus === "paid").length} paid`} />
        <StatCard title="Today's Bookings" value={todayBookings.length} icon={Armchair} color="purple" sub="of 200 slots" />
        <StatCard title="Checked In" value={checkedIn} icon={CheckCircle} color="green" sub="today" />
        <StatCard title="Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={CreditCard} color="amber" sub={`₹${pendingRevenue.toLocaleString()} pending`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Today's Slot Utilization</h2>
          </div>
          <div className="space-y-4">
            {slotStats.map(({ slot, count, pct }) => (
              <div key={slot}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <SlotBadge slot={slot as SlotKey} />
                    <span className="text-xs text-slate-400">{TIME_SLOTS[slot as SlotKey].time}</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-700">{count}/50</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${pct > 80 ? "bg-red-500" : pct > 50 ? "bg-amber-500" : "bg-green-500"}`}
                    style={{ width: `${pct}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock size={18} className="text-indigo-600" />
              <h2 className="font-semibold text-slate-900">Recent Bookings</h2>
            </div>
            <Link href="/bookings" className="text-xs text-indigo-600 hover:underline">View all</Link>
          </div>
          <div className="space-y-3">
            {recent.length === 0 && <p className="text-sm text-slate-400 text-center py-4">No bookings today</p>}
            {recent.map(b => {
              const student = students.find(s => s.id === b.studentId);
              return (
                <div key={b.id} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs">
                      {student?.name[0] ?? "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-800">{student?.name ?? "Unknown"}</p>
                      <p className="text-xs text-slate-400">Seat {b.seatId}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <SlotBadge slot={b.slot} size="sm" />
                    {b.checkedIn && <span className="w-2 h-2 bg-green-500 rounded-full" />}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-100">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Seat Overview</h2>
          <Link href="/seat-map" className="text-xs text-indigo-600 hover:underline">Full map →</Link>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {SEATS.map(seat => {
            const seatBookings = todayBookings.filter(b => b.seatId === seat.id);
            const occupiedSlots = seatBookings.length;
            const color = occupiedSlots === 0 ? "bg-green-400" : occupiedSlots < 4 ? "bg-amber-400" : "bg-red-500";
            return (
              <Link key={seat.id} href="/seat-map" title={`${seat.id} – ${occupiedSlots}/4 slots`}
                className={`w-7 h-7 rounded-md ${color} flex items-center justify-center text-white text-[9px] font-bold hover:opacity-80 transition-opacity`}>
                {seat.id}
              </Link>
            );
          })}
        </div>
        <div className="flex gap-4 mt-3 text-xs text-slate-500">
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-green-400 rounded" /> Available</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-amber-400 rounded" /> Partial</span>
          <span className="flex items-center gap-1"><span className="w-3 h-3 bg-red-500 rounded" /> Full</span>
        </div>
      </div>
    </div>
  );
}

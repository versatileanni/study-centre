"use client";
import { useStore } from "@/lib/useStore";
import { SLOT_KEYS, TIME_SLOTS, SlotKey } from "@/lib/types";
import { SEATS } from "@/lib/seats";
import StatCard from "@/components/StatCard";
import SlotBadge from "@/components/SlotBadge";
import { TrendingUp, Users, Armchair, IndianRupee, BarChart3, PieChart } from "lucide-react";
import { format, subDays, eachDayOfInterval } from "date-fns";

export default function AnalyticsPage() {
  const { students, bookings, payments } = useStore();

  const today = format(new Date(), "yyyy-MM-dd");
  const last7 = eachDayOfInterval({ start: subDays(new Date(), 6), end: new Date() });

  // Slot popularity
  const slotCounts = SLOT_KEYS.map(slot => ({
    slot,
    count: bookings.filter(b => b.slot === slot && b.status !== "cancelled").length,
  })).sort((a, b) => b.count - a.count);

  const maxSlotCount = Math.max(...slotCounts.map(s => s.count), 1);

  // Seat utilization
  const seatUtil = SEATS.map(seat => ({
    seat,
    count: bookings.filter(b => b.seatId === seat.id && b.status !== "cancelled").length,
  })).sort((a, b) => b.count - a.count).slice(0, 10);

  const maxSeatCount = Math.max(...seatUtil.map(s => s.count), 1);

  // Daily bookings last 7 days
  const dailyData = last7.map(day => {
    const d = format(day, "yyyy-MM-dd");
    return {
      date: format(day, "MMM d"),
      count: bookings.filter(b => b.date === d && b.status !== "cancelled").length,
    };
  });
  const maxDaily = Math.max(...dailyData.map(d => d.count), 1);

  // Revenue
  const totalRevenue = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const pendingRevenue = payments.filter(p => p.status !== "paid").reduce((s, p) => s + p.amount, 0);

  // Plan distribution
  const monthlyCount = students.filter(s => s.planType === "monthly").length;
  const slotCount = students.filter(s => s.planType === "slot-based").length;

  // Check-in rate
  const todayBookings = bookings.filter(b => b.date === today && b.status !== "cancelled");
  const checkinRate = todayBookings.length > 0
    ? Math.round((todayBookings.filter(b => b.checkedIn).length / todayBookings.length) * 100)
    : 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Analytics</h1>
        <p className="text-slate-500 text-sm">Insights and performance metrics</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Revenue" value={`₹${totalRevenue.toLocaleString()}`} icon={IndianRupee} color="green" sub="collected" />
        <StatCard title="Total Students" value={students.length} icon={Users} color="indigo" sub={`${monthlyCount} monthly`} />
        <StatCard title="Total Bookings" value={bookings.filter(b => b.status !== "cancelled").length} icon={Armchair} color="purple" />
        <StatCard title="Today Check-in" value={`${checkinRate}%`} icon={TrendingUp} color="amber" sub={`${todayBookings.filter(b => b.checkedIn).length}/${todayBookings.length}`} />
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Slot Popularity */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <BarChart3 size={18} className="text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Slot Popularity</h2>
          </div>
          <div className="space-y-4">
            {slotCounts.map(({ slot, count }) => (
              <div key={slot}>
                <div className="flex justify-between items-center mb-1.5">
                  <div className="flex items-center gap-2">
                    <SlotBadge slot={slot as SlotKey} size="sm" />
                    <span className="text-xs text-slate-400">{TIME_SLOTS[slot as SlotKey].time}</span>
                  </div>
                  <span className="text-sm font-bold text-slate-700">{count} bookings</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full transition-all"
                    style={{ width: `${(count / maxSlotCount) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Daily Bookings */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <TrendingUp size={18} className="text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Daily Bookings (Last 7 Days)</h2>
          </div>
          <div className="flex items-end gap-2 h-40">
            {dailyData.map(({ date, count }) => (
              <div key={date} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-semibold text-slate-600">{count}</span>
                <div className="w-full bg-indigo-100 rounded-t-lg overflow-hidden" style={{ height: "100px" }}>
                  <div className="w-full bg-indigo-500 rounded-t-lg transition-all"
                    style={{ height: `${(count / maxDaily) * 100}%`, marginTop: `${100 - (count / maxDaily) * 100}%` }} />
                </div>
                <span className="text-xs text-slate-400">{date}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Seats */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <Armchair size={18} className="text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Most Booked Seats</h2>
          </div>
          <div className="space-y-3">
            {seatUtil.map(({ seat, count }, i) => (
              <div key={seat.id} className="flex items-center gap-3">
                <span className="text-xs font-bold text-slate-400 w-5">#{i + 1}</span>
                <span className={`font-mono text-xs font-bold px-2 py-1 rounded-md ${
                  seat.type === "premium" ? "bg-amber-100 text-amber-700" :
                  seat.type === "semi-private" ? "bg-purple-100 text-purple-700" :
                  "bg-blue-100 text-blue-700"
                }`}>{seat.id}</span>
                <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${(count / maxSeatCount) * 100}%` }} />
                </div>
                <span className="text-xs font-semibold text-slate-600 w-8 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue & Plan Split */}
        <div className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-5">
            <PieChart size={18} className="text-indigo-600" />
            <h2 className="font-semibold text-slate-900">Revenue & Plans</h2>
          </div>

          {/* Revenue bar */}
          <div className="mb-6">
            <div className="flex justify-between text-xs text-slate-500 mb-1.5">
              <span>Revenue collection rate</span>
              <span>{Math.round((totalRevenue / (totalRevenue + pendingRevenue)) * 100) || 0}%</span>
            </div>
            <div className="h-4 bg-slate-100 rounded-full overflow-hidden flex">
              <div className="h-full bg-green-500 transition-all"
                style={{ width: `${(totalRevenue / (totalRevenue + pendingRevenue)) * 100 || 0}%` }} />
              <div className="h-full bg-red-400 transition-all"
                style={{ width: `${(pendingRevenue / (totalRevenue + pendingRevenue)) * 100 || 0}%` }} />
            </div>
            <div className="flex gap-4 mt-2 text-xs text-slate-500">
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-green-500 rounded-full" />Paid ₹{totalRevenue.toLocaleString()}</span>
              <span className="flex items-center gap-1"><span className="w-2 h-2 bg-red-400 rounded-full" />Pending ₹{pendingRevenue.toLocaleString()}</span>
            </div>
          </div>

          {/* Plan split */}
          <div>
            <p className="text-xs font-medium text-slate-500 mb-3">Plan Distribution</p>
            <div className="flex gap-4">
              <div className="flex-1 bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-indigo-600">{monthlyCount}</p>
                <p className="text-xs text-slate-500 mt-1">Monthly Plan</p>
              </div>
              <div className="flex-1 bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-2xl font-bold text-purple-600">{slotCount}</p>
                <p className="text-xs text-slate-500 mt-1">Slot-based</p>
              </div>
            </div>
          </div>

          {/* Payment status breakdown */}
          <div className="mt-4 grid grid-cols-3 gap-2">
            {(["paid", "pending", "overdue"] as const).map(status => {
              const count = students.filter(s => s.paymentStatus === status).length;
              const colors: Record<string, string> = { paid: "text-green-600 bg-green-50", pending: "text-yellow-600 bg-yellow-50", overdue: "text-red-600 bg-red-50" };
              return (
                <div key={status} className={`rounded-xl p-3 text-center ${colors[status]}`}>
                  <p className="text-lg font-bold">{count}</p>
                  <p className="text-xs capitalize">{status}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

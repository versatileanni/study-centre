"use client";
import { useState } from "react";
import { useStore } from "@/lib/useStore";
import { Payment } from "@/lib/types";
import Modal from "@/components/Modal";
import StatCard from "@/components/StatCard";
import { Plus, Search, CheckCircle, Clock, AlertCircle, CreditCard, TrendingUp, IndianRupee } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";

const EMPTY: Omit<Payment, "id"> = {
  studentId: "", amount: 0, date: format(new Date(), "yyyy-MM-dd"),
  status: "pending", description: "", month: format(new Date(), "yyyy-MM"),
};

export default function PaymentsPage() {
  const { students, payments, store } = useStore();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "paid" | "pending" | "overdue">("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<Omit<Payment, "id">>(EMPTY);

  const filtered = payments.filter(p => {
    const student = students.find(s => s.id === p.studentId);
    const matchSearch = !search || student?.name.toLowerCase().includes(search.toLowerCase()) || p.description.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || p.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPaid = payments.filter(p => p.status === "paid").reduce((s, p) => s + p.amount, 0);
  const totalPending = payments.filter(p => p.status === "pending").reduce((s, p) => s + p.amount, 0);
  const totalOverdue = payments.filter(p => p.status === "overdue").reduce((s, p) => s + p.amount, 0);

  const handleAdd = () => {
    if (!form.studentId || !form.amount || !form.description) return toast.error("Fill all required fields");
    store.addPayment(form);
    // Update student payment status
    store.updateStudent(form.studentId, { paymentStatus: form.status });
    toast.success("Payment recorded");
    setModalOpen(false);
    setForm(EMPTY);
  };

  const markPaid = (id: string, studentId: string) => {
    store.updatePayment(id, { status: "paid" });
    store.updateStudent(studentId, { paymentStatus: "paid" });
    toast.success("Marked as paid");
  };

  const statusIcon = (status: string) => {
    if (status === "paid") return <CheckCircle size={14} className="text-green-600" />;
    if (status === "overdue") return <AlertCircle size={14} className="text-red-500" />;
    return <Clock size={14} className="text-yellow-500" />;
  };

  const statusBadge = (status: string) => {
    const map: Record<string, string> = {
      paid: "bg-green-100 text-green-700",
      pending: "bg-yellow-100 text-yellow-700",
      overdue: "bg-red-100 text-red-700",
    };
    return map[status] ?? "bg-slate-100 text-slate-600";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Payments</h1>
          <p className="text-slate-500 text-sm">{payments.length} total transactions</p>
        </div>
        <button onClick={() => { setForm(EMPTY); setModalOpen(true); }}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Record Payment
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard title="Total Collected" value={`₹${totalPaid.toLocaleString()}`} icon={IndianRupee} color="green" />
        <StatCard title="Pending" value={`₹${totalPending.toLocaleString()}`} icon={Clock} color="amber" />
        <StatCard title="Overdue" value={`₹${totalOverdue.toLocaleString()}`} icon={AlertCircle} color="red" />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search student or description..."
            className="w-full pl-9 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
        </div>
        <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-xl px-1 py-1">
          {(["all", "paid", "pending", "overdue"] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all capitalize ${statusFilter === s ? "bg-indigo-600 text-white" : "text-slate-500 hover:bg-slate-100"}`}>
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Student</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Description</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Amount</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Date</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Status</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(p => {
                const student = students.find(s => s.id === p.studentId);
                return (
                  <tr key={p.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-xs flex-shrink-0">
                          {student?.name[0] ?? "?"}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{student?.name ?? "Unknown"}</p>
                          <p className="text-xs text-slate-400">{student?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">{p.description}</td>
                    <td className="px-4 py-3.5 font-semibold text-slate-900">₹{p.amount.toLocaleString()}</td>
                    <td className="px-4 py-3.5 text-slate-500 text-xs">{p.date}</td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-medium capitalize ${statusBadge(p.status)}`}>
                        {statusIcon(p.status)} {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      {p.status !== "paid" && (
                        <button onClick={() => markPaid(p.id, p.studentId)}
                          className="text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1.5 rounded-lg transition-colors font-medium">
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr><td colSpan={6} className="text-center py-10 text-slate-400">No payments found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Payment Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Record Payment">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Student *</label>
            <select value={form.studentId} onChange={e => setForm(f => ({ ...f, studentId: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Amount (₹) *</label>
              <input type="number" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="2500" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Date *</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Description *</label>
            <input value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Monthly Plan - April" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Status</label>
              <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value as Payment["status"] }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Month</label>
              <input type="month" value={form.month ?? ""} onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)}
              className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50">Cancel</button>
            <button onClick={handleAdd}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium">Record</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

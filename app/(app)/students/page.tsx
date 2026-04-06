"use client";
import { useState } from "react";
import { useStore } from "@/lib/useStore";
import { Student, SLOT_KEYS, TIME_SLOTS, SlotKey } from "@/lib/types";
import { SEATS } from "@/lib/seats";
import Modal from "@/components/Modal";
import SlotBadge from "@/components/SlotBadge";
import { Plus, Search, Edit2, Trash2, QrCode, Phone, Calendar, Copy, KeyRound, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";
import { format } from "date-fns";
import QRCode from "qrcode";

// Build WhatsApp message and open wa.me link
function sendWhatsApp(student: Student) {
  const slots = student.slots.map(s => `  • ${TIME_SLOTS[s].label} (${TIME_SLOTS[s].time})`).join("\n");
  const message = `🎓 *Welcome to StudyCentre!*

Hello *${student.name}*, your registration is confirmed. Here are your details:

━━━━━━━━━━━━━━━━━━
🪑 *Seat:* ${student.seatId || "To be assigned"}
📅 *Plan:* ${student.planType === "monthly" ? "Monthly" : "Slot-based"}
⏰ *Your Time Slots:*
${slots}

━━━━━━━━━━━━━━━━━━
🔐 *Login Credentials*
🌐 Portal: http://localhost:3001
👤 Username: \`${student.username}\`
🔑 Password: \`${student.password}\`

━━━━━━━━━━━━━━━━━━
📌 *Join Date:* ${student.joinDate}
💳 *Payment Status:* ${student.paymentStatus.toUpperCase()}

Thank you for choosing StudyCentre. Study hard! 📚`;

  const phone = student.phone.startsWith("+") ? student.phone.replace(/\D/g, "") : `91${student.phone}`;
  const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  window.open(url, "_blank");
}

const EMPTY: Omit<Student, "id" | "username" | "password"> = {
  name: "", phone: "", email: "", planType: "monthly",
  seatId: "", slots: [], joinDate: format(new Date(), "yyyy-MM-dd"),
  paymentStatus: "pending",
};

export default function StudentsPage() {
  const { students, store } = useStore();
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [qrModal, setQrModal] = useState<{ open: boolean; url: string; name: string }>({ open: false, url: "", name: "" });
  const [editing, setEditing] = useState<Student | null>(null);
  const [form, setForm] = useState<Omit<Student, "id" | "username" | "password">>(EMPTY);
  const [credModal, setCredModal] = useState<{ open: boolean; student: Student | null }>({ open: false, student: null });

  const filtered = students.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    s.phone.includes(search) ||
    s.seatId?.toLowerCase().includes(search.toLowerCase())
  );

  const openAdd = () => { setEditing(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (s: Student) => { setEditing(s); setForm({ ...s }); setModalOpen(true); };

  const handleSave = () => {
    if (!form.name || !form.phone) return toast.error("Name and phone are required");
    if (form.slots.length === 0) return toast.error("Select at least one slot");
    if (editing) {
      store.updateStudent(editing.id, form);
      toast.success("Student updated");
      setModalOpen(false);
    } else {
      const newStudent = store.addStudent(form);
      toast.success("Student added");
      setModalOpen(false);
      // Show credentials right after adding
      setCredModal({ open: true, student: newStudent });
      // Auto-open WhatsApp with registration message
      sendWhatsApp(newStudent);
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`Delete ${name}?`)) {
      store.deleteStudent(id);
      toast.success("Student removed");
    }
  };

  const showQR = async (s: Student) => {
    const data = JSON.stringify({ id: s.id, name: s.name, seat: s.seatId });
    const url = await QRCode.toDataURL(data, { width: 256, margin: 2 });
    setQrModal({ open: true, url, name: s.name });
  };

  const toggleSlot = (slot: SlotKey) => {
    setForm(f => ({
      ...f,
      slots: f.slots.includes(slot) ? f.slots.filter(s => s !== slot) : [...f.slots, slot]
    }));
  };

  const payBadge = (status: string) => {
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
          <h1 className="text-2xl font-bold text-slate-900">Students</h1>
          <p className="text-slate-500 text-sm">{students.length} registered students</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-medium transition-colors shadow-sm">
          <Plus size={16} /> Add Student
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, phone or seat..."
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="text-left px-5 py-3.5 font-semibold text-slate-600">Student</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Seat</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Slots</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Plan</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Login Credentials</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Payment</th>
                <th className="text-left px-4 py-3.5 font-semibold text-slate-600">Joined</th>
                <th className="px-4 py-3.5" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filtered.map(s => (
                <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-700 font-bold text-sm flex-shrink-0">
                        {s.name[0]}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{s.name}</p>
                        <p className="text-xs text-slate-400 flex items-center gap-1"><Phone size={10} />{s.phone}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="font-mono font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md text-xs">
                      {s.seatId || "—"}
                    </span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex flex-wrap gap-1">
                      {s.slots.map(slot => <SlotBadge key={slot} slot={slot} size="sm" />)}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className="text-xs capitalize text-slate-600">{s.planType}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-2">
                      <div className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                        <p className="text-xs text-slate-500 leading-tight">User: <span className="font-mono font-semibold text-slate-800">{s.username}</span></p>
                        <p className="text-xs text-slate-500 leading-tight">Pass: <span className="font-mono font-semibold text-slate-800">{s.password}</span></p>
                      </div>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(`Username: ${s.username}\nPassword: ${s.password}`);
                          toast.success("Credentials copied!");
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
                        title="Copy credentials"
                      >
                        <Copy size={13} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${payBadge(s.paymentStatus)}`}>
                      {s.paymentStatus}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-400">
                    <span className="flex items-center gap-1"><Calendar size={11} />{s.joinDate}</span>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1">
                      <button onClick={() => showQR(s)} className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors" title="QR Code">
                        <QrCode size={15} />
                      </button>
                      <button onClick={() => sendWhatsApp(s)} className="p-1.5 hover:bg-green-50 rounded-lg text-slate-400 hover:text-green-600 transition-colors" title="Send WhatsApp">
                        <MessageCircle size={15} />
                      </button>
                      <button onClick={() => openEdit(s)} className="p-1.5 hover:bg-indigo-50 rounded-lg text-slate-400 hover:text-indigo-600 transition-colors">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => handleDelete(s.id, s.name)} className="p-1.5 hover:bg-red-50 rounded-lg text-slate-400 hover:text-red-600 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-10 text-slate-400">No students found</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={editing ? "Edit Student" : "Add Student"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name *</label>
              <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="Student name" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Phone *</label>
              <input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="10-digit number" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
            <input value={form.email ?? ""} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
              className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" placeholder="optional" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Seat ID</label>
              <select value={form.seatId ?? ""} onChange={e => setForm(f => ({ ...f, seatId: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="">Select seat</option>
                {SEATS.map(s => <option key={s.id} value={s.id}>{s.id} ({s.type})</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Plan Type</label>
              <select value={form.planType} onChange={e => setForm(f => ({ ...f, planType: e.target.value as "monthly" | "slot-based" }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="monthly">Monthly</option>
                <option value="slot-based">Slot-based</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-600 mb-2">Time Slots *</label>
            <div className="grid grid-cols-2 gap-2">
              {SLOT_KEYS.map(slot => (
                <button key={slot} type="button" onClick={() => toggleSlot(slot)}
                  className={`flex items-center gap-2 px-3 py-2.5 rounded-xl border text-sm transition-all ${
                    form.slots.includes(slot)
                      ? "bg-indigo-600 border-indigo-600 text-white"
                      : "border-slate-200 text-slate-600 hover:border-indigo-300"
                  }`}>
                  <span className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${form.slots.includes(slot) ? "border-white bg-white" : "border-slate-300"}`}>
                    {form.slots.includes(slot) && <span className="w-2 h-2 bg-indigo-600 rounded-sm" />}
                  </span>
                  <span>{TIME_SLOTS[slot].label}</span>
                  <span className="text-xs opacity-70 ml-auto">{TIME_SLOTS[slot].time.split("–")[0].trim()}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Join Date</label>
              <input type="date" value={form.joinDate} onChange={e => setForm(f => ({ ...f, joinDate: e.target.value }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Payment Status</label>
              <select value={form.paymentStatus} onChange={e => setForm(f => ({ ...f, paymentStatus: e.target.value as Student["paymentStatus"] }))}
                className="w-full border border-slate-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-300">
                <option value="paid">Paid</option>
                <option value="pending">Pending</option>
                <option value="overdue">Overdue</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setModalOpen(false)}
              className="flex-1 border border-slate-200 text-slate-600 py-2.5 rounded-xl text-sm hover:bg-slate-50 transition-colors">
              Cancel
            </button>
            <button onClick={handleSave}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 rounded-xl text-sm font-medium transition-colors">
              {editing ? "Save Changes" : "Add Student"}
            </button>
          </div>
        </div>
      </Modal>

      {/* QR Modal */}
      <Modal open={qrModal.open} onClose={() => setQrModal(q => ({ ...q, open: false }))} title="Student QR Code" size="sm">
        <div className="flex flex-col items-center gap-4">
          <p className="text-slate-600 text-sm">{qrModal.name}</p>
          {qrModal.url && <img src={qrModal.url} alt="QR Code" className="w-48 h-48 rounded-xl border border-slate-200" />}
          <p className="text-xs text-slate-400 text-center">Student can use this QR code to check in at their seat</p>
          <a href={qrModal.url} download={`qr-${qrModal.name}.png`}
            className="w-full text-center bg-indigo-600 text-white py-2.5 rounded-xl text-sm font-medium hover:bg-indigo-700 transition-colors">
            Download QR
          </a>
        </div>
      </Modal>

      {/* Credentials Modal — shown right after adding a student */}
      <Modal open={credModal.open} onClose={() => setCredModal({ open: false, student: null })} title="Student Login Credentials" size="sm">
        {credModal.student && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-green-50 border border-green-200 rounded-xl">
              <KeyRound size={18} className="text-green-600 flex-shrink-0" />
              <p className="text-sm text-green-700 font-medium">Student account created successfully</p>
            </div>
            <p className="text-sm text-slate-500">Share these credentials with <strong>{credModal.student.name}</strong> so they can log in to their portal.</p>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Username</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{credModal.student.username}</span>
                  <button onClick={() => { navigator.clipboard.writeText(credModal.student!.username); toast.success("Copied!"); }}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700">
                    <Copy size={13} />
                  </button>
                </div>
              </div>
              <div className="border-t border-slate-200" />
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-500 font-medium">Password</span>
                <div className="flex items-center gap-2">
                  <span className="font-mono font-bold text-slate-900">{credModal.student.password}</span>
                  <button onClick={() => { navigator.clipboard.writeText(credModal.student!.password); toast.success("Copied!"); }}
                    className="p-1 hover:bg-slate-200 rounded text-slate-400 hover:text-slate-700">
                    <Copy size={13} />
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-400">Username = phone number · Password = SC@ + last 4 digits of phone</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`StudyCentre Login\nUsername: ${credModal.student!.username}\nPassword: ${credModal.student!.password}`);
                  toast.success("Both credentials copied!");
                }}
                className="flex-1 flex items-center justify-center gap-2 border border-slate-200 text-slate-700 py-2.5 rounded-xl text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                <Copy size={15} /> Copy
              </button>
              <button
                onClick={() => sendWhatsApp(credModal.student!)}
                className="flex-1 flex items-center justify-center gap-2 bg-green-500 hover:bg-green-600 text-white py-2.5 rounded-xl text-sm font-medium transition-colors"
              >
                <MessageCircle size={15} /> Send on WhatsApp
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

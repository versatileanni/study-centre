"use client";
import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Bot, User, Trash2, ChevronDown } from "lucide-react";
import clsx from "clsx";
import { useAuth } from "@/lib/auth";
import { useStore } from "@/lib/useStore";
import { format } from "date-fns";
import { TIME_SLOTS, SLOT_KEYS, SlotKey } from "@/lib/types";

// ── Types ──────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  role: "user" | "bot";
  text: string;
  timestamp: Date;
}

// ── Bot Brain ──────────────────────────────────────────────────────────────────
function useBotResponse() {
  const { user } = useAuth();
  const { students, bookings, payments, waitlist } = useStore();

  const respond = useCallback(
    (input: string): string => {
      const q = input.toLowerCase().trim();
      const today = format(new Date(), "yyyy-MM-dd");
      const isAdmin = user?.role === "admin";

      // ── Greetings ──
      if (/^(hi|hello|hey|howdy|hiya|good\s*(morning|afternoon|evening))/.test(q)) {
        return isAdmin
          ? `Hello, Admin! 👋 I can help you with student info, bookings, payments, and analytics. What do you need?`
          : `Hi there! 👋 I'm your StudyCentre assistant. I can help you with your bookings, seat info, payment status, and more. What can I do for you?`;
      }

      // ── Help menu ──
      if (/\b(help|what can you do|commands|options|menu)\b/.test(q)) {
        if (isAdmin) {
          return `Here's what I can help with:\n\n📊 **Students** – "how many students", "list overdue students", "find student [name]"\n📅 **Bookings** – "today's bookings", "bookings for morning slot"\n💰 **Payments** – "pending payments", "total revenue", "overdue payments"\n🪑 **Seats** – "available seats", "seat occupancy"\n📈 **Analytics** – "most popular slot", "occupancy rate"`;
        }
        return `Here's what I can help with:\n\n📅 **Bookings** – "my bookings", "my today's schedule"\n🪑 **Seat** – "my seat", "seat details"\n💰 **Payment** – "my payment status", "do I owe anything?"\n🕐 **Slots** – "what are the slot timings?"\n🔑 **Account** – "my username", "my login details"`;
      }

      // ════════════════════════════════
      //  ADMIN QUERIES
      // ════════════════════════════════
      if (isAdmin) {
        // Student count
        if (/how many students|student count|total students/.test(q)) {
          const paid = students.filter(s => s.paymentStatus === "paid").length;
          const pending = students.filter(s => s.paymentStatus === "pending").length;
          const overdue = students.filter(s => s.paymentStatus === "overdue").length;
          return `You have **${students.length}** students enrolled.\n• ✅ Paid: ${paid}\n• ⏳ Pending: ${pending}\n• ❗ Overdue: ${overdue}`;
        }

        // Find student by name
        const nameMatch = q.match(/(?:find|search|look up|who is|details of|info on)\s+(?:student\s+)?(.+)/);
        if (nameMatch) {
          const term = nameMatch[1].trim();
          const found = students.filter(s =>
            s.name.toLowerCase().includes(term) || s.phone.includes(term)
          );
          if (found.length === 0) return `No student found matching "${term}".`;
          return found
            .slice(0, 3)
            .map(
              s =>
                `**${s.name}** (${s.phone})\n• Seat: ${s.seatId ?? "none"} | Plan: ${s.planType}\n• Payment: ${s.paymentStatus} | Joined: ${s.joinDate}`
            )
            .join("\n\n");
        }

        // Overdue / pending students
        if (/overdue students|who owes|unpaid|overdue/.test(q)) {
          const list = students.filter(s => s.paymentStatus === "overdue");
          if (list.length === 0) return "No overdue payments right now. 🎉";
          return `**${list.length} students with overdue payments:**\n${list.map(s => `• ${s.name} (${s.phone})`).join("\n")}`;
        }

        if (/pending students|pending payment/.test(q)) {
          const list = students.filter(s => s.paymentStatus === "pending");
          if (list.length === 0) return "No pending payments. ✅";
          return `**${list.length} students with pending payments:**\n${list.map(s => `• ${s.name} (${s.phone})`).join("\n")}`;
        }

        // Revenue
        if (/revenue|total (paid|collected|earnings)|how much (earned|collected)/.test(q)) {
          const total = payments
            .filter(p => p.status === "paid")
            .reduce((s, p) => s + p.amount, 0);
          const pending = payments
            .filter(p => p.status !== "paid")
            .reduce((s, p) => s + p.amount, 0);
          return `💰 **Revenue Summary**\n• Collected: ₹${total.toLocaleString()}\n• Pending / Overdue: ₹${pending.toLocaleString()}\n• Total Expected: ₹${(total + pending).toLocaleString()}`;
        }

        // Today bookings
        if (/today.s bookings|bookings today|how many bookings today/.test(q)) {
          const todayB = bookings.filter(b => b.date === today && b.status !== "cancelled");
          const checkedIn = todayB.filter(b => b.checkedIn).length;
          return `📅 **Today's Bookings**\n• Total: ${todayB.length}\n• Checked In: ${checkedIn}\n• Yet to arrive: ${todayB.length - checkedIn}`;
        }

        // Bookings by slot
        const slotMatch = q.match(/\b(morning|midday|afternoon|evening)\b/);
        if (slotMatch && /booking|slot|student/.test(q)) {
          const slot = slotMatch[1] as SlotKey;
          const slotBookings = bookings.filter(
            b => b.slot === slot && b.date === today && b.status !== "cancelled"
          );
          const info = TIME_SLOTS[slot];
          return `**${info.label} slot** (${info.time}): **${slotBookings.length}** bookings today.${slotBookings.length > 0 ? `\nChecked in: ${slotBookings.filter(b => b.checkedIn).length}` : ""}`;
        }

        // Most popular slot
        if (/popular slot|busiest slot|most bookings/.test(q)) {
          const counts = SLOT_KEYS.map(slot => ({
            slot,
            count: bookings.filter(b => b.slot === slot && b.date === today && b.status !== "cancelled").length,
          }));
          counts.sort((a, b) => b.count - a.count);
          const top = counts[0];
          return `The **${TIME_SLOTS[top.slot].label}** slot is the most popular today with **${top.count}** bookings (${TIME_SLOTS[top.slot].time}).`;
        }

        // Occupancy rate
        if (/occupancy|utilization|fill rate/.test(q)) {
          const todayB = bookings.filter(b => b.date === today && b.status !== "cancelled");
          const totalSlots = 50 * 4; // 50 seats × 4 slots
          const rate = Math.round((todayB.length / totalSlots) * 100);
          return `📊 **Today's Occupancy Rate**: ${rate}%\n(${todayB.length} out of ${totalSlots} possible seat-slots)`;
        }

        // Waitlist
        if (/waitlist|waiting list/.test(q)) {
          if (waitlist.length === 0) return "No one is on the waitlist right now.";
          return `**Waitlist** has **${waitlist.length}** entr${waitlist.length === 1 ? "y" : "ies"}.`;
        }

        // Available seats
        if (/available seats|free seats|empty seats/.test(q)) {
          const { SEATS } = require("@/lib/seats");
          const todayB = bookings.filter(b => b.date === today && b.status !== "cancelled");
          const occupiedIds = new Set(todayB.map((b: { seatId: string }) => b.seatId));
          const free = SEATS.filter((s: { id: string }) => !occupiedIds.has(s.id));
          return `🪑 **${free.length} seats** have no bookings today out of ${SEATS.length} total.`;
        }

        // Slot timings
        if (/slot timing|what.*slot|slot schedule/.test(q)) {
          return `🕐 **Slot Timings:**\n${SLOT_KEYS.map(k => `• ${TIME_SLOTS[k].label}: ${TIME_SLOTS[k].time}`).join("\n")}`;
        }

        return `I'm not sure about that. Try asking about students, bookings, payments, or occupancy — or type **help** for a full list.`;
      }

      // ════════════════════════════════
      //  STUDENT QUERIES
      // ════════════════════════════════
      const me = students.find(s => s.id === user?.studentId);

      if (!me) {
        return "I couldn't find your student record. Please contact the admin.";
      }

      // My bookings
      if (/my booking|my schedule|when am i|my slot|today.*schedule|schedule.*today/.test(q)) {
        const myToday = bookings.filter(
          b => b.studentId === me.id && b.date === today && b.status !== "cancelled"
        );
        if (myToday.length === 0) return "You have no bookings for today.";
        return (
          `📅 **Your bookings for today:**\n` +
          myToday
            .map(b => `• ${TIME_SLOTS[b.slot].label} (${TIME_SLOTS[b.slot].time}) – Seat ${b.seatId}${b.checkedIn ? " ✅ Checked in" : ""}`)
            .join("\n")
        );
      }

      // My seat
      if (/my seat|which seat|seat number/.test(q)) {
        if (!me.seatId) return "You don't have an assigned seat yet. Please contact admin.";
        return `Your assigned seat is **${me.seatId}**. You can view it on the Seat Map page.`;
      }

      // Payment status
      if (/payment|fee|due|owe|paid|overdue|pending/.test(q)) {
        const myPayments = payments.filter(p => p.studentId === me.id);
        const latest = myPayments[myPayments.length - 1];
        const statusEmoji =
          me.paymentStatus === "paid" ? "✅" : me.paymentStatus === "pending" ? "⏳" : "❗";
        return (
          `💰 **Your Payment Status:** ${statusEmoji} ${me.paymentStatus}` +
          (latest
            ? `\n\nLatest payment:\n• ${latest.description}\n• Amount: ₹${latest.amount}\n• Date: ${latest.date}\n• Status: ${latest.status}`
            : "")
        );
      }

      // Slot timings
      if (/slot timing|what.*slot|slot schedule|time table|timetable/.test(q)) {
        return `🕐 **Slot Timings:**\n${SLOT_KEYS.map(k => `• ${TIME_SLOTS[k].label}: ${TIME_SLOTS[k].time}`).join("\n")}`;
      }

      // My plan
      if (/my plan|plan type|subscription|what plan/.test(q)) {
        return `You're on the **${me.planType === "monthly" ? "Monthly Plan" : "Slot-Based Plan"}**.\nYour enrolled slots: ${me.slots.map(s => TIME_SLOTS[s].label).join(", ")}.`;
      }

      // Account / credentials
      if (/username|login|credential|password|my account/.test(q)) {
        return `🔑 **Your Account**\n• Username: ${me.username}\n• Password: ${me.password}\n\nKeep these safe! Contact admin if you need to reset them.`;
      }

      // Contact / help admin
      if (/contact admin|speak to admin|admin help|reach admin/.test(q)) {
        return "To reach the admin, please visit the front desk or call the centre directly. The admin can help with seat changes, payment issues, and plan upgrades.";
      }

      // Joined date
      if (/join date|when did i join|member since|enrollment date/.test(q)) {
        return `You joined StudyCentre on **${me.joinDate}**. Welcome aboard! 🎓`;
      }

      // Waitlist
      if (/waitlist|am i on.*wait|waiting/.test(q)) {
        const myWait = waitlist.filter(w => w.studentId === me.id);
        if (myWait.length === 0) return "You're not on any waitlist currently.";
        return `You're on the waitlist for ${myWait.length} seat-slot${myWait.length > 1 ? "s" : ""}.`;
      }

      // Fallback
      return `I didn't quite understand that. Try asking about your bookings, seat, payment status, or slot timings — or type **help** for options.`;
    },
    [user, students, bookings, payments, waitlist]
  );

  return respond;
}

// ── Markdown-lite renderer ─────────────────────────────────────────────────────
function BotText({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <span className="whitespace-pre-wrap text-sm leading-relaxed">
      {lines.map((line, i) => {
        // Bold: **text**
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        return (
          <span key={i}>
            {parts.map((part, j) =>
              part.startsWith("**") && part.endsWith("**") ? (
                <strong key={j}>{part.slice(2, -2)}</strong>
              ) : (
                part
              )
            )}
            {i < lines.length - 1 && "\n"}
          </span>
        );
      })}
    </span>
  );
}

// ── Quick suggestion chips ─────────────────────────────────────────────────────
function SuggestionChips({
  isAdmin,
  onSelect,
}: {
  isAdmin: boolean;
  onSelect: (s: string) => void;
}) {
  const adminChips = [
    "How many students?",
    "Today's bookings",
    "Pending payments",
    "Most popular slot",
    "Total revenue",
    "Occupancy rate",
  ];
  const studentChips = [
    "My bookings today",
    "My seat",
    "My payment status",
    "Slot timings",
    "My plan",
    "My account",
  ];
  const chips = isAdmin ? adminChips : studentChips;

  return (
    <div className="flex flex-wrap gap-1.5 px-3 pb-2">
      {chips.map((chip) => (
        <button
          key={chip}
          onClick={() => onSelect(chip)}
          className="text-xs bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-full px-2.5 py-1 transition-colors border border-indigo-100"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}

// ── Main ChatBot component ─────────────────────────────────────────────────────
export default function ChatBot() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(true);
  const [unread, setUnread] = useState(0);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const respond = useBotResponse();

  const isAdmin = user?.role === "admin";

  // Initial greeting on first open
  useEffect(() => {
    if (open && messages.length === 0) {
      const greeting: Message = {
        id: "init",
        role: "bot",
        text: isAdmin
          ? "Hello, Admin! 👋 I'm your StudyCentre assistant. Ask me anything about students, bookings, payments, or analytics.\n\nType **help** to see all options."
          : "Hi there! 👋 I'm your StudyCentre assistant. I can answer questions about your bookings, seat, payments, and more.\n\nType **help** to see all options.",
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }
    if (open) {
      setUnread(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const sendMessage = useCallback(
    (text?: string) => {
      const msg = (text ?? input).trim();
      if (!msg) return;

      const userMsg: Message = {
        id: `u${Date.now()}`,
        role: "user",
        text: msg,
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setInput("");
      setShowSuggestions(false);
      setIsTyping(true);

      // Simulate a short think-delay
      setTimeout(() => {
        const reply = respond(msg);
        const botMsg: Message = {
          id: `b${Date.now()}`,
          role: "bot",
          text: reply,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, botMsg]);
        setIsTyping(false);
        if (!open) setUnread((n) => n + 1);
      }, 600);
    },
    [input, respond, open]
  );

  const clearChat = () => {
    setMessages([]);
    setShowSuggestions(true);
    setTimeout(() => {
      const greeting: Message = {
        id: `init${Date.now()}`,
        role: "bot",
        text: isAdmin
          ? "Hello, Admin! 👋 How can I help you today? Type **help** for options."
          : "Hi again! 👋 How can I help you? Type **help** for options.",
        timestamp: new Date(),
      };
      setMessages([greeting]);
    }, 50);
  };

  if (!user) return null;

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? "Close chat" : "Open chat assistant"}
        className={clsx(
          "fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300",
          open
            ? "bg-slate-700 hover:bg-slate-800"
            : "bg-indigo-600 hover:bg-indigo-700 hover:scale-105"
        )}
      >
        {open ? (
          <ChevronDown size={22} className="text-white" />
        ) : (
          <>
            <MessageCircle size={24} className="text-white" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={clsx(
          "fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col transition-all duration-300 origin-bottom-right",
          open
            ? "opacity-100 scale-100 pointer-events-auto"
            : "opacity-0 scale-95 pointer-events-none"
        )}
        style={{ maxHeight: "70vh", minHeight: "420px" }}
        role="dialog"
        aria-label="Chat assistant"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-indigo-600 rounded-t-2xl">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
              <Bot size={17} className="text-white" />
            </div>
            <div>
              <p className="text-white font-semibold text-sm leading-tight">StudyCentre Assistant</p>
              <p className="text-indigo-200 text-xs">
                {isAdmin ? "Admin mode" : "Student support"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={clearChat}
              title="Clear chat"
              className="p-1.5 rounded-lg hover:bg-white/20 text-indigo-200 hover:text-white transition-colors"
            >
              <Trash2 size={15} />
            </button>
            <button
              onClick={() => setOpen(false)}
              title="Close"
              className="p-1.5 rounded-lg hover:bg-white/20 text-indigo-200 hover:text-white transition-colors"
            >
              <X size={15} />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={clsx(
                "flex gap-2 items-end",
                msg.role === "user" ? "flex-row-reverse" : "flex-row"
              )}
            >
              {/* Avatar */}
              <div
                className={clsx(
                  "w-6 h-6 rounded-full flex-shrink-0 flex items-center justify-center text-white",
                  msg.role === "bot" ? "bg-indigo-600" : "bg-slate-400"
                )}
              >
                {msg.role === "bot" ? (
                  <Bot size={13} />
                ) : (
                  <User size={13} />
                )}
              </div>

              {/* Bubble */}
              <div
                className={clsx(
                  "max-w-[80%] rounded-2xl px-3 py-2 text-sm",
                  msg.role === "bot"
                    ? "bg-slate-100 text-slate-800 rounded-bl-sm"
                    : "bg-indigo-600 text-white rounded-br-sm"
                )}
              >
                {msg.role === "bot" ? (
                  <BotText text={msg.text} />
                ) : (
                  <span className="text-sm">{msg.text}</span>
                )}
                <p
                  className={clsx(
                    "text-[10px] mt-1 text-right",
                    msg.role === "bot" ? "text-slate-400" : "text-indigo-200"
                  )}
                >
                  {format(msg.timestamp, "HH:mm")}
                </p>
              </div>
            </div>
          ))}

          {/* Typing indicator */}
          {isTyping && (
            <div className="flex gap-2 items-end">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center text-white flex-shrink-0">
                <Bot size={13} />
              </div>
              <div className="bg-slate-100 rounded-2xl rounded-bl-sm px-3 py-2.5 flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:150ms]" />
                <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion chips */}
        {showSuggestions && messages.length <= 1 && (
          <SuggestionChips
            isAdmin={isAdmin}
            onSelect={(chip) => {
              setShowSuggestions(false);
              sendMessage(chip);
            }}
          />
        )}

        {/* Input bar */}
        <div className="border-t border-slate-100 px-3 py-3">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage();
            }}
            className="flex gap-2"
          >
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask me anything…"
              className="flex-1 text-sm bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 outline-none focus:ring-2 focus:ring-indigo-300 focus:border-indigo-400 placeholder-slate-400 transition-all"
              aria-label="Chat input"
            />
            <button
              type="submit"
              disabled={!input.trim() || isTyping}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-xl px-3 py-2 transition-colors"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </form>
        </div>
      </div>
    </>
  );
}

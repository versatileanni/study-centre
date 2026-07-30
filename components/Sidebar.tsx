"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Users, CalendarCheck, Map, CreditCard,
  BarChart3, LogOut, BookOpen, Menu, X, Home
} from "lucide-react";
import { useState } from "react";
import clsx from "clsx";

const ADMIN_NAV = [
  { href: "/dashboard",  label: "Dashboard",   icon: LayoutDashboard },
  { href: "/students",   label: "Students",    icon: Users },
  { href: "/bookings",   label: "Bookings",    icon: CalendarCheck },
  { href: "/seat-map",   label: "Seat Map",    icon: Map },
  { href: "/payments",   label: "Payments",    icon: CreditCard },
  { href: "/analytics",  label: "Analytics",   icon: BarChart3 },
];

const STUDENT_NAV = [
  { href: "/my-portal",  label: "My Portal",   icon: Home },
  { href: "/seat-map",   label: "Seat Map",    icon: Map },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);

  const nav = user?.role === "admin" ? ADMIN_NAV : STUDENT_NAV;

  const NavLinks = () => (
    <nav className="flex-1 px-3 py-4 space-y-1">
      {nav.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          onClick={() => setOpen(false)}
          className={clsx(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all",
            pathname.startsWith(href)
              ? "bg-indigo-600 text-white shadow-md shadow-indigo-200"
              : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          )}
        >
          <Icon size={18} />
          {label}
        </Link>
      ))}
    </nav>
  );

  return (
    <>
      <button
        className="fixed top-4 left-4 z-50 md:hidden bg-white shadow-md rounded-lg p-2"
        onClick={() => setOpen(!open)}
      >
        {open ? <X size={20} /> : <Menu size={20} />}
      </button>

      {open && (
        <div className="fixed inset-0 bg-black/40 z-40 md:hidden" onClick={() => setOpen(false)} />
      )}

      <aside className={clsx(
        "fixed top-0 left-0 h-full w-64 bg-white border-r border-slate-200 flex flex-col z-40 transition-transform duration-300",
        "md:translate-x-0",
        open ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-100">
          <div className="w-9 h-9 bg-indigo-600 rounded-xl flex items-center justify-center">
            <BookOpen size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-slate-900 text-sm leading-tight">StudyCentre</p>
            <p className="text-xs text-slate-400">
              {user?.role === "admin" ? "Admin Panel" : "Student Portal"}
            </p>
          </div>
        </div>

        <NavLinks />

        <div className="px-4 py-4 border-t border-slate-100">
          <div className="flex items-center gap-3 mb-3">
            <div className={clsx(
              "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm",
              user?.role === "admin" ? "bg-indigo-100 text-indigo-700" : "bg-green-100 text-green-700"
            )}>
              {user?.username[0].toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-800 capitalize">{user?.username}</p>
              <span className={clsx(
                "text-xs px-1.5 py-0.5 rounded-full font-medium capitalize",
                user?.role === "admin" ? "bg-indigo-100 text-indigo-600" : "bg-green-100 text-green-600"
              )}>
                {user?.role}
              </span>
            </div>
          </div>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-sm text-red-500 hover:text-red-700 transition-colors w-full px-2 py-1.5 rounded-lg hover:bg-red-50"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
      </aside>
    </>
  );
}

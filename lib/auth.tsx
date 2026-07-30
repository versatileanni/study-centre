"use client";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { Student } from "./types";

interface AuthUser { username: string; role: "admin" | "student"; studentId?: string }
interface AuthCtx { user: AuthUser | null; login: (u: string, p: string) => boolean; logout: () => void }

const AuthContext = createContext<AuthCtx>({ user: null, login: () => false, logout: () => {} });

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("sc_user");
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const login = (username: string, password: string): boolean => {
    // Admin check (hardcoded)
    if (username === "admin" && password === "admin123") {
      const u: AuthUser = { username: "admin", role: "admin" };
      setUser(u);
      localStorage.setItem("sc_user", JSON.stringify(u));
      return true;
    }

    // Student check — look up from localStorage store
    try {
      const raw = localStorage.getItem("sc_students");
      const students: Student[] = raw ? JSON.parse(raw) : [];
      const match = students.find(
        s => s.username === username && s.password === password
      );
      if (match) {
        const u: AuthUser = { username: match.username, role: "student", studentId: match.id };
        setUser(u);
        localStorage.setItem("sc_user", JSON.stringify(u));
        return true;
      }
    } catch { /* ignore */ }

    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("sc_user");
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

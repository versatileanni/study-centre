import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { Toaster } from "react-hot-toast";

const geist = Geist({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "StudyCentre – Premium Library Management",
  description: "Manage seats, slots, students and payments for your premium study centre",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-slate-50 text-slate-900 antialiased`}>
        <AuthProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ className: "text-sm" }} />
        </AuthProvider>
      </body>
    </html>
  );
}

"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) router.replace("/login");
    else if (user.role === "admin") router.replace("/dashboard");
    else router.replace("/my-portal");
  }, [user, router]);

  return null;
}

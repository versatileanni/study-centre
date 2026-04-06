"use client";
import { useEffect, useState } from "react";
import { store } from "./store";

export function useStore() {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    store.init();
    setTick(t => t + 1);
    return store.subscribe(() => setTick(t => t + 1));
  }, []);

  return {
    students: store.students,
    bookings: store.bookings,
    payments: store.payments,
    waitlist: store.waitlist,
    store,
    tick,
  };
}

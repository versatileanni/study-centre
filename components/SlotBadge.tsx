import { SlotKey, TIME_SLOTS } from "@/lib/types";
import clsx from "clsx";

interface Props {
  slot: SlotKey;
  status?: "available" | "occupied" | "reserved" | "active";
  size?: "sm" | "md";
}

const statusColors = {
  available: "bg-green-100 text-green-700 border-green-200",
  occupied:  "bg-red-100 text-red-700 border-red-200",
  reserved:  "bg-yellow-100 text-yellow-700 border-yellow-200",
  active:    "bg-indigo-100 text-indigo-700 border-indigo-200",
};

export default function SlotBadge({ slot, status = "active", size = "md" }: Props) {
  const s = TIME_SLOTS[slot];
  return (
    <span className={clsx(
      "inline-flex items-center rounded-full border font-medium",
      statusColors[status],
      size === "sm" ? "text-xs px-2 py-0.5" : "text-xs px-2.5 py-1"
    )}>
      {s.label}
    </span>
  );
}

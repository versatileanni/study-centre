import { LucideIcon } from "lucide-react";
import clsx from "clsx";

interface Props {
  title: string;
  value: string | number;
  icon: LucideIcon;
  color?: "indigo" | "green" | "amber" | "red" | "purple";
  sub?: string;
}

const colors = {
  indigo: { bg: "bg-indigo-50", icon: "bg-indigo-600 text-white", text: "text-indigo-600" },
  green:  { bg: "bg-green-50",  icon: "bg-green-600 text-white",  text: "text-green-600" },
  amber:  { bg: "bg-amber-50",  icon: "bg-amber-500 text-white",  text: "text-amber-600" },
  red:    { bg: "bg-red-50",    icon: "bg-red-500 text-white",    text: "text-red-600" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-600 text-white", text: "text-purple-600" },
};

export default function StatCard({ title, value, icon: Icon, color = "indigo", sub }: Props) {
  const c = colors[color];
  return (
    <div className={clsx("rounded-2xl p-5 flex items-center gap-4", c.bg)}>
      <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0", c.icon)}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm text-slate-500 font-medium">{title}</p>
        <p className={clsx("text-2xl font-bold", c.text)}>{value}</p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

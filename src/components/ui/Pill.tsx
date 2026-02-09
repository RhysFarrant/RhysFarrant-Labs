import type { ReactNode } from "react";

type PillTone = "wip" | "stable" | "archived";

type PillProps = {
  tone: PillTone;
  children: ReactNode;
};

const toneClasses: Record<PillTone, string> = {
  wip: "border-amber-400/35 bg-amber-400/10 text-amber-300",
  stable: "border-emerald-400/35 bg-emerald-400/10 text-emerald-300",
  archived: "border-slate-400/35 bg-slate-400/10 text-slate-300",
};

export default function Pill({ tone, children }: PillProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${toneClasses[tone]}`}
    >
      {children}
    </span>
  );
}

import type { ReactNode } from "react";

type LabFrameProps = {
  children: ReactNode;
};

export default function LabFrame({ children }: LabFrameProps) {
  return (
    <section className="rounded-xl border border-border-subtle bg-surface/60 p-5 sm:p-6">
      {children}
    </section>
  );
}

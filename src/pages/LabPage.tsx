import { Suspense } from "react";
import { Link } from "react-router-dom";
import LabFrame from "@/components/labs/LabFrame";
import LabMeta from "@/components/labs/LabMeta";
import type { LabDef } from "@/data/labs";

type LabPageProps = {
  lab: LabDef;
};

export default function LabPage({ lab }: LabPageProps) {
  const LabComponent = lab.component;

  return (
    <section className="px-6 py-8 sm:px-10 sm:py-10">
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-text-primary"
          >
            <span aria-hidden="true">&larr;</span>
            Back to Labs
          </Link>
          <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{lab.name}</h1>
          <p className="mt-2 text-sm text-text-secondary">{lab.description}</p>
        </div>
        <LabMeta lab={lab} />
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {lab.stack.map((item) => (
          <span
            key={item}
            className="rounded-full border border-border/70 px-2.5 py-1 text-[11px] text-text-muted"
          >
            {item}
          </span>
        ))}
      </div>

      <Suspense
        fallback={
          <LabFrame>
            <p className="text-sm text-text-muted">Loading lab...</p>
          </LabFrame>
        }
      >
        <LabFrame>
          <LabComponent />
        </LabFrame>
      </Suspense>
    </section>
  );
}

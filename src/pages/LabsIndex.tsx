import { useMemo, useState } from "react";
import LabCard from "@/components/labs/LabCard";
import { labs, type LabStatus } from "@/data/labs";
import Input from "@/components/ui/Input";

const statusOptions: Array<"All" | LabStatus> = [
  "All",
  "WIP",
  "Stable",
  "Archived",
];

export default function LabsIndex() {
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | LabStatus>("All");

  const visibleLabs = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    return labs.filter((lab) => {
      const statusMatch = status === "All" || lab.status === status;
      const textMatch =
        normalizedQuery.length === 0 ||
        lab.name.toLowerCase().includes(normalizedQuery) ||
        lab.description.toLowerCase().includes(normalizedQuery) ||
        lab.stack.join(" ").toLowerCase().includes(normalizedQuery);

      return statusMatch && textMatch;
    });
  }, [query, status]);

  return (
    <section className="hero-gradient px-6 py-8 sm:px-10 sm:py-10">
      <div className="mb-8">
        <p className="mb-2 text-[11px] uppercase tracking-[0.18em] text-text-muted">
          Labs Workspace
        </p>
        <h1 className="text-3xl font-bold sm:text-4xl">Labs</h1>
        <p className="mt-2 max-w-3xl text-sm text-text-secondary sm:text-base">
          Experiments, prototypes, and test builds.
        </p>
      </div>

      <div className="mb-6 grid gap-3 sm:grid-cols-[1fr_180px]">
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search name, description, or stack..."
          aria-label="Search labs"
        />
        <select
          value={status}
          onChange={(event) => setStatus(event.target.value as "All" | LabStatus)}
          className="w-full rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent/60"
          aria-label="Filter by status"
        >
          {statusOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {visibleLabs.length === 0 ? (
        <div className="rounded-xl border border-border bg-surface/50 p-6 text-sm text-text-muted">
          No labs match your filters.
        </div>
      ) : (
        <div className="grid gap-4 [grid-template-columns:repeat(auto-fit,minmax(280px,1fr))]">
          {visibleLabs.map((lab) => (
            <LabCard key={lab.slug} lab={lab} />
          ))}
        </div>
      )}
    </section>
  );
}

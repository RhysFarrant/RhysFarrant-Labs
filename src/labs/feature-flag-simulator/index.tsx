import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";

const flagDefinitions = [
  {
    key: "newNavigation",
    label: "New Navigation",
    description: "Switches between the classic menu and the redesigned multi-tab navigation.",
  },
  {
    key: "betaCheckout",
    label: "Beta Checkout",
    description: "Enables a faster checkout experience that is still under validation.",
  },
  {
    key: "advancedAnalytics",
    label: "Advanced Analytics",
    description: "Shows richer KPI cards and trend context for product teams.",
  },
  {
    key: "aiCopilot",
    label: "AI Copilot",
    description: "Adds contextual assistant prompts in the preview workspace.",
  },
  {
    key: "maintenanceMode",
    label: "Maintenance Mode",
    description: "Locks interactive actions and displays a global maintenance notice.",
  },
] as const;

type FlagKey = (typeof flagDefinitions)[number]["key"];

type Environment = "development" | "staging" | "production";
type Segment = "anonymous" | "free" | "pro" | "internal";
type OverrideMode = "inherit" | "on" | "off";

type FlagState = Record<FlagKey, boolean>;
type OverrideState = Record<FlagKey, OverrideMode>;

const environments: Environment[] = ["development", "staging", "production"];
const segments: Segment[] = ["anonymous", "free", "pro", "internal"];

const environmentDefaults: Record<Environment, FlagState> = {
  development: {
    newNavigation: true,
    betaCheckout: true,
    advancedAnalytics: true,
    aiCopilot: true,
    maintenanceMode: false,
  },
  staging: {
    newNavigation: true,
    betaCheckout: true,
    advancedAnalytics: false,
    aiCopilot: true,
    maintenanceMode: false,
  },
  production: {
    newNavigation: false,
    betaCheckout: false,
    advancedAnalytics: true,
    aiCopilot: false,
    maintenanceMode: false,
  },
};

const segmentOverrides: Record<Segment, Partial<FlagState>> = {
  anonymous: {
    advancedAnalytics: false,
    aiCopilot: false,
  },
  free: {
    advancedAnalytics: false,
  },
  pro: {
    newNavigation: true,
    advancedAnalytics: true,
    aiCopilot: true,
  },
  internal: {
    newNavigation: true,
    betaCheckout: true,
    advancedAnalytics: true,
    aiCopilot: true,
  },
};

const segmentNotes: Record<Segment, string> = {
  anonymous: "Unregistered traffic; conservative feature access.",
  free: "Signed-in free users; balanced exposure.",
  pro: "Paying customers; faster rollout for value features.",
  internal: "Staff and QA users; full feature visibility.",
};

const overrideLabel: Record<OverrideMode, string> = {
  inherit: "Inherit",
  on: "Force ON",
  off: "Force OFF",
};

function createInitialOverrides(): OverrideState {
  return flagDefinitions.reduce((state, flag) => {
    state[flag.key] = "inherit";
    return state;
  }, {} as OverrideState);
}

function cycleOverride(value: OverrideMode): OverrideMode {
  if (value === "inherit") return "on";
  if (value === "on") return "off";
  return "inherit";
}

function toTitleCase(value: string): string {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export default function FeatureFlagSimulatorLab() {
  const [environment, setEnvironment] = useState<Environment>("staging");
  const [segment, setSegment] = useState<Segment>("free");
  const [overrides, setOverrides] = useState<OverrideState>(createInitialOverrides);

  const resolvedFlags = useMemo(() => {
    return flagDefinitions.reduce((state, flag) => {
      const envValue = environmentDefaults[environment][flag.key];
      const segmentValue = segmentOverrides[segment][flag.key];
      const overrideValue = overrides[flag.key];

      if (overrideValue === "on" || overrideValue === "off") {
        state[flag.key] = {
          enabled: overrideValue === "on",
          source: "Manual override",
        };
        return state;
      }

      if (typeof segmentValue === "boolean") {
        state[flag.key] = {
          enabled: segmentValue,
          source: `Segment (${toTitleCase(segment)})`,
        };
        return state;
      }

      state[flag.key] = {
        enabled: envValue,
        source: `Environment (${toTitleCase(environment)})`,
      };
      return state;
    }, {} as Record<FlagKey, { enabled: boolean; source: string }>);
  }, [environment, segment, overrides]);

  const effectiveFlags = useMemo(() => {
    return flagDefinitions.reduce((state, flag) => {
      state[flag.key] = resolvedFlags[flag.key].enabled;
      return state;
    }, {} as FlagState);
  }, [resolvedFlags]);

  const enabledCount = useMemo(() => {
    return flagDefinitions.filter((flag) => effectiveFlags[flag.key]).length;
  }, [effectiveFlags]);

  const behaviorNotes = useMemo(() => {
    const notes: string[] = [];

    notes.push(
      effectiveFlags.newNavigation
        ? "Preview uses the redesigned navigation layout."
        : "Preview uses the classic navigation layout."
    );

    notes.push(
      effectiveFlags.betaCheckout
        ? "Checkout card includes the beta accelerated flow."
        : "Checkout card stays on the stable purchase flow."
    );

    notes.push(
      effectiveFlags.advancedAnalytics
        ? "Analytics panel shows advanced KPI and trend context."
        : "Analytics panel falls back to baseline metrics."
    );

    if (effectiveFlags.maintenanceMode) {
      notes.push("Maintenance mode suppresses interactive actions and checkout submission.");
    }

    if (effectiveFlags.betaCheckout && effectiveFlags.maintenanceMode) {
      notes.push("Beta checkout is configured but not reachable during maintenance.");
    }

    return notes;
  }, [effectiveFlags]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Feature Flag Simulator</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Toggle environment, segment, and overrides to see how flag-driven UI behavior changes in
          real time.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[360px_1fr]">
        <section className="space-y-4 rounded-xl border border-border bg-bg/35 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Context</p>
            <div className="mt-2 grid gap-2">
              <label className="text-xs text-text-muted">
                Environment
                <select
                  value={environment}
                  onChange={(event) => setEnvironment(event.target.value as Environment)}
                  className="mt-1 w-full rounded-lg border border-border bg-surface/75 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent/60"
                >
                  {environments.map((option) => (
                    <option key={option} value={option}>
                      {toTitleCase(option)}
                    </option>
                  ))}
                </select>
              </label>

              <label className="text-xs text-text-muted">
                User Segment
                <select
                  value={segment}
                  onChange={(event) => setSegment(event.target.value as Segment)}
                  className="mt-1 w-full rounded-lg border border-border bg-surface/75 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent/60"
                >
                  {segments.map((option) => (
                    <option key={option} value={option}>
                      {toTitleCase(option)}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <p className="mt-2 text-[11px] text-text-muted">{segmentNotes[segment]}</p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Flags</p>
            <Button variant="ghost" onClick={() => setOverrides(createInitialOverrides())}>
              Reset Overrides
            </Button>
          </div>

          <div className="space-y-2">
            {flagDefinitions.map((flag) => {
              const resolved = resolvedFlags[flag.key];
              const currentOverride = overrides[flag.key];
              return (
                <article key={flag.key} className="rounded-lg border border-border/70 bg-surface/45 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-text-primary">{flag.label}</p>
                      <p className="mt-1 text-xs text-text-muted">{flag.description}</p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-1 text-[10px] font-semibold tracking-[0.08em] ${
                        resolved.enabled
                          ? "border-emerald-400/35 bg-emerald-400/10 text-emerald-300"
                          : "border-rose-400/35 bg-rose-400/10 text-rose-300"
                      }`}
                    >
                      {resolved.enabled ? "ON" : "OFF"}
                    </span>
                  </div>

                  <p className="mt-2 text-[11px] text-text-muted">Source: {resolved.source}</p>

                  <button
                    type="button"
                    onClick={() =>
                      setOverrides((current) => ({
                        ...current,
                        [flag.key]: cycleOverride(current[flag.key]),
                      }))
                    }
                    className="mt-2 rounded-md border border-border bg-surface/70 px-2.5 py-1.5 text-[11px] font-medium text-text-secondary transition-colors hover:text-text-primary"
                  >
                    Override: {overrideLabel[currentOverride]}
                  </button>
                </article>
              );
            })}
          </div>

          <div className="rounded-lg border border-border/70 bg-surface/45 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Effective Store</p>
            <pre className="mt-2 overflow-x-auto text-[11px] text-text-secondary">
{JSON.stringify(
  {
    environment,
    segment,
    flags: effectiveFlags,
  },
  null,
  2
)}
            </pre>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface/55 p-4 sm:p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Live Preview</p>
              <h3 className="text-lg font-semibold">Product Dashboard</h3>
            </div>
            <span className="rounded-full border border-accent/40 bg-accent/10 px-2.5 py-1 text-[11px] text-text-secondary">
              {enabledCount}/{flagDefinitions.length} flags enabled
            </span>
          </div>

          {effectiveFlags.maintenanceMode ? (
            <div className="mb-3 rounded-lg border border-rose-400/35 bg-rose-400/10 px-3 py-2 text-xs text-rose-200">
              Maintenance mode active. Checkout and interactive actions are temporarily disabled.
            </div>
          ) : null}

          <div className="overflow-hidden rounded-xl border border-border bg-bg/45">
            <header className="border-b border-border px-4 py-3">
              {effectiveFlags.newNavigation ? (
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Workspace Navigation v2</p>
                  <nav className="flex gap-2 text-xs text-text-muted">
                    <span className="rounded-full border border-border px-2 py-1">Overview</span>
                    <span className="rounded-full border border-border px-2 py-1">Funnels</span>
                    <span className="rounded-full border border-border px-2 py-1">Experiments</span>
                  </nav>
                </div>
              ) : (
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-semibold">Classic Navigation</p>
                  <nav className="flex gap-3 text-xs text-text-muted">
                    <span>Home</span>
                    <span>Reports</span>
                    <span>Settings</span>
                  </nav>
                </div>
              )}
            </header>

            <div className="grid gap-3 p-4 md:grid-cols-2">
              <article className="rounded-lg border border-border bg-surface/65 p-3">
                <p className="text-xs uppercase tracking-[0.1em] text-text-muted">Checkout</p>
                <p className="mt-1 text-sm text-text-secondary">
                  {effectiveFlags.betaCheckout
                    ? "Beta checkout flow with express payment and saved profile hints."
                    : "Stable checkout flow with standard billing and confirmation steps."}
                </p>
                <button
                  type="button"
                  disabled={effectiveFlags.maintenanceMode}
                  className="mt-3 rounded-md border border-accent/50 bg-accent/20 px-3 py-1.5 text-xs font-medium text-text-primary disabled:cursor-not-allowed disabled:opacity-45"
                >
                  {effectiveFlags.betaCheckout ? "Try Beta Checkout" : "Open Checkout"}
                </button>
              </article>

              <article className="rounded-lg border border-border bg-surface/65 p-3">
                <p className="text-xs uppercase tracking-[0.1em] text-text-muted">Analytics</p>
                {effectiveFlags.advancedAnalytics ? (
                  <div className="mt-2 grid grid-cols-3 gap-2 text-xs">
                    <div className="rounded-md border border-border/70 bg-bg/45 px-2 py-2">
                      <p className="text-[11px] text-text-muted">Conversion</p>
                      <p className="mt-1 text-sm font-semibold text-text-primary">6.4%</p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-bg/45 px-2 py-2">
                      <p className="text-[11px] text-text-muted">ARPU</p>
                      <p className="mt-1 text-sm font-semibold text-text-primary">$47.20</p>
                    </div>
                    <div className="rounded-md border border-border/70 bg-bg/45 px-2 py-2">
                      <p className="text-[11px] text-text-muted">Trend</p>
                      <p className="mt-1 text-sm font-semibold text-emerald-300">+3.1%</p>
                    </div>
                  </div>
                ) : (
                  <p className="mt-1 text-sm text-text-secondary">
                    Baseline metrics only. Enable Advanced Analytics for richer KPI cards.
                  </p>
                )}
              </article>

              <article className="rounded-lg border border-border bg-surface/65 p-3 md:col-span-2">
                <p className="text-xs uppercase tracking-[0.1em] text-text-muted">Assistant</p>
                {effectiveFlags.aiCopilot ? (
                  <p className="mt-1 text-sm text-text-secondary">
                    AI Copilot is active and can suggest optimization ideas for selected funnels.
                  </p>
                ) : (
                  <p className="mt-1 text-sm text-text-secondary">
                    AI Copilot is hidden for this configuration.
                  </p>
                )}
              </article>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-border bg-bg/25 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Behavior Snapshot</p>
            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
              {behaviorNotes.map((note) => (
                <li key={note}>- {note}</li>
              ))}
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

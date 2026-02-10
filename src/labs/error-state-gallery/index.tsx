import { useEffect, useMemo, useState } from "react";
import Button from "@/components/ui/Button";

type ErrorSurface = "inline" | "banner" | "modal" | "toast";
type ErrorSeverity = "low" | "medium" | "high";

type ErrorScenario = {
  id: string;
  label: string;
  category: string;
  summary: string;
  context: string;
  detail: string;
  recommendation: ErrorSurface;
  severity: ErrorSeverity;
  primaryAction: string;
  secondaryAction: string;
};

type ErrorDisplayProps = {
  title: string;
  summary: string;
  detail: string;
  primaryAction: string;
  secondaryAction: string;
  onPrimaryAction: () => void;
  onSecondaryAction: () => void;
  onDismiss?: () => void;
  severity: ErrorSeverity;
};

const scenarios: ErrorScenario[] = [
  {
    id: "empty-data",
    label: "Empty Data",
    category: "No content",
    summary: "No projects are available yet.",
    context: "User has access to the page, but there is nothing to display.",
    detail: "Give a clear next step that helps the user create their first item.",
    recommendation: "inline",
    severity: "low",
    primaryAction: "Create Project",
    secondaryAction: "Import Data",
  },
  {
    id: "network-failure",
    label: "Network Failure",
    category: "Connectivity",
    summary: "Unable to reach the server.",
    context: "A request failed due to timeout or network disconnect.",
    detail: "Encourage retry and preserve user progress if possible.",
    recommendation: "banner",
    severity: "medium",
    primaryAction: "Retry Request",
    secondaryAction: "Work Offline",
  },
  {
    id: "permission-denied",
    label: "Permission Denied",
    category: "Authorization",
    summary: "You do not have permission to view this billing workspace.",
    context: "User is authenticated but lacks required role access.",
    detail: "State what is blocked and how to request the right permissions.",
    recommendation: "modal",
    severity: "medium",
    primaryAction: "Request Access",
    secondaryAction: "Go Back",
  },
  {
    id: "unexpected-crash",
    label: "Unexpected Crash",
    category: "Unhandled",
    summary: "Something went wrong while rendering this dashboard.",
    context: "Application entered an unrecoverable client-side error state.",
    detail: "A global error boundary should acknowledge failure and guide recovery.",
    recommendation: "toast",
    severity: "high",
    primaryAction: "Reload Page",
    secondaryAction: "Report Issue",
  },
];

const surfaceLabels: Record<ErrorSurface, string> = {
  inline: "Inline",
  banner: "Banner",
  modal: "Modal",
  toast: "Toast",
};

const severityBadgeClasses: Record<ErrorSeverity, string> = {
  low: "border-amber-400/35 bg-amber-400/10 text-amber-300",
  medium: "border-orange-400/35 bg-orange-400/10 text-orange-300",
  high: "border-rose-400/35 bg-rose-400/10 text-rose-300",
};

const surfaceButtonClasses: Record<ErrorSurface, string> = {
  inline: "hover:border-amber-400/60",
  banner: "hover:border-orange-400/60",
  modal: "hover:border-sky-400/60",
  toast: "hover:border-rose-400/60",
};

function ErrorInline(props: ErrorDisplayProps) {
  return (
    <article className="rounded-lg border border-border bg-surface/65 p-3">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 text-rose-300" aria-hidden="true">
          !
        </span>
        <div>
          <p className="text-sm font-semibold text-text-primary">{props.title}</p>
          <p className="mt-1 text-sm text-text-secondary">{props.summary}</p>
          <p className="mt-1 text-xs text-text-muted">{props.detail}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={props.onPrimaryAction}>{props.primaryAction}</Button>
            <Button variant="ghost" onClick={props.onSecondaryAction}>
              {props.secondaryAction}
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function ErrorBanner(props: ErrorDisplayProps) {
  return (
    <article className="rounded-lg border border-rose-400/35 bg-rose-400/10 px-3 py-2.5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-rose-100">{props.title}</p>
          <p className="text-xs text-rose-200/85">{props.summary}</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={props.onPrimaryAction}>{props.primaryAction}</Button>
          <Button variant="ghost" onClick={props.onSecondaryAction}>
            {props.secondaryAction}
          </Button>
        </div>
      </div>
    </article>
  );
}

function ErrorModal(props: ErrorDisplayProps) {
  return (
    <div className="rounded-lg border border-border/70 bg-bg/45 p-4">
      <div className="mx-auto max-w-md rounded-xl border border-border bg-surface px-4 py-4 shadow-xl">
        <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Modal Error</p>
        <p className="mt-2 text-lg font-semibold text-text-primary">{props.title}</p>
        <p className="mt-2 text-sm text-text-secondary">{props.summary}</p>
        <p className="mt-1 text-xs text-text-muted">{props.detail}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button onClick={props.onPrimaryAction}>{props.primaryAction}</Button>
          <Button variant="ghost" onClick={props.onSecondaryAction}>
            {props.secondaryAction}
          </Button>
          {props.onDismiss ? (
            <Button variant="ghost" onClick={props.onDismiss}>
              Dismiss
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function ErrorToast(props: ErrorDisplayProps) {
  return (
    <div className="flex justify-end">
      <article className="w-full max-w-sm rounded-lg border border-rose-400/35 bg-rose-400/10 p-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-rose-100">{props.title}</p>
            <p className="mt-1 text-xs text-rose-200/85">{props.summary}</p>
          </div>
          {props.onDismiss ? (
            <button
              type="button"
              onClick={props.onDismiss}
              className="rounded border border-rose-300/50 px-1.5 py-0.5 text-xs text-rose-100"
            >
              x
            </button>
          ) : null}
        </div>
        <div className="mt-3 flex gap-2">
          <Button onClick={props.onPrimaryAction}>{props.primaryAction}</Button>
          <Button variant="ghost" onClick={props.onSecondaryAction}>
            {props.secondaryAction}
          </Button>
        </div>
      </article>
    </div>
  );
}

function getToneCopy(severity: ErrorSeverity): string {
  if (severity === "high") {
    return "High impact: prioritize rapid recovery and escalation options.";
  }
  if (severity === "medium") {
    return "Medium impact: provide clear actions and preserve user confidence.";
  }
  return "Low impact: keep messaging calm and direct the next step.";
}

export default function ErrorStateGalleryLab() {
  const [selectedScenarioId, setSelectedScenarioId] = useState(scenarios[0].id);
  const [selectedSurface, setSelectedSurface] = useState<ErrorSurface>(scenarios[0].recommendation);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [isToastVisible, setIsToastVisible] = useState(true);

  const scenario = useMemo(() => {
    return scenarios.find((item) => item.id === selectedScenarioId) ?? scenarios[0];
  }, [selectedScenarioId]);

  useEffect(() => {
    setSelectedSurface(scenario.recommendation);
    setIsToastVisible(true);
  }, [scenario]);

  function pushActionLog(message: string) {
    const timestamp = new Date().toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    setActionLog((current) => [`[${timestamp}] ${message}`, ...current].slice(0, 8));
  }

  const commonProps: ErrorDisplayProps = {
    title: scenario.label,
    summary: scenario.summary,
    detail: scenario.detail,
    primaryAction: scenario.primaryAction,
    secondaryAction: scenario.secondaryAction,
    severity: scenario.severity,
    onPrimaryAction: () => pushActionLog(`${scenario.label}: "${scenario.primaryAction}" clicked.`),
    onSecondaryAction: () => pushActionLog(`${scenario.label}: "${scenario.secondaryAction}" clicked.`),
    onDismiss: () => {
      setIsToastVisible(false);
      pushActionLog(`${scenario.label}: error UI dismissed.`);
    },
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Error State Gallery</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Compare reusable error patterns across common failure scenarios to keep messaging and
          hierarchy consistent.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[320px_1fr]">
        <section className="space-y-3 rounded-xl border border-border bg-bg/35 p-4">
          <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Scenarios</p>

          {scenarios.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setSelectedScenarioId(item.id)}
              className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                selectedScenarioId === item.id
                  ? "border-accent/60 bg-accent/10"
                  : "border-border bg-surface/40 hover:border-text-muted"
              }`}
            >
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium text-text-primary">{item.label}</p>
                <span
                  className={`rounded-full border px-2 py-0.5 text-[10px] uppercase tracking-[0.08em] ${
                    severityBadgeClasses[item.severity]
                  }`}
                >
                  {item.severity}
                </span>
              </div>
              <p className="mt-1 text-xs text-text-muted">{item.category}</p>
            </button>
          ))}

          <div className="rounded-lg border border-border/70 bg-surface/45 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Scenario Context</p>
            <p className="mt-2 text-sm text-text-secondary">{scenario.context}</p>
            <p className="mt-2 text-xs text-text-muted">{getToneCopy(scenario.severity)}</p>
          </div>

          <div className="rounded-lg border border-border/70 bg-surface/45 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Interaction Log</p>
            <div className="mt-2 h-36 overflow-y-auto pr-1">
              <ul className="space-y-1 text-xs text-text-secondary">
                {actionLog.length === 0 ? <li>No interactions yet.</li> : null}
                {actionLog.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <section className="space-y-4 rounded-xl border border-border bg-surface/55 p-4 sm:p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Component Preview</p>
              <h3 className="text-lg font-semibold">{scenario.label}</h3>
            </div>
            <span className="rounded-full border border-border px-2.5 py-1 text-[11px] text-text-muted">
              Recommended: {surfaceLabels[scenario.recommendation]}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            {(Object.keys(surfaceLabels) as ErrorSurface[]).map((surface) => (
              <button
                key={surface}
                type="button"
                onClick={() => {
                  setSelectedSurface(surface);
                  if (surface === "toast") {
                    setIsToastVisible(true);
                  }
                }}
                className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${surfaceButtonClasses[surface]} ${
                  selectedSurface === surface
                    ? "border-accent/60 bg-accent/10 text-text-primary"
                    : "border-border bg-surface/65 text-text-secondary"
                }`}
              >
                {surfaceLabels[surface]}
              </button>
            ))}
          </div>

          {selectedSurface === "inline" ? <ErrorInline {...commonProps} /> : null}
          {selectedSurface === "banner" ? <ErrorBanner {...commonProps} /> : null}
          {selectedSurface === "modal" ? <ErrorModal {...commonProps} /> : null}
          {selectedSurface === "toast" ? (
            isToastVisible ? (
              <ErrorToast {...commonProps} />
            ) : (
              <div className="rounded-lg border border-border bg-bg/25 px-3 py-2 text-sm text-text-muted">
                Toast dismissed.
                <button
                  type="button"
                  onClick={() => setIsToastVisible(true)}
                  className="ml-2 rounded border border-border px-2 py-0.5 text-xs text-text-secondary"
                >
                  Show Again
                </button>
              </div>
            )
          ) : null}

          <div className="rounded-lg border border-border/70 bg-bg/25 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Consistency Checklist</p>
            <ul className="mt-2 space-y-1 text-sm text-text-secondary">
              <li>- Clear title describing what failed.</li>
              <li>- Short detail explaining impact and expected next step.</li>
              <li>- Primary and secondary actions with predictable placement.</li>
              <li>- Severity styling that matches urgency without overwhelming users.</li>
            </ul>
          </div>
        </section>
      </div>
    </div>
  );
}

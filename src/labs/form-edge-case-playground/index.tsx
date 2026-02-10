import { type FormEvent, useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type FormValues = {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
  teamName: string;
  useCase: string;
};

type FormErrors = Partial<Record<keyof FormValues, string>>;
type TouchedState = Partial<Record<keyof FormValues, boolean>>;
type SubmitMode = "success" | "partial" | "failure";

type SimulationConfig = {
  validationDelayMs: number;
  submissionDelayMs: number;
  forceEmailConflict: boolean;
  submitMode: SubmitMode;
};

type NoticeState = {
  tone: "success" | "warning" | "danger";
  message: string;
};

type AttemptLogItem = {
  id: number;
  timestamp: string;
  outcome: "success" | "partial" | "failure" | "validation";
  detail: string;
};

const initialValues: FormValues = {
  fullName: "",
  email: "",
  password: "",
  confirmPassword: "",
  teamName: "",
  useCase: "",
};

const initialConfig: SimulationConfig = {
  validationDelayMs: 600,
  submissionDelayMs: 1200,
  forceEmailConflict: false,
  submitMode: "success",
};

const delayOptions = [0, 250, 600, 1200, 2000];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(resolve, ms);
  });
}

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" });
}

function toneClasses(tone: NoticeState["tone"]): string {
  if (tone === "success") {
    return "border-emerald-400/35 bg-emerald-400/10 text-emerald-200";
  }
  if (tone === "warning") {
    return "border-amber-400/35 bg-amber-400/10 text-amber-200";
  }
  return "border-rose-400/35 bg-rose-400/10 text-rose-200";
}

function validateSync(values: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (values.fullName.trim().length < 2) {
    errors.fullName = "Enter at least 2 characters.";
  }

  if (!emailPattern.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }

  if (values.password.length < 8) {
    errors.password = "Use at least 8 characters.";
  }

  if (!/[A-Z]/.test(values.password) || !/[0-9]/.test(values.password)) {
    errors.password = "Include at least one uppercase letter and one number.";
  }

  if (values.confirmPassword !== values.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  if (values.teamName.trim().length === 0) {
    errors.teamName = "Team name is required.";
  }

  if (values.useCase.trim().length < 20) {
    errors.useCase = "Describe your use case in at least 20 characters.";
  }

  return errors;
}

export default function FormEdgeCasePlaygroundLab() {
  const [values, setValues] = useState<FormValues>(initialValues);
  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<TouchedState>({});
  const [config, setConfig] = useState<SimulationConfig>(initialConfig);

  const [isValidating, setIsValidating] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notice, setNotice] = useState<NoticeState | null>(null);
  const [attempt, setAttempt] = useState(0);
  const [attemptLog, setAttemptLog] = useState<AttemptLogItem[]>([]);
  const [lastSubmittedPayload, setLastSubmittedPayload] = useState<FormValues | null>(null);

  const visibleErrors = useMemo(() => {
    return Object.fromEntries(
      Object.entries(errors).filter(([field]) => touched[field as keyof FormValues])
    ) as FormErrors;
  }, [errors, touched]);

  const statusText = useMemo(() => {
    if (isValidating) return "Validating input...";
    if (isSubmitting) return "Submitting...";
    return "Idle";
  }, [isSubmitting, isValidating]);

  function pushLog(outcome: AttemptLogItem["outcome"], detail: string) {
    const item: AttemptLogItem = {
      id: Date.now() + Math.floor(Math.random() * 999),
      timestamp: formatTime(new Date()),
      outcome,
      detail,
    };

    setAttemptLog((current) => [item, ...current].slice(0, 7));
  }

  function markAllTouched() {
    setTouched({
      fullName: true,
      email: true,
      password: true,
      confirmPassword: true,
      teamName: true,
      useCase: true,
    });
  }

  async function runSubmission(): Promise<void> {
    const nextAttempt = attempt + 1;
    setAttempt(nextAttempt);
    setNotice(null);

    markAllTouched();
    const syncErrors = validateSync(values);
    setErrors(syncErrors);

    if (Object.keys(syncErrors).length > 0) {
      pushLog("validation", `Attempt ${nextAttempt}: blocked by client-side validation.`);
      setNotice({
        tone: "danger",
        message: "Fix the highlighted fields before submitting.",
      });
      return;
    }

    setIsValidating(true);
    if (config.validationDelayMs > 0) {
      await sleep(config.validationDelayMs);
    }

    if (config.forceEmailConflict) {
      setIsValidating(false);
      const conflictMessage = "This email is already in use.";
      setErrors((current) => ({
        ...current,
        email: conflictMessage,
      }));
      pushLog("validation", `Attempt ${nextAttempt}: async validation rejected the email.`);
      setNotice({
        tone: "danger",
        message: "Async validation failed. Use another email or disable forced conflict.",
      });
      return;
    }

    setIsValidating(false);
    setIsSubmitting(true);
    if (config.submissionDelayMs > 0) {
      await sleep(config.submissionDelayMs);
    }

    if (config.submitMode === "failure") {
      setIsSubmitting(false);
      pushLog("failure", `Attempt ${nextAttempt}: simulated server error (500).`);
      setNotice({
        tone: "danger",
        message: "Server error: the form was not saved. Review inputs and retry.",
      });
      return;
    }

    if (config.submitMode === "partial") {
      setIsSubmitting(false);
      setLastSubmittedPayload(values);
      setErrors((current) => ({
        ...current,
        password: "Password policy update rejected this value on the server.",
      }));
      setTouched((current) => ({ ...current, password: true }));
      pushLog("partial", `Attempt ${nextAttempt}: profile saved, credentials rejected.`);
      setNotice({
        tone: "warning",
        message: "Partial submission: profile fields saved, password update failed.",
      });
      return;
    }

    setIsSubmitting(false);
    setLastSubmittedPayload(values);
    setErrors({});
    pushLog("success", `Attempt ${nextAttempt}: submission completed successfully.`);
    setNotice({
      tone: "success",
      message: "Submission complete. You can change inputs and test another edge case.",
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isSubmitting || isValidating) return;
    await runSubmission();
  }

  function handleResetForm() {
    setValues(initialValues);
    setErrors({});
    setTouched({});
    setNotice(null);
    setLastSubmittedPayload(null);
    pushLog("validation", "Form reset to initial state.");
  }

  function handleRestoreLastPayload() {
    if (!lastSubmittedPayload) return;
    setValues(lastSubmittedPayload);
    setNotice({
      tone: "warning",
      message: "Restored the last submitted payload so you can retry recovery flows.",
    });
  }

  function handleFieldChange<K extends keyof FormValues>(key: K, value: FormValues[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    if (touched[key]) {
      const nextValues = { ...values, [key]: value };
      setErrors(validateSync(nextValues));
    }
  }

  function handleBlur<K extends keyof FormValues>(key: K) {
    setTouched((current) => ({ ...current, [key]: true }));
    setErrors(validateSync(values));
  }

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Form Edge-Case Playground</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Explore invalid input, delayed validation, partial submits, server failures, and recovery
          flows in one configurable form.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <section className="space-y-4 rounded-xl border border-border bg-bg/35 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Simulation Controls</p>
            <div className="mt-3 space-y-2">
              <label className="block text-xs text-text-muted">
                Validation Delay
                <select
                  value={String(config.validationDelayMs)}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      validationDelayMs: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-surface/75 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent/60"
                >
                  {delayOptions.map((delay) => (
                    <option key={delay} value={delay}>
                      {delay} ms
                    </option>
                  ))}
                </select>
              </label>

              <label className="block text-xs text-text-muted">
                Submission Delay
                <select
                  value={String(config.submissionDelayMs)}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      submissionDelayMs: Number(event.target.value),
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-surface/75 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent/60"
                >
                  {delayOptions.map((delay) => (
                    <option key={delay} value={delay}>
                      {delay} ms
                    </option>
                  ))}
                </select>
              </label>

              <label className="flex items-center gap-2 rounded-lg border border-border/70 bg-surface/45 px-3 py-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={config.forceEmailConflict}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      forceEmailConflict: event.target.checked,
                    }))
                  }
                  className="h-4 w-4 accent-rose-300"
                />
                Force async email conflict
              </label>

              <label className="block text-xs text-text-muted">
                Submission Result
                <select
                  value={config.submitMode}
                  onChange={(event) =>
                    setConfig((current) => ({
                      ...current,
                      submitMode: event.target.value as SubmitMode,
                    }))
                  }
                  className="mt-1 w-full rounded-lg border border-border bg-surface/75 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent/60"
                >
                  <option value="success">Success</option>
                  <option value="partial">Partial Success</option>
                  <option value="failure">Server Failure</option>
                </select>
              </label>
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-surface/45 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Runtime State</p>
            <p className="mt-2 text-sm text-text-secondary">Status: {statusText}</p>
            <p className="mt-1 text-sm text-text-secondary">Attempts: {attempt}</p>
            <p className="mt-1 text-sm text-text-secondary">
              Last payload: {lastSubmittedPayload ? "Available" : "None"}
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-surface/45 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Recovery</p>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <Button variant="ghost" onClick={handleRestoreLastPayload} disabled={!lastSubmittedPayload}>
                Restore Last Payload
              </Button>
              <Button variant="ghost" onClick={() => setNotice(null)} disabled={!notice}>
                Clear Notice
              </Button>
            </div>
            <p className="mt-2 text-[11px] text-text-muted">
              Use restore after partial/failure paths to retry with adjusted controls.
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-surface/45 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Attempt Log</p>
            <ul className="mt-2 space-y-1 text-xs text-text-secondary">
              {attemptLog.length === 0 ? <li>No events yet.</li> : null}
              {attemptLog.map((item) => (
                <li key={item.id}>
                  [{item.timestamp}] {item.outcome}: {item.detail}
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface/55 p-4 sm:p-5">
          {notice ? (
            <div className={`mb-4 rounded-lg border px-3 py-2 text-sm ${toneClasses(notice.tone)}`}>
              {notice.message}
            </div>
          ) : null}

          <form className="grid gap-3 sm:grid-cols-2" onSubmit={handleSubmit} noValidate>
            <label className="sm:col-span-1">
              <span className="text-xs text-text-muted">Full Name</span>
              <Input
                value={values.fullName}
                onChange={(event) => handleFieldChange("fullName", event.target.value)}
                onBlur={() => handleBlur("fullName")}
                placeholder="Avery Jordan"
                disabled={isSubmitting || isValidating}
              />
              {visibleErrors.fullName ? (
                <p className="mt-1 text-xs text-rose-300">{visibleErrors.fullName}</p>
              ) : null}
            </label>

            <label className="sm:col-span-1">
              <span className="text-xs text-text-muted">Email</span>
              <Input
                type="email"
                value={values.email}
                onChange={(event) => handleFieldChange("email", event.target.value)}
                onBlur={() => handleBlur("email")}
                placeholder="avery@team.co"
                disabled={isSubmitting || isValidating}
              />
              {visibleErrors.email ? (
                <p className="mt-1 text-xs text-rose-300">{visibleErrors.email}</p>
              ) : null}
            </label>

            <label className="sm:col-span-1">
              <span className="text-xs text-text-muted">Password</span>
              <Input
                type="password"
                value={values.password}
                onChange={(event) => handleFieldChange("password", event.target.value)}
                onBlur={() => handleBlur("password")}
                placeholder="At least 8 chars"
                disabled={isSubmitting || isValidating}
              />
              {visibleErrors.password ? (
                <p className="mt-1 text-xs text-rose-300">{visibleErrors.password}</p>
              ) : null}
            </label>

            <label className="sm:col-span-1">
              <span className="text-xs text-text-muted">Confirm Password</span>
              <Input
                type="password"
                value={values.confirmPassword}
                onChange={(event) => handleFieldChange("confirmPassword", event.target.value)}
                onBlur={() => handleBlur("confirmPassword")}
                placeholder="Repeat password"
                disabled={isSubmitting || isValidating}
              />
              {visibleErrors.confirmPassword ? (
                <p className="mt-1 text-xs text-rose-300">{visibleErrors.confirmPassword}</p>
              ) : null}
            </label>

            <label className="sm:col-span-2">
              <span className="text-xs text-text-muted">Team Name</span>
              <Input
                value={values.teamName}
                onChange={(event) => handleFieldChange("teamName", event.target.value)}
                onBlur={() => handleBlur("teamName")}
                placeholder="Growth Engineering"
                disabled={isSubmitting || isValidating}
              />
              {visibleErrors.teamName ? (
                <p className="mt-1 text-xs text-rose-300">{visibleErrors.teamName}</p>
              ) : null}
            </label>

            <label className="sm:col-span-2">
              <span className="text-xs text-text-muted">Use Case</span>
              <textarea
                value={values.useCase}
                onChange={(event) => handleFieldChange("useCase", event.target.value)}
                onBlur={() => handleBlur("useCase")}
                placeholder="Describe the workflow you are setting up..."
                disabled={isSubmitting || isValidating}
                className="mt-1 min-h-[112px] w-full rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/80 focus:border-accent/60"
              />
              {visibleErrors.useCase ? (
                <p className="mt-1 text-xs text-rose-300">{visibleErrors.useCase}</p>
              ) : null}
            </label>

            <div className="sm:col-span-2 flex flex-wrap gap-2 pt-1">
              <Button type="submit" disabled={isSubmitting || isValidating}>
                {isValidating ? "Validating..." : isSubmitting ? "Submitting..." : "Submit Form"}
              </Button>
              <Button
                variant="ghost"
                type="button"
                onClick={runSubmission}
                disabled={isSubmitting || isValidating}
              >
                Retry Same Payload
              </Button>
              <Button variant="ghost" type="button" onClick={handleResetForm}>
                Reset Form
              </Button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
}

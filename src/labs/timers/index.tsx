import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type PomodoroPhase = "idle" | "work" | "break" | "complete";

type PomodoroConfig = {
  workSeconds: number;
  breakSeconds: number;
  totalWorkPeriods: number;
};

function parseNumber(value: string, fallback: number): number {
  const parsed = Number.parseInt(value, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function formatSeconds(totalSeconds: number): string {
  const safeSeconds = Math.max(0, totalSeconds);
  const hours = Math.floor(safeSeconds / 3600);
  const minutes = Math.floor((safeSeconds % 3600) / 60);
  const seconds = safeSeconds % 60;

  if (hours > 0) {
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function getPomodoroStatusText(
  phase: PomodoroPhase,
  currentWorkPeriod: number,
  totalWorkPeriods: number
): string {
  if (phase === "complete") {
    return "Complete";
  }

  if (phase === "break") {
    const nextWorkPeriod = Math.min(currentWorkPeriod + 1, totalWorkPeriods);
    return `Break before work period ${nextWorkPeriod} of ${totalWorkPeriods}`;
  }

  return `Work period ${currentWorkPeriod} of ${totalWorkPeriods}`;
}

function getPomodoroTone(phase: PomodoroPhase): string {
  if (phase === "work") {
    return "border-amber-300/55 bg-amber-400/10";
  }

  if (phase === "break") {
    return "border-emerald-300/55 bg-emerald-400/10";
  }

  if (phase === "complete") {
    return "border-cyan-300/55 bg-cyan-400/10";
  }

  return "border-border bg-bg/35";
}

export default function TimersLab() {
  const [countUpElapsedMs, setCountUpElapsedMs] = useState(0);
  const [isCountUpRunning, setIsCountUpRunning] = useState(false);
  const countUpStartRef = useRef<number | null>(null);

  const [countdownMinutesInput, setCountdownMinutesInput] = useState("1");
  const [countdownSecondsInput, setCountdownSecondsInput] = useState("30");
  const [countdownRemainingSeconds, setCountdownRemainingSeconds] = useState(90);
  const [isCountdownRunning, setIsCountdownRunning] = useState(false);

  const [pomodoroWorkMinutesInput, setPomodoroWorkMinutesInput] = useState("25");
  const [pomodoroBreakMinutesInput, setPomodoroBreakMinutesInput] = useState("5");
  const [pomodoroPeriodsInput, setPomodoroPeriodsInput] = useState("4");
  const [pomodoroConfig, setPomodoroConfig] = useState<PomodoroConfig>({
    workSeconds: 25 * 60,
    breakSeconds: 5 * 60,
    totalWorkPeriods: 4,
  });
  const [pomodoroPhase, setPomodoroPhase] = useState<PomodoroPhase>("idle");
  const [pomodoroCurrentWorkPeriod, setPomodoroCurrentWorkPeriod] = useState(1);
  const [pomodoroRemainingSeconds, setPomodoroRemainingSeconds] = useState(25 * 60);
  const [isPomodoroRunning, setIsPomodoroRunning] = useState(false);

  useEffect(() => {
    if (!isCountUpRunning) {
      return;
    }

    const intervalId = window.setInterval(() => {
      if (countUpStartRef.current === null) return;
      setCountUpElapsedMs(Date.now() - countUpStartRef.current);
    }, 150);

    return () => window.clearInterval(intervalId);
  }, [isCountUpRunning]);

  useEffect(() => {
    if (!isCountdownRunning) return;
    if (countdownRemainingSeconds <= 0) {
      setIsCountdownRunning(false);
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setCountdownRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [countdownRemainingSeconds, isCountdownRunning]);

  useEffect(() => {
    if (!isPomodoroRunning) return;

    if (pomodoroPhase === "complete") {
      setIsPomodoroRunning(false);
      return;
    }

    if (pomodoroRemainingSeconds <= 0) {
      advancePomodoroPhase();
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPomodoroRemainingSeconds((current) => Math.max(0, current - 1));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [
    isPomodoroRunning,
    pomodoroConfig.breakSeconds,
    pomodoroConfig.totalWorkPeriods,
    pomodoroConfig.workSeconds,
    pomodoroCurrentWorkPeriod,
    pomodoroPhase,
    pomodoroRemainingSeconds,
  ]);

  const countUpElapsedSeconds = Math.floor(countUpElapsedMs / 1000);
  const countUpDisplay = formatSeconds(countUpElapsedSeconds);

  const countdownConfiguredSeconds = useMemo(() => {
    const minutes = Math.max(0, Math.min(999, parseNumber(countdownMinutesInput, 0)));
    const seconds = Math.max(0, Math.min(59, parseNumber(countdownSecondsInput, 0)));
    return minutes * 60 + seconds;
  }, [countdownMinutesInput, countdownSecondsInput]);

  const pomodoroStatusText = getPomodoroStatusText(
    pomodoroPhase,
    pomodoroCurrentWorkPeriod,
    pomodoroConfig.totalWorkPeriods
  );

  function advancePomodoroPhase() {
    if (pomodoroPhase === "work") {
      if (pomodoroCurrentWorkPeriod >= pomodoroConfig.totalWorkPeriods) {
        setPomodoroPhase("complete");
        setPomodoroRemainingSeconds(0);
        setIsPomodoroRunning(false);
      } else {
        setPomodoroPhase("break");
        setPomodoroRemainingSeconds(pomodoroConfig.breakSeconds);
      }
      return;
    }

    if (pomodoroPhase === "break") {
      setPomodoroCurrentWorkPeriod((current) => Math.min(current + 1, pomodoroConfig.totalWorkPeriods));
      setPomodoroPhase("work");
      setPomodoroRemainingSeconds(pomodoroConfig.workSeconds);
      return;
    }

    if (pomodoroPhase === "idle") {
      setPomodoroPhase("work");
      setPomodoroRemainingSeconds(pomodoroConfig.workSeconds);
    }
  }

  function handleCountUpStart() {
    if (isCountUpRunning) return;
    countUpStartRef.current = Date.now() - countUpElapsedMs;
    setIsCountUpRunning(true);
  }

  function handleCountUpPause() {
    if (!isCountUpRunning) return;
    if (countUpStartRef.current !== null) {
      setCountUpElapsedMs(Date.now() - countUpStartRef.current);
    }
    setIsCountUpRunning(false);
    countUpStartRef.current = null;
  }

  function handleCountUpReset() {
    setIsCountUpRunning(false);
    setCountUpElapsedMs(0);
    countUpStartRef.current = null;
  }

  function handleCountdownSet() {
    setIsCountdownRunning(false);
    setCountdownRemainingSeconds(countdownConfiguredSeconds);
  }

  function handleCountdownStart() {
    if (isCountdownRunning) return;
    if (countdownRemainingSeconds <= 0) {
      if (countdownConfiguredSeconds <= 0) return;
      setCountdownRemainingSeconds(countdownConfiguredSeconds);
    }
    setIsCountdownRunning(true);
  }

  function handleCountdownPause() {
    setIsCountdownRunning(false);
  }

  function handleCountdownReset() {
    setIsCountdownRunning(false);
    setCountdownRemainingSeconds(countdownConfiguredSeconds);
  }

  function handlePomodoroApplySettings() {
    const workMinutes = Math.max(1, Math.min(240, parseNumber(pomodoroWorkMinutesInput, 25)));
    const breakMinutes = Math.max(1, Math.min(180, parseNumber(pomodoroBreakMinutesInput, 5)));
    const periods = Math.max(1, Math.min(20, parseNumber(pomodoroPeriodsInput, 4)));

    const nextConfig: PomodoroConfig = {
      workSeconds: workMinutes * 60,
      breakSeconds: breakMinutes * 60,
      totalWorkPeriods: periods,
    };

    setPomodoroConfig(nextConfig);
    setPomodoroPhase("idle");
    setPomodoroCurrentWorkPeriod(1);
    setPomodoroRemainingSeconds(nextConfig.workSeconds);
    setIsPomodoroRunning(false);
  }

  function handlePomodoroStart() {
    if (isPomodoroRunning) return;

    if (pomodoroPhase === "complete") {
      setPomodoroPhase("work");
      setPomodoroCurrentWorkPeriod(1);
      setPomodoroRemainingSeconds(pomodoroConfig.workSeconds);
    } else if (pomodoroPhase === "idle") {
      setPomodoroPhase("work");
      if (pomodoroRemainingSeconds <= 0) {
        setPomodoroRemainingSeconds(pomodoroConfig.workSeconds);
      }
    }

    setIsPomodoroRunning(true);
  }

  function handlePomodoroPause() {
    setIsPomodoroRunning(false);
  }

  function handlePomodoroReset() {
    setIsPomodoroRunning(false);
    setPomodoroPhase("idle");
    setPomodoroCurrentWorkPeriod(1);
    setPomodoroRemainingSeconds(pomodoroConfig.workSeconds);
  }

  function handlePomodoroEndPeriodEarly() {
    if (pomodoroPhase === "idle" || pomodoroPhase === "complete") return;
    advancePomodoroPhase();
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Timers</h2>
      <p className="text-sm text-text-secondary">
        Count up, run a custom countdown, and cycle Pomodoro work and break sessions.
      </p>

      <div className="grid gap-4 xl:grid-cols-3">
        <section className="rounded-lg border border-border bg-bg/25 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Count Up</p>
          <p className="mt-2 font-mono text-3xl text-text-primary">{countUpDisplay}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button onClick={handleCountUpStart} disabled={isCountUpRunning}>
              Start
            </Button>
            <Button variant="ghost" onClick={handleCountUpPause} disabled={!isCountUpRunning}>
              Pause
            </Button>
            <Button variant="ghost" onClick={handleCountUpReset} disabled={countUpElapsedMs === 0 && !isCountUpRunning}>
              Reset
            </Button>
          </div>
        </section>

        <section className="rounded-lg border border-border bg-bg/25 px-4 py-3">
          <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Countdown</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <Input
              type="number"
              min={0}
              max={999}
              value={countdownMinutesInput}
              onChange={(event) => setCountdownMinutesInput(event.target.value)}
              aria-label="Countdown minutes"
              placeholder="Minutes"
              disabled={isCountdownRunning}
            />
            <Input
              type="number"
              min={0}
              max={59}
              value={countdownSecondsInput}
              onChange={(event) => setCountdownSecondsInput(event.target.value)}
              aria-label="Countdown seconds"
              placeholder="Seconds"
              disabled={isCountdownRunning}
            />
          </div>
          <p className="mt-3 font-mono text-3xl text-text-primary">{formatSeconds(countdownRemainingSeconds)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" onClick={handleCountdownSet} disabled={isCountdownRunning}>
              Set
            </Button>
            <Button onClick={handleCountdownStart} disabled={isCountdownRunning || countdownConfiguredSeconds <= 0}>
              Start
            </Button>
            <Button variant="ghost" onClick={handleCountdownPause} disabled={!isCountdownRunning}>
              Pause
            </Button>
            <Button variant="ghost" onClick={handleCountdownReset}>
              Reset
            </Button>
          </div>
        </section>

        <section className={`rounded-lg border px-4 py-3 transition-colors ${getPomodoroTone(pomodoroPhase)}`}>
          <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Pomodoro</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3">
            <Input
              type="number"
              min={1}
              max={240}
              value={pomodoroWorkMinutesInput}
              onChange={(event) => setPomodoroWorkMinutesInput(event.target.value)}
              aria-label="Pomodoro work minutes"
              placeholder="Work min"
              disabled={isPomodoroRunning}
            />
            <Input
              type="number"
              min={1}
              max={180}
              value={pomodoroBreakMinutesInput}
              onChange={(event) => setPomodoroBreakMinutesInput(event.target.value)}
              aria-label="Pomodoro break minutes"
              placeholder="Break min"
              disabled={isPomodoroRunning}
            />
            <Input
              type="number"
              min={1}
              max={20}
              value={pomodoroPeriodsInput}
              onChange={(event) => setPomodoroPeriodsInput(event.target.value)}
              aria-label="Pomodoro work periods"
              placeholder="Work periods"
              disabled={isPomodoroRunning}
            />
          </div>
          <p className="mt-3 text-sm text-text-secondary">{pomodoroStatusText}</p>
          <p className="mt-1 font-mono text-3xl text-text-primary">{formatSeconds(pomodoroRemainingSeconds)}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Button variant="ghost" onClick={handlePomodoroApplySettings} disabled={isPomodoroRunning}>
              Apply
            </Button>
            <Button onClick={handlePomodoroStart} disabled={isPomodoroRunning}>
              Start
            </Button>
            <Button variant="ghost" onClick={handlePomodoroPause} disabled={!isPomodoroRunning}>
              Pause
            </Button>
            <Button
              variant="ghost"
              onClick={handlePomodoroEndPeriodEarly}
              disabled={pomodoroPhase === "idle" || pomodoroPhase === "complete"}
            >
              End Period Early
            </Button>
            <Button variant="ghost" onClick={handlePomodoroReset}>
              Reset
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}

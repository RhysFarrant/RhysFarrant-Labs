import { useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";

const pastelColors = [
  "var(--color-lab-pastel-1)",
  "var(--color-lab-pastel-2)",
  "var(--color-lab-pastel-3)",
  "var(--color-lab-pastel-4)",
  "var(--color-lab-pastel-5)",
  "var(--color-lab-pastel-6)",
  "var(--color-lab-pastel-7)",
  "var(--color-lab-pastel-8)",
];
const SPIN_DURATION_MS = 3800;
const MAX_TICKS_PER_FRAME = 3;

function cubicBezierAt(time: number, p1: number, p2: number) {
  const inverse = 1 - time;
  return 3 * inverse * inverse * time * p1 + 3 * inverse * time * time * p2 + time * time * time;
}

function cubicBezierDerivativeAt(time: number, p1: number, p2: number) {
  const inverse = 1 - time;
  return 3 * inverse * inverse * p1 + 6 * inverse * time * (p2 - p1) + 3 * time * time * (1 - p2);
}

function cubicBezierSolveForTime(progress: number, p1: number, p2: number) {
  let time = progress;

  for (let i = 0; i < 5; i += 1) {
    const value = cubicBezierAt(time, p1, p2) - progress;
    if (Math.abs(value) < 1e-5) break;

    const derivative = cubicBezierDerivativeAt(time, p1, p2);
    if (Math.abs(derivative) < 1e-6) break;

    time -= value / derivative;
    time = Math.max(0, Math.min(1, time));
  }

  return time;
}

function spinEasing(progress: number) {
  if (progress <= 0) return 0;
  if (progress >= 1) return 1;

  const time = cubicBezierSolveForTime(progress, 0.16, 0.3);
  return cubicBezierAt(time, 1, 1);
}

type SpinResult = {
  id: number;
  label: string;
  color: string;
};

type PendingResult = SpinResult & {
  sourceLineIndex: number;
};

export default function WheelSpinnerLab() {
  const [entryText, setEntryText] = useState("");
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<SpinResult | null>(null);
  const [pendingResult, setPendingResult] = useState<PendingResult | null>(null);
  const [history, setHistory] = useState<SpinResult[]>([]);
  const spinAnimationFrameRef = useRef<number | null>(null);
  const rotationRef = useRef(0);
  const lastTickBoundaryRef = useRef(0);
  const lastTickAtRef = useRef(0);
  const audioContextRef = useRef<AudioContext | null>(null);
  const resultIdRef = useRef(0);

  const parsedEntries = useMemo(
    () =>
      entryText
        .split("\n")
        .map((line, index) => ({ label: line.trim(), sourceLineIndex: index }))
        .filter((line) => line.label.length > 0),
    [entryText]
  );

  const entries = parsedEntries.map((line) => line.label);
  const segmentCount = parsedEntries.length;
  const canSpin = segmentCount >= 1;
  const isResultDialogOpen = pendingResult !== null;
  const segmentAngle = segmentCount > 0 ? 360 / segmentCount : 360;
  const labelRadius = segmentCount <= 6 ? 84 : segmentCount <= 10 ? 90 : 96;
  const labelArcWidth = segmentCount > 0 ? (2 * Math.PI * labelRadius) / segmentCount : 0;
  const labelWidth = Math.max(56, Math.min(128, Math.floor(labelArcWidth + 6)));
  const labelFontSize = segmentCount > 14 ? 9 : segmentCount > 10 ? 10 : 11;

  useEffect(() => {
    return () => {
      if (spinAnimationFrameRef.current !== null) {
        window.cancelAnimationFrame(spinAnimationFrameRef.current);
      }
      if (audioContextRef.current !== null) {
        void audioContextRef.current.close();
      }
    };
  }, []);

  useEffect(() => {
    if (!isResultDialogOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setPendingResult(null);
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isResultDialogOpen]);

  function ensureAudioContext() {
    if (audioContextRef.current !== null) return audioContextRef.current;

    try {
      const AudioContextConstructor =
        window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
      if (!AudioContextConstructor) return null;
      audioContextRef.current = new AudioContextConstructor();
      return audioContextRef.current;
    } catch {
      return null;
    }
  }

  function playTick() {
    const nowMs = performance.now();
    if (nowMs - lastTickAtRef.current < 14) return;

    const audioContext = ensureAudioContext();
    if (audioContext === null) return;

    if (audioContext.state !== "running") {
      return;
    }

    const now = audioContext.currentTime;
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.type = "square";
    oscillator.frequency.setValueAtTime(1300, now);
    oscillator.frequency.exponentialRampToValueAtTime(850, now + 0.03);

    gainNode.gain.setValueAtTime(0.0001, now);
    gainNode.gain.exponentialRampToValueAtTime(0.05, now + 0.003);
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + 0.04);

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    oscillator.start(now);
    oscillator.stop(now + 0.045);

    lastTickAtRef.current = nowMs;
  }

  const wheelGradient = useMemo(() => {
    if (segmentCount === 0) {
      return "conic-gradient(from 0deg, var(--color-surface) 0deg 360deg)";
    }

    const stops = entries
      .map((_, index) => {
        const start = index * segmentAngle;
        const end = (index + 1) * segmentAngle;
        return `${pastelColors[index % pastelColors.length]} ${start}deg ${end}deg`;
      })
      .join(", ");
    return `conic-gradient(from 0deg, ${stops})`;
  }, [entries, segmentAngle, segmentCount]);

  function handleSpin() {
    if (isSpinning || !canSpin || isResultDialogOpen) return;

    const audioContext = ensureAudioContext();
    if (audioContext !== null && audioContext.state !== "running") {
      void audioContext.resume();
    }

    const startRotation = rotationRef.current;
    const currentRotationNormalized = ((startRotation % 360) + 360) % 360;
    const boundaryEpsilon = Math.max(0.25, Math.min(2, segmentAngle * 0.03));
    let pointerAngle = Math.random() * 360;

    if (segmentCount > 1) {
      const offsetWithinSegment = pointerAngle % segmentAngle;
      if (offsetWithinSegment < boundaryEpsilon) {
        pointerAngle += boundaryEpsilon - offsetWithinSegment;
      } else if (segmentAngle - offsetWithinSegment < boundaryEpsilon) {
        pointerAngle -= boundaryEpsilon - (segmentAngle - offsetWithinSegment);
      }
      pointerAngle = ((pointerAngle % 360) + 360) % 360;
    }

    const targetIndex = segmentCount === 1 ? 0 : Math.floor(pointerAngle / segmentAngle);
    const targetRotationNormalized = (360 - pointerAngle) % 360;
    const extraTurns = (4 + Math.floor(Math.random() * 3)) * 360;
    const deltaRotation =
      ((targetRotationNormalized - currentRotationNormalized + 360) % 360) + extraTurns;

    setIsSpinning(true);
    setWinner(null);
    lastTickBoundaryRef.current = Math.floor(startRotation / segmentAngle);
    const startTime = performance.now();

    if (spinAnimationFrameRef.current !== null) {
      window.cancelAnimationFrame(spinAnimationFrameRef.current);
    }

    const animate = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(1, elapsed / SPIN_DURATION_MS);
      const eased = spinEasing(progress);
      const nextRotation = startRotation + deltaRotation * eased;

      rotationRef.current = nextRotation;
      setRotation(nextRotation);

      const currentBoundary = Math.floor(nextRotation / segmentAngle);
      const boundariesCrossed = Math.max(0, currentBoundary - lastTickBoundaryRef.current);
      const tickCount = Math.min(MAX_TICKS_PER_FRAME, boundariesCrossed);

      for (let i = 0; i < tickCount; i += 1) {
        playTick();
      }

      if (boundariesCrossed > 0) {
        lastTickBoundaryRef.current = currentBoundary;
      }

      if (progress < 1) {
        spinAnimationFrameRef.current = window.requestAnimationFrame(animate);
        return;
      }

      const finalRotation = startRotation + deltaRotation;
      rotationRef.current = finalRotation;
      setRotation(finalRotation);

      const winningEntry = parsedEntries[targetIndex];
      if (!winningEntry) {
        setIsSpinning(false);
        spinAnimationFrameRef.current = null;
        return;
      }

      const label = winningEntry.label;
      const color = pastelColors[targetIndex % pastelColors.length];
      const result = {
        id: ++resultIdRef.current,
        label,
        color,
      };

      setIsSpinning(false);
      setWinner(result);
      setPendingResult({ ...result, sourceLineIndex: winningEntry.sourceLineIndex });
      setHistory((prev) => [result, ...prev].slice(0, 8));
      spinAnimationFrameRef.current = null;
    };

    spinAnimationFrameRef.current = window.requestAnimationFrame(animate);
  }

  function handleRemovePendingResult() {
    if (pendingResult === null) return;

    setEntryText((currentText) => {
      const lines = currentText.split("\n");
      if (pendingResult.sourceLineIndex < 0 || pendingResult.sourceLineIndex >= lines.length) {
        return currentText;
      }

      lines.splice(pendingResult.sourceLineIndex, 1);
      return lines.join("\n");
    });

    setPendingResult(null);
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Wheel Spinner</h2>
      <p className="text-sm text-text-secondary">
        Add entries (one per line), then spin the wheel.
      </p>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px] lg:grid-rows-[auto_auto] lg:items-stretch">
        <div className="grid h-full grid-rows-[auto_minmax(14rem,1fr)_auto] rounded-lg border border-border bg-bg/25 px-4 py-3 lg:row-span-2">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Entries</p>
            <p className="text-xs text-text-muted">{segmentCount} active</p>
          </div>
          <textarea
            value={entryText}
            onChange={(event) => setEntryText(event.target.value)}
            disabled={isSpinning || isResultDialogOpen}
            className="h-full min-h-[14rem] w-full resize-y rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder={"One entry per line\nExample:\nPizza\nChicken\nNoodles"}
            aria-label="Wheel entries"
          />
          <p className="mt-2 text-xs text-text-muted">
            Add at least 1 entry to spin.
          </p>
        </div>

        <div className="mx-auto w-full max-w-[340px] lg:col-start-2 lg:row-start-1">
          <div className="relative mx-auto h-72 w-72">
            <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-2">
              <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-text-primary" />
            </div>

            <div
              className="relative h-full w-full overflow-hidden rounded-full border border-border/70"
              style={{
                backgroundImage: wheelGradient,
                transform: `rotate(${rotation}deg)`,
              }}
            >
              <div className="absolute inset-0">
                {entries.map((label, index) => {
                  const labelAngle = segmentCount === 1 ? 0 : index * segmentAngle + segmentAngle / 2;

                  return (
                    <div
                      key={`${label}-${index}`}
                      className="pointer-events-none absolute left-1/2 top-1/2"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${labelAngle}deg) translateY(-${labelRadius}px)`,
                        zIndex: 5,
                      }}
                    >
                      <span
                        className="font-semibold text-[#1b1b24]"
                        style={{
                          position: "relative",
                          width: 0,
                          height: 0,
                        }}
                        title={label}
                      >
                        <span
                          style={{
                            position: "absolute",
                            left: 0,
                            top: 0,

                            transform: "translate(-50%, -50%) rotate(-90deg)",
                            transformOrigin: "center",

                            fontSize: `${labelFontSize}px`,
                            whiteSpace: "nowrap",

                            maxWidth: `${labelWidth}px`,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                          }}
                        >
                          {label}
                        </span>
                      </span>
                    </div>
                );
              })}
              </div>
            </div>

            <button
              type="button"
              onClick={handleSpin}
              disabled={isSpinning || !canSpin || isResultDialogOpen}
              className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-panel text-xs font-semibold text-text-primary shadow-lg shadow-black/30 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSpinning ? "..." : "Spin"}
            </button>
          </div>
        </div>

        <div className="flex justify-end lg:col-start-2 lg:row-start-2 lg:items-end">
          <Button
            variant="ghost"
            onClick={() => setHistory([])}
            disabled={history.length === 0 || isSpinning || isResultDialogOpen}
          >
            Clear History
          </Button>
        </div>
      </div>

      <div className="rounded-lg border border-border bg-bg/40 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Result</p>
        {winner === null ? (
          <p className="mt-1 text-sm text-text-muted">
            {isSpinning ? "Spinning..." : canSpin ? "Spin to pick one" : "Add an entry to begin"}
          </p>
        ) : (
          <p className="mt-1 text-lg font-semibold" style={{ color: winner.color }}>
            {winner.label}
          </p>
        )}
      </div>

      <div className="rounded-lg border border-border bg-bg/25 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Recent Results</p>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No spins yet.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="rounded-md border px-2.5 py-1 text-sm"
                style={{
                  backgroundColor: entry.color,
                  color: "#1b1b24",
                  borderColor: "rgba(42, 42, 54, 0.55)",
                }}
              >
                {entry.label}
              </li>
            ))}
          </ul>
        )}
      </div>

      {pendingResult !== null ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="wheel-result-title"
          onClick={() => setPendingResult(null)}
        >
          <div
            className="w-full max-w-sm rounded-xl border border-border bg-panel p-4 shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Spin Result</p>
            <p id="wheel-result-title" className="mt-2 text-2xl font-semibold" style={{ color: pendingResult.color }}>
              {pendingResult.label}
            </p>
            <p className="mt-2 text-sm text-text-secondary">
              Remove this result from the wheel before the next spin?
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setPendingResult(null)}>
                Keep
              </Button>
              <Button onClick={handleRemovePendingResult}>Remove</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

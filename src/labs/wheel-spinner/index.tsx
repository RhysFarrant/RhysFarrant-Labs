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

type SpinResult = {
  id: number;
  label: string;
  color: string;
};

export default function WheelSpinnerLab() {
  const [entryText, setEntryText] = useState("");
  const [rotation, setRotation] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<SpinResult | null>(null);
  const [history, setHistory] = useState<SpinResult[]>([]);
  const spinTimerRef = useRef<number | null>(null);
  const resultIdRef = useRef(0);

  const entries = useMemo(
    () =>
      entryText
        .split("\n")
        .map((line) => line.trim())
        .filter((line) => line.length > 0),
    [entryText]
  );

  const segmentCount = entries.length;
  const canSpin = segmentCount >= 1;
  const segmentAngle = segmentCount > 0 ? 360 / segmentCount : 360;
  const labelRadius = segmentCount <= 6 ? 84 : segmentCount <= 10 ? 90 : 96;
  const labelArcWidth = segmentCount > 0 ? (2 * Math.PI * labelRadius) / segmentCount : 0;
  const labelWidth = Math.max(56, Math.min(128, Math.floor(labelArcWidth + 6)));
  const labelFontSize = segmentCount > 14 ? 9 : segmentCount > 10 ? 10 : 11;

  useEffect(() => {
    return () => {
      if (spinTimerRef.current !== null) {
        window.clearTimeout(spinTimerRef.current);
      }
    };
  }, []);

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
    if (isSpinning || !canSpin) return;

    const targetIndex = Math.floor(Math.random() * segmentCount);
    const currentRotationNormalized = ((rotation % 360) + 360) % 360;
    const targetRotationNormalized = (360 - targetIndex * segmentAngle) % 360;
    const extraTurns = (4 + Math.floor(Math.random() * 3)) * 360;
    const deltaRotation =
      ((targetRotationNormalized - currentRotationNormalized + 360) % 360) + extraTurns;

    setIsSpinning(true);
    setWinner(null);
    setRotation((prev) => prev + deltaRotation);

    spinTimerRef.current = window.setTimeout(() => {
      const label = entries[targetIndex];
      const color = pastelColors[targetIndex % pastelColors.length];
      const result = {
        id: ++resultIdRef.current,
        label,
        color,
      };

      setIsSpinning(false);
      setWinner(result);
      setHistory((prev) => [result, ...prev].slice(0, 8));
      spinTimerRef.current = null;
    }, SPIN_DURATION_MS);
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Wheel Spinner</h2>
      <p className="text-sm text-text-secondary">
        Add entries (one per line), then spin the wheel.
      </p>

      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-border bg-bg/25 px-4 py-3">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Entries</p>
            <p className="text-xs text-text-muted">{segmentCount} active</p>
          </div>
          <textarea
            value={entryText}
            onChange={(event) => setEntryText(event.target.value)}
            disabled={isSpinning}
            className="h-56 w-full resize-y rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent/60 disabled:cursor-not-allowed disabled:opacity-60"
            placeholder={"One entry per line\nExample:\nPizza\nChicken\nNoodles"}
            aria-label="Wheel entries"
          />
          <p className="mt-2 text-xs text-text-muted">
            Add at least 1 entry to spin.
          </p>
        </div>

        <div className="mx-auto w-full max-w-[340px]">
          <div className="relative mx-auto h-72 w-72">
            <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-2">
              <div className="h-0 w-0 border-l-[10px] border-r-[10px] border-t-[18px] border-l-transparent border-r-transparent border-t-text-primary" />
            </div>

            <div
              className="relative h-full w-full overflow-hidden rounded-full border border-border/70"
              style={{
                backgroundImage: wheelGradient,
                transform: `rotate(${rotation}deg)`,
                transition: isSpinning
                  ? `transform ${SPIN_DURATION_MS}ms cubic-bezier(0.16, 1, 0.3, 1)`
                  : "none",
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
              disabled={isSpinning || !canSpin}
              className="absolute left-1/2 top-1/2 z-20 flex h-16 w-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-border/70 bg-panel text-xs font-semibold text-text-primary shadow-lg shadow-black/30 transition-colors hover:bg-surface disabled:cursor-not-allowed disabled:opacity-45"
            >
              {isSpinning ? "..." : "Spin"}
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <Button variant="ghost" onClick={() => setHistory([])} disabled={history.length === 0 || isSpinning}>
          Clear History
        </Button>
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
    </div>
  );
}

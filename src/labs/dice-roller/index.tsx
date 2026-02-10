import { useEffect, useRef, useState } from "react";
import Button from "@/components/ui/Button";

const diceOptions = [4, 6, 8, 10, 12, 20, 100];
const ROLL_DURATION_MS = 900;
const SHUFFLE_INTERVAL_MS = 60;

type RollEntry = {
  id: number;
  value: number;
  sides: number;
};

const colorBySides: Record<number, string> = {
  4: "var(--color-lab-pastel-1)",
  6: "var(--color-lab-pastel-2)",
  8: "var(--color-lab-pastel-3)",
  10: "var(--color-lab-pastel-4)",
  12: "var(--color-lab-pastel-5)",
  20: "var(--color-lab-pastel-6)",
  100: "var(--color-lab-pastel-7)",
};

function getColorForSides(sides: number): string {
  return colorBySides[sides] ?? "var(--color-lab-pastel-8)";
}

export default function DiceRollerLab() {
  const [sides, setSides] = useState(20);
  const [roll, setRoll] = useState<number | null>(null);
  const [rollSides, setRollSides] = useState<number | null>(null);
  const [displayRoll, setDisplayRoll] = useState<number | null>(null);
  const [isRolling, setIsRolling] = useState(false);
  const [history, setHistory] = useState<RollEntry[]>([]);
  const shuffleTimerRef = useRef<number | null>(null);
  const finishTimerRef = useRef<number | null>(null);
  const rollIdRef = useRef(0);

  useEffect(() => {
    return () => {
      if (shuffleTimerRef.current !== null) {
        window.clearInterval(shuffleTimerRef.current);
      }
      if (finishTimerRef.current !== null) {
        window.clearTimeout(finishTimerRef.current);
      }
    };
  }, []);

  function getRandomRoll(maxSides: number): number {
    return Math.floor(Math.random() * maxSides) + 1;
  }

  function handleRoll() {
    if (isRolling) return;

    const currentSides = sides;
    setIsRolling(true);
    setRollSides(currentSides);
    setDisplayRoll(getRandomRoll(currentSides));

    shuffleTimerRef.current = window.setInterval(() => {
      setDisplayRoll(getRandomRoll(currentSides));
    }, SHUFFLE_INTERVAL_MS);

    finishTimerRef.current = window.setTimeout(() => {
      if (shuffleTimerRef.current !== null) {
        window.clearInterval(shuffleTimerRef.current);
        shuffleTimerRef.current = null;
      }

      const finalRoll = getRandomRoll(currentSides);
      setRoll(finalRoll);
      setRollSides(currentSides);
      setDisplayRoll(finalRoll);
      setHistory((prev) => [{ id: ++rollIdRef.current, value: finalRoll, sides: currentSides }, ...prev].slice(0, 10));
      setIsRolling(false);
      finishTimerRef.current = null;
    }, ROLL_DURATION_MS);
  }

  const latestSides = rollSides ?? sides;
  const latestColor = getColorForSides(latestSides);
  const selectedDiceColor = getColorForSides(sides);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dice Roller</h2>
      <p className="text-sm text-text-secondary">
        Select a die from d4 to d100 and simulate random rolls.
      </p>

      <div className="grid gap-3 sm:grid-cols-[1fr_160px_120px]">
        <select
          value={sides}
          onChange={(event) => setSides(Number(event.target.value))}
          disabled={isRolling}
          className="rounded-lg border border-border px-3 py-2 text-sm outline-none transition-colors focus:border-accent/60"
          style={{
            backgroundColor: selectedDiceColor,
            color: "#1b1b24",
          }}
          aria-label="Select die sides"
        >
          {diceOptions.map((value) => (
            <option
              key={value}
              value={value}
              style={{
                backgroundColor: getColorForSides(value),
                color: "#1b1b24",
              }}
            >
              d{value}
            </option>
          ))}
        </select>

        <Button onClick={handleRoll} disabled={isRolling}>
          {isRolling ? "Rolling..." : `Roll d${sides}`}
        </Button>

        <Button
          variant="ghost"
          onClick={() => setHistory([])}
          disabled={history.length === 0 || isRolling}
        >
          Clear
        </Button>
      </div>

      <div className="rounded-lg border border-border bg-bg/40 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Latest Roll</p>
        <p className={`mt-1 font-mono text-xl ${isRolling ? "animate-pulse" : ""}`} style={{ color: latestColor }}>
          {displayRoll === null && roll === null ? "Roll to begin" : `${displayRoll ?? roll} / ${latestSides}`}
        </p>
      </div>

      <div className="rounded-lg border border-border bg-bg/25 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Recent Rolls</p>
        {history.length === 0 ? (
          <p className="mt-2 text-sm text-text-muted">No rolls yet.</p>
        ) : (
          <ul className="mt-2 flex flex-wrap gap-2">
            {history.map((entry) => (
              <li
                key={entry.id}
                className="rounded-md border px-2.5 py-1 text-sm"
                style={{
                  backgroundColor: getColorForSides(entry.sides),
                  color: "#1b1b24",
                  borderColor: "rgba(42, 42, 54, 0.55)",
                }}
              >
                {entry.value} / d{entry.sides}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

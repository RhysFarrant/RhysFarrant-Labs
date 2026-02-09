import { useMemo, useState } from "react";
import Input from "@/components/ui/Input";

type Operation = "+" | "-" | "*" | "/";

export default function CalculatorLab() {
  const [left, setLeft] = useState("12");
  const [right, setRight] = useState("8");
  const [operation, setOperation] = useState<Operation>("+");

  const result = useMemo(() => {
    const leftValue = Number(left);
    const rightValue = Number(right);

    if (Number.isNaN(leftValue) || Number.isNaN(rightValue)) {
      return "Enter valid numbers";
    }

    if (operation === "/" && rightValue === 0) {
      return "Division by zero";
    }

    const computed =
      operation === "+"
        ? leftValue + rightValue
        : operation === "-"
          ? leftValue - rightValue
          : operation === "*"
            ? leftValue * rightValue
            : leftValue / rightValue;

    return Number.isInteger(computed) ? String(computed) : computed.toFixed(4);
  }, [left, right, operation]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Calculator</h2>
      <p className="text-sm text-text-secondary">
        Simple arithmetic demo with immediate feedback.
      </p>

      <div className="grid gap-3 sm:grid-cols-[1fr_110px_1fr]">
        <Input
          value={left}
          onChange={(event) => setLeft(event.target.value)}
          inputMode="decimal"
          placeholder="First number"
          aria-label="First number"
        />
        <select
          value={operation}
          onChange={(event) => setOperation(event.target.value as Operation)}
          className="rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent/60"
          aria-label="Operation"
        >
          <option value="+">Add (+)</option>
          <option value="-">Subtract (-)</option>
          <option value="*">Multiply (*)</option>
          <option value="/">Divide (/)</option>
        </select>
        <Input
          value={right}
          onChange={(event) => setRight(event.target.value)}
          inputMode="decimal"
          placeholder="Second number"
          aria-label="Second number"
        />
      </div>

      <div className="rounded-lg border border-border bg-bg/40 px-4 py-3">
        <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Result</p>
        <p className="mt-1 font-mono text-xl text-text-primary">{result}</p>
      </div>
    </div>
  );
}

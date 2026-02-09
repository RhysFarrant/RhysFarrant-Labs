import { useMemo, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type FormState = {
  email: string;
  password: string;
  remember: boolean;
};

export default function LoginTestLab() {
  const [form, setForm] = useState<FormState>({
    email: "",
    password: "",
    remember: true,
  });
  const [submitted, setSubmitted] = useState(false);

  const validation = useMemo(() => {
    if (!form.email.includes("@")) {
      return "Enter a valid email address.";
    }
    if (form.password.length < 8) {
      return "Password must be at least 8 characters.";
    }
    return "";
  }, [form.email, form.password]);

  const canSubmit = validation.length === 0;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Login Test</h2>
      <p className="text-sm text-text-secondary">
        Form-state and validation harness for auth UI checks.
      </p>

      <form
        className="space-y-3"
        onSubmit={(event) => {
          event.preventDefault();
          setSubmitted(true);
        }}
      >
        <Input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, email: event.target.value }))
          }
          aria-label="Email"
        />
        <Input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, password: event.target.value }))
          }
          aria-label="Password"
        />

        <label className="inline-flex items-center gap-2 text-sm text-text-secondary">
          <input
            type="checkbox"
            checked={form.remember}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, remember: event.target.checked }))
            }
            className="h-4 w-4 rounded border-border bg-surface accent-accent"
          />
          Remember me
        </label>

        <Button type="submit" fullWidth disabled={!canSubmit}>
          Simulate Login
        </Button>
      </form>

      {validation && <p className="text-sm text-amber-300">{validation}</p>}

      {submitted && canSubmit && (
        <div className="rounded-lg border border-emerald-400/35 bg-emerald-400/10 px-4 py-3">
          <p className="text-sm text-emerald-300">Login simulation completed.</p>
          <p className="mt-1 text-xs text-text-secondary">
            Remember: {form.remember ? "on" : "off"}
          </p>
        </div>
      )}
    </div>
  );
}

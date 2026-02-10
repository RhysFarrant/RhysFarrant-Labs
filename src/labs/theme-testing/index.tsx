import { type ChangeEvent, useRef, useState } from "react";

type ThemeMode = "light" | "dark";

type ThemeTokens = {
  appBg: string;
  surface: string;
  surfaceAlt: string;
  border: string;
  text: string;
  textMuted: string;
  primary: string;
  primaryText: string;
  link: string;
  inputBg: string;
  inputText: string;
  focus: string;
};

type ThemePayload = {
  mode: ThemeMode;
  themes: Record<ThemeMode, ThemeTokens>;
};

const lightThemeDefaults: ThemeTokens = {
  appBg: "#F5F7FB",
  surface: "#FFFFFF",
  surfaceAlt: "#EEF3FF",
  border: "#D6DEEE",
  text: "#121B2F",
  textMuted: "#5A6782",
  primary: "#2E62FF",
  primaryText: "#FFFFFF",
  link: "#1B4BDC",
  inputBg: "#F9FBFF",
  inputText: "#0E1730",
  focus: "#89A8FF",
};

const darkThemeDefaults: ThemeTokens = {
  appBg: "#0F1320",
  surface: "#171D2E",
  surfaceAlt: "#1D263A",
  border: "#2E3A56",
  text: "#EDF2FF",
  textMuted: "#A4B0CC",
  primary: "#82A4FF",
  primaryText: "#111A2F",
  link: "#9AB7FF",
  inputBg: "#10182A",
  inputText: "#E9EEFF",
  focus: "#6E92FA",
};

const themeFields: Array<{ key: keyof ThemeTokens; label: string }> = [
  { key: "appBg", label: "Page Background" },
  { key: "surface", label: "Surface" },
  { key: "surfaceAlt", label: "Surface Alt" },
  { key: "border", label: "Border" },
  { key: "text", label: "Text" },
  { key: "textMuted", label: "Muted Text" },
  { key: "primary", label: "Primary Button" },
  { key: "primaryText", label: "Primary Text" },
  { key: "link", label: "Link" },
  { key: "inputBg", label: "Input Background" },
  { key: "inputText", label: "Input Text" },
  { key: "focus", label: "Focus Ring" },
];

const themePresets: Record<ThemeMode, ThemeTokens> = {
  light: lightThemeDefaults,
  dark: darkThemeDefaults,
};

function isThemeMode(value: unknown): value is ThemeMode {
  return value === "light" || value === "dark";
}

function isThemeTokens(value: unknown): value is ThemeTokens {
  if (!value || typeof value !== "object") {
    return false;
  }

  const record = value as Record<string, unknown>;
  return themeFields.every((field) => typeof record[field.key] === "string");
}

function parsePayload(value: unknown): ThemePayload | null {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;
  const incomingThemes = ("themes" in record ? record.themes : record) as
    | Record<string, unknown>
    | undefined;

  if (!incomingThemes || typeof incomingThemes !== "object") {
    return null;
  }

  const light = incomingThemes.light;
  const dark = incomingThemes.dark;

  if (!isThemeTokens(light) || !isThemeTokens(dark)) {
    return null;
  }

  const mode = isThemeMode(record.mode) ? record.mode : "dark";
  return {
    mode,
    themes: {
      light,
      dark,
    },
  };
}

export default function ThemeTestingLab() {
  const [mode, setMode] = useState<ThemeMode>("dark");
  const [themes, setThemes] = useState<Record<ThemeMode, ThemeTokens>>({
    light: lightThemeDefaults,
    dark: darkThemeDefaults,
  });
  const [transferStatus, setTransferStatus] = useState("");
  const importInputRef = useRef<HTMLInputElement | null>(null);

  const activeTheme = themes[mode];
  const toggleMode = () =>
    setMode((previous) => (previous === "light" ? "dark" : "light"));

  const applyPayload = (payload: ThemePayload) => {
    setThemes(payload.themes);
    setMode(payload.mode);
  };

  const handleExport = () => {
    const payload: ThemePayload = { mode, themes };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const objectUrl = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = objectUrl;
    link.download = "theme-testing-config.json";
    link.click();
    URL.revokeObjectURL(objectUrl);
    setTransferStatus("Exported JSON file.");
  };

  const handleImportFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    try {
      const content = await file.text();
      const parsedPayload = parsePayload(JSON.parse(content));
      if (!parsedPayload) {
        setTransferStatus("Import failed: invalid JSON shape.");
        return;
      }

      applyPayload(parsedPayload);
      setTransferStatus(`Imported ${file.name}.`);
    } catch {
      setTransferStatus("Import failed: invalid JSON file.");
    } finally {
      event.target.value = "";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-xl font-semibold">Theme Testing</h2>
          <p className="mt-1 text-sm text-text-secondary">
            Tune light and dark theme colors, then inspect a live mock site preview.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleExport}
              className="rounded-md border border-border bg-surface/70 px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
            >
              Export JSON
            </button>
            <button
              type="button"
              onClick={() => importInputRef.current?.click()}
              className="rounded-md border border-border bg-surface/70 px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
            >
              Import JSON
            </button>
            <input
              ref={importInputRef}
              type="file"
              accept="application/json,.json"
              onChange={handleImportFile}
              className="hidden"
              aria-label="Import theme JSON file"
            />
          </div>
          <p className="text-[11px] text-text-muted">{transferStatus}</p>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <section className="rounded-xl border border-border bg-bg/35 p-4">
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="relative grid h-9 w-[164px] grid-cols-2 rounded-full border border-border bg-surface/70 p-1">
              <span
                aria-hidden="true"
                className={`pointer-events-none absolute left-1 top-1 h-7 w-[calc(50%-0.25rem)] rounded-full bg-accent/30 shadow-sm transition-transform duration-300 ease-out ${
                  mode === "dark" ? "translate-x-full" : "translate-x-0"
                }`}
              />
              <button
                type="button"
                onClick={toggleMode}
                className={`relative z-10 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === "light"
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={toggleMode}
                className={`relative z-10 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                  mode === "dark"
                    ? "text-text-primary"
                    : "text-text-muted hover:text-text-primary"
                }`}
              >
                Dark
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setThemes((previous) => ({
                  ...previous,
                  [mode]: themePresets[mode],
                }))
              }
              className="rounded-md border border-border bg-surface/70 px-3 py-1.5 text-xs text-text-secondary transition-colors hover:text-text-primary"
            >
              Reset {mode}
            </button>
          </div>

          <p className="mb-3 text-xs uppercase tracking-[0.14em] text-text-muted">
            Editing {mode} theme
          </p>

          <div className="space-y-2">
            {themeFields.map((field) => (
              <label
                key={field.key}
                className="grid grid-cols-[1fr_auto] items-center gap-2 rounded-md border border-border/70 bg-surface/45 px-2.5 py-2"
              >
                <div>
                  <p className="text-xs text-text-primary">{field.label}</p>
                  <p className="text-[11px] text-text-muted">{activeTheme[field.key]}</p>
                </div>
                <input
                  type="color"
                  value={activeTheme[field.key]}
                  onChange={(event) =>
                    setThemes((previous) => ({
                      ...previous,
                      [mode]: {
                        ...previous[mode],
                        [field.key]: event.target.value,
                      },
                    }))
                  }
                  className="h-9 w-12 cursor-pointer rounded border border-border bg-transparent p-1"
                  aria-label={`Set ${field.label} color`}
                />
              </label>
            ))}
          </div>

        </section>

        <section
          className="rounded-xl border p-4 sm:p-5"
          style={{
            background: `linear-gradient(145deg, ${activeTheme.appBg} 0%, ${activeTheme.surfaceAlt} 100%)`,
            borderColor: activeTheme.border,
            color: activeTheme.text,
          }}
        >
          <div
            className="overflow-hidden rounded-xl border"
            style={{
              borderColor: activeTheme.border,
              backgroundColor: activeTheme.surface,
              color: activeTheme.text,
              boxShadow: `0 18px 42px -28px ${activeTheme.appBg}`,
            }}
          >
            <header
              className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3"
              style={{ borderColor: activeTheme.border }}
            >
              <div>
                <p className="text-xs uppercase tracking-[0.16em]" style={{ color: activeTheme.textMuted }}>
                  Mock Site
                </p>
                <p className="text-sm font-semibold">Theme Sandbox</p>
              </div>
              <nav className="flex items-center gap-4 text-sm">
                <a href="#" style={{ color: activeTheme.link }}>
                  Pricing
                </a>
                <a href="#" style={{ color: activeTheme.link }}>
                  Docs
                </a>
                <button
                  type="button"
                  className="rounded-md px-3 py-1.5 text-xs font-medium"
                  style={{
                    backgroundColor: activeTheme.primary,
                    color: activeTheme.primaryText,
                  }}
                >
                  Start Trial
                </button>
              </nav>
            </header>

            <div className="grid gap-4 p-4 lg:grid-cols-[1.1fr_0.9fr]">
              <article
                className="rounded-lg border p-4"
                style={{
                  borderColor: activeTheme.border,
                  backgroundColor: activeTheme.surfaceAlt,
                }}
              >
                <h3 className="text-lg font-semibold">Welcome back, Design Team</h3>
                <p className="mt-2 text-sm" style={{ color: activeTheme.textMuted }}>
                  Use this mock layout to test text contrast, borders, buttons, and forms while switching
                  between light and dark palettes.
                </p>
                <a
                  href="#"
                  className="mt-3 inline-flex text-sm font-medium"
                  style={{ color: activeTheme.link }}
                >
                  View documentation
                </a>

                <div className="mt-4 flex flex-wrap gap-2">
                  <span
                    className="rounded-full border px-2 py-1 text-xs"
                    style={{ borderColor: activeTheme.border, color: activeTheme.textMuted }}
                  >
                    Badge
                  </span>
                  <span
                    className="rounded-full px-2 py-1 text-xs font-semibold"
                    style={{
                      backgroundColor: activeTheme.primary,
                      color: activeTheme.primaryText,
                    }}
                  >
                    New Feature
                  </span>
                </div>
              </article>

              <form
                className="space-y-3 rounded-lg border p-4"
                style={{
                  borderColor: activeTheme.border,
                  backgroundColor: activeTheme.surface,
                }}
              >
                <p className="text-sm font-semibold">Quick Settings</p>

                <label className="block text-xs" style={{ color: activeTheme.textMuted }}>
                  Project Name
                </label>
                <input
                  placeholder="Apollo"
                  className="w-full rounded-md border px-3 py-2 text-sm outline-none"
                  style={{
                    borderColor: activeTheme.border,
                    backgroundColor: activeTheme.inputBg,
                    color: activeTheme.inputText,
                    boxShadow: `0 0 0 2px ${activeTheme.focus}33`,
                  }}
                />

                <label className="block text-xs" style={{ color: activeTheme.textMuted }}>
                  Environment
                </label>
                <select
                  className="w-full rounded-md border px-3 py-2 text-sm"
                  style={{
                    borderColor: activeTheme.border,
                    backgroundColor: activeTheme.inputBg,
                    color: activeTheme.inputText,
                  }}
                  defaultValue="Staging"
                >
                  <option>Development</option>
                  <option>Staging</option>
                  <option>Production</option>
                </select>

                <label
                  className="flex items-center gap-2 text-xs"
                  style={{ color: activeTheme.textMuted }}
                >
                  <input
                    type="checkbox"
                    defaultChecked
                    style={{ accentColor: activeTheme.primary }}
                  />
                  Enable email notifications
                </label>

                <div className="flex gap-2 pt-1">
                  <button
                    type="button"
                    className="rounded-md border px-3 py-2 text-xs font-medium"
                    style={{
                      borderColor: activeTheme.border,
                      color: activeTheme.textMuted,
                      backgroundColor: activeTheme.surfaceAlt,
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="rounded-md px-3 py-2 text-xs font-medium"
                    style={{
                      backgroundColor: activeTheme.primary,
                      color: activeTheme.primaryText,
                    }}
                  >
                    Save changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type PrimitiveValue = string | boolean;

type FieldValues = Record<string, PrimitiveValue>;

type VisibilityRule = {
  field: string;
  equals: PrimitiveValue;
};

type BaseNode = {
  id: string;
  type: string;
  visibleWhen?: VisibilityRule;
};

type TextNode = BaseNode & {
  type: "text";
  text: string;
  tone?: "default" | "muted" | "success" | "danger";
};

type InputNode = BaseNode & {
  type: "input";
  name: string;
  label: string;
  placeholder?: string;
  inputType?: "text" | "email" | "number" | "password";
  defaultValue?: string;
};

type TextareaNode = BaseNode & {
  type: "textarea";
  name: string;
  label: string;
  placeholder?: string;
  rows?: number;
  defaultValue?: string;
};

type SelectNode = BaseNode & {
  type: "select";
  name: string;
  label: string;
  options: Array<{ label: string; value: string }>;
  defaultValue?: string;
};

type CheckboxNode = BaseNode & {
  type: "checkbox";
  name: string;
  label: string;
  helperText?: string;
  defaultChecked?: boolean;
};

type DividerNode = BaseNode & {
  type: "divider";
  label?: string;
};

type ButtonNode = BaseNode & {
  type: "button";
  label: string;
  action: "submit" | "reset" | "notify";
  variant?: "primary" | "ghost";
  message?: string;
};

type RendererNode =
  | TextNode
  | InputNode
  | TextareaNode
  | SelectNode
  | CheckboxNode
  | DividerNode
  | ButtonNode;

type RendererConfig = {
  meta: {
    title: string;
    description: string;
  };
  elements: RendererNode[];
};

type Preset = {
  id: string;
  label: string;
  description: string;
  config: RendererConfig;
};

const basePresets: Preset[] = [
  {
    id: "onboarding",
    label: "Team Onboarding",
    description: "A typical account setup flow with conditional team-size input.",
    config: {
      meta: {
        title: "Workspace Onboarding",
        description: "Generated from JSON config. No JSX is hardcoded for these fields.",
      },
      elements: [
        {
          id: "intro",
          type: "text",
          text: "Choose a plan and complete setup fields to simulate a config-driven form.",
          tone: "muted",
        },
        {
          id: "name",
          type: "input",
          name: "fullName",
          label: "Full Name",
          placeholder: "Avery Jordan",
          defaultValue: "",
        },
        {
          id: "email",
          type: "input",
          name: "email",
          label: "Email",
          inputType: "email",
          placeholder: "avery@company.co",
          defaultValue: "",
        },
        {
          id: "plan",
          type: "select",
          name: "plan",
          label: "Plan",
          defaultValue: "starter",
          options: [
            { label: "Starter", value: "starter" },
            { label: "Team", value: "team" },
            { label: "Enterprise", value: "enterprise" },
          ],
        },
        {
          id: "seat-count",
          type: "input",
          name: "seats",
          label: "Estimated Seats",
          inputType: "number",
          placeholder: "25",
          visibleWhen: {
            field: "plan",
            equals: "team",
          },
        },
        {
          id: "beta-opt-in",
          type: "checkbox",
          name: "betaOptIn",
          label: "Join early-access features",
          helperText: "Toggles conditional messaging from the same config schema.",
          defaultChecked: false,
        },
        {
          id: "beta-note",
          type: "text",
          text: "Early-access is enabled for this workspace.",
          tone: "success",
          visibleWhen: {
            field: "betaOptIn",
            equals: true,
          },
        },
        {
          id: "divider",
          type: "divider",
          label: "Actions",
        },
        {
          id: "submit",
          type: "button",
          label: "Submit Payload",
          action: "submit",
          variant: "primary",
        },
        {
          id: "notify",
          type: "button",
          label: "Show Help Notice",
          action: "notify",
          variant: "ghost",
          message: "Schema-driven UIs make behavior reusable across multiple products.",
        },
        {
          id: "reset",
          type: "button",
          label: "Reset Values",
          action: "reset",
          variant: "ghost",
        },
      ],
    },
  },
  {
    id: "support",
    label: "Support Ticket",
    description: "A dynamic service form with severity-aware follow-up content.",
    config: {
      meta: {
        title: "Support Request Builder",
        description: "Rendered from config entries often used in internal admin tools.",
      },
      elements: [
        {
          id: "support-intro",
          type: "text",
          text: "Capture issue details without modifying React component code.",
          tone: "muted",
        },
        {
          id: "subject",
          type: "input",
          name: "subject",
          label: "Issue Subject",
          placeholder: "Checkout timeout on Safari",
        },
        {
          id: "severity",
          type: "select",
          name: "severity",
          label: "Severity",
          defaultValue: "medium",
          options: [
            { label: "Low", value: "low" },
            { label: "Medium", value: "medium" },
            { label: "Critical", value: "critical" },
          ],
        },
        {
          id: "description",
          type: "textarea",
          name: "description",
          label: "Description",
          rows: 4,
          placeholder: "Share exact steps and expected behavior...",
        },
        {
          id: "pager",
          type: "checkbox",
          name: "pagerDuty",
          label: "Trigger escalation path",
          helperText: "Use for production-impacting incidents.",
          defaultChecked: false,
        },
        {
          id: "critical-tip",
          type: "text",
          text: "Critical incidents should include timestamps and request IDs.",
          tone: "danger",
          visibleWhen: {
            field: "severity",
            equals: "critical",
          },
        },
        {
          id: "support-divider",
          type: "divider",
          label: "Submission",
        },
        {
          id: "support-submit",
          type: "button",
          label: "Create Ticket",
          action: "submit",
        },
        {
          id: "support-reset",
          type: "button",
          label: "Clear",
          action: "reset",
          variant: "ghost",
        },
      ],
    },
  },
];

function toConfigText(config: RendererConfig): string {
  return JSON.stringify(config, null, 2);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isPrimitiveValue(value: unknown): value is PrimitiveValue {
  return typeof value === "string" || typeof value === "boolean";
}

function hasVisibilityRule(value: unknown): value is VisibilityRule {
  if (!isRecord(value)) return false;
  return typeof value.field === "string" && isPrimitiveValue(value.equals);
}

function isBaseNode(value: unknown): value is BaseNode {
  if (!isRecord(value)) return false;
  if (typeof value.id !== "string" || typeof value.type !== "string") return false;
  if (value.visibleWhen === undefined) return true;
  return hasVisibilityRule(value.visibleWhen);
}

function parseNode(value: unknown): RendererNode | null {
  if (!isBaseNode(value)) return null;

  if (value.type === "text") {
    if (typeof value.text !== "string") return null;
    const tone = value.tone;
    if (
      tone !== undefined &&
      tone !== "default" &&
      tone !== "muted" &&
      tone !== "success" &&
      tone !== "danger"
    ) {
      return null;
    }
    return {
      id: value.id,
      type: "text",
      text: value.text,
      tone,
      visibleWhen: value.visibleWhen,
    };
  }

  if (value.type === "input") {
    if (typeof value.name !== "string" || typeof value.label !== "string") return null;
    if (value.placeholder !== undefined && typeof value.placeholder !== "string") return null;
    if (value.defaultValue !== undefined && typeof value.defaultValue !== "string") return null;
    const inputType = value.inputType;
    if (
      inputType !== undefined &&
      inputType !== "text" &&
      inputType !== "email" &&
      inputType !== "number" &&
      inputType !== "password"
    ) {
      return null;
    }
    return {
      id: value.id,
      type: "input",
      name: value.name,
      label: value.label,
      placeholder: value.placeholder,
      defaultValue: value.defaultValue,
      inputType,
      visibleWhen: value.visibleWhen,
    };
  }

  if (value.type === "textarea") {
    if (typeof value.name !== "string" || typeof value.label !== "string") return null;
    if (value.placeholder !== undefined && typeof value.placeholder !== "string") return null;
    if (value.defaultValue !== undefined && typeof value.defaultValue !== "string") return null;
    if (value.rows !== undefined && typeof value.rows !== "number") return null;
    return {
      id: value.id,
      type: "textarea",
      name: value.name,
      label: value.label,
      placeholder: value.placeholder,
      rows: value.rows,
      defaultValue: value.defaultValue,
      visibleWhen: value.visibleWhen,
    };
  }

  if (value.type === "select") {
    if (typeof value.name !== "string" || typeof value.label !== "string") return null;
    if (!Array.isArray(value.options) || value.options.length === 0) return null;
    const options = value.options
      .map((option) => {
        if (!isRecord(option)) return null;
        if (typeof option.label !== "string" || typeof option.value !== "string") return null;
        return { label: option.label, value: option.value };
      })
      .filter((option): option is { label: string; value: string } => option !== null);
    if (options.length !== value.options.length) return null;
    if (value.defaultValue !== undefined && typeof value.defaultValue !== "string") return null;
    return {
      id: value.id,
      type: "select",
      name: value.name,
      label: value.label,
      options,
      defaultValue: value.defaultValue,
      visibleWhen: value.visibleWhen,
    };
  }

  if (value.type === "checkbox") {
    if (typeof value.name !== "string" || typeof value.label !== "string") return null;
    if (value.helperText !== undefined && typeof value.helperText !== "string") return null;
    if (value.defaultChecked !== undefined && typeof value.defaultChecked !== "boolean") return null;
    return {
      id: value.id,
      type: "checkbox",
      name: value.name,
      label: value.label,
      helperText: value.helperText,
      defaultChecked: value.defaultChecked,
      visibleWhen: value.visibleWhen,
    };
  }

  if (value.type === "divider") {
    if (value.label !== undefined && typeof value.label !== "string") return null;
    return {
      id: value.id,
      type: "divider",
      label: value.label,
      visibleWhen: value.visibleWhen,
    };
  }

  if (value.type === "button") {
    if (typeof value.label !== "string") return null;
    if (value.action !== "submit" && value.action !== "reset" && value.action !== "notify") return null;
    if (value.variant !== undefined && value.variant !== "primary" && value.variant !== "ghost") return null;
    if (value.message !== undefined && typeof value.message !== "string") return null;
    return {
      id: value.id,
      type: "button",
      label: value.label,
      action: value.action,
      variant: value.variant,
      message: value.message,
      visibleWhen: value.visibleWhen,
    };
  }

  return null;
}

function parseRendererConfig(value: unknown): { config: RendererConfig | null; error: string | null } {
  if (!isRecord(value)) {
    return { config: null, error: "Config must be a JSON object." };
  }

  if (!isRecord(value.meta)) {
    return { config: null, error: "Config requires a meta object." };
  }

  if (typeof value.meta.title !== "string" || typeof value.meta.description !== "string") {
    return { config: null, error: "meta.title and meta.description must be strings." };
  }

  if (!Array.isArray(value.elements)) {
    return { config: null, error: "Config requires an elements array." };
  }

  const parsedNodes: RendererNode[] = [];
  for (const element of value.elements) {
    const parsedNode = parseNode(element);
    if (!parsedNode) {
      return {
        config: null,
        error: "At least one element is invalid. Check type-specific properties.",
      };
    }
    parsedNodes.push(parsedNode);
  }

  const ids = new Set<string>();
  for (const node of parsedNodes) {
    if (ids.has(node.id)) {
      return {
        config: null,
        error: `Duplicate element id found: "${node.id}".`,
      };
    }
    ids.add(node.id);
  }

  return {
    config: {
      meta: {
        title: value.meta.title,
        description: value.meta.description,
      },
      elements: parsedNodes,
    },
    error: null,
  };
}

function getInitialFieldValues(config: RendererConfig): FieldValues {
  return config.elements.reduce((state, node) => {
    if (node.type === "input") {
      state[node.name] = node.defaultValue ?? "";
    }
    if (node.type === "textarea") {
      state[node.name] = node.defaultValue ?? "";
    }
    if (node.type === "select") {
      const fallback = node.options[0]?.value ?? "";
      state[node.name] = node.defaultValue ?? fallback;
    }
    if (node.type === "checkbox") {
      state[node.name] = Boolean(node.defaultChecked);
    }
    return state;
  }, {} as FieldValues);
}

function shouldRender(node: RendererNode, values: FieldValues): boolean {
  if (!node.visibleWhen) return true;
  return values[node.visibleWhen.field] === node.visibleWhen.equals;
}

function textToneClass(tone: TextNode["tone"]): string {
  if (tone === "muted") return "text-text-muted";
  if (tone === "success") return "text-emerald-300";
  if (tone === "danger") return "text-rose-300";
  return "text-text-secondary";
}

export default function ConfigDrivenUiRendererLab() {
  const [selectedPresetId, setSelectedPresetId] = useState(basePresets[0].id);
  const [activeConfig, setActiveConfig] = useState<RendererConfig>(basePresets[0].config);
  const [configDraft, setConfigDraft] = useState(toConfigText(basePresets[0].config));
  const [isLargeEditorOpen, setIsLargeEditorOpen] = useState(false);
  const [fieldValues, setFieldValues] = useState<FieldValues>(getInitialFieldValues(basePresets[0].config));
  const [rendererMessage, setRendererMessage] = useState<string>(
    "Renderer ready. Interact with generated components or edit config JSON."
  );
  const [configError, setConfigError] = useState<string | null>(null);

  const visibleElementCount = useMemo(() => {
    return activeConfig.elements.filter((node) => shouldRender(node, fieldValues)).length;
  }, [activeConfig.elements, fieldValues]);

  useEffect(() => {
    if (!isLargeEditorOpen) {
      return;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isLargeEditorOpen]);

  function loadPreset(presetId: string) {
    const preset = basePresets.find((item) => item.id === presetId);
    if (!preset) return;
    setSelectedPresetId(preset.id);
    setActiveConfig(preset.config);
    setConfigDraft(toConfigText(preset.config));
    setFieldValues(getInitialFieldValues(preset.config));
    setConfigError(null);
    setRendererMessage(`Loaded preset: ${preset.label}`);
  }

  function applyDraftConfig() {
    try {
      const parsed = JSON.parse(configDraft) as unknown;
      const result = parseRendererConfig(parsed);
      if (!result.config || result.error) {
        setConfigError(result.error ?? "Invalid config.");
        return;
      }
      setActiveConfig(result.config);
      setFieldValues(getInitialFieldValues(result.config));
      setConfigError(null);
      setRendererMessage("Custom config applied successfully.");
    } catch {
      setConfigError("Invalid JSON syntax. Fix parsing issues and retry.");
    }
  }

  function applyDraftConfigAndClose() {
    applyDraftConfig();
    setIsLargeEditorOpen(false);
  }

  function revertDraftAndClose() {
    setConfigDraft(toConfigText(activeConfig));
    setConfigError(null);
    setIsLargeEditorOpen(false);
  }

  function resetRendererValues() {
    setFieldValues(getInitialFieldValues(activeConfig));
    setRendererMessage("Field values reset from current config defaults.");
  }

  function handleButtonAction(node: ButtonNode) {
    if (node.action === "submit") {
      setRendererMessage(`Submitted payload: ${JSON.stringify(fieldValues)}`);
      return;
    }
    if (node.action === "reset") {
      resetRendererValues();
      return;
    }
    setRendererMessage(node.message ?? "Notification action executed from config.");
  }

  function renderNode(node: RendererNode) {
    if (!shouldRender(node, fieldValues)) {
      return null;
    }

    if (node.type === "text") {
      return (
        <p key={node.id} className={`text-sm ${textToneClass(node.tone)}`}>
          {node.text}
        </p>
      );
    }

    if (node.type === "divider") {
      return (
        <div key={node.id} className="my-1 border-t border-border pt-2">
          {node.label ? (
            <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">{node.label}</p>
          ) : null}
        </div>
      );
    }

    if (node.type === "button") {
      return (
        <Button
          key={node.id}
          variant={node.variant ?? "primary"}
          onClick={() => handleButtonAction(node)}
          className="mr-2"
        >
          {node.label}
        </Button>
      );
    }

    if (node.type === "input") {
      return (
        <label key={node.id} className="block">
          <span className="text-xs text-text-muted">{node.label}</span>
          <Input
            type={node.inputType ?? "text"}
            placeholder={node.placeholder}
            value={String(fieldValues[node.name] ?? "")}
            onChange={(event) =>
              setFieldValues((current) => ({
                ...current,
                [node.name]: event.target.value,
              }))
            }
          />
        </label>
      );
    }

    if (node.type === "textarea") {
      return (
        <label key={node.id} className="block">
          <span className="text-xs text-text-muted">{node.label}</span>
          <textarea
            rows={node.rows ?? 3}
            value={String(fieldValues[node.name] ?? "")}
            placeholder={node.placeholder}
            onChange={(event) =>
              setFieldValues((current) => ({
                ...current,
                [node.name]: event.target.value,
              }))
            }
            className="mt-1 w-full rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted/80 focus:border-accent/60"
          />
        </label>
      );
    }

    if (node.type === "select") {
      return (
        <label key={node.id} className="block">
          <span className="text-xs text-text-muted">{node.label}</span>
          <select
            value={String(fieldValues[node.name] ?? "")}
            onChange={(event) =>
              setFieldValues((current) => ({
                ...current,
                [node.name]: event.target.value,
              }))
            }
            className="mt-1 w-full rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent/60"
          >
            {node.options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      );
    }

    return (
      <label key={node.id} className="block rounded-lg border border-border/70 bg-surface/45 px-3 py-2">
        <div className="flex items-start gap-2">
          <input
            type="checkbox"
            checked={Boolean(fieldValues[node.name])}
            onChange={(event) =>
              setFieldValues((current) => ({
                ...current,
                [node.name]: event.target.checked,
              }))
            }
            className="mt-0.5 h-4 w-4 accent-accent"
          />
          <div>
            <p className="text-sm text-text-secondary">{node.label}</p>
            {node.helperText ? <p className="text-xs text-text-muted">{node.helperText}</p> : null}
          </div>
        </div>
      </label>
    );
  }

  const selectedPreset = basePresets.find((item) => item.id === selectedPresetId) ?? basePresets[0];

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Config-Driven UI Renderer</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Render UI from a JSON schema by mapping config nodes to reusable presentation components.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[380px_1fr]">
        <section className="space-y-3 rounded-xl border border-border bg-bg/35 p-4">
          <div>
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Presets</p>
            <div className="mt-2 space-y-2">
              {basePresets.map((preset) => (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => loadPreset(preset.id)}
                  className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                    preset.id === selectedPresetId
                      ? "border-accent/60 bg-accent/10"
                      : "border-border bg-surface/40 hover:border-text-muted"
                  }`}
                >
                  <p className="text-sm font-medium text-text-primary">{preset.label}</p>
                  <p className="mt-1 text-xs text-text-muted">{preset.description}</p>
                </button>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-surface/45 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Config Editor</p>
            <textarea
              value={configDraft}
              onChange={(event) => setConfigDraft(event.target.value)}
              className="mt-2 h-64 w-full rounded-lg border border-border bg-bg/45 px-3 py-2 font-mono text-xs text-text-secondary outline-none transition-colors focus:border-accent/60"
              spellCheck={false}
            />
            <div className="mt-2 flex flex-wrap gap-2">
              <Button onClick={applyDraftConfig}>Apply Config</Button>
              <Button variant="ghost" onClick={() => setConfigDraft(toConfigText(activeConfig))}>
                Revert Draft
              </Button>
              <Button variant="ghost" onClick={() => setIsLargeEditorOpen(true)}>
                Open Large Editor
              </Button>
            </div>
            {configError ? <p className="mt-2 text-xs text-rose-300">{configError}</p> : null}
          </div>

          <div className="rounded-lg border border-border/70 bg-surface/45 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Renderer Status</p>
            <div className="mt-2 max-h-24 overflow-y-auto pr-1">
              <p className="text-xs text-text-secondary whitespace-pre-wrap break-all">{rendererMessage}</p>
            </div>
            <p className="mt-1 text-xs text-text-muted">
              Visible elements: {visibleElementCount} / {activeConfig.elements.length}
            </p>
            <p className="mt-1 text-xs text-text-muted">Active preset: {selectedPreset.label}</p>
          </div>
        </section>

        <section className="rounded-xl border border-border bg-surface/55 p-4 sm:p-5">
          <div className="mb-4">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Rendered Output</p>
            <h3 className="text-lg font-semibold">{activeConfig.meta.title}</h3>
            <p className="mt-1 text-sm text-text-secondary">{activeConfig.meta.description}</p>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-bg/35 p-4">
            {activeConfig.elements.map((node) => renderNode(node))}
          </div>

          <div className="mt-4 rounded-lg border border-border bg-bg/25 p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">State Snapshot</p>
              <Button variant="ghost" onClick={resetRendererValues}>
                Reset Values
              </Button>
            </div>
            <pre className="mt-2 overflow-x-auto text-[11px] text-text-secondary">
{JSON.stringify(fieldValues, null, 2)}
            </pre>
          </div>
        </section>
      </div>

      {isLargeEditorOpen && typeof document !== "undefined"
        ? createPortal(
            <div
              className="fixed inset-0 z-[80] bg-black/55 p-4 sm:p-6"
              onClick={() => setIsLargeEditorOpen(false)}
            >
              <div
                className="mx-auto flex h-full max-w-6xl flex-col rounded-xl border border-border bg-bg/95 p-4 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <div className="mb-3 flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Config Editor</p>
                    <p className="text-sm text-text-secondary">Large popout for easier schema editing.</p>
                  </div>
                  <Button variant="ghost" onClick={() => setIsLargeEditorOpen(false)}>
                    Close
                  </Button>
                </div>

                <textarea
                  value={configDraft}
                  onChange={(event) => setConfigDraft(event.target.value)}
                  className="min-h-0 flex-1 rounded-lg border border-border bg-bg/45 px-3 py-2 font-mono text-xs text-text-secondary outline-none transition-colors focus:border-accent/60"
                  spellCheck={false}
                />

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button onClick={applyDraftConfigAndClose}>Apply Config</Button>
                  <Button variant="ghost" onClick={revertDraftAndClose}>
                    Revert Draft
                  </Button>
                  <Button variant="ghost" onClick={() => setIsLargeEditorOpen(false)}>
                    Done
                  </Button>
                </div>
                {configError ? <p className="mt-2 text-xs text-rose-300">{configError}</p> : null}
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

import { useEffect, useId, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

type FeedbackTone = "idle" | "success" | "failure";
type CardState = "idle" | "saving" | "success" | "failure";
type ExportState = "idle" | "working" | "done";
type ReorderItem = { id: string; label: string };

const toneClasses: Record<FeedbackTone, string> = {
  idle: "border-border/70 bg-bg/35 text-text-muted",
  success: "border-emerald-400/50 bg-emerald-500/10 text-emerald-200",
  failure: "border-rose-400/50 bg-rose-500/10 text-rose-200",
};

const cards = [
  {
    id: "alpha",
    title: "Alpha Card",
    description: "Lift on hover, compress on press.",
  },
  {
    id: "beta",
    title: "Beta Card",
    description: "Same motion, separate content target.",
  },
];

const searchOptions = [
  "Alpha",
  "Bravo",
  "Charlie",
  "Delta",
  "Echo",
  "Foxtrot",
  "Golf",
  "Hotel",
  "India",
  "Juliett",
];

const tabItems = [
  {
    id: "overview",
    label: "Overview",
    title: "Overview Panel",
    body: "Quick summary content for the selected view.",
  },
  {
    id: "activity",
    label: "Activity",
    title: "Activity Panel",
    body: "Recent actions and timeline updates in a compact feed.",
  },
  {
    id: "exports",
    label: "Exports",
    title: "Exports Panel",
    body: "Export history and destination status for generated assets.",
  },
  {
    id: "settings",
    label: "Settings",
    title: "Settings Panel",
    body: "Configuration controls and defaults for this workspace.",
  },
];

const reorderItemsSeed: ReorderItem[] = [
  { id: "brief", label: "Project Brief" },
  { id: "wireframe", label: "Wireframe Draft" },
  { id: "copy", label: "Copy Pass" },
  { id: "assets", label: "Asset Export" },
  { id: "qa", label: "QA Review" },
  { id: "release", label: "Release Prep" },
];

function toLabel(tone: FeedbackTone): string {
  if (tone === "success") return "Success";
  if (tone === "failure") return "Failure";
  return "Idle";
}

export default function MicroAnimationPlaygroundLab() {
  const [pressCount, setPressCount] = useState(0);
  const [buttonFeedback, setButtonFeedback] = useState<FeedbackTone>("idle");
  const [toggleEnabled, setToggleEnabled] = useState(false);
  const [togglePulse, setTogglePulse] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState(cards[0].id);
  const [cardState, setCardState] = useState<CardState>("idle");
  const [dateInput, setDateInput] = useState("");
  const [timeInput, setTimeInput] = useState("");
  const [dateTimeInput, setDateTimeInput] = useState("");
  const [monthInput, setMonthInput] = useState("");
  const [weekInput, setWeekInput] = useState("");
  const [textInput, setTextInput] = useState("");
  const [integerInput, setIntegerInput] = useState("");
  const [decimalInput, setDecimalInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [activeSearchIndex, setActiveSearchIndex] = useState(-1);
  const [selectedSearchOption, setSelectedSearchOption] = useState("");
  const [activeTabId, setActiveTabId] = useState(tabItems[0].id);
  const [tabIndicator, setTabIndicator] = useState({ left: 0, width: 0 });
  const [errorMessageDraft, setErrorMessageDraft] = useState(
    "Intentional test error."
  );
  const [shouldThrowError, setShouldThrowError] = useState(false);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [savedPopupValue, setSavedPopupValue] = useState("");
  const [draftPopupValue, setDraftPopupValue] = useState("");
  const [reorderItems, setReorderItems] = useState(reorderItemsSeed);
  const [draggingItemId, setDraggingItemId] = useState<string | null>(null);
  const [dropTargetIndex, setDropTargetIndex] = useState<number | null>(null);
  const [dropTargetItemId, setDropTargetItemId] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [exportState, setExportState] = useState<ExportState>("idle");
  const searchInputId = useId();
  const searchListboxId = useId();
  const buttonResetTimerRef = useRef<number | null>(null);
  const togglePulseTimerRef = useRef<number | null>(null);
  const cardResolveTimerRef = useRef<number | null>(null);
  const cardResetTimerRef = useRef<number | null>(null);
  const exportResolveTimerRef = useRef<number | null>(null);
  const exportResetTimerRef = useRef<number | null>(null);
  const searchPanelRef = useRef<HTMLDivElement | null>(null);
  const tabsRef = useRef<HTMLDivElement | null>(null);
  const tabButtonRefs = useRef<Record<string, HTMLButtonElement | null>>({});

  useEffect(() => {
    return () => {
      if (buttonResetTimerRef.current !== null) {
        window.clearTimeout(buttonResetTimerRef.current);
      }
      if (togglePulseTimerRef.current !== null) {
        window.clearTimeout(togglePulseTimerRef.current);
      }
      if (cardResolveTimerRef.current !== null) {
        window.clearTimeout(cardResolveTimerRef.current);
      }
      if (cardResetTimerRef.current !== null) {
        window.clearTimeout(cardResetTimerRef.current);
      }
      if (exportResolveTimerRef.current !== null) {
        window.clearTimeout(exportResolveTimerRef.current);
      }
      if (exportResetTimerRef.current !== null) {
        window.clearTimeout(exportResetTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const handleMouseDown = (event: MouseEvent) => {
      if (
        searchPanelRef.current !== null &&
        !searchPanelRef.current.contains(event.target as Node)
      ) {
        setIsSearchOpen(false);
        setActiveSearchIndex(-1);
      }
    };

    window.addEventListener("mousedown", handleMouseDown);
    return () => window.removeEventListener("mousedown", handleMouseDown);
  }, []);

  function setTransientButtonFeedback(nextTone: FeedbackTone) {
    setButtonFeedback(nextTone);

    if (buttonResetTimerRef.current !== null) {
      window.clearTimeout(buttonResetTimerRef.current);
    }

    if (nextTone === "idle") {
      buttonResetTimerRef.current = null;
      return;
    }

    buttonResetTimerRef.current = window.setTimeout(() => {
      setButtonFeedback("idle");
      buttonResetTimerRef.current = null;
    }, 1100);
  }

  function handleTogglePress() {
    setToggleEnabled((prev) => !prev);
    setTogglePulse(true);

    if (togglePulseTimerRef.current !== null) {
      window.clearTimeout(togglePulseTimerRef.current);
    }

    togglePulseTimerRef.current = window.setTimeout(() => {
      setTogglePulse(false);
      togglePulseTimerRef.current = null;
    }, 140);
  }

  function runCardSave(nextTone?: FeedbackTone) {
    if (cardState === "saving") return;

    setCardState("saving");

    if (cardResolveTimerRef.current !== null) {
      window.clearTimeout(cardResolveTimerRef.current);
    }
    if (cardResetTimerRef.current !== null) {
      window.clearTimeout(cardResetTimerRef.current);
    }

    cardResolveTimerRef.current = window.setTimeout(() => {
      const resolved = nextTone ?? (Math.random() > 0.4 ? "success" : "failure");
      setCardState(resolved);
      cardResolveTimerRef.current = null;

      cardResetTimerRef.current = window.setTimeout(() => {
        setCardState("idle");
        cardResetTimerRef.current = null;
      }, 1200);
    }, 480);
  }

  function runExport() {
    if (exportState === "working") return;

    setExportState("working");

    if (exportResolveTimerRef.current !== null) {
      window.clearTimeout(exportResolveTimerRef.current);
    }
    if (exportResetTimerRef.current !== null) {
      window.clearTimeout(exportResetTimerRef.current);
    }

    exportResolveTimerRef.current = window.setTimeout(() => {
      setExportState("done");
      exportResolveTimerRef.current = null;

      exportResetTimerRef.current = window.setTimeout(() => {
        setExportState("idle");
        exportResetTimerRef.current = null;
      }, 1200);
    }, 700);
  }

  const filteredSearchOptions = useMemo(() => {
    const normalized = searchQuery.trim().toLowerCase();
    if (normalized.length === 0) return searchOptions;
    return searchOptions.filter((option) => option.toLowerCase().includes(normalized));
  }, [searchQuery]);

  useEffect(() => {
    if (!isSearchOpen) return;
    if (filteredSearchOptions.length === 0) {
      setActiveSearchIndex(-1);
      return;
    }

    setActiveSearchIndex((current) => {
      if (current < 0 || current >= filteredSearchOptions.length) return 0;
      return current;
    });
  }, [filteredSearchOptions, isSearchOpen]);

  function selectSearchOption(option: string) {
    setSearchQuery(option);
    setSelectedSearchOption(option);
    setIsSearchOpen(false);
    setActiveSearchIndex(-1);
  }

  const activeTabIndex = tabItems.findIndex((item) => item.id === activeTabId);

  function updateTabIndicator(tabId: string) {
    const tabsNode = tabsRef.current;
    const activeButtonNode = tabButtonRefs.current[tabId];
    if (!tabsNode || !activeButtonNode) return;

    const tabsRect = tabsNode.getBoundingClientRect();
    const buttonRect = activeButtonNode.getBoundingClientRect();
    const nextLeft = buttonRect.left - tabsRect.left;
    const nextWidth = buttonRect.width;

    setTabIndicator((current) => {
      if (Math.abs(current.left - nextLeft) < 0.5 && Math.abs(current.width - nextWidth) < 0.5) {
        return current;
      }

      return { left: nextLeft, width: nextWidth };
    });
  }

  useEffect(() => {
    updateTabIndicator(activeTabId);

    const handleResize = () => updateTabIndicator(activeTabId);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [activeTabId]);

  function moveTabSelection(step: number) {
    const nextIndex = (activeTabIndex + step + tabItems.length) % tabItems.length;
    setActiveTabId(tabItems[nextIndex].id);
  }

  function moveReorderItemToIndex(fromId: string, targetIndex: number) {
    setReorderItems((current) => {
      const fromIndex = current.findIndex((item) => item.id === fromId);
      if (fromIndex < 0) return current;

      const next = [...current];
      const [movedItem] = next.splice(fromIndex, 1);
      const clampedTarget = Math.max(0, Math.min(targetIndex, current.length));
      let insertIndex = clampedTarget;

      if (fromIndex < clampedTarget) {
        insertIndex -= 1;
      }

      insertIndex = Math.max(0, Math.min(insertIndex, next.length));
      next.splice(insertIndex, 0, movedItem);
      return next;
    });
  }

  function openPopupEditor() {
    setDraftPopupValue(savedPopupValue);
    setIsPopupOpen(true);
  }

  function cancelPopupEditor() {
    setDraftPopupValue(savedPopupValue);
    setIsPopupOpen(false);
  }

  function savePopupEditor() {
    setSavedPopupValue(draftPopupValue);
    setIsPopupOpen(false);
  }

  useEffect(() => {
    if (!isPopupOpen) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        cancelPopupEditor();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isPopupOpen, savedPopupValue]);

  if (shouldThrowError) {
    throw new Error(errorMessageDraft.trim() || "Intentional test error");
  }

  return (
    <div className="space-y-5">
      <h2 className="text-xl font-semibold">Micro-Animation Playground</h2>
      <p className="text-sm text-text-secondary">
        Small controls to test hover, press, and success/failure feedback.
      </p>

      <div className="grid gap-4 lg:grid-cols-3">
        <section className="rounded-xl border border-border bg-bg/30 p-4">
          <h3 className="text-base font-semibold">Buttons</h3>
          <p className="mt-1 text-sm text-text-muted">Hover and press the CTA, then trigger feedback.</p>

          <button
            type="button"
            onClick={() => setPressCount((count) => count + 1)}
            className="mt-4 w-full rounded-lg border border-accent/60 bg-accent/15 px-4 py-2 text-sm font-semibold text-text-primary transition-transform transition-colors hover:bg-accent/25 active:translate-y-[1px] active:scale-[0.99]"
          >
            Press Test
          </button>

          <div className="mt-3 flex gap-2">
            <Button variant="ghost" className="flex-1" onClick={() => setTransientButtonFeedback("success")}>
              Success
            </Button>
            <Button variant="ghost" className="flex-1" onClick={() => setTransientButtonFeedback("failure")}>
              Failure
            </Button>
          </div>

          <div className={`mt-3 rounded-md border px-3 py-2 text-xs transition-all ${toneClasses[buttonFeedback]}`}>
            State: {toLabel(buttonFeedback)} | Presses: {pressCount}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-bg/30 p-4">
          <h3 className="text-base font-semibold">Toggle</h3>
          <p className="mt-1 text-sm text-text-muted">Track animates on hover and snap-press.</p>

          <button
            type="button"
            role="switch"
            aria-checked={toggleEnabled}
            onClick={handleTogglePress}
            className={`mt-4 inline-flex w-full items-center justify-between rounded-full border px-3 py-2 transition-all hover:border-accent/60 ${toggleEnabled ? "border-emerald-400/45 bg-emerald-500/10" : "border-border bg-bg/35"} ${togglePulse ? "scale-[0.99]" : "scale-100"}`}
          >
            <span className="text-sm font-medium text-text-primary">{toggleEnabled ? "Enabled" : "Disabled"}</span>
            <span
              className={`h-5 w-10 rounded-full border border-border/70 p-[2px] transition-colors ${toggleEnabled ? "bg-emerald-500/30" : "bg-surface/80"}`}
            >
              <span
                className={`block h-full w-4 rounded-full bg-text-primary transition-transform ${toggleEnabled ? "translate-x-4" : "translate-x-0"}`}
              />
            </span>
          </button>

          <div
            className={`mt-3 rounded-md border px-3 py-2 text-xs transition-all ${toggleEnabled ? toneClasses.success : toneClasses.failure}`}
          >
            {toggleEnabled ? "Success tone active" : "Failure tone active"}
          </div>
        </section>

        <section className="rounded-xl border border-border bg-bg/30 p-4">
          <h3 className="text-base font-semibold">Cards</h3>
          <p className="mt-1 text-sm text-text-muted">Select a card, then save with random or forced result.</p>

          <div className="mt-4 grid gap-2">
            {cards.map((card) => (
              <button
                type="button"
                key={card.id}
                onClick={() => setSelectedCardId(card.id)}
                className={`rounded-lg border px-3 py-2 text-left transition-all hover:-translate-y-[1px] hover:border-accent/55 active:translate-y-0 active:scale-[0.99] ${selectedCardId === card.id ? "border-accent/70 bg-accent/10" : "border-border/80 bg-surface/35"}`}
              >
                <p className="text-sm font-medium text-text-primary">{card.title}</p>
                <p className="text-xs text-text-muted">{card.description}</p>
              </button>
            ))}
          </div>

          <div className="mt-3 flex gap-2">
            <Button className="flex-1" onClick={() => runCardSave()}>
              Save
            </Button>
            <Button variant="ghost" onClick={() => runCardSave("success")}>
              Pass
            </Button>
            <Button variant="ghost" onClick={() => runCardSave("failure")}>
              Fail
            </Button>
          </div>

          <div
            className={`mt-3 rounded-md border px-3 py-2 text-xs transition-all ${
              cardState === "saving"
                ? "border-accent/45 bg-accent/10 text-text-secondary"
                : cardState === "success"
                  ? toneClasses.success
                  : cardState === "failure"
                    ? toneClasses.failure
                    : toneClasses.idle
            }`}
          >
            {cardState === "saving"
              ? `Saving ${selectedCardId}...`
              : cardState === "success"
                ? `Saved ${selectedCardId} successfully.`
                : cardState === "failure"
                  ? `Save failed for ${selectedCardId}.`
                  : "No save action yet."}
          </div>
        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-bg/30 p-4">
          <h3 className="text-base font-semibold">Date/Time Inputs</h3>
          <p className="mt-1 text-sm text-text-muted">Try native browser date and time controls.</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Input type="date" value={dateInput} onChange={(event) => setDateInput(event.target.value)} />
            <Input type="time" value={timeInput} onChange={(event) => setTimeInput(event.target.value)} />
            <Input
              type="datetime-local"
              value={dateTimeInput}
              onChange={(event) => setDateTimeInput(event.target.value)}
            />
            <Input type="month" value={monthInput} onChange={(event) => setMonthInput(event.target.value)} />
            <Input type="week" value={weekInput} onChange={(event) => setWeekInput(event.target.value)} />
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setDateInput("");
                setTimeInput("");
                setDateTimeInput("");
                setMonthInput("");
                setWeekInput("");
              }}
            >
              Reset
            </Button>
          </div>

        </section>

        <section className="rounded-xl border border-border bg-bg/30 p-4">
          <h3 className="text-base font-semibold">Text/Number Inputs</h3>
          <p className="mt-1 text-sm text-text-muted">Test typing behavior and simple numeric constraints.</p>

          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            <Input
              type="text"
              value={textInput}
              onChange={(event) => setTextInput(event.target.value)}
              placeholder="Text (min 3 chars)"
            />
            <Input
              type="number"
              value={integerInput}
              onChange={(event) => setIntegerInput(event.target.value)}
              min={0}
              max={100}
              step={1}
              inputMode="numeric"
              placeholder="Integer 0-100"
            />
            <Input
              type="number"
              value={decimalInput}
              onChange={(event) => setDecimalInput(event.target.value)}
              step="0.01"
              inputMode="decimal"
              placeholder="Decimal"
            />
          </div>

          <div className="mt-3 flex gap-2">
            <Button
              variant="ghost"
              onClick={() => {
                setTextInput("");
                setIntegerInput("");
                setDecimalInput("");
              }}
            >
              Reset
            </Button>
          </div>

        </section>
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
      <section className="rounded-xl border border-border bg-bg/30 p-4 lg:col-span-2">
        <h3 className="text-base font-semibold">Animated Tabs</h3>
        <p className="mt-1 text-sm text-text-muted">
          Active tab highlight slides between tabs, and content switches with swipe animation.
        </p>

        <div
          ref={tabsRef}
          role="tablist"
          aria-label="Animated tab views"
          className="relative mt-4 flex rounded-lg border border-border/80 bg-bg/35 p-1"
        >
          <span
            aria-hidden="true"
            className="pointer-events-none absolute bottom-1 top-1 rounded-md bg-accent/25 transition-all duration-300 ease-out"
            style={{
              transform: `translateX(${tabIndicator.left}px)`,
              width: `${tabIndicator.width}px`,
            }}
          />
          {tabItems.map((tab) => (
            <button
              key={tab.id}
              ref={(node) => {
                tabButtonRefs.current[tab.id] = node;
              }}
              type="button"
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={activeTabId === tab.id}
              aria-controls={`panel-${tab.id}`}
              tabIndex={activeTabId === tab.id ? 0 : -1}
              onClick={() => setActiveTabId(tab.id)}
              onKeyDown={(event) => {
                if (event.key === "ArrowRight") {
                  event.preventDefault();
                  moveTabSelection(1);
                }
                if (event.key === "ArrowLeft") {
                  event.preventDefault();
                  moveTabSelection(-1);
                }
              }}
              className={`relative z-10 flex-1 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                activeTabId === tab.id ? "text-text-primary" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="mt-3 overflow-hidden rounded-lg border border-border/80 bg-surface/35">
          <div
            className="flex transition-transform duration-600 ease-out"
            style={{
              transform: `translateX(-${activeTabIndex * 100}%)`,
            }}
          >
            {tabItems.map((tab) => (
              <article
                key={tab.id}
                id={`panel-${tab.id}`}
                role="tabpanel"
                aria-labelledby={`tab-${tab.id}`}
                className="w-full shrink-0 p-4"
              >
                <p className="text-sm font-semibold text-text-primary">{tab.title}</p>
                <p className="mt-1 text-sm text-text-secondary">{tab.body}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-border bg-bg/30 p-4 lg:col-span-1">
        <h3 className="text-base font-semibold">Error Trigger</h3>
        <p className="mt-1 text-sm text-text-muted">
          Trigger an intentional render error to verify the route error boundary.
        </p>

        <Input
          value={errorMessageDraft}
          onChange={(event) => setErrorMessageDraft(event.target.value)}
          placeholder="Error message"
          className="mt-4"
        />

        <div className="mt-3 flex gap-2">
          <Button className="flex-1" onClick={() => setShouldThrowError(true)}>
            Trigger Error
          </Button>
          <Button
            variant="ghost"
            onClick={() =>
              setErrorMessageDraft("Intentional test error.")
            }
          >
            Reset
          </Button>
        </div>

        <p className="mt-3 text-xs text-text-muted">
          This will navigate to your custom error boundary view.
        </p>
      </section>
      </div>

      <section className="rounded-xl border border-border bg-bg/30 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold">Drag Reorder</h3>
            <p className="mt-1 text-sm text-text-muted">
              Drag cards to reorder the list, between rows, or directly onto another row.
            </p>
          </div>
          <Button
            variant="ghost"
            onClick={() => {
              setReorderItems(reorderItemsSeed);
              setDraggingItemId(null);
              setDropTargetIndex(null);
              setDropTargetItemId(null);
            }}
          >
            Reset Order
          </Button>
        </div>

        <ul className="mt-4 space-y-0">
          {reorderItems.map((item, index) => {
            const isDragging = draggingItemId === item.id;
            const isDropTargetBetween = dropTargetIndex === index && draggingItemId !== null;
            const isDropTargetOnItem =
              dropTargetItemId === item.id && draggingItemId !== null && !isDragging;

            return (
              <li key={item.id}>
                <div
                  onDragEnter={() => {
                    setDropTargetIndex(index);
                    setDropTargetItemId(null);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDropTargetIndex(index);
                    setDropTargetItemId(null);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (!draggingItemId) return;
                    moveReorderItemToIndex(draggingItemId, index);
                    setDraggingItemId(null);
                    setDropTargetIndex(null);
                    setDropTargetItemId(null);
                  }}
                  className={`h-4 rounded transition-all ${
                    draggingItemId === null
                      ? "bg-transparent"
                      : isDropTargetBetween
                        ? "bg-emerald-400/70"
                        : "bg-border/45"
                  }`}
                />

                <button
                  type="button"
                  draggable
                  onDragStart={() => {
                    setDraggingItemId(item.id);
                    setDropTargetIndex(index);
                    setDropTargetItemId(null);
                  }}
                  onDragEnter={() => {
                    if (draggingItemId === item.id) return;
                    setDropTargetIndex(null);
                    setDropTargetItemId(item.id);
                  }}
                  onDragOver={(event) => {
                    event.preventDefault();
                    if (draggingItemId === item.id) return;
                    setDropTargetIndex(null);
                    setDropTargetItemId(item.id);
                  }}
                  onDrop={(event) => {
                    event.preventDefault();
                    if (!draggingItemId || draggingItemId === item.id) return;
                    moveReorderItemToIndex(draggingItemId, index);
                    setDraggingItemId(null);
                    setDropTargetIndex(null);
                    setDropTargetItemId(null);
                  }}
                  onDragEnd={() => {
                    setDraggingItemId(null);
                    setDropTargetIndex(null);
                    setDropTargetItemId(null);
                  }}
                  className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left transition-all ${
                    isDragging
                      ? "border-accent/65 bg-accent/15 opacity-70"
                      : isDropTargetOnItem
                        ? "border-emerald-400/65 bg-emerald-500/10"
                        : "border-border/80 bg-surface/40 hover:border-accent/45 hover:bg-surface/60"
                  }`}
                >
                  <span className="text-sm text-text-primary">{item.label}</span>
                  <span className="text-xs text-text-muted">{index + 1}</span>
                </button>
              </li>
            );
          })}

          <li>
            <div
              onDragEnter={() => {
                setDropTargetIndex(reorderItems.length);
                setDropTargetItemId(null);
              }}
              onDragOver={(event) => {
                event.preventDefault();
                setDropTargetIndex(reorderItems.length);
                setDropTargetItemId(null);
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (!draggingItemId) return;
                moveReorderItemToIndex(draggingItemId, reorderItems.length);
                setDraggingItemId(null);
                setDropTargetIndex(null);
                setDropTargetItemId(null);
              }}
              className={`h-2 rounded transition-all ${
                draggingItemId === null
                  ? "bg-transparent"
                  : dropTargetIndex === reorderItems.length
                    ? "bg-emerald-400/70"
                    : "bg-border/45"
              }`}
            />
          </li>
        </ul>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-xl border border-border bg-bg/30 p-4">
          <h3 className="text-base font-semibold">Search Dropdown</h3>
          <p className="mt-1 text-sm text-text-muted">
            Type to filter 10 preset options. Use Arrow keys to navigate, Enter to select.
          </p>

          <div ref={searchPanelRef} className="relative mt-4">
            <Input
              id={searchInputId}
              value={searchQuery}
              onFocus={() => setIsSearchOpen(true)}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setIsSearchOpen(true);
              }}
              onKeyDown={(event) => {
                if (event.key === "ArrowDown") {
                  event.preventDefault();
                  setIsSearchOpen(true);
                  if (filteredSearchOptions.length === 0) {
                    setActiveSearchIndex(-1);
                    return;
                  }
                  setActiveSearchIndex((current) => {
                    if (current < 0) return 0;
                    return (current + 1) % filteredSearchOptions.length;
                  });
                  return;
                }

                if (event.key === "ArrowUp") {
                  event.preventDefault();
                  setIsSearchOpen(true);
                  if (filteredSearchOptions.length === 0) {
                    setActiveSearchIndex(-1);
                    return;
                  }
                  setActiveSearchIndex((current) => {
                    if (current < 0) return filteredSearchOptions.length - 1;
                    return (current - 1 + filteredSearchOptions.length) % filteredSearchOptions.length;
                  });
                  return;
                }

                if (event.key === "Enter" && isSearchOpen) {
                  event.preventDefault();
                  if (filteredSearchOptions.length === 0) return;
                  const chosenIndex = activeSearchIndex >= 0 ? activeSearchIndex : 0;
                  selectSearchOption(filteredSearchOptions[chosenIndex]);
                  return;
                }

                if (event.key === "Escape") {
                  setIsSearchOpen(false);
                  setActiveSearchIndex(-1);
                }
              }}
              onBlur={(event) => {
                const next = event.relatedTarget as Node | null;
                if (searchPanelRef.current?.contains(next)) return;
                setIsSearchOpen(false);
                setActiveSearchIndex(-1);
              }}
              role="combobox"
              aria-expanded={isSearchOpen}
              aria-controls={searchListboxId}
              aria-autocomplete="list"
              aria-label="Search options"
              placeholder="Search Alpha, Bravo, ..."
            />

            {isSearchOpen ? (
              <ul
                id={searchListboxId}
                role="listbox"
                className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-lg border border-border bg-panel/95 p-1 shadow-xl shadow-black/30"
              >
                {filteredSearchOptions.length === 0 ? (
                  <li className="px-3 py-2 text-sm text-text-muted">No matches</li>
                ) : (
                  filteredSearchOptions.map((option, index) => (
                    <li key={option}>
                      <button
                        type="button"
                        role="option"
                        aria-selected={index === activeSearchIndex}
                        onMouseDown={(event) => event.preventDefault()}
                        onMouseEnter={() => setActiveSearchIndex(index)}
                        onClick={() => selectSearchOption(option)}
                        className={`w-full rounded-md px-3 py-2 text-left text-sm transition-colors ${
                          index === activeSearchIndex
                            ? "bg-accent/25 text-text-primary"
                            : "text-text-secondary hover:bg-surface/70 hover:text-text-primary"
                        }`}
                      >
                        {option}
                      </button>
                    </li>
                  ))
                )}
              </ul>
            ) : null}
          </div>

          <p className="mt-3 text-xs text-text-muted">
            Selected: <span className="text-text-primary">{selectedSearchOption || "-"}</span>
          </p>
        </section>

        <section className="rounded-xl border border-border bg-bg/30 p-4">
          <h3 className="text-base font-semibold">Save/Cancel Popup</h3>
          <p className="mt-1 text-sm text-text-muted">
            Edit a value in a popup. Save persists it; Cancel discards draft changes.
          </p>

          <div className="mt-4 flex items-center gap-2">
            <Button className="self-center" onClick={openPopupEditor}>Open</Button>
            <div className="w-full rounded-md border border-border/70 bg-bg/35 px-3 py-2 text-sm">
              <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Saved Value</p>
              <p className="mt-1 text-text-primary">{savedPopupValue.length > 0 ? savedPopupValue : "Nothing saved yet."}</p>
            </div>
          </div>         
        </section>
      </div>

      <section className="rounded-xl border border-border bg-bg/30 p-4">
        <h3 className="text-base font-semibold">Hover Reveal Actions</h3>
        <p className="mt-1 text-sm text-text-muted">
          Action buttons stay hidden until hover, then each has its own interaction.
        </p>

        <div className="group relative mt-4 rounded-xl border border-border/80 bg-surface/35 p-4 transition-all hover:-translate-y-[1px] hover:border-accent/55">
          <p className="text-sm font-medium text-text-primary">Project Summary Card</p>
          <p className="mt-1 pr-36 text-xs text-text-muted">
            Keep utility actions quiet by default and reveal them only when the card is active.
          </p>

          <div className="absolute right-3 top-3 flex items-center gap-2">
            <div className="pointer-events-none flex translate-y-1 gap-2 opacity-0 transition-all duration-200 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100">
              <button
                type="button"
                onClick={runExport}
                className={`rounded-md border px-2 py-1 text-xs font-medium transition-all active:scale-[0.97] ${exportState === "done" ? "border-emerald-300/65 bg-emerald-500/15 text-emerald-200" : "border-border bg-bg/50 text-text-secondary hover:border-accent/60 hover:text-text-primary"}`}
              >
                {exportState === "working" ? "Exporting..." : exportState === "done" ? "Exported" : "Export"}
              </button>

              <button
                type="button"
                aria-pressed={isPinned}
                onClick={() => setIsPinned((prev) => !prev)}
                className={`rounded-md border px-2 py-1 text-xs font-medium transition-all active:scale-[0.97] ${isPinned ? "border-sky-300/65 bg-sky-500/15 text-sky-200" : "border-border bg-bg/50 text-text-secondary hover:border-sky-300/60 hover:text-sky-100"}`}
              >
                {isPinned ? "Pinned" : "Pin"}
              </button>
            </div>
            <button
              type="button"
              aria-pressed={isFavorite}
              onClick={() => setIsFavorite((prev) => !prev)}
              className={`rounded-md border px-2 py-1 text-xs font-medium transition-all active:scale-[0.97] ${isFavorite ? "pointer-events-auto translate-y-0 opacity-100 border-amber-300/70 bg-amber-500/15 text-amber-200" : "pointer-events-none translate-y-1 opacity-0 border-border bg-bg/50 text-text-secondary group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 hover:border-amber-300/60 hover:text-amber-100"}`}
            >
              {isFavorite ? "Starred" : "Favorite"}
            </button>
          </div>
        </div>

        <div className="mt-3 rounded-md border border-border/70 bg-bg/35 px-3 py-2 text-xs text-text-muted">
          Favorite: {isFavorite ? "On" : "Off"} | Export:{" "}
          {exportState === "working" ? "Running" : exportState === "done" ? "Done" : "Idle"} | Pin:{" "}
          {isPinned ? "On" : "Off"}
        </div>
      </section>

      {isPopupOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg/70 px-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-editor-title"
          onClick={cancelPopupEditor}
        >
          <div
            className="w-full max-w-md rounded-xl border border-border bg-panel p-4 shadow-2xl shadow-black/40"
            onClick={(event) => event.stopPropagation()}
          >
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Popup Editor</p>
            <h4 id="popup-editor-title" className="mt-2 text-lg font-semibold text-text-primary">
              Persist on Save
            </h4>
            <p className="mt-1 text-sm text-text-secondary">
              This input keeps changes only when you click Save.
            </p>
            <Input
              autoFocus
              value={draftPopupValue}
              onChange={(event) => setDraftPopupValue(event.target.value)}
              placeholder="Type something..."
              className="mt-3"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="ghost" onClick={cancelPopupEditor}>
                Cancel
              </Button>
              <Button onClick={savePopupEditor}>Save</Button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

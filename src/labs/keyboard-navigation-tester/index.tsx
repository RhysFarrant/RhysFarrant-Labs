import { type KeyboardEvent as ReactKeyboardEvent, useEffect, useMemo, useRef, useState } from "react";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";

const focusableClass =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/80 focus-visible:ring-offset-2 focus-visible:ring-offset-bg";

function isVisible(element: HTMLElement): boolean {
  return element.getClientRects().length > 0;
}

function getFocusableElements(container: HTMLElement): HTMLElement[] {
  const selector =
    'button, a[href], input, select, textarea, [tabindex]:not([tabindex="-1"])';
  return Array.from(container.querySelectorAll<HTMLElement>(selector)).filter((element) => {
    if (element.hasAttribute("disabled")) return false;
    if (element.getAttribute("aria-hidden") === "true") return false;
    if (element.tabIndex < 0) return false;
    return isVisible(element);
  });
}

function getFocusableIds(container: HTMLElement): string[] {
  return getFocusableElements(container)
    .map((element) => element.dataset.navId ?? "")
    .filter((value) => value.length > 0);
}

function DebugBadge({ visible, id }: { visible: boolean; id: string }) {
  if (!visible) return null;
  return (
    <span className="pointer-events-none absolute right-2 top-2 rounded border border-accent/60 bg-accent/15 px-1.5 py-0.5 font-mono text-[10px] text-text-secondary">
      {id}
    </span>
  );
}

export default function KeyboardNavigationTesterLab() {
  const previewRef = useRef<HTMLDivElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);
  const returnFocusRef = useRef<HTMLElement | null>(null);

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [trapFocusInModal, setTrapFocusInModal] = useState(true);
  const [showDebugBadges, setShowDebugBadges] = useState(true);
  const [fixMouseOnlyControl, setFixMouseOnlyControl] = useState(false);

  const [activeFocusId, setActiveFocusId] = useState<string>("None");
  const [lastKeyPressed, setLastKeyPressed] = useState<string>("None");
  const [focusOrder, setFocusOrder] = useState<string[]>([]);

  const activeFocusIndex = useMemo(() => {
    const index = focusOrder.indexOf(activeFocusId);
    return index >= 0 ? index + 1 : 0;
  }, [activeFocusId, focusOrder]);

  function refreshFocusOrder() {
    if (!previewRef.current) return;
    setFocusOrder(getFocusableIds(previewRef.current));
  }

  function closeModal() {
    setIsModalOpen(false);
    window.setTimeout(() => {
      returnFocusRef.current?.focus();
    }, 0);
  }

  function openModal() {
    returnFocusRef.current =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setIsModalOpen(true);
  }

  function handleFocusCapture(event: React.FocusEvent<HTMLElement>) {
    const target = event.target as HTMLElement;
    const focusId = target.dataset.navId;
    if (!focusId) return;
    setActiveFocusId(focusId);
  }

  function handleKeyDownCapture(event: ReactKeyboardEvent<HTMLElement>) {
    if (
      event.key === "Tab" ||
      event.key === "Enter" ||
      event.key === "Escape" ||
      event.key === " " ||
      event.key.startsWith("Arrow")
    ) {
      setLastKeyPressed(event.key === " " ? "Space" : event.key);
    }
  }

  useEffect(() => {
    refreshFocusOrder();
  }, [isMenuOpen, isModalOpen, trapFocusInModal, fixMouseOnlyControl]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    const modalElement = modalRef.current;
    if (!modalElement) {
      return;
    }

    const focusables = getFocusableElements(modalElement);
    focusables[0]?.focus();

    const handleModalKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeModal();
        return;
      }

      if (event.key !== "Tab" || !trapFocusInModal) {
        return;
      }

      const modalFocusables = getFocusableElements(modalElement);
      if (modalFocusables.length === 0) {
        return;
      }

      const first = modalFocusables[0];
      const last = modalFocusables[modalFocusables.length - 1];
      const active = document.activeElement instanceof HTMLElement ? document.activeElement : null;

      if (event.shiftKey) {
        if (!active || active === first || !modalElement.contains(active)) {
          event.preventDefault();
          last.focus();
        }
        return;
      }

      if (active === last) {
        event.preventDefault();
        first.focus();
      }
    };

    modalElement.addEventListener("keydown", handleModalKeyDown);
    return () => {
      modalElement.removeEventListener("keydown", handleModalKeyDown);
    };
  }, [isModalOpen, trapFocusInModal]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold">Keyboard Navigation Tester</h2>
        <p className="mt-1 text-sm text-text-secondary">
          Tab through the interface to inspect focus order, modal trapping behavior, and keyboard
          accessibility gaps.
        </p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[340px_1fr]">
        <section className="space-y-3 rounded-xl border border-border bg-bg/35 p-4">
          <div className="rounded-lg border border-border/70 bg-surface/45 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Focus State</p>
            <p className="mt-2 text-sm text-text-secondary">
              Current target: <span className="font-mono text-text-primary">{activeFocusId}</span>
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Last key: <span className="font-mono text-text-primary">{lastKeyPressed}</span>
            </p>
            <p className="mt-1 text-sm text-text-secondary">
              Focus position:{" "}
              <span className="font-mono text-text-primary">
                {activeFocusIndex > 0 ? `${activeFocusIndex}/${focusOrder.length}` : "-"}
              </span>
            </p>
          </div>

          <div className="rounded-lg border border-border/70 bg-surface/45 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Debug Options</p>
            <div className="mt-2 space-y-1.5 text-sm text-text-secondary">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={showDebugBadges}
                  onChange={(event) => setShowDebugBadges(event.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                Show focus target badges
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={trapFocusInModal}
                  onChange={(event) => setTrapFocusInModal(event.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                Trap focus while modal is open
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={fixMouseOnlyControl}
                  onChange={(event) => setFixMouseOnlyControl(event.target.checked)}
                  className="h-4 w-4 accent-accent"
                />
                Convert mouse-only control to keyboard-accessible button
              </label>
            </div>
            <div className="mt-2">
              <Button variant="ghost" onClick={refreshFocusOrder}>
                Refresh Focus Map
              </Button>
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-surface/45 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Focus Order Map</p>
            <ol className="mt-2 max-h-36 space-y-1 overflow-y-auto pr-1 text-xs text-text-secondary">
              {focusOrder.length === 0 ? <li>No focusable controls detected.</li> : null}
              {focusOrder.map((id, index) => (
                <li key={`${id}-${index}`} className={id === activeFocusId ? "text-text-primary" : ""}>
                  {index + 1}. {id}
                </li>
              ))}
            </ol>
          </div>

        </section>

        <section
          ref={previewRef}
          className="space-y-4 rounded-xl border border-border bg-surface/55 p-4 sm:p-5"
          onFocusCapture={handleFocusCapture}
          onKeyDownCapture={handleKeyDownCapture}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative rounded-lg border border-border/70 bg-bg/35 p-3">
              <DebugBadge visible={showDebugBadges} id="search-input" />
              <label className="text-xs text-text-muted" htmlFor="keyboard-lab-search">
                Search
              </label>
              <Input
                id="keyboard-lab-search"
                data-nav-id="search-input"
                placeholder="Search by keyboard"
                className={focusableClass}
              />
            </div>

            <div className="relative rounded-lg border border-border/70 bg-bg/35 p-3">
              <DebugBadge visible={showDebugBadges} id="filter-select" />
              <label className="text-xs text-text-muted" htmlFor="keyboard-lab-filter">
                Filter
              </label>
              <select
                id="keyboard-lab-filter"
                data-nav-id="filter-select"
                defaultValue="all"
                className={`mt-1 w-full rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent/60 ${focusableClass}`}
              >
                <option value="all">All</option>
                <option value="open">Open</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="relative rounded-lg border border-border/70 bg-bg/35 p-3">
              <DebugBadge visible={showDebugBadges} id="menu-toggle" />
              <p className="text-xs text-text-muted">Menu</p>
              <Button
                className={focusableClass}
                data-nav-id="menu-toggle"
                onClick={() => setIsMenuOpen((current) => !current)}
              >
                {isMenuOpen ? "Close Menu" : "Open Menu"}
              </Button>

              {isMenuOpen ? (
                <div className="mt-2 space-y-1 rounded-md border border-border bg-surface/75 p-2">
                  <button
                    type="button"
                    data-nav-id="menu-item-profile"
                    className={`w-full rounded-md border border-border px-2 py-1.5 text-left text-xs text-text-secondary hover:text-text-primary ${focusableClass}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Profile
                  </button>
                  <button
                    type="button"
                    data-nav-id="menu-item-settings"
                    className={`w-full rounded-md border border-border px-2 py-1.5 text-left text-xs text-text-secondary hover:text-text-primary ${focusableClass}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Settings
                  </button>
                  <button
                    type="button"
                    data-nav-id="menu-item-logout"
                    className={`w-full rounded-md border border-border px-2 py-1.5 text-left text-xs text-text-secondary hover:text-text-primary ${focusableClass}`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Log out
                  </button>
                </div>
              ) : null}
            </div>

            <div className="relative rounded-lg border border-border/70 bg-bg/35 p-3">
              <DebugBadge visible={showDebugBadges} id="open-modal" />
              <p className="text-xs text-text-muted">Modal Test</p>
              <Button className={focusableClass} data-nav-id="open-modal" onClick={openModal}>
                Open Modal
              </Button>
              <p className="mt-2 text-xs text-text-muted">
                {trapFocusInModal
                  ? "Focus will loop inside the modal until it closes."
                  : "Focus trap disabled to simulate leakage issues."}
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-border/70 bg-bg/35 p-3">
            <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Inaccessible Pattern Demo</p>
            {fixMouseOnlyControl ? (
              <div className="relative mt-2">
                <DebugBadge visible={showDebugBadges} id="mouse-only-fixed-button" />
                <button
                  type="button"
                  data-nav-id="mouse-only-fixed-button"
                  className={`w-full rounded-lg border border-border bg-surface/75 px-3 py-2 text-left text-sm text-text-secondary transition-colors hover:text-text-primary ${focusableClass}`}
                >
                  Keyboard-accessible card button
                </button>
              </div>
            ) : (
              <div
                className="mt-2 w-full rounded-lg border border-border bg-surface/65 px-3 py-2 text-left text-sm text-text-muted"
              >
                Mouse-only card (clickable but missing keyboard focus)
              </div>
            )}
            <p className="mt-2 text-xs text-text-muted">
              Toggle the fix option to compare inaccessible and accessible implementations.
            </p>
          </div>

          {isModalOpen ? (
            <div className="fixed inset-0 z-50 bg-black/45 p-4" onClick={closeModal}>
              <div
                ref={modalRef}
                className="mx-auto mt-14 max-w-md rounded-xl border border-border bg-panel p-4 shadow-2xl"
                onClick={(event) => event.stopPropagation()}
              >
                <p className="text-xs uppercase tracking-[0.12em] text-text-muted">Modal</p>
                <h3 className="mt-1 text-lg font-semibold">Keyboard Focus Test</h3>
                <p className="mt-1 text-sm text-text-secondary">
                  Use Tab/Shift+Tab to inspect focus behavior while this dialog is open.
                </p>

                <div className="mt-3 space-y-2">
                  <div className="relative rounded-lg border border-border/70 bg-bg/35 p-2">
                    <DebugBadge visible={showDebugBadges} id="modal-name-input" />
                    <label className="text-xs text-text-muted" htmlFor="keyboard-lab-modal-name">
                      Name
                    </label>
                    <Input
                      id="keyboard-lab-modal-name"
                      data-nav-id="modal-name-input"
                      placeholder="Type here"
                      className={focusableClass}
                    />
                  </div>

                  <div className="relative rounded-lg border border-border/70 bg-bg/35 p-2">
                    <DebugBadge visible={showDebugBadges} id="modal-confirm-button" />
                    <Button
                      className={focusableClass}
                      data-nav-id="modal-confirm-button"
                    >
                      Confirm
                    </Button>
                  </div>

                  <div className="relative rounded-lg border border-border/70 bg-bg/35 p-2">
                    <DebugBadge visible={showDebugBadges} id="modal-close-button" />
                    <Button
                      variant="ghost"
                      className={focusableClass}
                      data-nav-id="modal-close-button"
                      onClick={closeModal}
                    >
                      Close Modal
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </section>
      </div>
    </div>
  );
}

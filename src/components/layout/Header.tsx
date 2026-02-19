import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";

export default function Header() {
  const [mobileContactOpen, setMobileContactOpen] = useState(false);
  const [mobileSiteOpen, setMobileSiteOpen] = useState(false);
  const mobileMenusRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!mobileContactOpen && !mobileSiteOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      if (
        mobileMenusRef.current &&
        !mobileMenusRef.current.contains(event.target as Node)
      ) {
        setMobileContactOpen(false);
        setMobileSiteOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMobileContactOpen(false);
        setMobileSiteOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [mobileContactOpen, mobileSiteOpen]);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1140px] items-center justify-between gap-3 px-4 py-3 sm:px-6">
        <Link to="/" className="inline-flex items-center gap-2.5">
          <img
            src="/Me.png"
            alt="Rhys Farrant"
            className="h-8 w-8 rounded-full object-cover sm:h-9 sm:w-9"
          />
          <span className="brand-mark text-lg sm:text-xl">
            <span className="brand-mark-text">RHYS FARRANT</span>
          </span>
        </Link>

        <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
          <div ref={mobileMenusRef} className="flex items-center gap-2 sm:hidden">
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMobileContactOpen((prev) => !prev);
                  setMobileSiteOpen(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted transition-colors hover:border-text-muted hover:text-text-primary"
                aria-haspopup="menu"
                aria-expanded={mobileContactOpen}
                aria-controls="mobile-contact-menu"
              >
                Contact
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${mobileContactOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {mobileContactOpen && (
                <div
                  id="mobile-contact-menu"
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-40 rounded-xl border border-border bg-panel p-1.5 shadow-xl shadow-black/30"
                >
                  <a
                    href="https://github.com/rhysfarrant"
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setMobileContactOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-[0.1em] text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
                  >
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
                    </svg>
                    GitHub
                  </a>
                  <a
                    href="https://www.linkedin.com/in/rhys-farrant-0585ab173/"
                    target="_blank"
                    rel="noopener noreferrer"
                    role="menuitem"
                    onClick={() => setMobileContactOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-[0.1em] text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
                  >
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
                    </svg>
                    LinkedIn
                  </a>
                  <a
                    href="mailto:FarrantRhys@gmail.com"
                    role="menuitem"
                    onClick={() => setMobileContactOpen(false)}
                    className="flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-[0.1em] text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
                  >
                    <svg
                      className="h-3.5 w-3.5 shrink-0"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="2" y="4" width="20" height="16" rx="2" />
                      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                    </svg>
                    Email
                  </a>
                </div>
              )}
            </div>

            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setMobileSiteOpen((prev) => !prev);
                  setMobileContactOpen(false);
                }}
                className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted transition-colors hover:border-text-muted hover:text-text-primary"
                aria-haspopup="menu"
                aria-expanded={mobileSiteOpen}
                aria-controls="mobile-sites-menu"
              >
                Sites
                <svg
                  className={`h-3.5 w-3.5 transition-transform ${mobileSiteOpen ? "rotate-180" : ""}`}
                  viewBox="0 0 20 20"
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 0 1 1.06.02L10 11.17l3.71-3.94a.75.75 0 1 1 1.08 1.04l-4.25 4.5a.75.75 0 0 1-1.08 0l-4.25-4.5a.75.75 0 0 1 .02-1.06Z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>

              {mobileSiteOpen && (
                <div
                  id="mobile-sites-menu"
                  role="menu"
                  className="absolute right-0 top-[calc(100%+0.5rem)] z-50 w-40 rounded-xl border border-border bg-panel p-1.5 shadow-xl shadow-black/30"
                >
                  <span
                    role="menuitem"
                    className="block rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-[0.1em] text-text-primary"
                  >
                    Labs
                  </span>
                  <a
                    href="https://templates.rhysfarrant.com/"
                    role="menuitem"
                    onClick={() => setMobileSiteOpen(false)}
                    className="block rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-[0.1em] text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
                  >
                    Templates
                  </a>
                  <a
                    href="https://www.rhysfarrant.com"
                    role="menuitem"
                    onClick={() => setMobileSiteOpen(false)}
                    className="block rounded-lg px-3 py-2 text-xs font-medium uppercase tracking-[0.1em] text-text-muted transition-colors hover:bg-surface hover:text-text-primary"
                  >
                    Portfolio
                  </a>
                </div>
              )}
            </div>
          </div>

          <div className="hidden flex-wrap items-center gap-2 sm:flex">
            <a
              href="https://github.com/rhysfarrant"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted transition-colors hover:border-text-muted hover:text-text-primary"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12Z" />
              </svg>
              GitHub
            </a>
            <a
              href="https://www.linkedin.com/in/rhys-farrant-0585ab173/"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted transition-colors hover:border-text-muted hover:text-text-primary"
            >
              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286ZM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065Zm1.782 13.019H3.555V9h3.564v11.452ZM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003Z" />
              </svg>
              LinkedIn
            </a>
            <a
              href="mailto:FarrantRhys@gmail.com"
              className="inline-flex items-center gap-1.5 rounded-full border border-border/70 bg-surface/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted transition-colors hover:border-text-muted hover:text-text-primary"
            >
              <svg
                className="h-3.5 w-3.5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
              </svg>
              Email
            </a>
          </div>
          <div className="hidden h-5 w-px bg-border/70 sm:block" aria-hidden="true" />
          <div className="hidden items-center gap-2 sm:flex sm:pl-1">
            <span className="rounded-full border border-accent/50 bg-accent/20 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.14em] text-text-primary">
              Labs
            </span>
            <a
              href="https://templates.rhysfarrant.com/"
              className="rounded-full border border-border/70 bg-surface/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted transition-colors hover:border-text-muted hover:text-text-primary"
            >
              Templates
            </a>
            <a
              href="https://www.rhysfarrant.com"
              className="rounded-full border border-border/70 bg-surface/70 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-text-muted transition-colors hover:border-text-muted hover:text-text-primary"
            >
              Portfolio
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}


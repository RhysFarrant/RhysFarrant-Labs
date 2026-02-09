import { Link } from "react-router-dom";

export default function Header() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-bg/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-[1140px] items-center justify-between px-4 py-3 sm:px-6">
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

        <div className="inline-flex items-center gap-2">
          <span className="rounded-full border border-border/70 bg-surface/70 px-3 py-1 text-[11px] uppercase tracking-[0.14em] text-text-muted">
            Labs
          </span>
          <a
            href="https://www.rhysfarrant.com"
            target="_blank"
            rel="noreferrer noopener"
            className="rounded-full border border-accent/40 bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.12em] text-text-secondary transition-colors hover:border-accent/70 hover:text-text-primary"
          >
            Main Site
          </a>
        </div>
      </div>
    </header>
  );
}

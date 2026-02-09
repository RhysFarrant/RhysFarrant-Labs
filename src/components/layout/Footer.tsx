export default function Footer() {
  return (
    <footer className="border-t border-border px-6 py-6 sm:px-8">
      <div className="flex flex-wrap items-center justify-center text-sm text-text-muted">
        <span>&copy; {new Date().getFullYear()} Rhys Farrant</span>
        <span className="mx-3 text-lg font-bold text-text-muted/80" aria-hidden="true">
          &middot;
        </span>
        <a
          href="https://github.com/rhysfarrant"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 hover:text-text-primary"
        >
          GitHub
        </a>
        <span className="mx-3 text-lg font-bold text-text-muted/80" aria-hidden="true">
          &middot;
        </span>
        <a
          href="https://www.linkedin.com/in/rhys-farrant-0585ab173/"
          target="_blank"
          rel="noreferrer noopener"
          className="inline-flex items-center gap-1.5 hover:text-text-primary"
        >
          LinkedIn
        </a>
        <span className="mx-3 text-lg font-bold text-text-muted/80" aria-hidden="true">
          &middot;
        </span>
        <a
          href="mailto:your@email.com"
          className="inline-flex items-center gap-1.5 hover:text-text-primary"
        >
          Email
        </a>
      </div>
    </footer>
  );
}

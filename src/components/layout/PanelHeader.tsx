export default function PanelHeader() {
  return (
    <div className="flex items-center justify-between border-b border-border px-6 py-4 sm:px-8">
      <div className="inline-flex items-center gap-2.5">
        <img
          src="/Me.png"
          alt="Rhys Farrant"
          className="h-7 w-7 rounded-full object-cover sm:h-8 sm:w-8"
        />
        <span className="brand-mark text-base sm:text-lg">
          <span className="brand-mark-text">Rhys Farrant Labs</span>
        </span>
      </div>

      <nav className="inline-flex items-center gap-2">
        <a
          href="https://github.com/RhysFarrant/RhysFarrant-Labs"
          target="_blank"
          rel="noreferrer noopener"
          className="rounded-md border border-border px-3 py-1.5 text-sm text-text-muted transition-colors hover:border-text-muted hover:text-text-primary"
        >
          GitHub
        </a>
      </nav>
    </div>
  );
}

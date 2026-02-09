import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <section className="px-6 py-12 text-center sm:px-10">
      <p className="text-xs uppercase tracking-[0.18em] text-text-muted">404</p>
      <h1 className="mt-2 text-3xl font-bold">Lab Not Found</h1>
      <p className="mx-auto mt-3 max-w-lg text-sm text-text-secondary">
        This route does not match a registered lab.
      </p>
      <div className="mt-6 flex justify-center">
        <Link
          to="/"
          className="inline-flex items-center rounded-lg border border-accent/50 bg-accent/20 px-3.5 py-2 text-sm font-medium text-text-primary transition-colors hover:border-accent hover:bg-accent/30"
        >
          Back to Labs
        </Link>
      </div>
    </section>
  );
}

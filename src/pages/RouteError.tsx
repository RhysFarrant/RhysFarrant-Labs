import { Link, isRouteErrorResponse, useRouteError } from "react-router-dom";

function getErrorMessage(error: unknown): string {
  if (isRouteErrorResponse(error)) {
    if (typeof error.data === "string") return error.data;

    if (
      typeof error.data === "object" &&
      error.data !== null &&
      "message" in error.data &&
      typeof (error.data as { message?: unknown }).message === "string"
    ) {
      return (error.data as { message: string }).message;
    }

    return "The route could not be loaded.";
  }

  if (error instanceof Error && error.message.trim().length > 0) {
    return error.message;
  }

  return "An unexpected application error occurred.";
}

export default function RouteError() {
  const error = useRouteError();
  const title = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText || "Route Error"}`
    : "Application Error";
  const message = getErrorMessage(error);
  const stack = error instanceof Error ? error.stack : null;

  return (
    <section className="px-6 py-10 sm:px-10">
      <p className="text-xs uppercase tracking-[0.18em] text-text-muted">Something Broke</p>
      <h1 className="mt-2 text-2xl font-bold sm:text-3xl">{title}</h1>
      <p className="mt-3 max-w-2xl text-sm text-text-secondary">{message}</p>

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          to="/"
          className="inline-flex items-center rounded-lg border border-accent/50 bg-accent/20 px-3.5 py-2 text-sm font-medium text-text-primary transition-colors hover:border-accent hover:bg-accent/30"
        >
          Back to Labs
        </Link>
        <button
          type="button"
          onClick={() => window.location.reload()}
          className="inline-flex items-center rounded-lg border border-border bg-surface/70 px-3.5 py-2 text-sm font-medium text-text-secondary transition-colors hover:border-text-muted hover:text-text-primary"
        >
          Reload
        </button>
      </div>

      {import.meta.env.DEV && stack ? (
        <pre className="mt-6 overflow-x-auto rounded-lg border border-border bg-bg/50 p-3 text-xs text-text-muted">
          {stack}
        </pre>
      ) : null}
    </section>
  );
}

import { useMemo, useState } from "react";
import { languageOptions, translations, type LanguageCode } from "./translations";

export default function LanguageSwitchingTestLab() {
  const [language, setLanguage] = useState<LanguageCode>("en");

  const t = useMemo(() => translations[language], [language]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-xl font-semibold">{t.labTitle}</h2>
          <p className="mt-1 max-w-3xl text-sm text-text-secondary">{t.labDescription}</p>
        </div>

        <label className="text-xs text-text-muted">
          {t.languageLabel}
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value as LanguageCode)}
            className="mt-1 block min-w-44 rounded-lg border border-border bg-surface/80 px-3 py-2 text-sm text-text-primary outline-none transition-colors focus:border-accent/60"
            aria-label="Select language"
          >
            {languageOptions.map((option) => (
              <option key={option.code} value={option.code}>
                {option.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <section className="overflow-hidden rounded-xl border border-border bg-surface/55">
        <header className="flex flex-wrap items-start justify-between gap-3 border-b border-border px-4 py-3">
          <div>
            <p className="text-[11px] uppercase tracking-[0.12em] text-text-muted">{t.footerText}</p>
            <h3 className="text-lg font-semibold">{t.appName}</h3>
            <p className="text-sm text-text-secondary">{t.appTagline}</p>
          </div>
          <span className="rounded-full border border-emerald-400/35 bg-emerald-400/10 px-2.5 py-1 text-[11px] text-emerald-300">
            {t.statusLabel}
          </span>
        </header>

        <div className="border-b border-border px-4 py-3">
          <nav className="flex flex-wrap gap-2 text-xs">
            {[t.navHome, t.navProjects, t.navBilling, t.navSupport].map((item) => (
              <span key={item} className="rounded-full border border-border px-2.5 py-1 text-text-secondary">
                {item}
              </span>
            ))}
          </nav>
        </div>

        <div className="grid gap-4 p-4 lg:grid-cols-[1.1fr_0.9fr]">
          <article className="rounded-lg border border-border bg-bg/35 p-4">
            <h4 className="text-base font-semibold text-text-primary">{t.heroTitle}</h4>
            <p className="mt-2 text-sm text-text-secondary">{t.heroBody}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                className="rounded-lg border border-accent/50 bg-accent/20 px-3 py-1.5 text-xs font-medium text-text-primary"
              >
                {t.primaryButton}
              </button>
              <button
                type="button"
                className="rounded-lg border border-border bg-surface/70 px-3 py-1.5 text-xs font-medium text-text-secondary"
              >
                {t.secondaryButton}
              </button>
            </div>

            <div className="mt-4 rounded-lg border border-border/70 bg-surface/55 p-3">
              <p className="text-xs uppercase tracking-[0.11em] text-text-muted">{t.activityTitle}</p>
              <ul className="mt-2 space-y-1 text-sm text-text-secondary">
                <li>- {t.activityOne}</li>
                <li>- {t.activityTwo}</li>
                <li>- {t.activityThree}</li>
              </ul>
            </div>
          </article>

          <form className="space-y-3 rounded-lg border border-border bg-bg/35 p-4">
            <p className="text-sm font-semibold text-text-primary">{t.formTitle}</p>

            <label className="block text-xs text-text-muted">
              {t.searchLabel}
              <input
                placeholder={t.searchPlaceholder}
                className="mt-1 w-full rounded-lg border border-border bg-surface/75 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted/80"
              />
            </label>

            <label className="block text-xs text-text-muted">
              {t.emailLabel}
              <input
                placeholder={t.emailPlaceholder}
                className="mt-1 w-full rounded-lg border border-border bg-surface/75 px-3 py-2 text-sm text-text-primary outline-none placeholder:text-text-muted/80"
              />
            </label>

            <label className="block text-xs text-text-muted">
              {t.timezoneLabel}
              <select
                defaultValue="UTC+0"
                className="mt-1 w-full rounded-lg border border-border bg-surface/75 px-3 py-2 text-sm text-text-primary outline-none"
              >
                <option>UTC-5</option>
                <option>UTC+0</option>
                <option>UTC+1</option>
              </select>
            </label>

            <div className="flex gap-2 pt-1">
              <button
                type="button"
                className="rounded-lg border border-accent/50 bg-accent/20 px-3 py-2 text-xs font-medium text-text-primary"
              >
                {t.saveButton}
              </button>
              <button
                type="button"
                className="rounded-lg border border-border bg-surface/70 px-3 py-2 text-xs font-medium text-text-secondary"
              >
                {t.resetButton}
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}





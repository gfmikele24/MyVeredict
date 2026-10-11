import type { Locale } from "@/lib/i18n";
import type { Translation } from "./types";

interface MyVeredictHeaderProps {
    locale: Locale;
    onLocaleChange: (locale: Locale) => void;
    t: Translation;
}

export const MyVeredictHeader = ({ locale, onLocaleChange, t }: MyVeredictHeaderProps) => (
    <header className="mb-10 flex items-center justify-between gap-4">
        <div>
            <p className="text-sm font-semibold tracking-wide text-brand-secondary uppercase">MyVeredict</p>
            <p className="mt-1 text-sm text-tertiary">{t.appDescription}</p>
        </div>
        <div className="flex rounded-lg bg-primary p-1 shadow-xs ring-1 ring-secondary">
            {(["es", "en"] as const).map((item) => (
                <button
                    key={item}
                    type="button"
                    onClick={() => onLocaleChange(item)}
                    aria-pressed={locale === item}
                    className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${locale === item ? "bg-brand-solid text-white" : "text-tertiary hover:bg-primary_hover"}`}
                >
                    {item.toUpperCase()}
                </button>
            ))}
        </div>
    </header>
);

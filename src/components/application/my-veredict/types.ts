import type { translations } from "@/lib/i18n";
import type { Fight } from "@/lib/scoring";

export type Translation = Record<keyof (typeof translations)["es"], string>;
export type ActiveFight = Fight;

import type { translations } from "@/lib/i18n";
import type { Fight, FightEndMethod } from "@/lib/scoring";

export type Translation = Record<keyof (typeof translations)["es"], string>;
export type ActiveFight = Fight;

export const getEndMethodLabel = (method: FightEndMethod, t: Translation) =>
    ({ ko: t.ko, tko: t.tko, submission: t.submission, "no-contest": t.noContest })[method];

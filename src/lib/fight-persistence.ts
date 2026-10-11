"use client";

import type { BaseScore, Corner, Fight, RoundScore } from "@/lib/scoring";

export const FIGHT_STORAGE_KEY = "my-veredict.fight-session";

export interface RoundDraft {
    baseScore: BaseScore | null;
    deductionCorner: Corner | null;
    deductionPoints: 1 | 2;
    winner: Corner | null;
}

export interface PersistedFightSession {
    draft: RoundDraft;
    fight: Fight;
    version: 1;
}

export const createEmptyRoundDraft = (): RoundDraft => ({
    baseScore: null,
    deductionCorner: null,
    deductionPoints: 1,
    winner: null,
});

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null;

const isCorner = (value: unknown): value is Corner => value === "blue" || value === "red";

const isBaseScore = (value: unknown): value is BaseScore => value === "10-9" || value === "10-8" || value === "10-7";

const isRoundScore = (value: unknown): value is RoundScore => {
    if (!isRecord(value) || !isBaseScore(value.baseScore) || !isCorner(value.winner)) {
        return false;
    }

    if (value.deduction === undefined) {
        return true;
    }

    return (
        isRecord(value.deduction) &&
        isCorner(value.deduction.corner) &&
        (value.deduction.points === 1 || value.deduction.points === 2)
    );
};

const isFight = (value: unknown): value is Fight => {
    if (!isRecord(value) || !isRecord(value.setup) || !Array.isArray(value.rounds)) {
        return false;
    }

    const { blueCorner, redCorner, rounds } = value.setup;
    return (
        typeof blueCorner === "string" &&
        blueCorner.trim().length > 0 &&
        typeof redCorner === "string" &&
        redCorner.trim().length > 0 &&
        typeof rounds === "number" &&
        Number.isInteger(rounds) &&
        rounds >= 1 &&
        rounds <= 12 &&
        value.rounds.length <= rounds &&
        value.rounds.every(isRoundScore)
    );
};

const isRoundDraft = (value: unknown): value is RoundDraft =>
    isRecord(value) &&
    (value.winner === null || isCorner(value.winner)) &&
    (value.baseScore === null || isBaseScore(value.baseScore)) &&
    (value.deductionCorner === null || isCorner(value.deductionCorner)) &&
    (value.deductionPoints === 1 || value.deductionPoints === 2);

const isPersistedFightSession = (value: unknown): value is PersistedFightSession =>
    isRecord(value) && value.version === 1 && isFight(value.fight) && isRoundDraft(value.draft);

export const readFightSession = (): PersistedFightSession | null => {
    try {
        const storedSession = window.localStorage.getItem(FIGHT_STORAGE_KEY);

        if (!storedSession) {
            return null;
        }

        const parsedSession: unknown = JSON.parse(storedSession);
        return isPersistedFightSession(parsedSession) ? parsedSession : null;
    } catch {
        return null;
    }
};

export const writeFightSession = (session: Omit<PersistedFightSession, "version">) => {
    try {
        window.localStorage.setItem(FIGHT_STORAGE_KEY, JSON.stringify({ ...session, version: 1 }));
    } catch {
        // ponytail: persistence is optional; the in-memory score remains usable if browser storage is unavailable.
    }
};

export const clearFightSession = () => {
    try {
        window.localStorage.removeItem(FIGHT_STORAGE_KEY);
    } catch {
        // ponytail: persistence is optional; the in-memory score remains usable if browser storage is unavailable.
    }
};

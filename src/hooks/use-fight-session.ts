"use client";

import { useEffect, useState } from "react";
import { clearFightSession, createEmptyRoundDraft, readFightSession, writeFightSession } from "@/lib/fight-persistence";
import type { Fight, FightSetup, RoundScore } from "@/lib/scoring";
import { confirmRound, createFight, isFightComplete } from "@/lib/scoring";

export const useFightSession = () => {
    const [fight, setFight] = useState<Fight | null>(null);
    const [isHydrated, setIsHydrated] = useState(false);

    useEffect(() => {
        const persistedSession = readFightSession();
        setFight(persistedSession?.fight ?? null);
        setIsHydrated(true);
    }, []);

    const startFight = (setup: FightSetup) => {
        const nextFight = createFight(setup);
        setFight(nextFight);
        writeFightSession({ draft: createEmptyRoundDraft(), fight: nextFight });
    };

    const scoreRound = (round: RoundScore) => {
        if (!fight) {
            throw new Error("No hay un combate activo");
        }

        const nextFight = confirmRound(fight, round);
        setFight(nextFight);
        writeFightSession({ draft: readFightSession()?.draft ?? createEmptyRoundDraft(), fight: nextFight });
    };

    const clearFight = () => {
        clearFightSession();
        setFight(null);
    };

    return {
        clearFight,
        fight,
        isComplete: fight ? isFightComplete(fight) : false,
        isHydrated,
        scoreRound,
        startFight,
    };
};

import assert from "node:assert/strict";
import test from "node:test";
import { createEmptyRoundDraft, FIGHT_STORAGE_KEY, readFightSession, writeFightSession } from "./fight-persistence.ts";
import { confirmRound, createFight, endFight, getVerdict, isFightComplete, type FightEnd } from "./scoring.ts";

const setup = { blueCorner: "Azul", redCorner: "Rojo", rounds: 3 };
const storage = new Map<string, string>();

Object.defineProperty(globalThis, "window", {
    value: {
        localStorage: {
            getItem: (key: string) => storage.get(key) ?? null,
            removeItem: (key: string) => storage.delete(key),
            setItem: (key: string, value: string) => storage.set(key, value),
        },
    },
});

test("un KO termina el combate y usa su ganador aunque pierda a los puntos", () => {
    const fight = confirmRound(createFight(setup), { baseScore: "10-9", winner: "blue" });
    const endedFight = endFight(fight, { method: "ko", winner: "red" });

    assert.deepEqual(endedFight.ending, { method: "ko", round: 2, winner: "red" });
    assert.equal(isFightComplete(endedFight), true);
    assert.equal(getVerdict(endedFight).winner, "red");
    assert.deepEqual(getVerdict(endedFight).totals, { blue: 10, red: 9 });
});

test("un NO CONTEST termina el combate sin ganador", () => {
    const endedFight = endFight(createFight(setup), { method: "no-contest", winner: null });

    assert.deepEqual(endedFight.ending, { method: "no-contest", round: 1, winner: null });
    assert.equal(isFightComplete(endedFight), true);
    assert.equal(getVerdict(endedFight).winner, null);
});

test("rechaza un final incompatible con su método", () => {
    assert.throws(() => endFight(createFight(setup), { method: "submission", winner: null } as unknown as FightEnd), /WINNER_REQUIRED/);
    assert.throws(() => endFight(createFight(setup), { method: "no-contest", winner: "blue" } as unknown as FightEnd), /NO_CONTEST_HAS_NO_WINNER/);
});

test("persiste un final anticipado y sigue aceptando combates sin final", () => {
    const endedFight = endFight(createFight(setup), { method: "tko", winner: "blue" });
    writeFightSession({ draft: createEmptyRoundDraft(), fight: endedFight });

    assert.deepEqual(readFightSession()?.fight.ending, { method: "tko", round: 1, winner: "blue" });

    writeFightSession({ draft: createEmptyRoundDraft(), fight: createFight(setup) });
    assert.equal(readFightSession()?.fight.ending, undefined);

    storage.set(
        FIGHT_STORAGE_KEY,
        JSON.stringify({
            draft: createEmptyRoundDraft(),
            fight: { ...createFight(setup), ending: { method: "no-contest", round: 1, winner: "red" } },
            version: 1,
        }),
    );
    assert.equal(readFightSession(), null);
});

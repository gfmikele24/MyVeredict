import assert from "node:assert/strict";
import test from "node:test";
import { calculateTotals, confirmRound, createFight, getVerdict } from "./scoring.ts";

test("calcula la deducción contra la esquina seleccionada", () => {
    const fight = createFight({ blueCorner: "Azul", redCorner: "Rojo", rounds: 3 });
    const scoredFight = confirmRound(fight, {
        baseScore: "10-9",
        deduction: { corner: "red", points: 1 },
        winner: "red",
    });

    assert.deepEqual(calculateTotals(scoredFight), { blue: 9, red: 9 });
});

test("bloquea una ronda ya confirmada y calcula el veredicto", () => {
    const fight = createFight({ blueCorner: "Azul", redCorner: "Rojo", rounds: 2 });
    const firstRound = confirmRound(fight, { baseScore: "10-8", winner: "blue" });
    const completedFight = confirmRound(firstRound, { baseScore: "10-9", winner: "red" });

    assert.throws(() => confirmRound(completedFight, { baseScore: "10-9", winner: "blue" }), /No quedan rondas/);
    assert.equal(getVerdict(completedFight).winner, "blue");
});

import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("solicita confirmación antes de abandonar un combate en curso", async () => {
    const panel = await readFile(new URL("./round-scoring-panel.tsx", import.meta.url), "utf8");

    assert.match(panel, /onBackToHome: \(\) => void/);
    assert.match(panel, /t\.restartFightConfirmation/);
    assert.match(panel, /onPress=\{onBackToHome\}/);
});

test("recibe el reinicio desde la tarjeta de puntuación", async () => {
    const scorecard = await readFile(new URL("./fight-scorecard.tsx", import.meta.url), "utf8");

    assert.match(scorecard, /onBackToHome=\{onBackToHome\}/);
});

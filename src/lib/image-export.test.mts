import assert from "node:assert/strict";
import test from "node:test";
import type { Translation } from "@/components/application/my-veredict/types";
import type { Fight } from "@/lib/scoring";
import { createImageFilename, getScorecardExportData, getScorecardPanelLayout, shareImageFile } from "./image-export.ts";

test("crea un nombre seguro para la tarjeta compartible", () => {
    assert.equal(createImageFilename("José Aldo", "Max/Holloway"), "myveredict-jose-aldo-vs-max-holloway.png");
});

test("centra una tarjeta más estrecha dentro del lienzo", () => {
    assert.deepEqual(getScorecardPanelLayout(false), { height: 952, width: 900, x: 90, y: 64 });
});

test("prepara filas y deducciones para el renderizador Canvas", () => {
    const fight: Fight = {
        rounds: [{ baseScore: "10-9", deduction: { corner: "red", points: 1 }, winner: "red" }],
        setup: { blueCorner: "Azul", redCorner: "Rojo", rounds: 1 },
    };
    const t = {
        blueCorner: "Esquina azul",
        draw: "Empate",
        finalVerdict: "Veredicto final",
        noContest: "No contest",
        redCorner: "Esquina roja",
        winner: "Ganador",
    } as Translation;

    const data = getScorecardExportData(fight, t);

    assert.equal(data.compact, false);
    assert.equal(data.resultName, "Empate");
    assert.deepEqual(data.rows, [{ blue: 9, blueDeduction: 0, red: 10, redDeduction: 1, round: 1 }]);
});

test("usa el diseño compacto a partir de ocho asaltos", () => {
    const fight: Fight = {
        rounds: Array.from({ length: 8 }, () => ({ baseScore: "10-9", winner: "blue" })),
        setup: { blueCorner: "Azul", redCorner: "Rojo", rounds: 8 },
    };
    const t = { draw: "Empate", finalVerdict: "Veredicto final", winner: "Ganador" } as Translation;

    assert.equal(getScorecardExportData(fight, t).compact, true);
});

test("prepara el método de finalización para el resumen y la tabla", () => {
    const fight: Fight = {
        ending: { method: "ko", round: 2, winner: "red" },
        rounds: [{ baseScore: "10-9", winner: "red" }],
        setup: { blueCorner: "Azul", redCorner: "Rojo", rounds: 12 },
    };
    const t = {
        blueCorner: "Esquina azul",
        deduction: "Deducción",
        draw: "Empate",
        finalVerdict: "Veredicto final",
        ko: "KO",
        noContest: "No contest",
        noWinner: "Sin ganador",
        redCorner: "Esquina roja",
        round: "Ronda",
        winner: "Ganador",
    } as Translation;

    const data = getScorecardExportData(fight, t);

    assert.equal(data.endingSummary, "KO · Ronda 2");
    assert.equal(data.endingTableRow, "KO · Ronda 2 · Rojo");
    assert.deepEqual(data.totals, { blue: 9, red: 10 });
});

test("comparte el archivo PNG cuando el navegador admite compartir archivos", async () => {
    const originalNavigator = globalThis.navigator;
    const shared: unknown[] = [];
    const file = { name: "myveredict-red-vs-blue.png", type: "image/png" } as File;

    Object.defineProperty(globalThis, "navigator", {
        configurable: true,
        value: {
            canShare: () => true,
            share: async (data: unknown) => {
                shared.push(data);
            },
        },
    });

    try {
        assert.equal(await shareImageFile(file), true);
        assert.deepEqual(shared, [{ files: [file], title: "MyVeredict" }]);
    } finally {
        Object.defineProperty(globalThis, "navigator", { configurable: true, value: originalNavigator });
    }
});

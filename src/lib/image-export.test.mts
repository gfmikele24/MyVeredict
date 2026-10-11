import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createImageFilename } from "./image-export.ts";

test("crea un nombre seguro para la tarjeta compartible", () => {
    assert.equal(createImageFilename("José Aldo", "Max/Holloway"), "myveredict-jose-aldo-vs-max-holloway.png");
});

test("la tarjeta compartible no se coloca fuera del lienzo de exportación", async () => {
    const summary = await readFile(new URL("../components/application/my-veredict/print-summary.tsx", import.meta.url), "utf8");

    assert.doesNotMatch(summary, /left:\s*-10000/);
});

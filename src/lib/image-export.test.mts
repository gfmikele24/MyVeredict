import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import { createImageFilename, shareImageFile, waitForImages } from "./image-export.ts";

test("crea un nombre seguro para la tarjeta compartible", () => {
    assert.equal(createImageFilename("José Aldo", "Max/Holloway"), "myveredict-jose-aldo-vs-max-holloway.png");
});

test("la tarjeta compartible no se coloca fuera del lienzo de exportación", async () => {
    const summary = await readFile(new URL("../components/application/my-veredict/print-summary.tsx", import.meta.url), "utf8");

    assert.doesNotMatch(summary, /left:\s*-10000/);
});

test("la tarjeta compartible muestra el logo de MyVeredict", async () => {
    const summary = await readFile(new URL("../components/application/my-veredict/print-summary.tsx", import.meta.url), "utf8");

    assert.match(summary, /alt="MyVeredict"/);
    assert.match(summary, /src="\/logo-mv\.png"/);
});

test("espera a que las imágenes terminen de cargar antes de exportar", async () => {
    const image = new EventTarget() as EventTarget & Pick<HTMLImageElement, "complete" | "decode">;
    let decodeCalls = 0;
    let settled = false;

    Object.assign(image, {
        complete: false,
        decode: async () => {
            decodeCalls += 1;
        },
    });

    const waiting = waitForImages([image as HTMLImageElement]).then(() => {
        settled = true;
    });

    await Promise.resolve();
    assert.equal(settled, false);

    image.dispatchEvent(new Event("load"));
    await waiting;

    assert.equal(decodeCalls, 1);
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

import assert from "node:assert/strict";
import test from "node:test";
import { translations } from "./i18n.ts";

test("incluye los textos de confirmación para abandonar un combate", () => {
    for (const locale of ["en", "es"] as const) {
        assert.equal(typeof translations[locale].restartFight, "string");
        assert.equal(typeof translations[locale].restartFightConfirmation, "string");
        assert.equal(typeof translations[locale].restartFightWarning, "string");
        assert.equal(typeof translations[locale].confirmRestartFight, "string");
    }
});

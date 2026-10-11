"use client";

import { useState } from "react";
import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import type { FightSetup } from "@/lib/scoring";
import type { Translation } from "./types";

interface FightSetupModalProps {
    isOpen: boolean;
    onOpenChange: (isOpen: boolean) => void;
    onStartFight: (setup: FightSetup) => string | undefined;
    t: Translation;
}

export const FightSetupModal = ({ isOpen, onOpenChange, onStartFight, t }: FightSetupModalProps) => {
    const [blueCorner, setBlueCorner] = useState("");
    const [redCorner, setRedCorner] = useState("");
    const [rounds, setRounds] = useState(3);
    const [error, setError] = useState("");

    const startFight = () => {
        const setupError = onStartFight({ blueCorner, redCorner, rounds });
        setError(setupError ?? "");

        if (!setupError) {
            onOpenChange(false);
        }
    };

    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
            <Modal className="max-w-lg">
                <Dialog aria-label={t.fightSetup}>
                    <div className="p-6 sm:p-8">
                        <h2 className="text-xl font-semibold text-primary">{t.fightSetup}</h2>
                        <div className="mt-6 grid gap-5">
                            <FighterInput color="red" label={t.redCorner} onChange={setRedCorner} value={redCorner} />
                            <FighterInput color="blue" label={t.blueCorner} onChange={setBlueCorner} value={blueCorner} />
                            <label className="grid gap-1.5 text-sm font-medium text-secondary">
                                {t.rounds}
                                <select
                                    value={rounds}
                                    onChange={(event) => setRounds(Number(event.target.value))}
                                    className="rounded-lg bg-primary px-3 py-2.5 text-primary shadow-xs ring-1 ring-primary outline-hidden focus:ring-2 focus:ring-brand"
                                >
                                    {Array.from({ length: 12 }, (_, index) => index + 1).map((round) => (
                                        <option key={round} value={round}>
                                            {round}
                                        </option>
                                    ))}
                                </select>
                            </label>
                        </div>
                        {error && <p className="mt-3 text-sm text-error-primary">{error}</p>}
                        <div className="mt-8 flex justify-end gap-3">
                            <Button color="secondary" onPress={() => onOpenChange(false)}>
                                {t.cancel}
                            </Button>
                            <Button onPress={startFight}>{t.startFight}</Button>
                        </div>
                    </div>
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};

const FighterInput = ({ color, label, onChange, value }: { color: "blue" | "red"; label: string; onChange: (value: string) => void; value: string }) => (
    <label className="grid gap-1.5 text-sm font-medium text-secondary">
        {label}
        <input
            required
            value={value}
            onChange={(event) => onChange(event.target.value)}
            className={`rounded-lg bg-primary px-3 py-2.5 text-primary shadow-xs ring-1 outline-hidden focus:ring-2 ${color === "red" ? "ring-error_subtle focus:ring-error" : "ring-primary focus:ring-brand"}`}
        />
    </label>
);

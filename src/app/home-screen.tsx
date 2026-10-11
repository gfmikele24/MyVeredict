"use client";

import { FightEmptyState } from "@/components/application/my-veredict/fight-empty-state";
import { FightScorecard } from "@/components/application/my-veredict/fight-scorecard";
import { FightSetupModal } from "@/components/application/my-veredict/fight-setup-modal";
import { MyVeredictHeader } from "@/components/application/my-veredict/my-veredict-header";
import { PrintSummary } from "@/components/application/my-veredict/print-summary";
import { VerdictModal } from "@/components/application/my-veredict/verdict-modal";
import { useFightSession } from "@/hooks/use-fight-session";
import { useImageExport } from "@/hooks/use-image-export";
import { readFightSession, writeFightSession } from "@/lib/fight-persistence";
import { detectLocale, translations, type Locale } from "@/lib/i18n";
import { createImageFilename } from "@/lib/image-export";
import type { BaseScore, Corner, FightSetup } from "@/lib/scoring";
import { useEffect, useRef, useState } from "react";

export const HomeScreen = () => {
    const { clearFight, fight, isComplete, isHydrated, scoreRound, startFight } = useFightSession();
    const { error: imageExportError, exportImage, isExporting } = useImageExport();
    const imageCardRef = useRef<HTMLElement>(null);
    const [locale, setLocale] = useState<Locale>("es");
    const [isSetupOpen, setIsSetupOpen] = useState(false);
    const [isVerdictOpen, setIsVerdictOpen] = useState(false);
    const [winner, setWinner] = useState<Corner | null>(null);
    const [baseScore, setBaseScore] = useState<BaseScore | null>(null);
    const [deductionCorner, setDeductionCorner] = useState<Corner | null>(null);
    const [deductionPoints, setDeductionPoints] = useState<1 | 2>(1);
    const [isDraftHydrated, setIsDraftHydrated] = useState(false);
    const t = translations[locale];

    useEffect(() => {
        setLocale(detectLocale());
    }, []);

    useEffect(() => {
        if (!isHydrated) {
            return;
        }

        const persistedSession = readFightSession();

        if (persistedSession) {
            setWinner(persistedSession.draft.winner);
            setBaseScore(persistedSession.draft.baseScore);
            setDeductionCorner(persistedSession.draft.deductionCorner);
            setDeductionPoints(persistedSession.draft.deductionPoints);
        }

        setIsDraftHydrated(true);
    }, [isHydrated]);

    useEffect(() => {
        if (!isHydrated || !isDraftHydrated || !fight) {
            return;
        }

        writeFightSession({
            draft: { baseScore, deductionCorner, deductionPoints, winner },
            fight,
        });
    }, [baseScore, deductionCorner, deductionPoints, fight, isDraftHydrated, isHydrated, winner]);

    const resetRoundForm = () => {
        setWinner(null);
        setBaseScore(null);
        setDeductionCorner(null);
        setDeductionPoints(1);
    };

    const handleStartFight = (setup: FightSetup) => {
        try {
            startFight(setup);
            resetRoundForm();
            return undefined;
        } catch (error) {
            return error instanceof Error && error.message === "ROUND_COUNT_INVALID" ? t.roundCountInvalid : t.fighterNamesRequired;
        }
    };

    const handleConfirmRound = () => {
        if (!winner || !baseScore) {
            return;
        }

        const isLastRound = fight !== null && fight.rounds.length === fight.setup.rounds - 1;

        scoreRound({
            baseScore,
            deduction: deductionCorner ? { corner: deductionCorner, points: deductionPoints } : undefined,
            winner,
        });
        resetRoundForm();

        if (isLastRound) {
            setIsVerdictOpen(true);
        }
    };

    const handleLocaleChange = (nextLocale: Locale) => {
        setLocale(nextLocale);
        document.documentElement.lang = nextLocale;
    };

    const handleImageDownload = () => {
        if (!fight) {
            return;
        }

        void exportImage(imageCardRef.current, createImageFilename(fight.setup.redCorner, fight.setup.blueCorner));
    };

    const handleBackToHome = () => {
        setIsVerdictOpen(false);
        resetRoundForm();
        clearFight();
    };

    if (!isHydrated || !isDraftHydrated) {
        return <main aria-busy="true" className="app-shell min-h-dvh bg-secondary" />;
    }

    return (
        <>
            <main className="app-shell min-h-dvh bg-secondary px-4 py-6 sm:px-8 sm:py-10">
                <div className="mx-auto max-w-4xl">
                    <MyVeredictHeader locale={locale} onLocaleChange={handleLocaleChange} t={t} />

                    {!fight ? (
                        <FightEmptyState onStart={() => setIsSetupOpen(true)} t={t} />
                    ) : (
                        <FightScorecard
                            baseScore={baseScore}
                            deductionCorner={deductionCorner}
                            deductionPoints={deductionPoints}
                            exportError={imageExportError}
                            fight={fight}
                            isComplete={isComplete}
                            isExporting={isExporting}
                            onConfirmRound={handleConfirmRound}
                            onDeductionCornerChange={setDeductionCorner}
                            onDeductionPointsChange={setDeductionPoints}
                            onBackToHome={handleBackToHome}
                            onDownloadImage={handleImageDownload}
                            onScoreChange={setBaseScore}
                            onWinnerChange={setWinner}
                            t={t}
                            winner={winner}
                        />
                    )}
                </div>
            </main>

            <FightSetupModal isOpen={isSetupOpen} onOpenChange={setIsSetupOpen} onStartFight={handleStartFight} t={t} />

            {fight && (
                <VerdictModal
                    exportError={imageExportError}
                    fight={fight}
                    isOpen={isVerdictOpen}
                    isExporting={isExporting}
                    onDownloadImage={handleImageDownload}
                    onOpenChange={setIsVerdictOpen}
                    t={t}
                />
            )}
            {fight && isComplete && <PrintSummary cardRef={imageCardRef} fight={fight} t={t} />}
        </>
    );
};

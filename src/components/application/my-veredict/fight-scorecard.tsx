import { Button } from "@/components/base/buttons/button";
import { calculateTotals, getVerdict, type BaseScore, type Corner } from "@/lib/scoring";
import { CornerHeader } from "./corner-header";
import { RoundScoreTable } from "./round-score-table";
import { RoundScoringPanel } from "./round-scoring-panel";
import type { ActiveFight, Translation } from "./types";

interface FightScorecardProps {
    baseScore: BaseScore | null;
    deductionCorner: Corner | null;
    deductionPoints: 1 | 2;
    exportError: boolean;
    fight: ActiveFight;
    isComplete: boolean;
    isExporting: boolean;
    onBackToHome: () => void;
    onConfirmRound: () => void;
    onDeductionCornerChange: (corner: Corner | null) => void;
    onDeductionPointsChange: (points: 1 | 2) => void;
    onDownloadImage: () => void;
    onScoreChange: (score: BaseScore) => void;
    onWinnerChange: (corner: Corner) => void;
    t: Translation;
    winner: Corner | null;
}

export const FightScorecard = ({
    baseScore,
    deductionCorner,
    deductionPoints,
    exportError,
    fight,
    isComplete,
    isExporting,
    onBackToHome,
    onConfirmRound,
    onDeductionCornerChange,
    onDeductionPointsChange,
    onDownloadImage,
    onScoreChange,
    onWinnerChange,
    t,
    winner,
}: FightScorecardProps) => {
    const totals = calculateTotals(fight);
    const verdict = getVerdict(fight);
    const winnerName = verdict.winner === "red" ? fight.setup.redCorner : verdict.winner === "blue" ? fight.setup.blueCorner : t.draw;

    return (
        <section className="overflow-hidden rounded-2xl bg-primary shadow-xs ring-1 ring-secondary">
            <div className="grid grid-cols-2 divide-x divide-secondary border-b border-secondary">
                <CornerHeader color="red" name={fight.setup.redCorner} points={totals.red} />
                <CornerHeader color="blue" name={fight.setup.blueCorner} points={totals.blue} />
            </div>
            <div className="p-5 sm:p-8">
                {isComplete ? (
                    <div className="py-8 text-center">
                        <p className="text-xl font-semibold text-primary">{verdict.winner ? `${t.winner}: ${winnerName}` : t.draw}</p>
                        <Button className="mt-5" size="lg" isLoading={isExporting} showTextWhileLoading onPress={onDownloadImage}>
                            {isExporting ? t.generatingImage : t.downloadImage}
                        </Button>
                        <div>
                            <Button className="mt-3" color="secondary" onPress={onBackToHome}>
                                {t.backToHome}
                            </Button>
                        </div>
                        {exportError && <p className="mt-3 text-sm text-error-primary">{t.imageExportError}</p>}
                    </div>
                ) : (
                    <RoundScoringPanel
                        baseScore={baseScore}
                        deductionCorner={deductionCorner}
                        deductionPoints={deductionPoints}
                        fight={fight}
                        onConfirm={onConfirmRound}
                        onDeductionCornerChange={onDeductionCornerChange}
                        onDeductionPointsChange={onDeductionPointsChange}
                        onScoreChange={onScoreChange}
                        onWinnerChange={onWinnerChange}
                        t={t}
                        winner={winner}
                    />
                )}
                <RoundScoreTable fight={fight} t={t} />
            </div>
        </section>
    );
};

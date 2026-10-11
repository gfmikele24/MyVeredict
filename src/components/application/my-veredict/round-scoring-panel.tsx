import { Button } from "@/components/base/buttons/button";
import type { BaseScore, Corner } from "@/lib/scoring";
import { CornerChoice } from "./corner-choice";
import type { ActiveFight, Translation } from "./types";

interface RoundScoringPanelProps {
    baseScore: BaseScore | null;
    deductionCorner: Corner | null;
    deductionPoints: 1 | 2;
    fight: ActiveFight;
    onConfirm: () => void;
    onDeductionCornerChange: (corner: Corner | null) => void;
    onDeductionPointsChange: (points: 1 | 2) => void;
    onScoreChange: (score: BaseScore) => void;
    onWinnerChange: (corner: Corner) => void;
    t: Translation;
    winner: Corner | null;
}

export const RoundScoringPanel = ({
    baseScore,
    deductionCorner,
    deductionPoints,
    fight,
    onConfirm,
    onDeductionCornerChange,
    onDeductionPointsChange,
    onScoreChange,
    onWinnerChange,
    t,
    winner,
}: RoundScoringPanelProps) => {
    const roundNumber = fight.rounds.length + 1;
    const scoreButtonClass = (isSelected: boolean) => {
        if (winner === "red") {
            return isSelected ? "bg-error-solid text-white ring-error-solid" : "bg-error-primary text-error-primary ring-error_subtle hover:bg-error-secondary";
        }

        if (winner === "blue") {
            return isSelected ? "bg-utility-blue-600 text-white ring-utility-blue-600" : "bg-utility-blue-50 text-utility-blue-700 ring-utility-blue-300 hover:bg-utility-blue-100";
        }

        return isSelected ? "bg-primary text-primary ring-brand" : "bg-primary text-primary ring-secondary hover:bg-primary_hover";
    };
    const deductionPointsClass = (isSelected: boolean) => {
        if (deductionCorner === "red") {
            return isSelected ? "bg-error-solid text-white ring-error-solid" : "text-error-primary ring-error_subtle";
        }

        return deductionCorner === "blue"
            ? isSelected
                ? "bg-utility-blue-600 text-white ring-utility-blue-600"
                : "text-utility-blue-700 ring-utility-blue-300"
            : "text-tertiary ring-secondary";
    };

    return (
        <>
            <div>
                <div>
                    <p className="text-sm font-medium text-tertiary">
                        {t.round} {roundNumber} / {fight.setup.rounds}
                    </p>
                    <h1 className="mt-1 text-xl font-semibold text-primary">{t.scoreRound}</h1>
                </div>
            </div>

            <div className="mt-7">
                <p className="text-sm font-medium text-secondary">{t.winnerOfRound}</p>
                <div className="mt-2 grid grid-cols-2 gap-3">
                    <CornerChoice active={winner === "red"} color="red" name={fight.setup.redCorner} onClick={() => onWinnerChange("red")} />
                    <CornerChoice active={winner === "blue"} color="blue" name={fight.setup.blueCorner} onClick={() => onWinnerChange("blue")} />
                </div>
            </div>

            <div className="mt-6">
                <p className="text-sm font-medium text-secondary">{t.score}</p>
                <div className="mt-2 grid grid-cols-3 gap-3">
                    {(["10-9", "10-8", "10-7"] as const).map((score) => (
                        <button
                            key={score}
                            type="button"
                            onClick={() => onScoreChange(score)}
                            className={`rounded-lg px-3 py-3 text-lg font-semibold ring-1 transition ${scoreButtonClass(baseScore === score)}`}
                        >
                            {score}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mt-6 rounded-xl bg-secondary p-4">
                <p className="font-medium text-primary">{t.deduction}</p>
                <p className="mt-1 text-sm text-tertiary">{t.deductionHelp}</p>
                <div className="mt-4 grid grid-cols-3 gap-2">
                    <button type="button" onClick={() => onDeductionCornerChange(null)} className={`rounded-lg px-2 py-2 text-sm font-semibold ring-1 ${!deductionCorner ? "bg-primary text-primary ring-primary" : "bg-secondary text-tertiary ring-secondary"}`}>
                        {t.noDeduction}
                    </button>
                    <button type="button" onClick={() => onDeductionCornerChange("red")} className={`rounded-lg px-2 py-2 text-sm font-semibold ring-1 ${deductionCorner === "red" ? "bg-error-solid text-white ring-error-solid" : "bg-error-primary text-error-primary ring-error_subtle hover:bg-error-secondary"}`}>
                        {fight.setup.redCorner}
                    </button>
                    <button type="button" onClick={() => onDeductionCornerChange("blue")} className={`rounded-lg px-2 py-2 text-sm font-semibold ring-1 ${deductionCorner === "blue" ? "bg-utility-blue-600 text-white ring-utility-blue-600" : "bg-utility-blue-50 text-utility-blue-700 ring-utility-blue-300 hover:bg-utility-blue-100"}`}>
                        {fight.setup.blueCorner}
                    </button>
                </div>
                {deductionCorner && (
                    <div className="mt-3 flex gap-2">
                        {([1, 2] as const).map((points) => (
                            <button key={points} type="button" onClick={() => onDeductionPointsChange(points)} className={`rounded-lg px-4 py-2 text-sm font-semibold ring-1 ${deductionPointsClass(deductionPoints === points)}`}>
                                -{points} {t.points}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <Button className="mt-7 w-full" size="lg" isDisabled={!winner || !baseScore} onPress={onConfirm}>
                {t.finishRound}
            </Button>
        </>
    );
};

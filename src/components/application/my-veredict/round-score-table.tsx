import { getRoundPoints } from "@/lib/scoring";
import { getEndMethodLabel, type ActiveFight, type Translation } from "./types";

interface RoundScoreTableProps {
    fight: ActiveFight;
    t: Translation;
}

export const RoundScoreTable = ({ fight, t }: RoundScoreTableProps) => (
    <div className="mt-8 overflow-hidden rounded-xl ring-1 ring-secondary">
        <table className="w-full text-left text-sm">
            <thead className="bg-secondary text-tertiary">
                <tr>
                    <th className="px-4 py-3 font-medium">{t.round}</th>
                    <th className="px-4 py-3 font-medium">{fight.setup.redCorner}</th>
                    <th className="px-4 py-3 font-medium">{fight.setup.blueCorner}</th>
                    <th className="hidden px-4 py-3 font-medium sm:table-cell">{t.deduction}</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-secondary">
                {fight.rounds.map((round, index) => {
                    const points = getRoundPoints(round);
                    return (
                        <tr key={index} className="text-secondary">
                            <td className={`px-4 py-3 font-medium ${round.winner === "red" ? "bg-linear-to-r from-error-primary to-transparent" : "bg-linear-to-r from-utility-blue-500/35 to-transparent"}`}>{index + 1}</td>
                            <td className="px-4 py-3">{points.red}</td>
                            <td className="px-4 py-3">{points.blue}</td>
                            <td className="hidden px-4 py-3 sm:table-cell">{round.deduction ? `-${round.deduction.points} ${round.deduction.corner === "red" ? fight.setup.redCorner : fight.setup.blueCorner}` : "—"}</td>
                        </tr>
                    );
                })}
                {fight.ending && (
                    <tr className="bg-secondary text-secondary">
                        <td className="px-4 py-3 font-medium">{fight.ending.round}</td>
                        <td className="px-4 py-3" colSpan={3}>
                            {getEndMethodLabel(fight.ending.method, t)} · {fight.ending.method === "no-contest" ? t.noWinner : fight.ending.winner === "red" ? fight.setup.redCorner : fight.setup.blueCorner}
                        </td>
                    </tr>
                )}
            </tbody>
        </table>
    </div>
);

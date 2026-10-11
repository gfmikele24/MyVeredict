import type { CSSProperties, Ref } from "react";
import { getRoundPoints, getVerdict } from "@/lib/scoring";
import { getEndMethodLabel, type ActiveFight, type Translation } from "./types";

interface PrintSummaryProps {
    cardRef: Ref<HTMLElement>;
    fight: ActiveFight;
    t: Translation;
}

export const PrintSummary = ({ cardRef, fight, t }: PrintSummaryProps) => {
    const verdict = getVerdict(fight);
    const resultName = fight.ending?.method === "no-contest" ? t.noContest : verdict.winner === "red" ? fight.setup.redCorner : verdict.winner === "blue" ? fight.setup.blueCorner : t.draw;
    const compact = fight.rounds.length > 7;
    const cellStyle: CSSProperties = {
        borderBottom: "1px solid rgba(255, 255, 255, 0.12)",
        padding: compact ? "6px 12px" : "16px 12px",
    };

    return (
        <section
            ref={cardRef}
            id="social-scorecard"
            style={{
                background: "#090b10",
                boxSizing: "border-box",
                color: "#ffffff",
                fontFamily: "Arial, Helvetica, sans-serif",
                height: 1080,
                left: 0,
                overflow: "hidden",
                padding: compact ? 40 : 64,
                pointerEvents: "none",
                position: "fixed",
                top: 0,
                width: 1080,
                zIndex: -1,
            }}
        >
            <div
                style={{
                    background: "linear-gradient(180deg, rgba(255, 255, 255, 0.08), rgba(255, 255, 255, 0))",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                    borderRadius: 40,
                    boxSizing: "border-box",
                    display: "flex",
                    flexDirection: "column",
                    height: "100%",
                    padding: compact ? 32 : 48,
                }}
            >
                <header style={{ alignItems: "center", borderBottom: "1px solid rgba(255, 255, 255, 0.15)", display: "flex", gap: compact ? 24 : 32, justifyContent: "space-between", paddingBottom: compact ? 24 : 36 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <span style={{ color: "#f87171", fontSize: compact ? 15 : 18, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>{t.redCorner}</span>
                        <strong style={{ display: "block", fontSize: compact ? 28 : 36, marginTop: compact ? 8 : 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fight.setup.redCorner}</strong>
                    </div>
                    <img
                        alt="MyVeredict"
                        src="/logo-mv.png"
                        style={{
                            flexShrink: 0,
                            height: compact ? 52 : 76,
                            objectFit: "contain",
                            width: compact ? 78 : 114,
                        }}
                    />
                    <div style={{ flex: 1, minWidth: 0, textAlign: "right" }}>
                        <span style={{ color: "#60a5fa", fontSize: compact ? 15 : 18, fontWeight: 700, letterSpacing: "0.22em", textTransform: "uppercase" }}>{t.blueCorner}</span>
                        <strong style={{ display: "block", fontSize: compact ? 28 : 36, marginTop: compact ? 8 : 12, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{fight.setup.blueCorner}</strong>
                    </div>
                </header>

                <div style={{ padding: compact ? "24px 0" : "36px 0", textAlign: "center" }}>
                    <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: compact ? 16 : 20, fontWeight: 700, letterSpacing: "0.18em", margin: 0, textTransform: "uppercase" }}>{verdict.winner ? t.winner : t.finalVerdict}</p>
                    <h2 style={{ fontSize: compact ? 42 : 58, letterSpacing: "-0.04em", margin: `${compact ? 8 : 12}px 0 0` }}>{resultName}</h2>
                    {fight.ending && <p style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: compact ? 16 : 20, fontWeight: 700, margin: `${compact ? 8 : 12}px 0 0`, textTransform: "uppercase" }}>{getEndMethodLabel(fight.ending.method, t)} · {t.round} {fight.ending.round}</p>}
                    <p style={{ color: "rgba(255, 255, 255, 0.8)", fontSize: compact ? 24 : 30, fontWeight: 700, margin: `${compact ? 10 : 16}px 0 0` }}>
                        <span style={{ color: "#f87171" }}>{verdict.totals.red}</span> — <span style={{ color: "#60a5fa" }}>{verdict.totals.blue}</span>
                    </p>
                </div>

                <table style={{ border: "1px solid rgba(255, 255, 255, 0.15)", borderCollapse: "separate", borderRadius: 16, borderSpacing: 0, fontSize: compact ? 14 : 20, overflow: "hidden", textAlign: "center", width: "100%" }}>
                    <thead style={{ background: "rgba(255, 255, 255, 0.1)", color: "rgba(255, 255, 255, 0.65)", fontSize: compact ? 11 : 14, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>
                        <tr>
                            <th style={cellStyle}>{t.redCorner}</th>
                            <th style={cellStyle}>{t.deduction}</th>
                            <th style={cellStyle}>{t.round}</th>
                            <th style={cellStyle}>{t.deduction}</th>
                            <th style={cellStyle}>{t.blueCorner}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {fight.rounds.map((round, index) => {
                            const finalPoints = getRoundPoints(round);
                            const redDeduction = round.deduction?.corner === "red" ? round.deduction.points : 0;
                            const blueDeduction = round.deduction?.corner === "blue" ? round.deduction.points : 0;

                            return (
                                <tr key={index} style={{ fontWeight: 700 }}>
                                    <td style={{ ...cellStyle, color: "#fca5a5" }}>{finalPoints.red + redDeduction}</td>
                                    <td style={{ ...cellStyle, color: "rgba(255, 255, 255, 0.6)" }}>{redDeduction ? `-${redDeduction}` : "—"}</td>
                                    <td style={{ ...cellStyle, color: "rgba(255, 255, 255, 0.75)" }}>{index + 1}</td>
                                    <td style={{ ...cellStyle, color: "rgba(255, 255, 255, 0.6)" }}>{blueDeduction ? `-${blueDeduction}` : "—"}</td>
                                    <td style={{ ...cellStyle, color: "#93c5fd" }}>{finalPoints.blue + blueDeduction}</td>
                                </tr>
                            );
                        })}
                        {fight.ending && (
                            <tr style={{ background: "rgba(255, 255, 255, 0.06)", fontWeight: 700 }}>
                                <td colSpan={5} style={{ ...cellStyle, color: "rgba(255, 255, 255, 0.75)" }}>
                                    {getEndMethodLabel(fight.ending.method, t)} · {t.round} {fight.ending.round} · {fight.ending.method === "no-contest" ? t.noWinner : fight.ending.winner === "red" ? fight.setup.redCorner : fight.setup.blueCorner}
                                </td>
                            </tr>
                        )}
                    </tbody>
                    <tfoot style={{ background: "rgba(255, 255, 255, 0.1)", fontSize: compact ? 20 : 24, fontWeight: 700 }}>
                        <tr>
                            <th colSpan={2} style={{ color: "#fca5a5", padding: compact ? 12 : 20 }}>{verdict.totals.red}</th>
                            <th style={{ color: "rgba(255, 255, 255, 0.6)", fontSize: compact ? 12 : 16, letterSpacing: "0.08em", padding: compact ? 12 : 20, textTransform: "uppercase" }}>{t.total}</th>
                            <th colSpan={2} style={{ color: "#93c5fd", padding: compact ? 12 : 20 }}>{verdict.totals.blue}</th>
                        </tr>
                    </tfoot>
                </table>

                <footer style={{ borderTop: "1px solid rgba(255, 255, 255, 0.15)", color: "rgba(255, 255, 255, 0.6)", display: "flex", fontSize: compact ? 14 : 18, fontWeight: 700, justifyContent: "space-between", marginTop: "auto", paddingTop: compact ? 20 : 28 }}>
                    <span>{t.judge}: MyVeredict</span>
                    <span>MyVeredict</span>
                </footer>
            </div>
        </section>
    );
};

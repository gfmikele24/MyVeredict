export type Corner = "blue" | "red";
export type BaseScore = "10-9" | "10-8" | "10-7";
export type FightEndMethod = "ko" | "tko" | "submission" | "no-contest";

export type FightEnd =
    | { method: "ko" | "tko" | "submission"; winner: Corner }
    | { method: "no-contest"; winner: null };

export type FightEnding = FightEnd & { round: number };

export interface Deduction {
    corner: Corner;
    points: 1 | 2;
}

export interface RoundScore {
    baseScore: BaseScore;
    deduction?: Deduction;
    winner: Corner;
}

export interface FightSetup {
    blueCorner: string;
    redCorner: string;
    rounds: number;
}

export interface Fight {
    ending?: FightEnding;
    setup: FightSetup;
    rounds: RoundScore[];
}

export interface FightTotals {
    blue: number;
    red: number;
}

export const createFight = (setup: FightSetup): Fight => {
    const blueCorner = setup.blueCorner.trim();
    const redCorner = setup.redCorner.trim();

    if (!blueCorner || !redCorner) {
        throw new Error("FIGHTER_NAMES_REQUIRED");
    }

    if (!Number.isInteger(setup.rounds) || setup.rounds < 1 || setup.rounds > 12) {
        throw new Error("ROUND_COUNT_INVALID");
    }

    return { rounds: [], setup: { ...setup, blueCorner, redCorner } };
};

const getBasePoints = (score: BaseScore) => Number(score.at(-1));

export const getRoundPoints = (round: RoundScore): FightTotals => {
    const loserPoints = getBasePoints(round.baseScore);
    const points = round.winner === "blue" ? { blue: 10, red: loserPoints } : { blue: loserPoints, red: 10 };

    if (round.deduction) {
        points[round.deduction.corner] -= round.deduction.points;
    }

    return points;
};

export const confirmRound = (fight: Fight, round: RoundScore): Fight => {
    if (isFightComplete(fight)) {
        throw new Error("No quedan rondas por puntuar");
    }

    return { ...fight, rounds: [...fight.rounds, round] };
};

export const endFight = (fight: Fight, ending: FightEnd): Fight => {
    if (isFightComplete(fight)) {
        throw new Error("El combate ya ha terminado");
    }

    if (ending.method === "no-contest" && ending.winner !== null) {
        throw new Error("NO_CONTEST_HAS_NO_WINNER");
    }

    if (ending.method !== "no-contest" && ending.winner === null) {
        throw new Error("WINNER_REQUIRED");
    }

    return { ...fight, ending: { ...ending, round: fight.rounds.length + 1 } };
};

export const calculateTotals = (fight: Fight): FightTotals =>
    fight.rounds.reduce<FightTotals>(
        (totals, round) => {
            const points = getRoundPoints(round);
            return { blue: totals.blue + points.blue, red: totals.red + points.red };
        },
        { blue: 0, red: 0 },
    );

export const getVerdict = (fight: Fight) => {
    const totals = calculateTotals(fight);
    const winner: Corner | null = fight.ending ? fight.ending.winner : totals.blue === totals.red ? null : totals.blue > totals.red ? "blue" : "red";

    return { totals, winner };
};

export const isFightComplete = (fight: Fight) => Boolean(fight.ending) || fight.rounds.length === fight.setup.rounds;

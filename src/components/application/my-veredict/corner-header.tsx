import type { Corner } from "@/lib/scoring";

interface CornerHeaderProps {
    color: Corner;
    name: string;
    points: number;
}

export const CornerHeader = ({ color, name, points }: CornerHeaderProps) => (
    <div className={`p-4 text-white sm:p-5 ${color === "red" ? "bg-linear-to-r from-error-solid via-error-solid/70 to-error-solid/20" : "bg-linear-to-r from-utility-blue-600 via-utility-blue-600/70 to-utility-blue-600/20"}`}>
        <p className="truncate text-base font-semibold text-white">{name}</p>
        <p className="mt-1 text-3xl font-bold text-white">{points}</p>
    </div>
);

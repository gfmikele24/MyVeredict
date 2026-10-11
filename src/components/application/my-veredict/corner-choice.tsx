import type { Corner } from "@/lib/scoring";

interface CornerChoiceProps {
    active: boolean;
    color: Corner;
    name: string;
    onClick: () => void;
}

export const CornerChoice = ({ active, color, name, onClick }: CornerChoiceProps) => (
    <button
        type="button"
        onClick={onClick}
        className={`rounded-xl border-2 px-3 py-4 text-center font-semibold outline-hidden transition focus-visible:ring-2 focus-visible:ring-offset-2 ${color === "red" ? (active ? "border-error bg-error-solid text-white focus-visible:ring-error" : "border-error_subtle bg-error-primary text-error-primary hover:bg-error-secondary focus-visible:ring-error") : active ? "border-utility-blue-600 bg-utility-blue-600 text-white focus-visible:ring-utility-blue-500" : "border-utility-blue-400 bg-utility-blue-50 text-utility-blue-700 hover:bg-utility-blue-100 focus-visible:ring-utility-blue-500"}`}
    >
        {name}
    </button>
);

import { Button } from "@/components/base/buttons/button";
import type { Translation } from "./types";

interface FightEmptyStateProps {
    onStart: () => void;
    t: Translation;
}

export const FightEmptyState = ({ onStart, t }: FightEmptyStateProps) => (
    <section className="rounded-2xl bg-primary p-8 text-center shadow-xs ring-1 ring-secondary sm:p-12">
        <p className="text-display-xs font-semibold text-primary">MyVeredict</p>
        <p className="mx-auto mt-3 max-w-md text-md text-tertiary">{t.readyToScore}</p>
        <Button className="mt-8" size="lg" onPress={onStart}>
            {t.newFight}
        </Button>
    </section>
);

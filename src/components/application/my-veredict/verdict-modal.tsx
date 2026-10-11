import { Dialog, Modal, ModalOverlay } from "@/components/application/modals/modal";
import { Button } from "@/components/base/buttons/button";
import { getVerdict } from "@/lib/scoring";
import type { ActiveFight, Translation } from "./types";

interface VerdictModalProps {
    exportError: boolean;
    fight: ActiveFight;
    isOpen: boolean;
    isExporting: boolean;
    onDownloadImage: () => void;
    onOpenChange: (isOpen: boolean) => void;
    t: Translation;
}

export const VerdictModal = ({ exportError, fight, isExporting, isOpen, onDownloadImage, onOpenChange, t }: VerdictModalProps) => {
    const verdict = getVerdict(fight);
    const winnerName = verdict.winner === "red" ? fight.setup.redCorner : verdict.winner === "blue" ? fight.setup.blueCorner : t.draw;
    const gradient = verdict.winner === "red" ? "linear-gradient(135deg, #7f1d1d, #ef4444)" : verdict.winner === "blue" ? "linear-gradient(135deg, #1e3a8a, #3b82f6)" : "linear-gradient(135deg, #374151, #9ca3af)";

    return (
        <ModalOverlay isOpen={isOpen} onOpenChange={onOpenChange} isDismissable>
            <Modal className="max-w-lg overflow-hidden">
                <Dialog aria-label={t.finalVerdict}>
                    <div className="p-8 text-center text-white" style={{ background: gradient }}>
                        <p className="text-sm font-medium text-white/75">{t.finalVerdict}</p>
                        <h2 className="mt-2 text-3xl font-semibold">{winnerName}</h2>
                        <p className="mt-3 text-lg text-white/85">
                            {fight.setup.redCorner} {verdict.totals.red} — {verdict.totals.blue} {fight.setup.blueCorner}
                        </p>
                    </div>
                    <div className="flex justify-end gap-3 p-5">
                        <Button color="secondary" onPress={() => onOpenChange(false)}>
                            {t.cancel}
                        </Button>
                        <Button isLoading={isExporting} showTextWhileLoading onPress={onDownloadImage}>
                            {isExporting ? t.generatingImage : t.downloadImage}
                        </Button>
                    </div>
                    {exportError && <p className="px-5 pb-5 text-sm text-error-primary">{t.imageExportError}</p>}
                </Dialog>
            </Modal>
        </ModalOverlay>
    );
};

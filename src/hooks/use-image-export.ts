"use client";

import { useState } from "react";
import { downloadPng } from "@/lib/image-export";
import type { Translation } from "@/components/application/my-veredict/types";
import type { Fight } from "@/lib/scoring";

export const useImageExport = () => {
    const [error, setError] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const exportImage = async (fight: Fight, t: Translation, filename: string) => {
        setError(false);
        setIsExporting(true);

        try {
            await downloadPng(fight, t, filename);
        } catch {
            setError(true);
        } finally {
            setIsExporting(false);
        }
    };

    return { error, exportImage, isExporting };
};

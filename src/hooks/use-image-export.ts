"use client";

import { useState } from "react";
import { downloadPng } from "@/lib/image-export";

export const useImageExport = () => {
    const [error, setError] = useState(false);
    const [isExporting, setIsExporting] = useState(false);

    const exportImage = async (node: HTMLElement | null, filename: string) => {
        if (!node) {
            setError(true);
            return;
        }

        setError(false);
        setIsExporting(true);

        try {
            await downloadPng(node, filename);
        } catch {
            setError(true);
        } finally {
            setIsExporting(false);
        }
    };

    return { error, exportImage, isExporting };
};

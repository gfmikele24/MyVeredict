import { toPng } from "html-to-image";

const normalizeFilenamePart = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "fighter";

export const createImageFilename = (redCorner: string, blueCorner: string) => `myveredict-${normalizeFilenamePart(redCorner)}-vs-${normalizeFilenamePart(blueCorner)}.png`;

export const downloadPng = async (node: HTMLElement, filename: string) => {
    await document.fonts?.ready;
    await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));

    const { height, width } = node.getBoundingClientRect();
    if (Math.round(width) !== 1080 || Math.round(height) !== 1080) {
        throw new Error("La tarjeta no tiene las dimensiones esperadas");
    }

    const dataUrl = await toPng(node, {
        backgroundColor: "#090b10",
        cacheBust: true,
        height: 1080,
        pixelRatio: 1,
        skipAutoScale: true,
        style: {
            fontFamily: "Arial, Helvetica, sans-serif",
        },
        width: 1080,
    });
    const link = document.createElement("a");
    link.download = filename;
    link.href = dataUrl;
    document.body.append(link);
    link.click();
    link.remove();
};

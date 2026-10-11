import { toPng } from "html-to-image";

const normalizeFilenamePart = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "fighter";

export const createImageFilename = (redCorner: string, blueCorner: string) => `myveredict-${normalizeFilenamePart(redCorner)}-vs-${normalizeFilenamePart(blueCorner)}.png`;

export const shareImageFile = async (file: File) => {
    if (!navigator.share || !navigator.canShare?.({ files: [file] })) {
        return false;
    }

    try {
        await navigator.share({ files: [file], title: "MyVeredict" });
        return true;
    } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") {
            return true;
        }

        throw error;
    }
};

const isAppleMobile = () => /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

export const downloadPng = async (node: HTMLElement, filename: string) => {
    const canShareImage = Reflect.has(navigator, "share") && navigator.canShare?.({ files: [new File([], filename, { type: "image/png" })] });
    const previewWindow = isAppleMobile() && !canShareImage ? window.open("", "_blank") : null;

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

    const image = await fetch(dataUrl);
    const file = new File([await image.blob()], filename, { type: "image/png" });

    if (isAppleMobile() && await shareImageFile(file)) {
        previewWindow?.close();
        return;
    }

    if (isAppleMobile()) {
        if (previewWindow) {
            previewWindow.location.replace(dataUrl);
        } else {
            window.open(dataUrl, "_blank", "noopener,noreferrer");
        }

        return;
    }

    const objectUrl = URL.createObjectURL(file);
    const link = document.createElement("a");
    link.download = filename;
    link.href = objectUrl;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(objectUrl), 0);
};

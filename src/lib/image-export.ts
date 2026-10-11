import type { Translation } from "../components/application/my-veredict/types.ts";
import { getRoundPoints, getVerdict, type Fight, type FightEndMethod } from "./scoring.ts";

const normalizeFilenamePart = (value: string) =>
    value
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "") || "fighter";

export const createImageFilename = (redCorner: string, blueCorner: string) => `myveredict-${normalizeFilenamePart(redCorner)}-vs-${normalizeFilenamePart(blueCorner)}.png`;

export const getScorecardPanelLayout = (compact: boolean) => {
    const y = compact ? 40 : 64;
    const width = compact ? 920 : 900;

    return { height: 1080 - y * 2, width, x: (1080 - width) / 2, y };
};

const getEndMethodLabel = (method: FightEndMethod, t: Translation) =>
    ({ ko: t.ko, tko: t.tko, submission: t.submission, "no-contest": t.noContest })[method];

interface ScorecardRow {
    blue: number;
    blueDeduction: number;
    red: number;
    redDeduction: number;
    round: number;
}

export interface ScorecardExportData {
    compact: boolean;
    endingSummary?: string;
    endingTableRow?: string;
    resultLabel: string;
    resultName: string;
    rows: ScorecardRow[];
    totals: { blue: number; red: number };
}

export const getScorecardExportData = (fight: Fight, t: Translation): ScorecardExportData => {
    const verdict = getVerdict(fight);
    const resultName = fight.ending?.method === "no-contest" ? t.noContest : verdict.winner === "red" ? fight.setup.redCorner : verdict.winner === "blue" ? fight.setup.blueCorner : t.draw;
    const endingSummary = fight.ending ? `${getEndMethodLabel(fight.ending.method, t)} · ${t.round} ${fight.ending.round}` : undefined;
    const endingWinner = fight.ending?.method === "no-contest" ? t.noWinner : fight.ending?.winner === "red" ? fight.setup.redCorner : fight.setup.blueCorner;

    return {
        compact: fight.rounds.length > 7,
        endingSummary,
        endingTableRow: endingSummary ? `${endingSummary} · ${endingWinner}` : undefined,
        resultLabel: verdict.winner ? t.winner : t.finalVerdict,
        resultName,
        rows: fight.rounds.map((round, index) => {
            const points = getRoundPoints(round);
            const redDeduction = round.deduction?.corner === "red" ? round.deduction.points : 0;
            const blueDeduction = round.deduction?.corner === "blue" ? round.deduction.points : 0;

            return { blue: points.blue + blueDeduction, blueDeduction, red: points.red + redDeduction, redDeduction, round: index + 1 };
        }),
        totals: verdict.totals,
    };
};

const drawRoundedRect = (context: CanvasRenderingContext2D, x: number, y: number, width: number, height: number, radius: number) => {
    context.beginPath();
    context.roundRect(x, y, width, height, radius);
};

const drawText = (context: CanvasRenderingContext2D, text: string, x: number, y: number, maxWidth: number, align: CanvasTextAlign = "left") => {
    context.textAlign = align;
    context.fillText(text, x, y, maxWidth);
};

const loadLogo = () =>
    new Promise<HTMLImageElement>((resolve, reject) => {
        const logo = new Image();
        logo.onload = () => resolve(logo);
        logo.onerror = () => reject(new Error("No se pudo cargar el logo para exportar"));
        logo.src = "/logo-mv.png";
    });

const canvasToBlob = (canvas: HTMLCanvasElement) =>
    new Promise<Blob>((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob) {
                resolve(blob);
                return;
            }

            reject(new Error("No se pudo crear la imagen"));
        }, "image/png");
    });

const drawScorecard = async (fight: Fight, t: Translation) => {
    const data = getScorecardExportData(fight, t);
    const canvas = document.createElement("canvas");
    canvas.height = 1080;
    canvas.width = 1080;

    const context = canvas.getContext("2d");
    if (!context) {
        throw new Error("No se pudo crear el lienzo");
    }

    const logo = await loadLogo();
    const panel = getScorecardPanelLayout(data.compact);
    const panelPadding = data.compact ? 32 : 48;
    const panelX = panel.x;
    const panelY = panel.y;
    const headerY = panelY + panelPadding;
    const headerBottom = headerY + (data.compact ? 118 : 152);
    const summaryLabelY = data.compact ? 244 : 318;
    const resultNameY = data.compact ? 296 : 404;
    const endingSummaryY = data.compact ? 334 : 458;
    const scoreY = data.compact ? (data.endingSummary ? 364 : 332) : data.endingSummary ? 516 : 466;
    const tableY = data.compact ? (data.endingSummary ? 394 : 356) : data.endingSummary ? 568 : 516;
    const rowHeight = data.compact ? 30 : data.rows.length > 4 ? 40 : 62;
    const tableHeaderHeight = data.compact ? 28 : 52;
    const tableWidth = panel.width - panelPadding * 2;
    const tableX = panelX + panelPadding;
    const columnWidth = tableWidth / 5;
    const endingRowHeight = data.endingTableRow ? rowHeight : 0;
    const totalsRowY = tableY + tableHeaderHeight + data.rows.length * rowHeight + endingRowHeight;
    const tableHeight = tableHeaderHeight + data.rows.length * rowHeight + endingRowHeight + rowHeight;

    context.fillStyle = "#090b10";
    context.fillRect(0, 0, 1080, 1080);

    const gradient = context.createLinearGradient(0, panelY, 0, panelY + panel.height);
    gradient.addColorStop(0, "rgba(255, 255, 255, 0.08)");
    gradient.addColorStop(1, "rgba(255, 255, 255, 0)");
    drawRoundedRect(context, panelX, panelY, panel.width, panel.height, 40);
    context.fillStyle = gradient;
    context.fill();
    context.strokeStyle = "rgba(255, 255, 255, 0.15)";
    context.lineWidth = 1;
    context.stroke();

    context.strokeStyle = "rgba(255, 255, 255, 0.15)";
    context.beginPath();
    context.moveTo(tableX, headerBottom);
    context.lineTo(tableX + tableWidth, headerBottom);
    context.stroke();

    context.font = `700 ${data.compact ? 15 : 18}px Arial, Helvetica, sans-serif`;
    context.fillStyle = "#f87171";
    drawText(context, t.redCorner.toUpperCase(), tableX, headerY + 18, tableWidth / 2 - 80);
    context.fillStyle = "#60a5fa";
    drawText(context, t.blueCorner.toUpperCase(), tableX + tableWidth, headerY + 18, tableWidth / 2 - 80, "right");
    context.font = `700 ${data.compact ? 28 : 36}px Arial, Helvetica, sans-serif`;
    context.fillStyle = "#ffffff";
    drawText(context, fight.setup.redCorner, tableX, headerY + (data.compact ? 62 : 76), tableWidth / 2 - 100);
    drawText(context, fight.setup.blueCorner, tableX + tableWidth, headerY + (data.compact ? 62 : 76), tableWidth / 2 - 100, "right");

    const logoHeight = data.compact ? 58 : 84;
    const logoWidth = data.compact ? 68 : 96;
    context.drawImage(logo, 540 - logoWidth / 2, headerY + 6, logoWidth, logoHeight);

    context.textAlign = "center";
    context.font = `700 ${data.compact ? 16 : 20}px Arial, Helvetica, sans-serif`;
    context.fillStyle = "rgba(255, 255, 255, 0.6)";
    context.fillText(data.resultLabel.toUpperCase(), 540, summaryLabelY);
    context.font = `400 ${data.compact ? 42 : 58}px Arial, Helvetica, sans-serif`;
    context.fillStyle = "#ffffff";
    context.fillText(data.resultName, 540, resultNameY, 820);
    if (data.endingSummary) {
        context.font = `700 ${data.compact ? 18 : 22}px Arial, Helvetica, sans-serif`;
        context.fillStyle = "rgba(255, 255, 255, 0.6)";
        context.fillText(data.endingSummary.toUpperCase(), 540, endingSummaryY);
    }
    context.font = `700 ${data.compact ? 24 : 30}px Arial, Helvetica, sans-serif`;
    context.fillStyle = "#f87171";
    context.fillText(String(data.totals.red), 500, scoreY);
    context.fillStyle = "rgba(255, 255, 255, 0.8)";
    context.fillText("—", 540, scoreY);
    context.fillStyle = "#60a5fa";
    context.fillText(String(data.totals.blue), 580, scoreY);

    drawRoundedRect(context, tableX, tableY, tableWidth, tableHeight, 16);
    context.fillStyle = "rgba(255, 255, 255, 0.04)";
    context.fill();
    context.save();
    drawRoundedRect(context, tableX, tableY, tableWidth, tableHeight, 16);
    context.clip();
    context.fillStyle = "rgba(255, 255, 255, 0.1)";
    context.fillRect(tableX, tableY, tableWidth, tableHeaderHeight);
    context.font = `700 ${data.compact ? 12 : 15}px Arial, Helvetica, sans-serif`;
    context.fillStyle = "rgba(255, 255, 255, 0.65)";
    [t.redCorner, t.deduction, t.round, t.deduction, t.blueCorner].forEach((label, index) => context.fillText(label.toUpperCase(), tableX + columnWidth * (index + 0.5), tableY + tableHeaderHeight * 0.66, columnWidth - 8));

    context.font = `700 ${data.compact ? 14 : 20}px Arial, Helvetica, sans-serif`;
    data.rows.forEach((row, index) => {
        const y = tableY + tableHeaderHeight + rowHeight * (index + 0.65);
        context.fillStyle = "#fca5a5";
        context.fillText(String(row.red), tableX + columnWidth * 0.5, y);
        context.fillStyle = "rgba(255, 255, 255, 0.6)";
        context.fillText(row.redDeduction ? `-${row.redDeduction}` : "—", tableX + columnWidth * 1.5, y);
        context.fillStyle = "rgba(255, 255, 255, 0.75)";
        context.fillText(String(row.round), tableX + columnWidth * 2.5, y);
        context.fillStyle = "rgba(255, 255, 255, 0.6)";
        context.fillText(row.blueDeduction ? `-${row.blueDeduction}` : "—", tableX + columnWidth * 3.5, y);
        context.fillStyle = "#93c5fd";
        context.fillText(String(row.blue), tableX + columnWidth * 4.5, y);
    });

    if (data.endingTableRow) {
        const endingRowY = tableY + tableHeaderHeight + data.rows.length * rowHeight;
        context.fillStyle = "rgba(255, 255, 255, 0.06)";
        context.fillRect(tableX, endingRowY, tableWidth, rowHeight);
        context.font = `700 ${data.compact ? 15 : 18}px Arial, Helvetica, sans-serif`;
        context.fillStyle = "rgba(255, 255, 255, 0.75)";
        context.fillText(data.endingTableRow, 540, endingRowY + rowHeight * 0.65, tableWidth - 24);
    }

    const totalsY = totalsRowY + rowHeight * 0.65;
    context.fillStyle = "rgba(255, 255, 255, 0.1)";
    context.fillRect(tableX, totalsRowY, tableWidth, rowHeight);
    context.restore();
    drawRoundedRect(context, tableX, tableY, tableWidth, tableHeight, 16);
    context.strokeStyle = "rgba(255, 255, 255, 0.15)";
    context.stroke();
    context.font = `700 ${data.compact ? 20 : 24}px Arial, Helvetica, sans-serif`;
    context.fillStyle = "#fca5a5";
    context.fillText(String(data.totals.red), tableX + columnWidth, totalsY);
    context.font = `700 ${data.compact ? 12 : 16}px Arial, Helvetica, sans-serif`;
    context.fillStyle = "rgba(255, 255, 255, 0.6)";
    context.fillText(t.total.toUpperCase(), tableX + columnWidth * 2.5, totalsY);
    context.font = `700 ${data.compact ? 20 : 24}px Arial, Helvetica, sans-serif`;
    context.fillStyle = "#93c5fd";
    context.fillText(String(data.totals.blue), tableX + columnWidth * 4, totalsY);

    context.strokeStyle = "rgba(255, 255, 255, 0.15)";
    context.beginPath();
    context.moveTo(tableX, 910);
    context.lineTo(tableX + tableWidth, 910);
    context.stroke();
    context.font = `700 ${data.compact ? 14 : 18}px Arial, Helvetica, sans-serif`;
    context.fillStyle = "rgba(255, 255, 255, 0.6)";
    drawText(context, `${t.judge}: MyVeredict`, tableX, 960, tableWidth / 2);
    drawText(context, "MyVeredict", tableX + tableWidth, 960, tableWidth / 2, "right");

    return canvas;
};

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

export const downloadPng = async (fight: Fight, t: Translation, filename: string) => {
    const canShareImage = Reflect.has(navigator, "share") && navigator.canShare?.({ files: [new File([], filename, { type: "image/png" })] });
    const previewWindow = isAppleMobile() && !canShareImage ? window.open("", "_blank") : null;
    const file = new File([await canvasToBlob(await drawScorecard(fight, t))], filename, { type: "image/png" });

    if (isAppleMobile() && await shareImageFile(file)) {
        previewWindow?.close();
        return;
    }

    if (isAppleMobile()) {
        const previewUrl = URL.createObjectURL(file);

        if (previewWindow) {
            previewWindow.location.replace(previewUrl);
        } else {
            window.open(previewUrl, "_blank", "noopener,noreferrer");
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

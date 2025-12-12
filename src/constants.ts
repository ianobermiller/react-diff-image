import { ImageDiffMode } from "./types";

export const MODES: Array<{ label: string; value: ImageDiffMode }> = [
    { label: "Split", value: "split" },
    { label: "Blend", value: "blend" },
    { label: "Pixel-diff", value: "pixel-diff" },
    { label: "Side-by-side", value: "side-by-side" },
    { label: "3-up", value: "3-up" },
];

export const OLD_COLOR = "rgb(191, 38, 0)";
export const NEW_COLOR = "rgb(0, 102, 68)";
export const OVERLAY_COLOR = "rgba(255, 0, 255, 0.5)";

export const OLD_BG = "rgb(255, 235, 230)";
export const NEW_BG = "rgb(227, 252, 239)";

export const BORDER_WIDTH = 2;
export const PADDING = 20;

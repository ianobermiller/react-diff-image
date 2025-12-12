export type ImageDiffMode = "3-up" | "blend" | "new-only" | "old-only" | "pixel-diff" | "side-by-side" | "split";

export interface ImageSize {
    height: number;
    width: number;
}

export interface ModeProps {
    hasPadding: boolean;
    overlayUrl: string | undefined;
    scale: number;
    size: ImageSize;
    url: string;
}

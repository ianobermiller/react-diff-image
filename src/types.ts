export interface ImageSize {
    height: number;
    width: number;
}

export type ImageDiffMode = "blend" | "pixel-diff" | "side-by-side" | "split";

export interface ModeProps {
    overlayUrl: string | undefined;
    scale: number;
    size: ImageSize;
    url: string;
    hasPadding: boolean;
}

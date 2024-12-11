export type ImageDiffMode = "blend" | "pixel-diff" | "side-by-side" | "split";

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

import { DiffImage } from "./DiffImage";
import { OverlayImage } from "./OverlayImage";
import { ModeProps } from "./types";

export function PixelDiff({ hasPadding, overlayUrl, scale, size, url }: ModeProps) {
    return (
        <div style={{ position: "relative" }}>
            <DiffImage hasPadding={hasPadding} scale={scale} size={size} type="diff" url={url} />

            <OverlayImage hasPadding={hasPadding} overlayUrl={overlayUrl} scale={scale} size={size} />
        </div>
    );
}

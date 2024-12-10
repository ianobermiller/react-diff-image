import { DiffImage } from "./DiffImage";
import { OverlayImage } from "./OverlayImage";
import { ModeProps } from "./types";

export function PixelDiff({ overlayUrl, scale, size, url }: ModeProps) {
    return (
        <div style={{ position: "relative" }}>
            <DiffImage scale={scale} size={size} type="diff" url={url} />

            <OverlayImage overlayUrl={overlayUrl} scale={scale} size={size} />
        </div>
    );
}

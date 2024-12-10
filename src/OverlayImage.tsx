import { BORDER_WIDTH } from "./constants";
import type { ImageSize } from "./types";

export function OverlayImage({
    overlayUrl,
    scale,
    size,
}: {
    overlayUrl: string | undefined;
    scale: number;
    size: ImageSize;
}) {
    if (!overlayUrl) return null;

    return (
        <div
            style={{
                backgroundImage: `url(${overlayUrl})`,
                backgroundSize: `${size.width}px ${size.height}px`,
                height: size.height,
                left: BORDER_WIDTH,
                position: "absolute",
                top: BORDER_WIDTH,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: size.width,
            }}
        />
    );
}

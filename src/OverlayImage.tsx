import { BORDER_WIDTH, PADDING } from "./constants";
import type { ModeProps } from "./types";

interface Props extends Pick<ModeProps, "scale" | "size" | "overlayUrl" | "hasPadding"> {}

export function OverlayImage({ hasPadding, overlayUrl, scale, size }: Props) {
    if (!overlayUrl) return null;

    const padding = hasPadding ? PADDING : 0;

    return (
        <div
            style={{
                backgroundImage: `url(${overlayUrl})`,
                backgroundSize: `${size.width}px ${size.height}px`,
                height: size.height,
                left: BORDER_WIDTH + padding,
                position: "absolute",
                top: BORDER_WIDTH + padding,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: size.width,
            }}
        />
    );
}

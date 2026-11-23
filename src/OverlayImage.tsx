import type { ReactElement } from "react";

import { BORDER_WIDTH, PADDING } from "./constants";
import type { ModeProps } from "./types";

type Props = Pick<ModeProps, "hasPadding" | "overlayUrl" | "scale" | "size">;

export function OverlayImage({ hasPadding, overlayUrl, scale, size }: Props): ReactElement | null {
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

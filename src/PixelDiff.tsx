import type { ReactElement } from "react";

import { DiffImage } from "./DiffImage";
import { OverlayImage } from "./OverlayImage";
import type { ModeProps } from "./types";

export function PixelDiff({ hasPadding, overlayUrl, scale, size, url }: ModeProps): ReactElement {
    return (
        <div style={{ position: "relative" }}>
            <DiffImage hasPadding={hasPadding} scale={scale} size={size} type="diff" url={url} />

            <OverlayImage hasPadding={hasPadding} overlayUrl={overlayUrl} scale={scale} size={size} />
        </div>
    );
}

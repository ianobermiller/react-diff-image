import { useState } from "react";
import { BORDER_WIDTH, OLD_BG, OLD_COLOR, NEW_BG, NEW_COLOR } from "./constants";
import { DiffImage } from "./DiffImage";
import { OverlayImage } from "./OverlayImage";
import { Tag } from "./Tag";
import { ModeProps } from "./types";

export function Blend({ overlayUrl, scale, size, url }: ModeProps) {
    const [percentage, setPercentage] = useState(0.5);
    const diffImageWidth = size.width * scale + BORDER_WIDTH * 2;

    return (
        <div style={{ width: diffImageWidth }}>
            <div
                style={{
                    alignItems: "center",
                    display: "flex",
                    gap: 4,
                    justifyContent: "center",
                    marginBottom: 12,
                }}
            >
                <Tag background={OLD_BG} color={OLD_COLOR}>
                    OLD
                </Tag>

                <input
                    onInput={(e) => setPercentage(Number(e.currentTarget.value) / 100)}
                    style={{ width: 300 }}
                    type="range"
                />

                <Tag background={NEW_BG} color={NEW_COLOR}>
                    NEW
                </Tag>
            </div>

            <div
                style={{
                    height: size.height + BORDER_WIDTH * 2,
                    position: "relative",
                    width: size.width + BORDER_WIDTH * 2,
                }}
            >
                <DiffImage scale={scale} size={size} style={{ position: "absolute" }} type="old" url={url} />

                <DiffImage
                    scale={scale}
                    size={size}
                    style={{ opacity: percentage, position: "absolute" }}
                    type="new"
                    url={url}
                />

                <OverlayImage overlayUrl={overlayUrl} scale={scale} size={size} />
            </div>
        </div>
    );
}

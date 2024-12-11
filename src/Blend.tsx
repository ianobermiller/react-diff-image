import { useState } from "react";

import { NEW_BG, NEW_COLOR, OLD_BG, OLD_COLOR } from "./constants";
import { DiffImage, getDiffImageSize } from "./DiffImage";
import { OverlayImage } from "./OverlayImage";
import { Tag } from "./Tag";
import { ModeProps } from "./types";

export function Blend({ hasPadding, overlayUrl, scale, size, url }: ModeProps) {
    const [percentage, setPercentage] = useState(0.5);
    const diffImageSize = getDiffImageSize({ hasPadding, scale, size });

    return (
        <div style={{ width: diffImageSize.width }}>
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
                    onInput={(e) => {
                        setPercentage(Number(e.currentTarget.value) / 100);
                    }}
                    style={{ width: 300 }}
                    type="range"
                />

                <Tag background={NEW_BG} color={NEW_COLOR}>
                    NEW
                </Tag>
            </div>

            <div style={{ ...diffImageSize, position: "relative" }}>
                <DiffImage
                    hasPadding={hasPadding}
                    scale={scale}
                    size={size}
                    style={{ position: "absolute" }}
                    type="old"
                    url={url}
                />

                <DiffImage
                    hasPadding={hasPadding}
                    scale={scale}
                    size={size}
                    style={{ opacity: percentage, position: "absolute" }}
                    type="new"
                    url={url}
                />

                <OverlayImage hasPadding={hasPadding} overlayUrl={overlayUrl} scale={scale} size={size} />
            </div>
        </div>
    );
}

import React, { useCallback, useState } from "react";

import { clamp } from "./clamp";
import { NEW_BG, NEW_COLOR, OLD_BG, OLD_COLOR } from "./constants";
import { DiffImage, getDiffImageSize } from "./DiffImage";
import { OverlayImage } from "./OverlayImage";
import { Tag } from "./Tag";
import { ModeProps } from "./types";

export function Split({ hasPadding, overlayUrl, scale, showDivider, size, url }: ModeProps & { showDivider: boolean }) {
    const [percentage, setPercentage] = useState(0.5);
    const diffImageSize = getDiffImageSize({ hasPadding, scale, size });

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>): void => {
            const delta = e.clientX - e.currentTarget.getBoundingClientRect().x;
            setPercentage(delta / diffImageSize.width);
        },
        [diffImageSize.width],
    );

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: diffImageSize.width,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Tag background={OLD_BG} color={OLD_COLOR}>
                    OLD
                </Tag>
                <Tag background={NEW_BG} color={NEW_COLOR}>
                    NEW
                </Tag>
            </div>

            <div onMouseMove={handleMouseMove} style={{ ...diffImageSize, position: "relative" }}>
                <DiffImage
                    hasPadding={hasPadding}
                    scale={scale}
                    size={size}
                    style={{
                        clipPath: `inset(0 ${(1 - percentage) * 100}% 0 0)`,
                        left: 0,
                        position: "absolute",
                    }}
                    type="old"
                    url={url}
                />

                <DiffImage
                    hasPadding={hasPadding}
                    scale={scale}
                    size={size}
                    style={{
                        clipPath: `inset(0 0 0 ${percentage * 100}%)`,
                        position: "absolute",
                        right: 0,
                    }}
                    type="new"
                    url={url}
                />

                <OverlayImage hasPadding={hasPadding} overlayUrl={overlayUrl} scale={scale} size={size} />

                {showDivider && (
                    <div
                        style={{
                            background: "orange",
                            borderLeft: "1px solid white",
                            borderRight: "1px solid white",
                            bottom: 0,
                            left: `calc(${clamp(percentage * 100, 0, 100)}% - 2px)`,
                            position: "absolute",
                            top: 0,
                            width: 2,
                        }}
                    />
                )}
            </div>
        </div>
    );
}

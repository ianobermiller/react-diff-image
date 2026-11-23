import { useRef } from "react";

import { NEW_BG, NEW_COLOR, OLD_BG, OLD_COLOR } from "./constants";
import { DiffImage, getDiffImageSize } from "./DiffImage";
import { OverlayImage } from "./OverlayImage";
import { Tag } from "./Tag";
import { ModeProps } from "./types";

export function Blend({ hasPadding, newLabel, oldLabel, overlayUrl, scale, size, url }: ModeProps) {
    const percentageRef = useRef(0.5);
    const newLayerRef = useRef<HTMLDivElement>(null);

    const diffImageSize = getDiffImageSize({ hasPadding, scale, size });
    const imageProps = { hasPadding, scale, size, url };

    const p = percentageRef.current;

    return (
        <div style={{ width: diffImageSize.width }}>
            <div
                style={{
                    display: "flex",
                    gap: 4,
                    justifyContent: "center",
                    marginBottom: 12,
                }}
            >
                <div style={{ display: "flex", flex: 1, justifyContent: "end" }}>
                    <Tag background={OLD_BG} color={OLD_COLOR}>
                        {oldLabel}
                    </Tag>
                </div>

                <input
                    defaultValue={p * 100}
                    onInput={(e) => {
                        const opacity = Number(e.currentTarget.value) / 100;
                        percentageRef.current = opacity;
                        if (newLayerRef.current) newLayerRef.current.style.opacity = String(opacity);
                    }}
                    style={{ width: 300 }}
                    type="range"
                />

                <div style={{ display: "flex", flex: 1 }}>
                    <Tag background={NEW_BG} color={NEW_COLOR}>
                        {newLabel}
                    </Tag>
                </div>
            </div>

            <div style={{ ...diffImageSize, position: "relative" }}>
                <div style={{ position: "absolute" }}>
                    <DiffImage {...imageProps} type="old" />
                </div>
                <div ref={newLayerRef} style={{ opacity: p, position: "absolute" }}>
                    <DiffImage {...imageProps} type="new" />
                </div>

                <OverlayImage hasPadding={hasPadding} overlayUrl={overlayUrl} scale={scale} size={size} />
            </div>
        </div>
    );
}

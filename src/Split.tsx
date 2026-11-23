import { type MouseEvent, useRef } from "react";

import { clamp } from "./clamp";
import { NEW_BG, NEW_COLOR, OLD_BG, OLD_COLOR } from "./constants";
import { DiffImage, getDiffImageSize } from "./DiffImage";
import { OverlayImage } from "./OverlayImage";
import { Tag } from "./Tag";
import { ModeProps } from "./types";

export function Split({
    hasPadding,
    newLabel,
    oldLabel,
    overlayUrl,
    scale,
    showDivider,
    size,
    url,
}: ModeProps & { showDivider: boolean }) {
    const percentageRef = useRef(0.5);
    const oldLayerRef = useRef<HTMLDivElement>(null);
    const newLayerRef = useRef<HTMLDivElement>(null);
    const dividerRef = useRef<HTMLDivElement>(null);

    const diffImageSize = getDiffImageSize({ hasPadding, scale, size });
    const imageProps = { hasPadding, scale, size, url };

    function handleMouseMove(e: MouseEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        const p = clamp((e.clientX - rect.left) / rect.width, 0, 1);
        percentageRef.current = p;

        if (oldLayerRef.current) {
            oldLayerRef.current.style.clipPath = `inset(0 ${(1 - p) * 100}% 0 0)`;
        }
        if (newLayerRef.current) {
            newLayerRef.current.style.clipPath = `inset(0 0 0 ${p * 100}%)`;
        }
        if (dividerRef.current) {
            dividerRef.current.style.left = `calc(${p * 100}% - 2px)`;
        }
    }

    const p = percentageRef.current;

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
                    {oldLabel}
                </Tag>
                <Tag background={NEW_BG} color={NEW_COLOR}>
                    {newLabel}
                </Tag>
            </div>

            <div onMouseMove={handleMouseMove} style={{ ...diffImageSize, position: "relative" }}>
                <DiffImage
                    {...imageProps}
                    outerRef={oldLayerRef}
                    style={{
                        clipPath: `inset(0 ${(1 - p) * 100}% 0 0)`,
                        left: 0,
                        position: "absolute",
                    }}
                    type="old"
                />

                <DiffImage
                    {...imageProps}
                    outerRef={newLayerRef}
                    style={{
                        clipPath: `inset(0 0 0 ${p * 100}%)`,
                        position: "absolute",
                        right: 0,
                    }}
                    type="new"
                />

                <OverlayImage hasPadding={hasPadding} overlayUrl={overlayUrl} scale={scale} size={size} />

                {showDivider && (
                    <div
                        ref={dividerRef}
                        style={{
                            background: "orange",
                            borderLeft: "1px solid white",
                            borderRight: "1px solid white",
                            bottom: 0,
                            left: `calc(${p * 100}% - 2px)`,
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

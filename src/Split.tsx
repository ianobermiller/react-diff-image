import { type ReactElement, type KeyboardEvent, type PointerEvent, useRef } from "react";

import { clamp } from "./clamp";
import { NEW_BG, NEW_COLOR, OLD_BG, OLD_COLOR } from "./constants";
import { DiffImage, getDiffImageSize } from "./DiffImage";
import { OverlayImage } from "./OverlayImage";
import { Tag } from "./Tag";
import type { ModeProps } from "./types";

export function Split({
    hasPadding,
    newLabel,
    oldLabel,
    overlayUrl,
    scale,
    showDivider,
    size,
    url,
}: ModeProps & { showDivider: boolean }): ReactElement {
    const percentageRef = useRef(0.5);
    const sliderRef = useRef<HTMLDivElement>(null);
    const oldLayerRef = useRef<HTMLDivElement>(null);
    const newLayerRef = useRef<HTMLDivElement>(null);
    const dividerRef = useRef<HTMLDivElement>(null);

    const diffImageSize = getDiffImageSize({ hasPadding, scale, size });
    const imageProps = { hasPadding, scale, size, url };

    function updatePercentage(value: number) {
        const p = clamp(value, 0, 1);
        percentageRef.current = p;
        sliderRef.current?.setAttribute("aria-valuenow", String(Math.round(p * 100)));
        sliderRef.current?.setAttribute("aria-valuetext", `${Math.round(p * 100)}% ${oldLabel}`);

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

    function handlePointer(e: PointerEvent<HTMLDivElement>) {
        const rect = e.currentTarget.getBoundingClientRect();
        if (rect.width > 0) updatePercentage((e.clientX - rect.left) / rect.width);
    }

    function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
        const step = e.shiftKey ? 0.1 : 0.01;
        let value = percentageRef.current;
        switch (e.key) {
            case "ArrowLeft":
            case "ArrowDown": {
                value -= step;
                break;
            }
            case "ArrowRight":
            case "ArrowUp": {
                value += step;
                break;
            }
            case "PageDown": {
                value -= 0.1;
                break;
            }
            case "PageUp": {
                value += 0.1;
                break;
            }
            case "Home": {
                value = 0;
                break;
            }
            case "End": {
                value = 1;
                break;
            }
            default: {
                return;
            }
        }
        e.preventDefault();
        updatePercentage(value);
    }

    // Input updates the DOM directly; incidental renders snapshot the current position.
    // oxlint-disable-next-line react/refs
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

            <div
                ref={sliderRef}
                // A native range cannot contain the image panels that form this slider.
                // oxlint-disable-next-line jsx-a11y/prefer-tag-over-role
                role="slider"
                aria-label={`Compare ${oldLabel} and ${newLabel}`}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-valuenow={Math.round(p * 100)}
                aria-valuetext={`${Math.round(p * 100)}% ${oldLabel}`}
                tabIndex={0}
                onKeyDown={handleKeyDown}
                onPointerDown={(e) => {
                    if (e.pointerType === "mouse") return;
                    e.currentTarget.setPointerCapture(e.pointerId);
                    handlePointer(e);
                }}
                onPointerMove={handlePointer}
                style={{
                    ...diffImageSize,
                    cursor: "col-resize",
                    outlineOffset: 2,
                    position: "relative",
                    touchAction: "pan-y pinch-zoom",
                }}
            >
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

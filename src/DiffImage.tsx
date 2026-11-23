import { memo } from "react";
import type { CSSProperties, NamedExoticComponent, ReactElement, Ref } from "react";

import { BORDER_WIDTH, NEW_COLOR, OLD_COLOR, PADDING } from "./constants";
import type { ImageSize, ModeProps } from "./types";

interface Props extends Pick<ModeProps, "hasPadding" | "scale" | "size" | "url"> {
    outerRef?: Ref<HTMLDivElement>;
    style?: CSSProperties;
    type: "diff" | "new" | "old";
}

const CHECKERBOARD_STYLES = getCheckerboardStyles("#ccc", "#fff", 10);

export const DiffImage: NamedExoticComponent<Props> = memo(function DiffImage({
    hasPadding,
    outerRef,
    scale,
    size,
    style,
    type,
    url,
}: Props): ReactElement {
    const { index, borderColor } = {
        old: { index: 0, borderColor: OLD_COLOR },
        new: { index: 2, borderColor: NEW_COLOR },
        diff: { index: 1, borderColor: "#DFE1E6" },
    }[type];
    const outerSize = getDiffImageSize({ hasPadding, scale, size });

    return (
        <div
            ref={outerRef}
            style={{
                ...CHECKERBOARD_STYLES,
                border: `${BORDER_WIDTH}px solid ${borderColor}`,
                boxSizing: "border-box",
                height: outerSize.height,
                padding: hasPadding ? PADDING : 0,
                userSelect: "none",
                width: outerSize.width,
                ...style,
            }}
        >
            <div
                style={{
                    height: size.height,
                    overflow: "hidden",
                    position: "relative",
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    width: size.width,
                }}
            >
                <img
                    alt=""
                    crossOrigin="anonymous"
                    draggable={false}
                    src={url}
                    style={{
                        height: size.height,
                        left: -size.width * index,
                        maxWidth: "none",
                        position: "absolute",
                        top: 0,
                        width: size.width * 3,
                    }}
                />
            </div>
        </div>
    );
});

export function getDiffImageSize({
    hasPadding,
    scale,
    size,
}: Pick<ModeProps, "hasPadding" | "scale" | "size">): ImageSize {
    const extra = (hasPadding ? PADDING * 2 : 0) + BORDER_WIDTH * 2;

    return {
        height: size.height * scale + extra,
        width: size.width * scale + extra,
    };
}

function getCheckerboardStyles(color: string, alternate: string, size: number): CSSProperties | undefined {
    return {
        backgroundImage: `
            linear-gradient(45deg, ${color} 25%, transparent 25%),
            linear-gradient(-45deg, ${color} 25%, transparent 25%),
            linear-gradient(45deg, transparent 75%, ${color} 75%),
            linear-gradient(-45deg, ${alternate} 75%, ${color} 75%)
        `
            .replace(/\n/gu, "")
            .trim(),
        backgroundPosition: `0 0, 0 ${size}px, ${size}px -${size}px, -${size}px 0px`,
        backgroundSize: `${size * 2}px ${size * 2}px`,
    };
}

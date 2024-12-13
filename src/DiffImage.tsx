import { type CSSProperties } from "react";

import { BORDER_WIDTH, NEW_COLOR, OLD_COLOR, PADDING } from "./constants";
import { ModeProps } from "./types";

interface Props extends Pick<ModeProps, "hasPadding" | "scale" | "size" | "url"> {
    style?: CSSProperties;
    type: "diff" | "new" | "old";
}

const CHECKERBOARD_COLOR = "#ccc";
const CHECKERBOARD_ALTERNATE_COLOR = "#fff";
const CHECKERBOARD_SIZE = 10;

export function DiffImage({ hasPadding, scale, size, style, type, url }: Props) {
    const index = type === "old" ? 0 : type === "new" ? 2 : 1;
    const borderColor = type === "old" ? OLD_COLOR : type === "new" ? NEW_COLOR : "#DFE1E6";
    const outerSize = getDiffImageSize({ hasPadding, scale, size });

    return (
        <div
            style={{
                ...getCheckerboardStyles(CHECKERBOARD_COLOR, CHECKERBOARD_ALTERNATE_COLOR, CHECKERBOARD_SIZE),
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
                    backgroundImage: `url(${url})`,
                    backgroundPositionX: `-${size.width * index}px`,
                    backgroundRepeat: "no-repeat",
                    backgroundSize: `${size.width * 3}px ${size.height}px`,
                    height: size.height,
                    transform: `scale(${scale})`,
                    transformOrigin: "top left",
                    width: size.width,
                }}
            ></div>
        </div>
    );
}

export function getDiffImageSize({ hasPadding, scale, size }: Pick<ModeProps, "hasPadding" | "scale" | "size">) {
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
            .replace(/\n/g, "")
            .trim(),
        backgroundPosition: `0 0, 0 ${size}px, ${size}px -${size}px, -${size}px 0px`,
        backgroundSize: `${size * 2}px ${size * 2}px`,
    };
}

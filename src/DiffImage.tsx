import { type CSSProperties } from "react";
import { BORDER_WIDTH, NEW_COLOR, OLD_COLOR, PADDING } from "./constants";
import { ModeProps } from "./types";

interface Props extends Pick<ModeProps, "scale" | "size" | "url" | "hasPadding"> {
    style?: CSSProperties;
    type: "diff" | "new" | "old";
}

export function DiffImage({ scale, size, style, type, url, hasPadding }: Props) {
    const index = type === "old" ? 0 : type === "new" ? 2 : 1;
    const borderColor = type === "old" ? OLD_COLOR : type === "new" ? NEW_COLOR : "#DFE1E6";
    const outerSize = getDiffImageSize({ scale, size, hasPadding });

    return (
        <div
            style={{
                // Checkerboard background
                backgroundImage:
                    "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0px",
                backgroundSize: "20px 20px",
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

export function getDiffImageSize({ scale, size, hasPadding }: Pick<ModeProps, "scale" | "size" | "hasPadding">) {
    const extra = (hasPadding ? PADDING * 2 : 0) + BORDER_WIDTH * 2;

    return {
        height: size.height * scale + extra,
        width: size.width * scale + extra,
    };
}

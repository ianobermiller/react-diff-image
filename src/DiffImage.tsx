import { type CSSProperties } from "react";
import { BORDER_WIDTH, NEW_COLOR, OLD_COLOR } from "./constants";
import { ModeProps } from "./types";

interface Props extends Pick<ModeProps, "scale" | "size" | "url"> {
    style?: CSSProperties;
    type: "diff" | "new" | "old";
}

export function DiffImage({ scale, size, style, type, url }: Props) {
    const index = type === "old" ? 0 : type === "new" ? 2 : 1;
    const borderColor = type === "old" ? OLD_COLOR : type === "new" ? NEW_COLOR : "#DFE1E6";
    return (
        <div
            style={{
                border: `${BORDER_WIDTH}px solid ${borderColor}`,
                boxSizing: "border-box",
                height: size.height * scale + BORDER_WIDTH * 2,
                userSelect: "none",
                width: size.width * scale + BORDER_WIDTH * 2,
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

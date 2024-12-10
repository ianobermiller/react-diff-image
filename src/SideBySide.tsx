import { BORDER_WIDTH, NEW_BG, NEW_COLOR, OLD_BG, OLD_COLOR } from "./constants";
import { DiffImage } from "./DiffImage";
import { OverlayImage } from "./OverlayImage";
import { Tag } from "./Tag";
import { ModeProps } from "./types";

export const SIDE_BY_SIDE_GAP = 12;

export function SideBySide({ overlayUrl, scale, size, url }: ModeProps) {
    const diffImageWidth = size.width * scale + BORDER_WIDTH * 2;

    return (
        <div style={{ width: diffImageWidth * 2 + SIDE_BY_SIDE_GAP }}>
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 12,
                }}
            >
                <Tag background={OLD_BG} color={OLD_COLOR}>
                    OLD
                </Tag>
                <Tag background={NEW_BG} color={NEW_COLOR}>
                    NEW
                </Tag>
            </div>

            <div style={{ display: "flex", gap: SIDE_BY_SIDE_GAP }}>
                <div style={{ position: "relative" }}>
                    <DiffImage scale={scale} size={size} type="old" url={url} />
                    <OverlayImage overlayUrl={overlayUrl} scale={scale} size={size} />
                </div>

                <div style={{ position: "relative" }}>
                    <DiffImage scale={scale} size={size} type="new" url={url} />
                    <OverlayImage overlayUrl={overlayUrl} scale={scale} size={size} />
                </div>
            </div>
        </div>
    );
}

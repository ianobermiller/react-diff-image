import { NEW_BG, NEW_COLOR, OLD_BG, OLD_COLOR } from "./constants";
import { DiffImage, getDiffImageSize } from "./DiffImage";
import { OverlayImage } from "./OverlayImage";
import { Tag } from "./Tag";
import { ModeProps } from "./types";

export const THREE_UP_GAP = 12;

export function ThreeUp({ hasPadding, overlayUrl, scale, size, url }: ModeProps) {
    const diffImageSize = getDiffImageSize({ hasPadding, scale, size });

    return (
        <div style={{ width: diffImageSize.width * 3 + THREE_UP_GAP * 2 }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12 }}>
                <Tag background={OLD_BG} color={OLD_COLOR}>
                    OLD
                </Tag>
                <Tag background="#F4F5F7" color="#172B4D">
                    DIFF
                </Tag>
                <Tag background={NEW_BG} color={NEW_COLOR}>
                    NEW
                </Tag>
            </div>

            <div style={{ display: "flex", gap: THREE_UP_GAP }}>
                <div style={{ position: "relative" }}>
                    <DiffImage hasPadding={hasPadding} scale={scale} size={size} type="old" url={url} />
                    <OverlayImage hasPadding={hasPadding} overlayUrl={overlayUrl} scale={scale} size={size} />
                </div>

                <div style={{ position: "relative" }}>
                    <DiffImage hasPadding={hasPadding} scale={scale} size={size} type="diff" url={url} />
                    <OverlayImage hasPadding={hasPadding} overlayUrl={overlayUrl} scale={scale} size={size} />
                </div>

                <div style={{ position: "relative" }}>
                    <DiffImage hasPadding={hasPadding} scale={scale} size={size} type="new" url={url} />
                    <OverlayImage hasPadding={hasPadding} overlayUrl={overlayUrl} scale={scale} size={size} />
                </div>
            </div>
        </div>
    );
}

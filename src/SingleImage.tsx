import { NEW_BG, NEW_COLOR, OLD_BG, OLD_COLOR } from "./constants";
import { DiffImage, getDiffImageSize } from "./DiffImage";
import { Tag } from "./Tag";
import { ModeProps } from "./types";

export function SingleImage({
    hasPadding,
    newLabel,
    oldLabel,
    scale,
    size,
    type,
    url,
}: Pick<ModeProps, "hasPadding" | "newLabel" | "oldLabel" | "scale" | "size" | "url"> & {
    type: "new" | "old";
}) {
    const diffImageSize = getDiffImageSize({ hasPadding, scale, size });

    return (
        <div
            style={{
                alignItems: "center",
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: diffImageSize.width,
            }}
        >
            <Tag background={type === "new" ? NEW_BG : OLD_BG} color={type === "new" ? NEW_COLOR : OLD_COLOR}>
                {type === "new" ? newLabel : oldLabel}
            </Tag>

            <DiffImage hasPadding={hasPadding} scale={scale} size={size} type={type} url={url} />
        </div>
    );
}

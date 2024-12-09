import type { CSSProperties, ReactNode } from "react";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";

interface Props {
    /** Image with old-diff-new concatenated horizontally in that order. */
    url: string;
    mode: ImageDiffMode;
    /** Show the divider in `split` mode */
    showDivider: boolean;
    /** Show the image at its natural size instead of fitting to the viewport */
    showFullSize: boolean;
    /** Show an overlay to highlight small differences between the old and new images */
    showOverlay: boolean;
}
export { Props as ImageDiffProps };

export type ImageDiffMode = "blend" | "pixel-diff" | "side-by-side" | "split";

export const DEFAULT_PROPS: Omit<Props, "url"> = {
    mode: "split",
    showDivider: true,
    showFullSize: false,
    showOverlay: false,
};

export const MODES: Array<{ label: string; value: ImageDiffMode }> = [
    { label: "Split", value: "split" },
    { label: "Blend", value: "blend" },
    { label: "Pixel-diff", value: "pixel-diff" },
    { label: "Side-by-side", value: "side-by-side" },
];

export const OLD_COLOR = "rgb(191, 38, 0)";
export const NEW_COLOR = "rgb(0, 102, 68)";

const OLD_BG = "rgb(255, 235, 230)";
const NEW_BG = "rgb(227, 252, 239)";
const BORDER_WIDTH = 2;
const DEFAULT_SIZE = { height: 1080, width: 1920 };

export function ImageDiff({
    mode = DEFAULT_PROPS.mode,
    showDivider = DEFAULT_PROPS.showDivider,
    showFullSize = DEFAULT_PROPS.showFullSize,
    showOverlay = DEFAULT_PROPS.showOverlay,
    url,
}: Props) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [maxWidth, setMaxWidth] = useState<number | undefined>();

    useLayoutEffect(() => {
        if (!rootRef.current || showFullSize) {
            return;
        }

        const resizeObserver = new ResizeObserver(([entry]) => {
            if (entry) {
                setMaxWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(rootRef.current);

        return () => resizeObserver.disconnect();
    }, []);

    const img = useImage(url);

    const overlayUrl = useMemo(() => (showOverlay ? getOverlay(img) : undefined), [showOverlay, img]);

    if (!maxWidth && !showFullSize)
        return (
            <div
                ref={(div) => {
                    if (div?.clientWidth) {
                        setMaxWidth(Math.floor(div.clientWidth));
                    }
                }}
                style={{ alignSelf: "stretch", flexGrow: 1 }}
            />
        );

    const size = img ? { height: img.naturalHeight, width: img.naturalWidth / 3 } : DEFAULT_SIZE;

    const targetWidth = maxWidth
        ? mode === "side-by-side"
            ? Math.floor((maxWidth - BORDER_WIDTH * 4 - SIDE_BY_SIDE_GAP) / 2)
            : maxWidth - BORDER_WIDTH * 2
        : null;

    const scale = targetWidth ? Math.min(1, targetWidth / size.width) : 1;
    const appliedScale = showFullSize ? 1 : scale;

    let comparison: ReactNode;
    switch (mode) {
        case "blend":
            comparison = <Blend overlayUrl={overlayUrl} scale={appliedScale} size={size} url={url} />;
            break;
        case "side-by-side":
            comparison = <SideBySide overlayUrl={overlayUrl} scale={appliedScale} size={size} url={url} />;
            break;
        case "split":
            comparison = (
                <Split showDivider={showDivider} overlayUrl={overlayUrl} scale={appliedScale} size={size} url={url} />
            );
            break;
        case "pixel-diff":
        default:
            comparison = <PixelDiff overlayUrl={overlayUrl} scale={appliedScale} size={size} url={url} />;
            break;
    }

    return (
        <div ref={rootRef} style={{ alignSelf: "stretch", flexGrow: 1, maxWidth: "100%" }}>
            {comparison}
        </div>
    );
}

interface ModeProps {
    overlayUrl: string | undefined;
    scale: number;
    size: ImageSize;
    url: string;
}

function Blend({ overlayUrl, scale, size, url }: ModeProps) {
    const [percentage, setPercentage] = useState(0.5);
    const diffImageWidth = size.width * scale + BORDER_WIDTH * 2;

    return (
        <div style={{ width: diffImageWidth }}>
            <div
                style={{
                    alignItems: "center",
                    display: "flex",
                    gap: 4,
                    justifyContent: "center",
                    marginBottom: 12,
                }}
            >
                <Tag background={OLD_BG} color={OLD_COLOR}>
                    OLD
                </Tag>
                <input
                    onInput={(e) => setPercentage(Number(e.currentTarget.value) / 100)}
                    style={{ width: 300 }}
                    type="range"
                />
                <Tag background={NEW_BG} color={NEW_COLOR}>
                    NEW
                </Tag>
            </div>

            <div
                style={{
                    height: size.height + BORDER_WIDTH * 2,
                    position: "relative",
                    width: size.width + BORDER_WIDTH * 2,
                }}
            >
                <DiffImage scale={scale} size={size} style={{ position: "absolute" }} type="old" url={url} />

                <DiffImage
                    scale={scale}
                    size={size}
                    style={{ opacity: percentage, position: "absolute" }}
                    type="new"
                    url={url}
                />

                <OverlayImage overlayUrl={overlayUrl} scale={scale} size={size} />
            </div>
        </div>
    );
}

const SIDE_BY_SIDE_GAP = 12;
function SideBySide({ overlayUrl, scale, size, url }: ModeProps) {
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

function Split({ showDivider, overlayUrl, scale, size, url }: ModeProps & Pick<Props, "showDivider">) {
    const [percentage, setPercentage] = useState(0.5);
    const diffImageWidth = size.width * scale + BORDER_WIDTH * 2;
    const diffImageHeight = size.height * scale + BORDER_WIDTH * 2;

    const handleMouseMove = useCallback(
        (e: React.MouseEvent<HTMLDivElement>): void => {
            const delta = e.clientX - e.currentTarget.getBoundingClientRect().x;
            return setPercentage(delta / diffImageWidth);
        },
        [diffImageWidth],
    );

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
                width: diffImageWidth,
            }}
        >
            <div style={{ display: "flex", justifyContent: "space-between" }}>
                <Tag background={OLD_BG} color={OLD_COLOR}>
                    OLD
                </Tag>
                <Tag background={NEW_BG} color={NEW_COLOR}>
                    NEW
                </Tag>
            </div>
            <div
                onMouseMove={handleMouseMove}
                style={{
                    height: diffImageHeight,
                    position: "relative",
                    width: diffImageWidth,
                }}
            >
                <DiffImage
                    scale={scale}
                    size={size}
                    style={{
                        clipPath: `inset(0 ${(1 - percentage) * 100}% 0 0)`,
                        left: 0,
                        position: "absolute",
                    }}
                    type="old"
                    url={url}
                />

                <DiffImage
                    scale={scale}
                    size={size}
                    style={{
                        clipPath: `inset(0 0 0 ${percentage * 100}%)`,
                        position: "absolute",
                        right: 0,
                    }}
                    type="new"
                    url={url}
                />

                <OverlayImage overlayUrl={overlayUrl} scale={scale} size={size} />

                {showDivider && (
                    <div
                        style={{
                            background: "orange",
                            borderLeft: "1px solid white",
                            borderRight: "1px solid white",
                            bottom: 0,
                            left: `calc(${clamp(percentage * 100, 0, 100)}% - 2px)`,
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

function PixelDiff({ overlayUrl, scale, size, url }: ModeProps) {
    return (
        <div style={{ position: "relative" }}>
            <DiffImage scale={scale} size={size} type="diff" url={url} />

            <OverlayImage overlayUrl={overlayUrl} scale={scale} size={size} />
        </div>
    );
}

interface DiffImageProps extends Pick<ModeProps, "scale" | "size" | "url"> {
    style?: CSSProperties;
    type: "diff" | "new" | "old";
}

function DiffImage({ scale, size, style, type, url }: DiffImageProps) {
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

function OverlayImage({ overlayUrl, scale, size }: { overlayUrl: string | undefined; scale: number; size: ImageSize }) {
    if (!overlayUrl) return null;

    return (
        <div
            style={{
                backgroundImage: `url(${overlayUrl})`,
                backgroundSize: `${size.width}px ${size.height}px`,
                height: size.height,
                left: BORDER_WIDTH,
                position: "absolute",
                top: BORDER_WIDTH,
                transform: `scale(${scale})`,
                transformOrigin: "top left",
                width: size.width,
            }}
        />
    );
}
interface TagProps {
    background: string;
    children: React.ReactNode;
    color: string;
}

function Tag({ background, children, color }: TagProps) {
    return (
        <span
            style={{
                background,
                borderRadius: 3,
                color,
                fontWeight: "bold",
                padding: "2px 4px 3px 4px",
            }}
        >
            {children}
        </span>
    );
}

interface ImageSize {
    height: number;
    width: number;
}

function useImage(url: string): HTMLImageElement | undefined {
    const [image, setImage] = useState<HTMLImageElement>();

    useEffect(() => {
        const img = new Image();
        img.setAttribute("crossOrigin", "");
        img.onload = () => setImage(img);
        img.src = url;

        return () => {
            img.src = "";
        };
    }, [url]);

    return image;
}

function clamp(value: number, min: number, max: number) {
    return Math.min(Math.max(value, min), max);
}

export const OVERLAY_COLOR = "rgba(255, 0, 255, 0.5)";

/**
 * Given the three-part image, analyze the center image (the diff) and create a transparent overlay that highlights all
 * the changed pixels.
 */
function getOverlay(img: HTMLImageElement | undefined): string | undefined {
    if (!img) return;

    const overlayCanvas = document.createElement("canvas");
    const overlayCtx = overlayCanvas.getContext("2d");
    if (!overlayCtx) return;

    // load the image and get the size
    overlayCanvas.width = img.naturalWidth / 3;
    overlayCanvas.height = img.naturalHeight;

    const imageCanvas = document.createElement("canvas");
    const imageCtx = imageCanvas.getContext("2d");
    if (!imageCtx) return;

    imageCanvas.width = overlayCanvas.width;
    imageCanvas.height = overlayCanvas.height;

    // draw the middle third of the image into imageCanvas
    imageCtx.drawImage(
        img,
        overlayCanvas.width,
        0,
        overlayCanvas.width,
        overlayCanvas.height,
        0,
        0,
        overlayCanvas.width,
        overlayCanvas.height,
    );
    const { data } = imageCtx.getImageData(0, 0, imageCanvas.width, imageCanvas.height);

    for (let x = 0; x < overlayCanvas.width; x++) {
        for (let y = 0; y < overlayCanvas.height; y++) {
            const index = (y * overlayCanvas.width + x) * 4;
            const r = data[index] || 0;
            const g = data[index + 1] || 0;
            const b = data[index + 2] || 0;

            // In the diff image, the original is rendered in grayscale with red for differing pixels and yellow for
            // "anti-aliased" pixels, or pixels that are only different by a small amount.
            const isGrayscale = r === g && g === b;
            if (!isGrayscale) {
                // circle around the pixel
                overlayCtx.moveTo(x, y);
                overlayCtx.arc(x, y, 19, 0, Math.PI * 2);
            }
        }
    }

    overlayCtx.fillStyle = OVERLAY_COLOR;
    overlayCtx.fill();

    return overlayCanvas.toDataURL("image/webp", 1);
}

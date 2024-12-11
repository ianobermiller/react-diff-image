import type { ReactNode } from "react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import { BORDER_WIDTH, MODES, NEW_COLOR, OLD_COLOR, OVERLAY_COLOR, PADDING } from "./constants";
import { getOverlay } from "./getOverlay";
import { PixelDiff } from "./PixelDiff";
import { SIDE_BY_SIDE_GAP, SideBySide } from "./SideBySide";
import { Split } from "./Split";
import { ImageDiffMode } from "./types";
import { useImage } from "./useImage";
import { Blend } from "./Blend";

interface Props {
    /** Image with old-diff-new concatenated horizontally in that order. */
    url: string;
    mode?: ImageDiffMode;
    /** Show the divider in `split` mode */
    showDivider?: boolean;
    /** Show the image at its natural size instead of fitting to the viewport */
    showFullSize?: boolean;
    /** Show an overlay to highlight small differences between the old and new images */
    showOverlay?: boolean;
    /** Add padding inside the image to better see the edges. */
    hasPadding?: boolean;
}

export { Props as ImageDiffProps };

export const DEFAULT_PROPS = {
    mode: "split",
    showDivider: true,
    showFullSize: false,
    showOverlay: false,
    hasPadding: false,
} satisfies Partial<Props>;

export type { ImageDiffMode };

export { MODES, NEW_COLOR, OLD_COLOR, OVERLAY_COLOR };

export function ImageDiff({
    mode = DEFAULT_PROPS.mode,
    showDivider = DEFAULT_PROPS.showDivider,
    showFullSize = DEFAULT_PROPS.showFullSize,
    showOverlay = DEFAULT_PROPS.showOverlay,
    hasPadding = DEFAULT_PROPS.hasPadding,
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

    const overlayUrl = useMemo(() => (showOverlay ? getOverlay(img, OVERLAY_COLOR) : undefined), [showOverlay, img]);

    const size = img ? { height: img.naturalHeight, width: img.naturalWidth / 3 } : { height: 0, width: 0 };

    const targetWidth = maxWidth
        ? mode === "side-by-side"
            ? Math.floor((maxWidth - BORDER_WIDTH * 4 - (hasPadding ? PADDING * 4 : 0) - SIDE_BY_SIDE_GAP) / 2)
            : maxWidth - BORDER_WIDTH * 2 - (hasPadding ? PADDING * 2 : 0)
        : null;

    const scale = targetWidth ? Math.min(1, targetWidth / size.width) : 1;
    const appliedScale = showFullSize ? 1 : scale;

    let comparison: ReactNode;
    switch (mode) {
        case "blend":
            comparison = (
                <Blend overlayUrl={overlayUrl} scale={appliedScale} size={size} url={url} hasPadding={hasPadding} />
            );
            break;
        case "side-by-side":
            comparison = (
                <SideBySide
                    overlayUrl={overlayUrl}
                    scale={appliedScale}
                    size={size}
                    url={url}
                    hasPadding={hasPadding}
                />
            );
            break;
        case "split":
            comparison = (
                <Split
                    showDivider={showDivider}
                    overlayUrl={overlayUrl}
                    scale={appliedScale}
                    size={size}
                    url={url}
                    hasPadding={hasPadding}
                />
            );
            break;
        case "pixel-diff":
        default:
            comparison = (
                <PixelDiff overlayUrl={overlayUrl} scale={appliedScale} size={size} url={url} hasPadding={hasPadding} />
            );
            break;
    }

    return (
        <div
            ref={rootRef}
            style={{ alignSelf: "stretch", flexGrow: 1, maxWidth: "100%", overflow: showFullSize ? "auto" : "hidden" }}
        >
            {comparison}
        </div>
    );
}

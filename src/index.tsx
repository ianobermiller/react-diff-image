import type { CSSProperties, ReactNode } from "react";

import { useEffect, useLayoutEffect, useMemo, useReducer, useRef, useState } from "react";

import { Blend } from "./Blend";
import { BORDER_WIDTH, MODES, NEW_COLOR, OLD_COLOR, OVERLAY_COLOR, PADDING } from "./constants";
import { getCachedOverlay, getOverlay } from "./getOverlay";
import { PixelDiff } from "./PixelDiff";
import { SIDE_BY_SIDE_GAP, SideBySide } from "./SideBySide";
import { SingleImage } from "./SingleImage";
import { Split } from "./Split";
import { THREE_UP_GAP, ThreeUp } from "./ThreeUp";
import { ImageDiffMode } from "./types";
import { useImage } from "./useImage";

interface Props {
    /** Label for the diff image. Defaults to "DIFF". */
    diffLabel?: string;
    /** Add padding inside the image to better see the edges. */
    hasPadding?: boolean;
    mode?: ImageDiffMode;
    /** Label for the new image. Defaults to "NEW". */
    newLabel?: string;
    /** Label for the old image. Defaults to "OLD". */
    oldLabel?: string;
    /** Show the divider in `split` mode */
    showDivider?: boolean;
    /** Show the image at its natural size instead of fitting to the viewport */
    showFullSize?: boolean;
    /** Show an overlay to highlight small differences between the old and new images */
    showOverlay?: boolean;
    /** Style the container */
    style?: CSSProperties;
    /** Image with old-diff-new concatenated horizontally in that order. */
    url: string;
}

export { Props as ImageDiffProps };

export const DEFAULT_PROPS = {
    hasPadding: false,
    mode: "split",
    showDivider: true,
    showFullSize: false,
    showOverlay: false,
} satisfies Partial<Props>;

export type { ImageDiffMode };

export { MODES, NEW_COLOR, OLD_COLOR, OVERLAY_COLOR };

export function ImageDiff({
    diffLabel = "DIFF",
    hasPadding = DEFAULT_PROPS.hasPadding,
    mode = DEFAULT_PROPS.mode,
    newLabel = "NEW",
    oldLabel = "OLD",
    showDivider = DEFAULT_PROPS.showDivider,
    showFullSize = DEFAULT_PROPS.showFullSize,
    showOverlay = DEFAULT_PROPS.showOverlay,
    style,
    url,
}: Props) {
    const rootRef = useRef<HTMLDivElement>(null);
    const [maxWidth, setMaxWidth] = useState<number | undefined>();

    useLayoutEffect(() => {
        if (!rootRef.current || showFullSize) {
            setMaxWidth(undefined);
            return;
        }

        const resizeObserver = new ResizeObserver(([entry]) => {
            if (entry) {
                setMaxWidth(entry.contentRect.width);
            }
        });

        resizeObserver.observe(rootRef.current);

        return () => {
            resizeObserver.disconnect();
        };
    }, [showFullSize]);

    const img = useImage(url);

    const [, refreshOverlay] = useReducer((version: number) => version + 1, 0);
    const overlayUrl = showOverlay && img ? getCachedOverlay(img) : undefined;

    // Schedule the first encode after the comparison renders.
    useEffect(() => {
        if (!showOverlay || !img || getCachedOverlay(img)) return;

        const compute = () => {
            getOverlay(img);
            refreshOverlay();
        };

        if (typeof requestIdleCallback === "function") {
            const id = requestIdleCallback(compute, { timeout: 100 });
            return () => {
                cancelIdleCallback(id);
            };
        }

        const timeout = setTimeout(compute, 0);
        return () => {
            clearTimeout(timeout);
        };
    }, [showOverlay, img]);

    const size = useMemo(
        () => (img ? { height: img.naturalHeight, width: img.naturalWidth / 3 } : { height: 0, width: 0 }),
        [img],
    );

    const panelEdges = 2 * (BORDER_WIDTH + (hasPadding ? PADDING : 0));
    let targetWidth = 0;
    if (maxWidth) {
        targetWidth = maxWidth - panelEdges;
        if (mode === "side-by-side") targetWidth = Math.floor((maxWidth - SIDE_BY_SIDE_GAP) / 2) - panelEdges;
        if (mode === "3-up") targetWidth = Math.floor((maxWidth - 2 * THREE_UP_GAP) / 3) - panelEdges;
    }

    const scale = !showFullSize && targetWidth ? Math.min(1, targetWidth / size.width) : 1;
    const modeProps = { diffLabel, hasPadding, newLabel, oldLabel, overlayUrl, scale, size, url };

    let comparison: ReactNode;
    switch (mode) {
        case "3-up":
            comparison = <ThreeUp {...modeProps} />;
            break;
        case "blend":
            comparison = <Blend {...modeProps} />;
            break;
        case "new-only":
        case "old-only":
            comparison = <SingleImage {...modeProps} type={mode === "new-only" ? "new" : "old"} />;
            break;
        case "pixel-diff":
            comparison = <PixelDiff {...modeProps} />;
            break;
        case "side-by-side":
            comparison = <SideBySide {...modeProps} />;
            break;
        default:
            comparison = <Split {...modeProps} showDivider={showDivider} />;
            break;
    }

    return (
        <div ref={rootRef} style={style}>
            {comparison}
        </div>
    );
}

import { OVERLAY_COLOR } from "./constants";

/** Radius of the circle drawn around a differing pixel. */
const OVERLAY_RADIUS = 19;
/** Render the overlay at half resolution and let CSS scale it back up. */
const OVERLAY_SCALE = 0.5;

/** If the channels are within this threshold, consider the color to be grayscale. */
const GRAYSCALE_THRESHOLD = 10;

const overlayCache = new WeakMap<HTMLImageElement, string>();

export function getCachedOverlay(img: HTMLImageElement) {
    return overlayCache.get(img);
}

/**
 * Given the three-part image, analyze the center image (the diff) and create a transparent overlay that highlights all
 * the changed pixels.
 */
export function getOverlay(img: HTMLImageElement): string | undefined {
    const cached = overlayCache.get(img);
    if (cached) return cached;

    const width = Math.floor(img.naturalWidth / 3);
    const height = img.naturalHeight;
    if (!width || !height) return undefined;

    const overlayWidth = Math.max(1, Math.round(width * OVERLAY_SCALE));
    const overlayHeight = Math.max(1, Math.round(height * OVERLAY_SCALE));

    // draw the middle third of the image into a scratch canvas and scan it for differing pixels
    const imageCanvas = document.createElement("canvas");
    imageCanvas.width = width;
    imageCanvas.height = height;

    const imageCtx = imageCanvas.getContext("2d", { willReadFrequently: true });
    if (!imageCtx) return undefined;

    imageCtx.drawImage(img, width, 0, width, height, 0, 0, width, height);
    const { data } = imageCtx.getImageData(0, 0, width, height);

    const overlayCanvas = document.createElement("canvas");
    overlayCanvas.width = overlayWidth;
    overlayCanvas.height = overlayHeight;

    const overlayCtx = overlayCanvas.getContext("2d");
    if (!overlayCtx) return undefined;

    // Round centers the same way as the overlay coordinates. On an even-sized
    // panel, the last center can land on the canvas edge and still be visible.
    const columns = Math.round((width - 1) * OVERLAY_SCALE) + 1;
    const rows = Math.round((height - 1) * OVERLAY_SCALE) + 1;
    const stride = columns + 2;
    const centers = new Uint8Array(stride * (rows + 2));
    for (let y = 0; y < height; y++) {
        const row = (Math.round(y * OVERLAY_SCALE) + 1) * stride + 1;
        for (let x = 0; x < width; x++) {
            const index = (y * width + x) * 4;
            if (!isAlmostGrayscale(data[index] || 0, data[index + 1] || 0, data[index + 2] || 0)) {
                centers[row + Math.round(x * OVERLAY_SCALE)] = 1;
            }
        }
    }

    const radius = OVERLAY_RADIUS * OVERLAY_SCALE;
    for (let y = 0; y < rows; y++) {
        const row = (y + 1) * stride + 1;
        let interiorStart = -1;
        for (let x = 0; x <= columns; x++) {
            const index = row + x;
            const occupied = centers[index];
            // Away from the occupied unit squares, the closest occupied center
            // is on the boundary. Only boundary centers need their full circles.
            if (
                occupied &&
                centers[index - 1] &&
                centers[index + 1] &&
                centers[index - stride] &&
                centers[index + stride]
            ) {
                if (interiorStart === -1) interiorStart = x;
                continue;
            }
            if (interiorStart !== -1) {
                overlayCtx.rect(interiorStart - 0.5, y - 0.5, x - interiorStart, 1);
                interiorStart = -1;
            }
            if (occupied) {
                overlayCtx.moveTo(x + radius, y);
                overlayCtx.arc(x, y, radius, 0, Math.PI * 2);
            }
        }
    }

    overlayCtx.fillStyle = OVERLAY_COLOR;
    overlayCtx.fill();

    const url = overlayCanvas.toDataURL("image/webp", 1);

    overlayCache.set(img, url);
    return url;
}

function isAlmostGrayscale(r: number, g: number, b: number): boolean {
    return (
        Math.abs(r - g) < GRAYSCALE_THRESHOLD &&
        Math.abs(g - b) < GRAYSCALE_THRESHOLD &&
        Math.abs(b - r) < GRAYSCALE_THRESHOLD
    );
}

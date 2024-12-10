/**
 * Given the three-part image, analyze the center image (the diff) and create a transparent overlay that highlights all
 * the changed pixels.
 */
export function getOverlay(img: HTMLImageElement | undefined, color: string): string | undefined {
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
            if (!isAlmostGrayscale(r, g, b)) {
                // circle around the pixel
                overlayCtx.moveTo(x, y);
                overlayCtx.arc(x, y, 19, 0, Math.PI * 2);
            }
        }
    }

    overlayCtx.fillStyle = color;
    overlayCtx.fill();

    return overlayCanvas.toDataURL("image/webp", 1);
}

function isAlmostGrayscale(r: number, g: number, b: number): boolean {
    return Math.abs(r - g) < 10 && Math.abs(g - b) < 10 && Math.abs(b - r) < 10;
}

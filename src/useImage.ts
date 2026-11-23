import { useEffect, useState } from "react";

const MAX_CACHED_IMAGES = 8;
// Budget by decoded RGBA size. A three-panel 4K sprite uses about 95 MiB.
const MAX_CACHED_BYTES = 128 * 1024 * 1024;

/** Recently used images, keyed by URL. */
const resolvedCache = new Map<string, HTMLImageElement>();

/** In-flight loads, keyed by URL — multiple consumers share the same request. */
const pendingCache = new Map<string, Promise<HTMLImageElement | undefined>>();

export function useImage(url: string): HTMLImageElement | undefined {
    const [loaded, setLoaded] = useState<{ image: HTMLImageElement; url: string }>();

    useEffect(() => {
        let cancelled = false;

        void loadImage(url).then((img) => {
            if (!cancelled) setLoaded(img && { image: img, url });
        });

        return () => {
            cancelled = true;
        };
    }, [url]);

    return loaded?.url === url ? loaded.image : resolvedCache.get(url);
}

function imageBytes(img: HTMLImageElement): number {
    return img.naturalWidth * img.naturalHeight * 4;
}

function loadImage(url: string): Promise<HTMLImageElement | undefined> {
    const cached = resolvedCache.get(url);
    if (cached) {
        resolvedCache.delete(url);
        resolvedCache.set(url, cached);
        return Promise.resolve(cached);
    }

    const pending = pendingCache.get(url);
    if (pending) return pending;

    const promise = new Promise<HTMLImageElement | undefined>((resolve) => {
        const img = new Image();
        // Match the panels' CORS mode so they can share this request.
        img.crossOrigin = "anonymous";
        img.onload = () => {
            let bytes = imageBytes(img);
            if (bytes <= MAX_CACHED_BYTES) {
                for (const cachedImage of resolvedCache.values()) bytes += imageBytes(cachedImage);
                for (const [oldestUrl, oldest] of resolvedCache) {
                    if (resolvedCache.size < MAX_CACHED_IMAGES && bytes <= MAX_CACHED_BYTES) break;
                    resolvedCache.delete(oldestUrl);
                    bytes -= imageBytes(oldest);
                }
                resolvedCache.set(url, img);
            }
            resolve(img);
        };
        img.onerror = () => {
            resolve(undefined);
        };
        img.src = url;
    }).finally(() => {
        pendingCache.delete(url);
    });

    pendingCache.set(url, promise);
    return promise;
}

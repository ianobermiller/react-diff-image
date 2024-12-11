import { useEffect, useState } from "react";

export function useImage(url: string): HTMLImageElement | undefined {
    const [image, setImage] = useState<HTMLImageElement>();

    useEffect(() => {
        const img = new Image();
        img.setAttribute("crossOrigin", "");
        img.onload = () => {
            setImage(img);
        };
        img.src = url;

        return () => {
            img.src = "";
        };
    }, [url]);

    return image;
}

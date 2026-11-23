import { useState } from "react";
import { createRoot } from "react-dom/client";

import { ImageDiff, MODES } from "../dist/index.mjs";
import type { ImageDiffMode } from "../dist/index.mjs";

function Fixture() {
    const [url, setUrl] = useState("/diff.webp");
    const [width, setWidth] = useState(800);
    const [mode, setMode] = useState<ImageDiffMode>("split");
    const [hasPadding, setPadding] = useState(false);
    const [showOverlay, setOverlay] = useState(false);
    const [showDivider, setDivider] = useState(true);
    const [showFullSize, setFullSize] = useState(false);
    const [customLabels, setCustomLabels] = useState(false);
    return (
        <>
            <label>
                URL
                <input
                    value={url}
                    onChange={(event) => {
                        setUrl(event.currentTarget.value);
                    }}
                />
            </label>
            <label>
                Width
                <input
                    type="number"
                    value={width}
                    onChange={(event) => {
                        setWidth(event.currentTarget.valueAsNumber);
                    }}
                />
            </label>
            {(
                [
                    ...MODES,
                    { label: "New only", value: "new-only" },
                    { label: "Old only", value: "old-only" },
                ] satisfies typeof MODES
            ).map(({ label, value }) => (
                <button
                    type="button"
                    key={value}
                    onClick={() => {
                        setMode(value);
                    }}
                >
                    {label}
                </button>
            ))}
            <label>
                Padding
                <input
                    type="checkbox"
                    checked={hasPadding}
                    onChange={(event) => {
                        setPadding(event.currentTarget.checked);
                    }}
                />
            </label>
            <label>
                Overlay
                <input
                    type="checkbox"
                    checked={showOverlay}
                    onChange={(event) => {
                        setOverlay(event.currentTarget.checked);
                    }}
                />
            </label>
            <label>
                Divider
                <input
                    type="checkbox"
                    checked={showDivider}
                    onChange={(event) => {
                        setDivider(event.currentTarget.checked);
                    }}
                />
            </label>
            <label>
                Full size
                <input
                    type="checkbox"
                    checked={showFullSize}
                    onChange={(event) => {
                        setFullSize(event.currentTarget.checked);
                    }}
                />
            </label>
            <label>
                Custom labels
                <input
                    type="checkbox"
                    checked={customLabels}
                    onChange={(event) => {
                        setCustomLabels(event.currentTarget.checked);
                    }}
                />
            </label>
            <section aria-label="Image comparison" style={{ width }}>
                <ImageDiff
                    url={url}
                    mode={mode}
                    hasPadding={hasPadding}
                    showOverlay={showOverlay}
                    showDivider={showDivider}
                    showFullSize={showFullSize}
                    {...(customLabels ? { oldLabel: "Before", newLabel: "After", diffLabel: "Changes" } : {})}
                />
            </section>
        </>
    );
}

const root = document.querySelector("#root");
if (!root) throw new Error("Missing root");
createRoot(root).render(<Fixture />);

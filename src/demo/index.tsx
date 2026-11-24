import { useState } from "react";
import { createRoot } from "react-dom/client";

import { DEFAULT_PROPS, ImageDiff, MODES } from "..";
import type { ImageDiffProps } from "..";

document.addEventListener("DOMContentLoaded", () => {
    const root = document.querySelector("#root");
    if (!root) return;

    createRoot(root).render(<App />);
});

function App() {
    const [config, setConfig] = useState<Omit<ImageDiffProps, "url">>(DEFAULT_PROPS);
    return (
        <main className="demo">
            <header className="demo-header">
                <div>
                    <h1>react-diff-image</h1>
                    <p>A closer look at what changed. Pick a mode to compare the images.</p>
                </div>
                <a href="https://github.com/ianobermiller/react-diff-image">View on GitHub ↗</a>
            </header>

            <div className="demo-controls">
                <fieldset className="demo-modes">
                    <legend>Comparison mode</legend>
                    {(
                        [
                            ...MODES,
                            { label: "New only", value: "new-only" },
                            { label: "Old only", value: "old-only" },
                        ] satisfies typeof MODES
                    ).map(({ label, value }) => (
                        <label className="demo-mode" key={value}>
                            <input
                                checked={config.mode === value}
                                name="mode"
                                onChange={() => {
                                    setConfig((prev) => ({ ...prev, mode: value }));
                                }}
                                type="radio"
                            />{" "}
                            {label}
                        </label>
                    ))}
                </fieldset>
                <fieldset className="demo-options">
                    <legend>Display options</legend>
                    <label>
                        <input
                            checked={config.showDivider}
                            onChange={() => {
                                setConfig((prev) => ({ ...prev, showDivider: !prev.showDivider }));
                            }}
                            type="checkbox"
                        />{" "}
                        Show divider
                    </label>
                    <label>
                        <input
                            checked={config.showFullSize}
                            onChange={() => {
                                setConfig((prev) => ({ ...prev, showFullSize: !prev.showFullSize }));
                            }}
                            type="checkbox"
                        />{" "}
                        Show full size
                    </label>
                    <label>
                        <input
                            checked={config.showOverlay}
                            onChange={() => {
                                setConfig((prev) => ({ ...prev, showOverlay: !prev.showOverlay }));
                            }}
                            type="checkbox"
                        />{" "}
                        Show overlay
                    </label>
                    <label>
                        <input
                            checked={config.hasPadding}
                            onChange={() => {
                                setConfig((prev) => ({ ...prev, hasPadding: !prev.hasPadding }));
                            }}
                            type="checkbox"
                        />{" "}
                        Padding
                    </label>
                </fieldset>
            </div>

            <div className="demo-preview">
                <ImageDiff {...config} style={{ overflow: "auto" }} url="/diff.webp" />
            </div>
        </main>
    );
}

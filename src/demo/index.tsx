import { useState } from "react";
import { createRoot } from "react-dom/client";

import { DEFAULT_PROPS, ImageDiff, ImageDiffProps, MODES } from "..";

document.addEventListener("DOMContentLoaded", () => {
    const root = document.getElementById("root");
    if (!root) return;

    createRoot(root).render(<App />);
});

function App() {
    const [config, setConfig] = useState<Omit<ImageDiffProps, "url">>(DEFAULT_PROPS);
    return (
        <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 20, marginBottom: 20, whiteSpace: "nowrap" }}>
                {MODES.concat([
                    { label: "New only", value: "new-only" },
                    { label: "Old only", value: "old-only" },
                ]).map(({ label, value }) => (
                    <label key={value}>
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
            </div>

            <ImageDiff {...config} url="/diff.webp" />
        </div>
    );
}

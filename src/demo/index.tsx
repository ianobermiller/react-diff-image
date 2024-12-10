import { createRoot } from "react-dom/client";
import { DEFAULT_PROPS, ImageDiff, ImageDiffProps, MODES } from "..";
import { useState } from "react";

document.addEventListener("DOMContentLoaded", () => {
    const root = createRoot(document.getElementById("root")!);
    root.render(<App />);
});

function App() {
    const [config, setConfig] = useState<Omit<ImageDiffProps, "url">>(DEFAULT_PROPS);
    return (
        <div>
            <div style={{ marginBottom: 20, display: "flex", gap: 20 }}>
                {MODES.map(({ label, value }) => (
                    <label key={value}>
                        <input
                            type="radio"
                            name="mode"
                            checked={config.mode === value}
                            onChange={() => setConfig((prev) => ({ ...prev, mode: value }))}
                        />{" "}
                        {label}
                    </label>
                ))}
                <label>
                    <input
                        type="checkbox"
                        checked={config.showDivider}
                        onChange={() => setConfig((prev) => ({ ...prev, showDivider: !prev.showDivider }))}
                    />{" "}
                    Show divider
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={config.showFullSize}
                        onChange={() => setConfig((prev) => ({ ...prev, showFullSize: !prev.showFullSize }))}
                    />{" "}
                    Show full size
                </label>
                <label>
                    <input
                        type="checkbox"
                        checked={config.showOverlay}
                        onChange={() => setConfig((prev) => ({ ...prev, showOverlay: !prev.showOverlay }))}
                    />{" "}
                    Show overlay
                </label>
            </div>

            <ImageDiff {...config} url="/diff.webp" />
        </div>
    );
}

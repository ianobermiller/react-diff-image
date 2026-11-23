// Tiny static file server for dist-demo (no deps).
import { createServer } from "node:http";
import { readFile, realpath } from "node:fs/promises";
import { extname, isAbsolute, relative, resolve, sep } from "node:path";

const root = await realpath(resolve(process.argv[2] || "dist-demo"));
const port = Number(process.argv[3] || 8765);
const host = "127.0.0.1";

const MIME = {
    ".html": "text/html",
    ".mjs": "text/javascript",
    ".js": "text/javascript",
    ".map": "application/json",
    ".webp": "image/webp",
    ".png": "image/png",
    ".json": "application/json",
    ".css": "text/css",
};

function isWithinRoot(file) {
    const fromRoot = relative(root, file);
    return fromRoot !== ".." && !fromRoot.startsWith(`..${sep}`) && !isAbsolute(fromRoot);
}

const server = createServer(async (req, res) => {
    try {
        const pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
        const candidate = resolve(root, pathname === "/" ? "./index.html" : `.${pathname}`);
        const file = isWithinRoot(candidate) ? await realpath(candidate) : undefined;
        if (!file || !isWithinRoot(file)) {
            res.writeHead(403);
            return res.end("forbidden");
        }
        const body = await readFile(file);
        res.writeHead(200, {
            "Content-Type": MIME[extname(file)] || "application/octet-stream",
            "Cache-Control": "no-cache",
        });
        res.end(body);
    } catch {
        res.writeHead(404);
        res.end("not found");
    }
});
server.listen(port, host, () => console.log(`serving ${root} on http://${host}:${server.address().port}`));

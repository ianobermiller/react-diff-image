import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, mkdirSync, readFileSync, renameSync, rmSync, symlinkSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

const repository = resolve(import.meta.dirname, "..");

test("the published tarball supports CJS, ESM, TypeScript consumers, and client boundaries", () => {
    const temporary = mkdtempSync(join(tmpdir(), "react-diff-image-package-"));
    try {
        const packed = JSON.parse(
            execFileSync("npm", ["pack", "--json", "--ignore-scripts", "--pack-destination", temporary], {
                cwd: repository,
                env: { ...process.env, npm_config_cache: join(temporary, "cache") },
                encoding: "utf8",
            }),
        );
        const [pack] = Array.isArray(packed) ? packed : Object.values(packed);
        assert.ok(pack);
        assert.ok(
            pack.files.every(
                ({ path }) => path.startsWith("dist/") || ["package.json", "README.md", "LICENSE"].includes(path),
            ),
            "only runtime artifacts and package documentation belong in the tarball",
        );
        const modules = join(temporary, "node_modules");
        mkdirSync(modules);
        execFileSync("tar", ["-xzf", join(temporary, pack.filename), "-C", modules]);
        const installed = join(modules, "react-diff-image");
        renameSync(join(modules, "package"), installed);
        for (const name of ["react", "react-dom", "@types", "csstype"]) {
            symlinkSync(join(repository, "node_modules", name), join(modules, name), "dir");
        }
        for (const file of ["index.js", "index.mjs"]) {
            const source = readFileSync(join(installed, "dist", file), "utf8");
            assert.match(source, /^\s*["']use client["'];/u, `${file} must preserve the client boundary`);
        }
        const script = `import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createElement } from 'react';
import * as esm from 'react-diff-image';
const require = createRequire(import.meta.url);
const { renderToString } = require('react-dom/server');
const cjs = require('react-diff-image');
assert.deepEqual(Object.keys(esm).sort(), Object.keys(cjs).sort());
for (const library of [esm, cjs]) {
    assert.equal(typeof library.ImageDiff, 'function');
    assert.match(renderToString(createElement(library.ImageDiff, {url: '/diff.webp'})), /OLD/);
}`;
        const runtime = join(temporary, "runtime.mjs");
        writeFileSync(runtime, script);
        execFileSync(process.execPath, [runtime], { cwd: temporary, stdio: "pipe" });
        const consumer = `import { ImageDiff, DEFAULT_PROPS, type ImageDiffMode, type ImageDiffProps } from 'react-diff-image';
import { createElement } from 'react';
const mode: ImageDiffMode = 'split';
const defaultMode: 'split' = DEFAULT_PROPS.mode;
const defaultPadding: false = DEFAULT_PROPS.hasPadding;
const defaultDivider: true = DEFAULT_PROPS.showDivider;
const defaultFullSize: false = DEFAULT_PROPS.showFullSize;
const defaultOverlay: false = DEFAULT_PROPS.showOverlay;
const props: ImageDiffProps = {...DEFAULT_PROPS, mode, url:'/diff.webp'};
createElement(ImageDiff, props);`;
        for (const extension of ["mts", "cts"]) {
            const file = join(temporary, `consumer.${extension}`);
            writeFileSync(file, consumer);
            execFileSync(
                join(repository, "node_modules", ".bin", "tsc"),
                ["--noEmit", "--strict", "--module", "nodenext", "--target", "es2020", "--types", "react", file],
                { cwd: temporary, stdio: "pipe" },
            );
        }
    } finally {
        rmSync(temporary, { recursive: true, force: true });
    }
});

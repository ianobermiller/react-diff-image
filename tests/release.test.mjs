import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { test } from "node:test";

import { highestRelease, validateReleaseBaseline } from "../scripts/check-release-baseline.mjs";
import { validateManifest, validateRelease } from "../scripts/release-policy.mjs";

const repository = resolve(import.meta.dirname, "..");

test("releasing fails closed when Git tags differ from npm's published version", () => {
    assert.equal(highestRelease(["2.1.1", "1.6.0", "2.1.2-beta.0"]), "2.1.1");
    assert.equal(highestRelease(["2.9.0", "2.10.0", "10.0.0"]), "10.0.0");
    assert.doesNotThrow(() => validateReleaseBaseline("2.1.1", "v2.1.1"));
    for (const tag of ["", "v1.5.0", "v1.6.0", "v2.1.0", "v2.1.2"]) {
        assert.throws(() => validateReleaseBaseline("2.1.1", tag), /Release baseline mismatch/u);
    }
});

test("PR titles reject missing release intent and skipped checks", () => {
    for (const title of ["update component", "feature: add a mode", "fix: ", "fix: drag\n", "fix: drag [skip ci]"]) {
        assert.throws(() => validateRelease(title, []));
    }
    for (const file of ["src/Split.tsx", "tsdown.config.mts", "tsconfig.json", "LICENSE"]) {
        assert.throws(() => validateRelease("chore: update", [file]));
    }
    assert.equal(validateRelease("docs: explain labels", ["README.md", "src/demo/index.tsx"]), "none");
    assert.equal(
        validateRelease(
            "refactor!: simplify props",
            ["src/types.ts"],
            "BREAKING CHANGE: Replace oldLabel with labels.old.",
        ),
        "major",
    );
});

test("breaking releases require migration notes and matching title intent", () => {
    assert.throws(() => validateRelease("feat!: replace props", [], "## Migration\nRename the old prop."));
    assert.throws(() => validateRelease("feat!: replace props", [], "BREAKING CHANGE:   "));
    for (const body of ["BREAKING CHANGE: Rename the prop.", "* breaking-change: Rename the prop."]) {
        assert.throws(() => validateRelease("fix: replace props", [], body));
    }
    assert.throws(() => validateRelease("fix: update", [], "Details\n[skip ci]"));
    assert.throws(() => validateRelease("fix: update", [], "skip-checks: true"));
    assert.doesNotThrow(() =>
        validateRelease("fix: update", [], "## Change\nRepair dragging.\n\n## Validation\nBrowser tests."),
    );
    assert.doesNotThrow(() => validateManifest("major", { main: "old.js" }, { main: "new.js" }));
});

test("published metadata needs a release and versions belong to CI", () => {
    assert.throws(() => validateManifest("patch", { version: "2.1.1" }, { version: "2.1.2" }));
    assert.throws(() => validateManifest("none", { main: "old.js" }, { main: "new.js" }));
    assert.doesNotThrow(() => validateManifest("patch", { main: "old.js" }, { main: "new.js" }));
    assert.doesNotThrow(() => validateManifest("none", { devDependencies: {} }, { devDependencies: { tool: "1" } }));
});

for (const [title, bump, version] of [
    ["fix: repair dragging", "patch", "9.8.8"],
    ["perf(overlay): reduce encoding", "patch", "9.8.8"],
    ["revert: undo a change", "patch", "9.8.8"],
    ["feat: add a mode", "minor", "9.9.0"],
    ["feat(api)!: replace props", "major", "10.0.0"],
    ["chore!: drop old React", "major", "10.0.0"],
    ["docs: clarify usage", "none", ""],
    ["refactor: reorganize tests", "none", ""],
]) {
    test(`release tooling agrees with PR policy for ${title}`, () => {
        const migration = "Replace oldLabel with labels.old in every ImageDiff call.";
        const body = bump === "major" ? `## Change\nReplace the label API.\n\nBREAKING CHANGE: ${migration}` : "";
        assert.equal(validateRelease(title, [], body), bump);
        const directory = mkdtempSync(join(tmpdir(), "react-diff-release-"));
        const options = { cwd: directory, encoding: "utf8", stdio: "pipe" };
        function git(...args) {
            return execFileSync("git", args, options);
        }
        try {
            git("init", "--initial-branch=main");
            git("config", "user.name", "Release test");
            git("config", "user.email", "test@example.com");
            git("remote", "add", "origin", directory);
            writeFileSync(
                join(directory, "package.json"),
                JSON.stringify({ name: "release-fixture", version: "2.1.1" }),
            );
            git("add", ".");
            git("commit", "-m", "chore: initial");
            git("tag", "v9.8.7");
            git("commit", "--allow-empty", "-m", title, "-m", body);
            if (title === "fix: repair dragging" || bump === "major") git("tag", "v1.6.0");
            const result = execFileSync(
                process.execPath,
                [
                    join(repository, "node_modules/release-it/bin/release-it.js"),
                    "--config",
                    join(repository, ".release-it.json"),
                    "--ci",
                    "--release-version",
                    "--no-github",
                    "--git.requireUpstream=false",
                ],
                options,
            ).trim();
            assert.equal(result, version);
            if (bump === "major") {
                const changelog = execFileSync(
                    process.execPath,
                    [
                        join(repository, "node_modules/release-it/bin/release-it.js"),
                        "--config",
                        join(repository, ".release-it.json"),
                        "--ci",
                        "--changelog",
                        "--no-github",
                        "--git.requireUpstream=false",
                    ],
                    options,
                );
                assert.match(changelog, /BREAKING CHANGES/u);
                assert.ok(changelog.includes(migration));
                assert.doesNotMatch(changelog, /## \[1\.6\.0\]/u);
            }
        } finally {
            rmSync(directory, { recursive: true, force: true });
        }
    });
}

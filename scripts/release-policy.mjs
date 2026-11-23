import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";

export function validateRelease(title, files, body = "") {
    if (/[\r\n]/u.test(title)) throw new Error("Release titles must be a single line.");
    const match = /^(feat|fix|perf|revert|docs|test|ci|build|chore|refactor|style)(?:\([a-z0-9-]+\))?(!)?: \S.*$/u.exec(
        title,
    );
    if (!match) {
        throw new Error(
            "Use a Conventional Commit title, for example fix: correct split dragging or feat!: replace an API.",
        );
    }
    if (/\[(?:skip ci|ci skip|no ci|skip actions|actions skip)\]|skip-checks:\s*true/iu.test(`${title}\n${body}`)) {
        throw new Error("Release titles and descriptions cannot skip CI.");
    }
    const [, type, breaking] = match;
    if (breaking && !/^BREAKING CHANGE:[\t ]+\S.*$/mu.test(body)) {
        throw new Error("Breaking releases require a BREAKING CHANGE: footer describing the change and migration.");
    }
    if (!breaking && /^(?:\*\s+)?BREAKING[ -]CHANGE:/imu.test(body)) {
        throw new Error("A BREAKING CHANGE footer requires ! in the PR title.");
    }
    const publishes = Boolean(breaking) || ["feat", "fix", "perf", "revert"].includes(type);
    const libraryChanged = files.some(
        (file) =>
            (file.startsWith("src/") && !file.startsWith("src/demo/")) ||
            ["tsdown.config.mts", "tsconfig.json", "LICENSE"].includes(file),
    );
    if (libraryChanged && !publishes) {
        throw new Error("Library changes require feat:, fix:, perf:, revert:, or a breaking ! title.");
    }
    if (breaking) return "major";
    if (type === "feat") return "minor";
    return publishes ? "patch" : "none";
}

export function validateManifest(release, before, after) {
    if (before.version !== after.version) {
        throw new Error("CI owns package versions. Do not edit package.json version.");
    }
    for (const field of [
        "name",
        "exports",
        "main",
        "module",
        "types",
        "files",
        "peerDependencies",
        "dependencies",
        "sideEffects",
    ]) {
        if (JSON.stringify(before[field]) !== JSON.stringify(after[field]) && release === "none") {
            throw new Error(`Published metadata ${field} changed without a release.`);
        }
    }
}

if (import.meta.main) {
    const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
    const pr = event.pull_request;
    const base = pr ? pr.base.sha : `${process.env.GITHUB_SHA}^`;
    const head = pr ? pr.head.sha : process.env.GITHUB_SHA;
    const title = pr ? pr.title : execFileSync("git", ["show", "-s", "--format=%s", head], { encoding: "utf8" }).trim();
    const body = pr ? (pr.body ?? "") : execFileSync("git", ["show", "-s", "--format=%b", head], { encoding: "utf8" });
    const files = execFileSync("git", ["diff", "--name-only", "-z", `${base}...${head}`], {
        encoding: "utf8",
    })
        .split("\0")
        .filter(Boolean);
    const release = validateRelease(title, files, body);
    const before = JSON.parse(execFileSync("git", ["show", `${base}:package.json`], { encoding: "utf8" }));
    const after = JSON.parse(execFileSync("git", ["show", `${head}:package.json`], { encoding: "utf8" }));
    validateManifest(release, before, after);
}

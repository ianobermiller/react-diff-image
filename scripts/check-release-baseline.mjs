import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { setTimeout } from "node:timers/promises";

export function validateReleaseBaseline(publishedVersion, latestTag) {
    if (!/^\d+\.\d+\.\d+$/u.test(publishedVersion) || latestTag !== `v${publishedVersion}`) {
        throw new Error(
            `Release baseline mismatch: highest npm version is ${publishedVersion}, highest Git tag is ${latestTag || "missing"}.`,
        );
    }
}

export function highestRelease(versions) {
    return versions
        .filter((version) => /^\d+\.\d+\.\d+$/u.test(version))
        .toSorted((left, right) => left.localeCompare(right, "en", { numeric: true }))
        .at(-1);
}

async function verify(attempts) {
    try {
        const { name } = JSON.parse(readFileSync("package.json", "utf8"));
        const registryResponse = JSON.parse(
            execFileSync("npm", ["view", name, "versions", "dist-tags", "--json", "--prefer-online"], {
                encoding: "utf8",
            }),
        );
        const registry = Array.isArray(registryResponse) ? registryResponse[0] : registryResponse;
        const version = highestRelease(registry.versions);
        const options = { encoding: "utf8" };
        const tag = execFileSync(
            "git",
            [
                "-c",
                "versionsort.suffix=-",
                "for-each-ref",
                "--count=1",
                "--sort=-v:refname",
                "--format=%(refname:short)",
                "refs/tags/v*",
            ],
            options,
        ).trim();
        validateReleaseBaseline(version, tag);
        const response = JSON.parse(
            execFileSync(
                "npm",
                ["view", `${name}@${version}`, "version", "gitHead", "--json", "--prefer-online"],
                options,
            ),
        );
        const published = Array.isArray(response) ? response[0] : response;
        const commit = execFileSync("git", ["rev-parse", `${tag}^{commit}`], options).trim();
        if (published.gitHead !== commit) {
            throw new Error(`The ${tag} tag must point to npm's published source commit ${published.gitHead}.`);
        }
        execFileSync("git", ["merge-base", "--is-ancestor", commit, "HEAD"], options);
        if (process.argv.includes("--retry") && registry["dist-tags"].latest !== version) {
            throw new Error(`npm latest must point to the verified ${version} release.`);
        }
        process.stdout.write(`Verified ${tag} against npm and the current branch history.\n`);
    } catch (error) {
        if (attempts === 0) throw error;
        await setTimeout(5000);
        await verify(attempts - 1);
    }
}

if (import.meta.main) await verify(process.argv.includes("--retry") ? 6 : 0);

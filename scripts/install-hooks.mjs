import { execFileSync } from "node:child_process";
import { existsSync } from "node:fs";

// Published packages and the isolated pre-push copy have no Git metadata.
if (existsSync(new URL("../.git", import.meta.url))) {
    execFileSync("git", ["config", "core.hooksPath", ".githooks"], { stdio: "inherit" });
}

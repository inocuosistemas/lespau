const { existsSync } = require("node:fs");
const { spawnSync } = require("node:child_process");
const { join } = require("node:path");
const { homedir } = require("node:os");

const candidates = [
  join(homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "python", "python.exe"),
  "python",
  "python3"
];

const python = candidates.find((candidate) => candidate.includes("\\") ? existsSync(candidate) : true);
const result = spawnSync(python, ["scripts/extract-official-data.py"], { stdio: "inherit", shell: false });

process.exit(result.status ?? 1);

#!/usr/bin/env node
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";

const BIOME_EXTENSIONS = new Set([
  ".js",
  ".cjs",
  ".mjs",
  ".ts",
  ".tsx",
  ".jsx",
  ".json",
  ".css",
  ".html",
  ".md",
]);

function parseChangedFiles() {
  const gitStatus = spawnSync("git", ["status", "--short"], {
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });

  if (gitStatus.status !== 0) {
    console.error("Unable to determine git status for Biome:", gitStatus.stderr?.trim() || "");
    process.exit(gitStatus.status ?? 1);
  }

  const output = gitStatus.stdout;
  if (!output) return [];

  return output
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => line.replace(/^[A-Z?]{1,2}\s+/, ""))
    .map((entry) => {
      if (entry.includes(" -> ")) {
        const parts = entry.split(" -> ");
        return parts[parts.length - 1].trim();
      }
      return entry;
    })
    .filter((file) => {
      const ext = path.extname(file);
      return BIOME_EXTENSIONS.has(ext) && existsSync(file);
    });
}

const filesToCheck = parseChangedFiles();

if (!filesToCheck.length) {
  console.log("Biome: no touched files detected, skipping check.");
  process.exit(0);
}

const result = spawnSync("npx", ["@biomejs/biome", "check", ...filesToCheck], {
  stdio: "inherit",
});

if (result.status !== 0) {
  process.exit(result.status ?? 1);
}

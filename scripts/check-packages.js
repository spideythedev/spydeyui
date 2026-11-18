import { access, readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const packagesRoot = join(root, "packages");
const entries = await readdir(packagesRoot, { withFileTypes: true });
const packages = entries.filter((entry) => entry.isDirectory());
const names = new Set();

for (const entry of packages) {
  const packageRoot = join(packagesRoot, entry.name);
  const manifestPath = join(packageRoot, "package.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));

  if (!manifest.name || !manifest.version || !manifest.exports) {
    throw new Error(`Invalid package manifest: ${entry.name}`);
  }

  if (names.has(manifest.name)) {
    throw new Error(`Duplicate package name: ${manifest.name}`);
  }

  names.add(manifest.name);

  for (const target of Object.values(manifest.exports)) {
    if (target.includes("*")) continue;
    await access(resolve(packageRoot, target));
  }
}

const tokenRoot = join(packagesRoot, "tokens", "src");
const tokenFiles = [
  "palette.json",
  "spacing.json",
  "typography.json",
  "motion.json",
  "themes/obsidian.json",
  "themes/daylight.json",
  "themes/high-contrast.json"
];

for (const file of tokenFiles) {
  JSON.parse(await readFile(join(tokenRoot, file), "utf8"));
}

process.stdout.write(`Checked ${packages.length} packages and ${tokenFiles.length} token files.\n`);

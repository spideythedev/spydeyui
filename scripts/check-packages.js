import { readdir, readFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../packages/", import.meta.url));
const entries = await readdir(root, { withFileTypes: true });
const packages = entries.filter((entry) => entry.isDirectory());
const names = new Set();

for (const entry of packages) {
  const path = join(root, entry.name, "package.json");
  const manifest = JSON.parse(await readFile(path, "utf8"));

  if (!manifest.name || !manifest.version || !manifest.exports) {
    throw new Error(`Invalid package manifest: ${entry.name}`);
  }

  if (names.has(manifest.name)) {
    throw new Error(`Duplicate package name: ${manifest.name}`);
  }

  names.add(manifest.name);
}

process.stdout.write(`Checked ${packages.length} workspace packages.\n`);

import { access, readdir, readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const packagesRoot = join(root, "packages");
const entries = await readdir(packagesRoot, { withFileTypes: true });
const packages = entries.filter((entry) => entry.isDirectory());
const manifests = await Promise.all(packages.map(async (entry) => {
  const packageRoot = join(packagesRoot, entry.name);
  const manifest = JSON.parse(await readFile(join(packageRoot, "package.json"), "utf8"));
  return { entry, packageRoot, manifest };
}));
const names = new Set();
const packageNames = new Set(manifests.map(({ manifest }) => manifest.name));

for (const { entry, packageRoot, manifest } of manifests) {
  if (!manifest.name || !manifest.version || !manifest.exports) {
    throw new Error(`Invalid package manifest: ${entry.name}`);
  }

  if (names.has(manifest.name)) {
    throw new Error(`Duplicate package name: ${manifest.name}`);
  }

  names.add(manifest.name);

  for (const target of Object.values(manifest.exports)) {
    if (typeof target !== "string") {
      throw new Error(`Invalid export target in ${manifest.name}`);
    }

    if (!target.includes("*")) {
      await access(resolve(packageRoot, target));
      continue;
    }

    const directory = resolve(packageRoot, dirname(target));
    const suffix = target.slice(target.lastIndexOf("*") + 1);
    const files = await readdir(directory);

    if (!files.some((file) => file.endsWith(suffix))) {
      throw new Error(`No files match export target ${target} in ${manifest.name}`);
    }
  }

  for (const [dependency, version] of Object.entries(manifest.dependencies || {})) {
    if (version.startsWith("workspace:") && !packageNames.has(dependency)) {
      throw new Error(`Missing workspace dependency ${dependency} in ${manifest.name}`);
    }
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

const cssFiles = [];

async function collectCss(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) await collectCss(path);
    else if (entry.name.endsWith(".css")) cssFiles.push(path);
  }
}

await collectCss(join(packagesRoot, "core", "src"));

for (const file of cssFiles) {
  const content = await readFile(file, "utf8");

  for (const match of content.matchAll(/@import\s+["'](\.\/|\.\.\/)([^"']+)["']/g)) {
    await access(resolve(dirname(file), match[1] + match[2]));
  }
}

await access(join(packagesRoot, "tokens", "dist", "tokens.css"));
await access(join(packagesRoot, "tokens", "dist", "figma-tokens.json"));

process.stdout.write(`Checked ${packages.length} packages, ${tokenFiles.length} token files and ${cssFiles.length} stylesheets.\n`);

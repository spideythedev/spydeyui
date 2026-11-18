import { mkdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../", import.meta.url));
const source = join(root, "packages/tokens/src");
const output = join(root, "packages/tokens/dist");

async function readJson(path) {
  return JSON.parse(await readFile(join(source, path), "utf8"));
}

const [palette, spacing, typography, motion, obsidian, daylight, highContrast] = await Promise.all([
  readJson("palette.json"),
  readJson("spacing.json"),
  readJson("typography.json"),
  readJson("motion.json"),
  readJson("themes/obsidian.json"),
  readJson("themes/daylight.json"),
  readJson("themes/high-contrast.json")
]);

const themes = {
  obsidian,
  daylight,
  "high-contrast": highContrast
};

const kebab = (value) => value.replace(/[A-Z]/g, (letter) => `-${letter.toLowerCase()}`);

function declarations(values, prefix) {
  return Object.entries(values).map(([key, value]) => `  ${prefix}${kebab(key)}: ${value};`).join("\n");
}

function themeBlock(name, theme) {
  const selector = name === "obsidian" ? ":root,\n[data-theme=\"obsidian\"]" : `[data-theme="${name}"]`;
  const colors = declarations(theme.color, "--spydeyui-color-");
  const radii = declarations(theme.radius, "--spydeyui-radius-");
  const scheme = name === "daylight" ? "light" : "dark";
  return `${selector} {\n  color-scheme: ${scheme};\n${colors}\n${radii}\n}`;
}

const css = [
  Object.entries(themes).map(([name, theme]) => themeBlock(name, theme)).join("\n\n"),
  `:root {\n${declarations(palette.status, "--spydeyui-color-")}\n${declarations(Object.fromEntries(Object.entries(palette.statusForeground).map(([key, value]) => [`${key}Foreground`, value])), "--spydeyui-color-")}\n${declarations(spacing, "--spydeyui-space-")}\n${declarations(typography.fontFamily, "--spydeyui-font-")}\n${declarations(motion.duration, "--spydeyui-duration-")}\n${declarations(motion.easing, "--spydeyui-easing-")}\n}`
].join("\n\n") + "\n";

const figmaTokens = {
  color: {
    neutral: Object.fromEntries(Object.entries(palette.neutral).map(([key, value]) => [key, { $type: "color", $value: value }])),
    status: Object.fromEntries(Object.entries(palette.status).map(([key, value]) => [key, { $type: "color", $value: value }])),
    statusForeground: Object.fromEntries(Object.entries(palette.statusForeground).map(([key, value]) => [key, { $type: "color", $value: value }]))
  },
  spacing: Object.fromEntries(Object.entries(spacing).map(([key, value]) => [key, { $type: "dimension", $value: value }])),
  typography,
  motion,
  themes
};

await mkdir(output, { recursive: true });
await Promise.all([
  writeFile(join(output, "tokens.css"), css),
  writeFile(join(output, "figma-tokens.json"), JSON.stringify(figmaTokens, null, 2) + "\n")
]);

process.stdout.write("Generated CSS variables and Figma tokens.\n");

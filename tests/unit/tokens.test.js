import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import * as tokens from "../../packages/tokens/src/index.js";

test("exports all design token groups", () => {
  assert.ok(tokens.palette.neutral);
  assert.ok(tokens.palette.status);
  assert.ok(tokens.spacing["4"]);
  assert.ok(tokens.typography.fontFamily);
  assert.ok(tokens.motion.duration);
});

test("exports all supported themes", () => {
  assert.deepEqual(Object.keys(tokens.themes).sort(), [
    "daylight",
    "high-contrast",
    "obsidian"
  ]);
});

test("generated assets include semantic and theme variables", async () => {
  const css = await readFile(new URL("../../packages/tokens/dist/tokens.css", import.meta.url), "utf8");
  const figma = JSON.parse(await readFile(new URL("../../packages/tokens/dist/figma-tokens.json", import.meta.url), "utf8"));

  assert.match(css, /--spydeyui-color-success:/);
  assert.match(css, /\[data-theme="daylight"\]/);
  assert.match(css, /\[data-theme="high-contrast"\]/);
  assert.equal(figma.color.status.success.$type, "color");
  assert.equal(figma.color.statusForeground.success.$value, "#4ade80");
});

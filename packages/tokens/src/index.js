import palette from "./palette.json" with { type: "json" };
import spacing from "./spacing.json" with { type: "json" };
import typography from "./typography.json" with { type: "json" };
import motion from "./motion.json" with { type: "json" };
import obsidian from "./themes/obsidian.json" with { type: "json" };
import daylight from "./themes/daylight.json" with { type: "json" };
import highContrast from "./themes/high-contrast.json" with { type: "json" };

export { palette, spacing, typography, motion };
export const themes = {
  obsidian,
  daylight,
  "high-contrast": highContrast
};

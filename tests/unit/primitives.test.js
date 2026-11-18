import test from "node:test";
import assert from "node:assert/strict";
import * as primitives from "../../packages/primitives/src/index.js";

test("exports the complete primitive API", () => {
  assert.deepEqual(Object.keys(primitives).sort(), [
    "createAriaAnnouncer",
    "createDismissableLayer",
    "createFocusTrap",
    "createPortal",
    "createRovingTabindex"
  ]);
});

test("exports callable primitive factories", () => {
  for (const factory of Object.values(primitives)) {
    assert.equal(typeof factory, "function");
  }
});

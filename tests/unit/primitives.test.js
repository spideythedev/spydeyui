import test from "node:test";
import assert from "node:assert/strict";
import * as primitives from "../../packages/primitives/src/index.js";
import { createRovingTabindex } from "../../packages/primitives/src/roving-tabindex.js";

function createElement(document, attributes = {}) {
  const values = new Map(Object.entries(attributes));
  const element = {
    nodeType: 1,
    ownerDocument: document,
    tabIndex: Number(values.get("tabindex") ?? -1),
    hasAttribute(name) {
      return values.has(name);
    },
    getAttribute(name) {
      return values.has(name) ? values.get(name) : null;
    },
    setAttribute(name, value) {
      values.set(name, String(value));
      if (name === "tabindex") this.tabIndex = Number(value);
    },
    removeAttribute(name) {
      values.delete(name);
      if (name === "tabindex") this.tabIndex = -1;
    },
    closest() {
      return null;
    },
    contains(target) {
      return target === this;
    },
    focus() {
      document.activeElement = this;
    }
  };
  return element;
}

function createContainer(items) {
  const document = { activeElement: null, defaultView: { getComputedStyle: () => ({ display: "block", visibility: "visible" }) } };
  const listeners = new Map();
  const container = {
    nodeType: 1,
    ownerDocument: document,
    querySelectorAll: () => items,
    addEventListener: (name, callback) => listeners.set(name, callback),
    removeEventListener: (name) => listeners.delete(name),
    dispatch(event) {
      listeners.get(event.type)?.(event);
    }
  };
  for (const item of items) item.ownerDocument = document;
  return { container, document, listeners };
}

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

test("roving tabindex keeps one tab stop and moves focus with arrow keys", () => {
  const items = [createElement({}), createElement({}), createElement({})];
  const { container, document } = createContainer(items);
  const roving = createRovingTabindex(container, { orientation: "horizontal" });
  let prevented = false;

  assert.deepEqual(items.map((item) => item.tabIndex), [0, -1, -1]);

  container.dispatch({
    type: "keydown",
    key: "ArrowRight",
    target: items[0],
    preventDefault() {
      prevented = true;
    }
  });

  assert.equal(prevented, true);
  assert.equal(document.activeElement, items[1]);
  assert.deepEqual(items.map((item) => item.tabIndex), [-1, 0, -1]);
  roving.destroy();
  assert.equal(container.listeners.size, 0);
});

test("roving tabindex restores original attributes on destroy", () => {
  const items = [createElement({}, { tabindex: "3" }), createElement({})];
  const { container } = createContainer(items);
  const roving = createRovingTabindex(container);

  roving.destroy();

  assert.equal(items[0].getAttribute("tabindex"), "3");
  assert.equal(items[1].getAttribute("tabindex"), null);
});

test("roving tabindex validates orientation and direction", () => {
  const { container } = createContainer([]);

  assert.throws(() => createRovingTabindex(container, { orientation: "diagonal" }), /Orientation/);
  assert.throws(() => createRovingTabindex(container, { direction: "sideways" }), /Direction/);
});

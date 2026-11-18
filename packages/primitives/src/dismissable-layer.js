const layers = new WeakMap();

function getStack(document) {
  let stack = layers.get(document);

  if (!stack) {
    stack = [];
    layers.set(document, stack);
  }

  return stack;
}

function eventIsInside(event, elements) {
  const path = event.composedPath?.() || [];
  return elements.some((element) => path.includes(element) || element.contains(event.target));
}

function handlePointerDown(event, stack) {
  const layer = stack.at(-1);
  if (!layer || eventIsInside(event, layer.elements())) return;
  layer.onInteractOutside?.(event);
  if (!event.defaultPrevented) layer.onDismiss?.("outside", event);
}

function handleKeyDown(event, stack) {
  if (event.key !== "Escape") return;
  const layer = stack.at(-1);
  if (!layer || layer.escapeKey !== true) return;
  layer.onEscapeKeyDown?.(event);
  if (event.defaultPrevented) return;
  event.preventDefault();
  layer.onDismiss?.("escape", event);
}

export function createDismissableLayer(options = {}) {
  const document = options.document || globalThis.document;

  if (!document?.addEventListener) {
    throw new Error("A document is required to create a dismissable layer.");
  }

  const stack = getStack(document);
  const layer = {
    escapeKey: options.escapeKey !== false,
    elements: () => [options.element, ...(options.branches || [])].filter(Boolean),
    onDismiss: options.onDismiss,
    onInteractOutside: options.onInteractOutside,
    onEscapeKeyDown: options.onEscapeKeyDown
  };

  if (stack.length === 0) {
    document.addEventListener("pointerdown", (event) => handlePointerDown(event, stack), true);
    document.addEventListener("keydown", (event) => handleKeyDown(event, stack), true);
  }

  stack.push(layer);
  let active = true;

  return {
    dismiss(reason = "programmatic", event = null) {
      if (active) layer.onDismiss?.(reason, event);
    },
    destroy() {
      if (!active) return;
      active = false;
      const index = stack.indexOf(layer);
      if (index !== -1) stack.splice(index, 1);
    },
    get active() {
      return active;
    }
  };
}

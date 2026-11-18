export function createPortal(content, options = {}) {
  const document = options.document || globalThis.document;

  if (!document?.createElement) {
    throw new Error("A document is required to create a portal.");
  }

  const target = options.target || document.body;

  if (!target?.appendChild) {
    throw new TypeError("The portal target must be a DOM element.");
  }

  const element = options.container || document.createElement("div");

  if (options.className) element.className = options.className;
  if (options.attributes) {
    for (const [name, value] of Object.entries(options.attributes)) {
      if (value !== null && value !== undefined) {
        element.setAttribute(name, String(value));
      }
    }
  }

  if (content && typeof content === "object" && "nodeType" in content) {
    element.append(content);
  } else if (content !== null && content !== undefined) {
    element.textContent = String(content);
  }

  target.append(element);

  let mounted = true;

  return {
    element,
    destroy() {
      if (!mounted) return;
      mounted = false;
      element.remove();
    }
  };
}

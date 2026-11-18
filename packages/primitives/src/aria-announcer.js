const regions = new WeakMap();

function createRegion(document, target) {
  const element = document.createElement("div");
  element.setAttribute("aria-live", "polite");
  element.setAttribute("aria-atomic", "true");
  element.setAttribute("role", "status");
  element.setAttribute("data-spydeyui-announcer", "");
  Object.assign(element.style, {
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    border: "0"
  });
  target.append(element);
  return element;
}

export function createAriaAnnouncer(options = {}) {
  const document = options.document || globalThis.document;

  if (!document?.createElement) {
    throw new Error("A document is required to create an announcer.");
  }

  let entry = regions.get(document);

  if (!entry || !entry.element.isConnected) {
    entry = {
      element: createRegion(document, options.target || document.body),
      references: 0
    };
    regions.set(document, entry);
  }

  entry.references += 1;
  let active = true;

  return {
    announce(message, settings = {}) {
      if (!active) return;
      entry.element.setAttribute("aria-live", settings.priority === "assertive" ? "assertive" : "polite");
      entry.element.setAttribute("role", settings.priority === "assertive" ? "alert" : "status");
      entry.element.textContent = "";
      queueMicrotask(() => {
        if (active && entry.element.isConnected) {
          entry.element.textContent = String(message ?? "");
        }
      });
    },
    clear() {
      if (active) entry.element.textContent = "";
    },
    destroy() {
      if (!active) return;
      active = false;
      entry.references -= 1;
      if (entry.references === 0) {
        entry.element.remove();
        regions.delete(document);
      }
    },
    element: entry.element
  };
}

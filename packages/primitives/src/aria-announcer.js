const regions = new WeakMap();

export function createAriaAnnouncer(options = {}) {
  const document = options.document || globalThis.document;

  if (!document?.createElement) {
    throw new Error("A document is required to create an announcer.");
  }

  let region = regions.get(document);

  if (!region || !region.isConnected) {
    region = document.createElement("div");
    region.setAttribute("aria-live", "polite");
    region.setAttribute("aria-atomic", "true");
    region.setAttribute("role", "status");
    region.setAttribute("data-spydeyui-announcer", "");
    Object.assign(region.style, {
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
    (options.target || document.body).append(region);
    regions.set(document, region);
  }

  return {
    announce(message, settings = {}) {
      region.setAttribute("aria-live", settings.priority === "assertive" ? "assertive" : "polite");
      region.setAttribute("role", settings.priority === "assertive" ? "alert" : "status");
      region.textContent = "";
      queueMicrotask(() => {
        if (region.isConnected) region.textContent = String(message ?? "");
      });
    },
    clear() {
      region.textContent = "";
    },
    destroy() {
      if (regions.get(document) !== region) return;
      region.remove();
      regions.delete(document);
    },
    element: region
  };
}

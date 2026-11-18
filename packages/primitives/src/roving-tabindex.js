const ITEM_SELECTOR = "[data-roving-item], [role='menuitem'], [role='option'], [role='tab'], [role='radio']";

export function createRovingTabindex(container, options = {}) {
  if (!container || container.nodeType !== 1) {
    throw new TypeError("Roving tabindex requires a valid container element.");
  }

  const orientation = options.orientation || "both";
  const loop = options.loop !== false;
  const direction = options.direction || "ltr";

  if (!["horizontal", "vertical", "both"].includes(orientation)) {
    throw new TypeError("Orientation must be horizontal, vertical or both.");
  }

  if (!["ltr", "rtl"].includes(direction)) {
    throw new TypeError("Direction must be ltr or rtl.");
  }

  const originalTabindex = new Map();
  let items = [];
  let currentItem = null;

  const isAvailable = (item) => {
    const style = container.ownerDocument.defaultView?.getComputedStyle(item);
    return !item.hasAttribute("disabled") &&
      item.getAttribute("aria-disabled") !== "true" &&
      !item.closest("[hidden], [inert], [aria-hidden='true']") &&
      style?.display !== "none" &&
      style?.visibility !== "hidden";
  };

  const refresh = () => {
    const nextItems = [...container.querySelectorAll(options.selector || ITEM_SELECTOR)].filter(isAvailable);

    for (const item of nextItems) {
      if (!originalTabindex.has(item)) {
        originalTabindex.set(item, item.getAttribute("tabindex"));
      }
    }

    items = nextItems;
    const active = items.find((item) => item === container.ownerDocument.activeElement);
    const current = items.find((item) => item === currentItem);
    const tabbable = items.find((item) => item.tabIndex === 0);
    currentItem = active || current || tabbable || items[0] || null;

    items.forEach((item) => {
      item.tabIndex = item === currentItem ? 0 : -1;
    });
  };

  const focusAt = (index) => {
    if (!items.length) return;

    const nextIndex = loop
      ? (index + items.length) % items.length
      : Math.max(0, Math.min(index, items.length - 1));

    currentItem = items[nextIndex];
    items.forEach((item) => {
      item.tabIndex = item === currentItem ? 0 : -1;
    });
    currentItem.focus();
  };

  const handleKeydown = (event) => {
    const target = items.find((item) => item === event.target || item.contains(event.target));
    const index = items.indexOf(target);
    if (index < 0 || event.altKey || event.ctrlKey || event.metaKey) return;

    let next = index;
    const previousKey = direction === "rtl" ? "ArrowRight" : "ArrowLeft";
    const nextKey = direction === "rtl" ? "ArrowLeft" : "ArrowRight";

    if ((orientation === "horizontal" || orientation === "both") && event.key === nextKey) {
      next += 1;
    } else if ((orientation === "horizontal" || orientation === "both") && event.key === previousKey) {
      next -= 1;
    } else if ((orientation === "vertical" || orientation === "both") && event.key === "ArrowDown") {
      next += 1;
    } else if ((orientation === "vertical" || orientation === "both") && event.key === "ArrowUp") {
      next -= 1;
    } else if (event.key === "Home") {
      next = 0;
    } else if (event.key === "End") {
      next = items.length - 1;
    } else {
      return;
    }

    event.preventDefault();
    focusAt(next);
  };

  refresh();
  container.addEventListener("keydown", handleKeydown);

  return {
    refresh,
    focusAt,
    destroy() {
      container.removeEventListener("keydown", handleKeydown);
      for (const [item, tabindex] of originalTabindex) {
        if (tabindex === null) item.removeAttribute("tabindex");
        else item.setAttribute("tabindex", tabindex);
      }
      originalTabindex.clear();
      items = [];
      currentItem = null;
    }
  };
}

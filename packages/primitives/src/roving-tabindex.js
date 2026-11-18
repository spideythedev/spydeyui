const ITEM_SELECTOR = "[data-roving-item], [role='menuitem'], [role='option'], [role='tab'], [role='radio']";

export function createRovingTabindex(container, options = {}) {
  if (!(container instanceof Element)) {
    throw new TypeError("Roving tabindex requires a valid container element.");
  }

  const orientation = options.orientation || "both";
  const loop = options.loop !== false;
  const direction = options.direction || "ltr";
  let items = [];
  let currentIndex = 0;

  const refresh = () => {
    items = [...container.querySelectorAll(options.selector || ITEM_SELECTOR)].filter((item) => {
      return !item.hasAttribute("disabled") &&
        item.getAttribute("aria-disabled") !== "true" &&
        item.getAttribute("hidden") === null;
    });

    const selected = items.findIndex((item) => item === container.ownerDocument.activeElement);
    const current = items.findIndex((item) => item.tabIndex === 0);
    currentIndex = selected >= 0 ? selected : Math.max(0, current);
    items.forEach((item, index) => {
      item.tabIndex = index === currentIndex ? 0 : -1;
    });
  };

  const focusAt = (index) => {
    if (!items.length) return;
    currentIndex = loop
      ? (index + items.length) % items.length
      : Math.max(0, Math.min(index, items.length - 1));
    items.forEach((item, itemIndex) => {
      item.tabIndex = itemIndex === currentIndex ? 0 : -1;
    });
    items[currentIndex].focus();
  };

  const handleKeydown = (event) => {
    const index = items.indexOf(event.target);
    if (index < 0) return;

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
      items.forEach((item) => {
        item.tabIndex = 0;
      });
    }
  };
}

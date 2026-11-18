const FOCUSABLE = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled]):not([type='hidden'])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "summary",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

export function createFocusTrap(container, options = {}) {
  if (!container || container.nodeType !== 1) {
    throw new TypeError("A focus trap requires a valid container element.");
  }

  const document = container.ownerDocument;
  const previous = document.activeElement;
  const initialFocus = options.initialFocus;
  const fallback = options.fallbackFocus || container;
  const fallbackTabindex = fallback.getAttribute("tabindex");
  let active = false;

  if (fallback !== container && !container.contains(fallback)) {
    throw new TypeError("The fallback focus target must be inside the trap.");
  }

  const getFocusable = () => [...container.querySelectorAll(FOCUSABLE)].filter((element) => {
    const style = document.defaultView?.getComputedStyle(element);
    return !element.hasAttribute("hidden") &&
      element.getAttribute("aria-hidden") !== "true" &&
      !element.closest("[hidden], [inert], [aria-hidden='true']") &&
      style?.visibility !== "hidden" &&
      style?.display !== "none" &&
      element.getClientRects().length > 0;
  });

  const focus = (element) => {
    if (element && typeof element.focus === "function") {
      element.focus({ preventScroll: true });
    }
  };

  const handleKeydown = (event) => {
    if (!active || event.key !== "Tab") return;

    const elements = getFocusable();
    const first = elements[0];
    const last = elements[elements.length - 1];
    const current = document.activeElement;

    if (!first) {
      event.preventDefault();
      focus(fallback);
      return;
    }

    if (event.shiftKey && (current === first || !container.contains(current))) {
      event.preventDefault();
      focus(last);
    } else if (!event.shiftKey && (current === last || !container.contains(current))) {
      event.preventDefault();
      focus(first);
    }
  };

  const handleFocusin = (event) => {
    if (active && !container.contains(event.target)) {
      focus(getFocusable()[0] || fallback);
    }
  };

  const activate = () => {
    if (active) return;
    if (!fallback.hasAttribute("tabindex")) fallback.setAttribute("tabindex", "-1");
    active = true;
    document.addEventListener("keydown", handleKeydown, true);
    document.addEventListener("focusin", handleFocusin, true);
    const target = typeof initialFocus === "function"
      ? initialFocus()
      : initialFocus || getFocusable()[0] || fallback;
    focus(target);
  };

  const deactivate = ({ restoreFocus = true } = {}) => {
    if (!active) return;
    active = false;
    document.removeEventListener("keydown", handleKeydown, true);
    document.removeEventListener("focusin", handleFocusin, true);
    if (restoreFocus && previous?.isConnected) focus(previous);
    if (fallbackTabindex === null) fallback.removeAttribute("tabindex");
    else fallback.setAttribute("tabindex", fallbackTabindex);
  };

  activate();

  return {
    activate,
    deactivate,
    get active() {
      return active;
    },
    refresh() {
      if (active && !container.contains(document.activeElement)) {
        focus(getFocusable()[0] || fallback);
      }
    }
  };
}

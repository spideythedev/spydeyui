# Accessibility primitives

The primitives package contains small browser-native helpers. It has no runtime dependencies and does not impose a component model.

## Install

```sh
pnpm add @spydeyui/primitives
```

## Focus trap

Use a focus trap while a modal surface is open. The previously focused element is restored when the trap is deactivated.

```js
import { createFocusTrap } from "@spydeyui/primitives/focus-trap";

const trap = createFocusTrap(document.querySelector("[data-dialog]"));

trap.deactivate();
trap.activate();
trap.deactivate({ restoreFocus: false });
```

The container or fallback target receives a temporary `tabindex="-1"` when needed. Call `refresh()` after changing the contents if focus has moved outside the container.

## Portal

Mount content outside its current DOM parent and remove the portal when it is no longer needed.

```js
import { createPortal } from "@spydeyui/primitives/portal";

const portal = createPortal(document.createElement("div"), {
  className: "sy-overlay",
  attributes: {
    "data-state": "open"
  }
});

portal.destroy();
```

## Dismissable layer

Only the topmost registered layer responds to outside pointer interaction and Escape. Call `destroy()` when the layer is removed.

```js
import { createDismissableLayer } from "@spydeyui/primitives/dismissable-layer";

const layer = createDismissableLayer({
  element: document.querySelector("[data-popover]"),
  onDismiss(reason) {
    closePopover(reason);
  }
});

layer.destroy();
```

Use `onInteractOutside` to inspect or cancel outside interactions. Calling `event.preventDefault()` prevents the automatic dismissal for that interaction.

## Roving tabindex

Use roving tabindex for composite widgets such as tabs, menus and radio groups. Items are selected with the default selector or a custom selector.

```js
import { createRovingTabindex } from "@spydeyui/primitives/roving-tabindex";

const tabs = createRovingTabindex(document.querySelector("[role='tablist']"), {
  orientation: "horizontal",
  direction: "ltr",
  loop: true
});

tabs.refresh();
tabs.destroy();
```

Supported keys are the orientation-appropriate arrow keys, Home and End. Disabled items are skipped.

## ARIA announcer

Share one visually hidden live region per document to announce dynamic updates.

```js
import { createAriaAnnouncer } from "@spydeyui/primitives/aria-announcer";

const announcer = createAriaAnnouncer();

announcer.announce("Changes saved");
announcer.announce("Connection lost", { priority: "assertive" });
announcer.clear();
```

The announcer uses a polite status region by default and switches to an assertive alert for urgent messages.

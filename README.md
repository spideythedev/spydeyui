# SpydeYUI

A lightweight, accessible UI foundation built on the native web platform.

SpydeYUI is an open-source interface system for teams that want deliberate design foundations without unnecessary runtime weight. It starts with design tokens and framework-independent CSS, then grows through small, composable packages.

## Principles

- Native HTML, CSS and JavaScript first
- No runtime dependency in the foundation
- Accessible interaction patterns
- Explicit, composable design tokens
- Dark, light and high-contrast themes
- Framework adapters that stay close to their host framework

## Project status

SpydeYUI is in active foundation work. Public APIs are not stable yet. The foundation includes generated design tokens, framework-independent CSS, and browser-native accessibility primitives. Public APIs are not stable yet.

## Development

Use Node.js 24 LTS and pnpm 12.

```sh
pnpm install
pnpm build:tokens
pnpm lint
pnpm test
```

## Packages

| Package | Purpose |
| --- | --- |
| `@spydeyui/tokens` | Shared design tokens and theme styles |
| `@spydeyui/core` | Framework-independent CSS foundation |
| `@spydeyui/primitives` | Dependency-free accessibility and interaction utilities |

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

## Accessibility primitives

The primitives package provides focus management, portals, dismissable layers, roving tabindex and live announcements. See [the primitives guide](packages/primitives/README.md) for API usage.

## Using the core styles

Install the packages in your application:

```sh
pnpm add @spydeyui/core @spydeyui/tokens
```

Import the complete foundation once in your application entry stylesheet:

```css
@import "@spydeyui/core/css";
```

Use the component classes with native HTML:

```html
<button class="sy-button">Continue</button>
<button class="sy-button sy-button--secondary">Cancel</button>

<span class="sy-badge sy-badge--success">Available</span>

<label class="sy-field">
  <span class="sy-label">Email</span>
  <input class="sy-input" type="email" autocomplete="email">
</label>

<section class="sy-card">
  <header class="sy-card-header">
    <h2 class="sy-card-title">Account</h2>
  </header>
  <div class="sy-card-content">
    Your account details are ready.
  </div>
</section>
```

## Themes

Set the theme on the document root:

```html
<html lang="en" data-theme="daylight">
```

Available themes are `obsidian`, `daylight` and `high-contrast`. Obsidian is the default.

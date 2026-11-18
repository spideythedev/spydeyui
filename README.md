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

SpydeYUI is in active foundation work. Public APIs are not stable yet. The first milestone establishes workspace conventions, design tokens and the core CSS layer.

## Development

Use Node.js 20 or newer and pnpm 9 or newer.

```sh
pnpm install
pnpm lint
```

## Packages

| Package | Purpose |
| --- | --- |
| `@spydeyui/tokens` | Shared design tokens and theme styles |
| `@spydeyui/core` | Framework-independent CSS foundation |

## Contributing

Read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

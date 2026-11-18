# Contributing

Thanks for taking an interest in SpydeYUI.

## Before you start

Check existing issues and discussions before starting substantial work. For larger changes, open an issue first so the direction can be agreed on before implementation.

## Development setup

Use Node.js 24 LTS and pnpm 12.

```sh
pnpm install
pnpm lint
```

## Pull requests

- Keep changes focused and explain the user-facing reason.
- Include tests for behavior changes.
- Check keyboard interaction and accessible names when changing interactive components.
- Avoid adding dependencies unless the project genuinely needs them.
- Do not add comments to source, configuration or style files.
- Use Conventional Commits, for example `feat(core): add button styles` or `fix(tokens): correct contrast values`.

## Design decisions

Prefer native platform features over custom runtime code. Keep packages independently usable and avoid coupling the core stylesheet to a framework.

# Contributing to Meteor Client

👋 Hey, thanks for wanting to improve Meteor Client! Any contribution is welcome and appreciated!

---

## Before contributing

The goal of Meteor Client is to make developers work faster and stay up to date with their git workflow by providing accurate data, filters, and more. It is focused on receiving and managing notifications. I'm trying to make the UI more intuitive and easier to use in order to provide the best possible experience.

### Tech Stack

- UI → [shadcn/ui](https://ui.shadcn.com/) + [Tailwind CSS](https://tailwindcss.com/)
- Framework → [Nextjs](https://nextjs.org/)
- Langage → [Typescript](https://www.typescriptlang.org/)
- Desktop app → [Tauri](https://tauri.app/)
- Deployment → [Vercel](https://vercel.com)
- Package manager → [pnpm](https://pnpm.io/)

## How to contribute

### Feature request

If you are using Meteor Client and are missing a feature that you would find helpful, please create an issue. Others may also find it missing.

### Reporting bugs

If you hit a bug, you should first check if it's not already reported in the issues, and if not, please create an issue or contact me on Twitter.

### Running locally

#### Desktop app

> **Note**: Skip this if you don't want to work on the native app

Just follow the [Tauri prerequisites](https://tauri.app/v1/guides/getting-started/prerequisites).

#### Frontend

Just install dependencies:

```bash
pnpm install
```

Finally, run `pnpm dev` or `pnpm dev:tauri` to start the dev server!

## Styleguides

- PR names should follow the [conventionnal commits](https://www.conventionalcommits.org/en/v1.0.0/) guidelines.
- Code should be valid for Eslint and Prettier.

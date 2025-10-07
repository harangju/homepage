# Homepage

This repository hosts a minimal personal site built with React and Bun.

## Requirements
- Install [bun](https://bun.com).

## Setup
1. Fork this repo and `cd` into it.
2. Run `bun install` to pull dependencies.
3. Run `bun run dev` to run the server at http://localhost:3000.

## Customize
- Update the text in `src/App.tsx` to reflect your bio or links.
- Adjust styles in `src/index.css` if you want different colors or spacing.
- Swap icons or social urls in `src/utils/icons.tsx`.

## Deploy
- Deploy anywhere that can host static files:
    - Run `bun run build` to create a production bundle.
    - Run `bun run serve` to serve the built site.
- Deploy on Firebase for free:
    - Create a [Firebase](https://console.firebase.google.com/) project.
    - Set up the [CLI](https://firebase.google.com/docs/cli).
    - Update your project name in `.firebaserc`.
    - Run `bun run deploy` to build and deploy.

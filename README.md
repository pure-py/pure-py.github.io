# PurePy website

The PurePy project site, built with SvelteKit and `adapter-static` (deployed to GitHub Pages).

## Development setup

The site pins one version of the reference implementation and specification in `.purepy-version`. The `dev` and `build` commands use `uv` to install the reference implementation before starting, so setup needs only the Node dependencies:

```bash
yarn install
```

## Development

```bash
yarn dev      # local dev server
yarn build    # static output in build/
```

## Branding

The logo is a placeholder wordmark (`PurePy` in the header / `static/favicon.svg`); drop in the real logo and swap the `.brand` text for an `<img>` when available.

## Structure

The layout is single-page for now; routes are structured to grow into an online specification, examples, and tutorial.

## Script reference

```bash
yarn install          # install dependencies

yarn dev              # local dev server
yarn dev:anonymous    # local dev server in anonymous mode

yarn build            # static output in `build/`
yarn build:anonymous  # static output in `build/` in anonymous mode

yarn preview          # preview the built static output

yarn check            # sync SvelteKit and run TypeScript/Svelte checks

yarn lint             # check formatting with Prettier and lint with ESLint
yarn format           # format the codebase with Prettier
```

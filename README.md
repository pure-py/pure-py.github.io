# PurePy website

The PurePy project site, built with SvelteKit and `adapter-static` (deployed to GitHub Pages).

## Development setup

This repository includes the [`pure-py-spec`](https://github.com/pure-py/pure-py-spec) reference type checker as a Git submodule.

After cloning, initialise the submodule with shallow history and install dependencies:

```bash
yarn setup
```

Or run the steps manually:

```bash
git submodule update --init --depth 1
yarn install
```

## Development

```bash
yarn dev      # local dev server
yarn build    # static output in build/
```

## Updating the submodule

To update `pure-py-spec` to the latest tagged release:

```bash
yarn submodule:update
```

Then commit the updated submodule pointer:

```bash
git add pure-py-spec
git commit -m "Pin pure-py-spec submodule to $(git -C pure-py-spec describe --tags --abbrev=0)"
```

To update it manually to a specific release:

```bash
cd pure-py-spec
git checkout v1.2.3
cd ..

git add pure-py-spec
git commit -m "Pin pure-py-spec to v1.2.3"
```

The parent repository records the exact submodule commit, so contributors and CI always use the same version.

## Branding

The logo is a placeholder wordmark (`PurePy` in the header / `static/favicon.svg`); drop in the real logo and swap the `.brand` text for an `<img>` when available.

## Structure

The layout is single-page for now; routes are structured to grow into an online specification, examples, and tutorial.

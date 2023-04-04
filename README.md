# React scatterplot component for large datasets

This is a customizable React component library for scatterplots. Unlike many other charting libraries out there, the `<Scatterplot/>` component can handle tens of thousands of datapoints without any problems or significant lag. This is made possible by using WebGL (React Three Fiber) under the hood instead of `canvas` or `SVG` elements (like virtually all popular charting libraries do).
If you happen to know of any (free!) charting library that can handle large datasets (and includes scatterplots) please let me know! I implemented this only because even after a lot of searching I couldn't find anything online.

## Install library in your own project

Note: throughout this README I assume that you use `yarn` as your package manager. If you use `npm` or `pnpm` just look up the equivalent commands online.

1. run `yarn add @sejmou/react-big-dataset-scatterplot`
2. import the CSS styles required for the component to render properly in the entrypoint of your app (usually `main.tsx`) by adding the line `import 'react-big-dataset-scatterplot/dist/styles.css';`

## Demo

I have put together an example React (Vite) app that uses this library with a considerably large example dataset of Spotify songs (roughly 30k rows). The code can be found in the `lib-usage-demo` folder.

To install it locally, navigate to the folder and run `yarn` followed by `yarn dev`.

## Acknowledgements

[This](https://observablehq.com/@grantcuster/using-three-js-for-2d-data-visualization) awesome tutorial by Grant Custer on Observable helped me get started with implementation. However, quite a bit of additional work was required to get things working in React.

Creating a proper React library (and downloadable NPM package) was even more time-consuming and quite a bit of a pain 😅

I turned this into a library with the help of TSDX, a project whose intention is to make the setup of the codebase for JavaScript/TypeScript libraries easier (including React component libraries). Unfortunately it is no longer maintained and a bunch of stuff does not work properly anymore (gotta love Web Dev - things get "outdated" soo quickly lol), forcing me to find hacks to work around it. Maybe for my next project I should rather create everything from scratch - then I would at least understand more of what's going on under the hood. Alternatively, I might some day migrate to TurboRepo, which could apparently also be used for projects like this one.

I followed [this](https://zach.codes/build-your-own-flexible-component-library-using-tsdx-typescript-tailwind-css-headless-ui/) tutorial to get Tailwind CSS working inside my project. Maybe it might be useful to you for your own work, too.

## Open features

 * axis tick rotation (not as simple as expected to implement)

## Known bugs

 * broken zoom after window/canvas resize

## Development

TSDX scaffolds new libraries inside `/src`. I have also set up a Vite App using my library inside `lib-usage-example`.

The recommended workflow is to run TSDX in one terminal:

```bash
yarn start
```

This builds to `/dist` and runs the project in watch mode so any edits you save inside `src` causes a rebuild to `/dist`.

Then, run either Storybook or the library usage example app:

### Option a): Storybook

Run inside another terminal:

```bash
yarn storybook
```

This loads the stories from `./stories`.

> NOTE: Stories should reference the components as if using the library, similar to the example playground. This means importing from the root project directory. This has been aliased in the tsconfig and the storybook webpack config as a helper.

### Option b): Using example app
Run the following inside the terminal:

```bash
cd lib-usage-demo
yarn # install dependencies
yarn start
```

The example app uses React 18.

Out of the box, the app will not work as `react-big-dataset-scatterplot` is not included in the `package.json` (for deployment it would need to be added by running `yarn add react-big-dataset-scatterplot`). Instead it is meant to be used during development with the current version of the package (from the `dist` folder in the root directory). For this to work, we need to link the package like this:

1. Switch to the parent directory and run `yarn link` there.
2. Go back to the example app directory and run `yarn link react-big-dataset-scatterplot`. 

yarn should from now on use a symlink for the library during development, which means that always automatically the most recent version is used without having to run `yarn` on every change to the library package.

Additional note: The line `import 'react-big-dataset-scatterplot/dist/tailwind.css';` inside `main.tsx` is important! If this is not included Tailwind styles used by the library are not applied (or in this case, any Tailwind class that is not already used in the rest of the app does NOT work).

## Building

`yarn build`

## Testing

`yarn test`

Jest tests are theoretically set up by TSDX to run with `yarn test`. I don't use tests though :)

## Other stuff that might be good to know

### Bundle analysis

Calculates the real cost of your library using [size-limit](https://github.com/ai/size-limit) with `yarn size` and visualize it with `yarn analyze`.

### Rollup

TSDX uses [Rollup](https://rollupjs.org) as a bundler and generates multiple rollup configs for various module formats and build settings. See [Optimizations](#optimizations) for details.

### TypeScript

`tsconfig.json` is set up to interpret `dom` and `esnext` types, as well as `react` for `jsx`. I have adjusted it according to my needs.

## Continuous Integration

### GitHub Actions

Two actions were added by TSDX by default:

- `main` which installs deps w/ cache, lints, tests, and builds on all pushes against a Node and OS matrix (changed that a bit, removing Node 14 as it is close to end of life anyway)
- `size` which comments cost comparison of your library on every pull request using [size-limit](https://github.com/ai/size-limit)

## Optimizations

Please see the main `tsdx` [optimizations docs](https://github.com/palmerhq/tsdx#optimizations). In particular, know that you can take advantage of development-only optimizations:

```js
// ./types/index.d.ts
declare var __DEV__: boolean;

// inside your code...
if (__DEV__) {
  console.log('foo');
}
```

You can also choose to install and use [invariant](https://github.com/palmerhq/tsdx#invariant) and [warning](https://github.com/palmerhq/tsdx#warning) functions.

## Module Formats

CJS, ESModules, and UMD module formats are supported.

The appropriate paths should be configured in `package.json` and `dist/index.js` accordingly. If any issues come up I will have to find a solution myself as the TSDX is not maintained anymore lol

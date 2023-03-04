# Scatterplot for large-scale data
This is a React component library for scatterplots using large-scale datasets. The `<Scatterplot/>` component can handle 30k datapoints without any problems or significant lag. This is made possible by using WebGL (React Three Fiber) under the hood.

For publishing this component as a library, I made use of TSDX and then made some changes to make things work for my project. Check out [this](https://zach.codes/build-your-own-flexible-component-library-using-tsdx-typescript-tailwind-css-headless-ui/) tutorial for a more structured guide on setting up a React component library yourself.

## Install library as a user
In your project, run
`yarn add @sejmou/react-large-scale-data-scatterplot` OR `npm install @sejmou/react-large-scale-data-scatterplot`

## Demo
A demo of how this component could be used in a React application can be found in the `lib-usage-demo` folder. Just navigate to that directory. Then, run

`yarn` followed by `yarn dev` OR `npm install` followed by `npm run dev`


## TSDX
This library was created with the help of TSDX, a project whose intention is to make the setup of the codebase for JavaScript/TypeScript libraries easier (including React component libraries). Unfortunately it is no longer maintained and a bunch of stuff does not work properly anymore, forcing me to find hacks to work around it. Maybe for my next project I should rather create everything from scratch - then I would at least understand more of what's going on under the hood lol

> NOTE: The following text is mainly copied/adapted from the original README created by TSDX:

## Development Workflow

TSDX scaffolds new libraries inside `/src`. I have also set up a Vite App using my library inside `lib-usage-example`.

The recommended workflow is to run TSDX in one terminal:

```bash
npm start # or yarn start
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

### Option b): Library usage example app
Run the following inside the terminal:

```bash
cd lib-usage-demo
npm i # or yarn to install dependencies
npm start # or yarn start
```

If you check the `package.json`, you will notice that a certain version of the library is listed as a dependency and the component is also imported and used in the app.

TODO: make this work with whatever is currently in `dist` instead to speed up development workflow (this is also kinda what tsdx did by default - but the example app was configured differently, not using Vite among other things).

To do a one-off build, use `npm run build` or `yarn build`.

To run tests, use `npm test` or `yarn test`.

### Jest

Jest tests are theoretically set up by TSDX to run with `npm test` or `yarn test`. None have been implemented yet though, so no idea whether it would work :)

### Bundle analysis

Calculates the real cost of your library using [size-limit](https://github.com/ai/size-limit) with `npm run size` and visulize it with `npm run analyze`.

### Rollup

TSDX uses [Rollup](https://rollupjs.org) as a bundler and generates multiple rollup configs for various module formats and build settings. See [Optimizations](#optimizations) for details.

### TypeScript

`tsconfig.json` is set up to interpret `dom` and `esnext` types, as well as `react` for `jsx`. I have adjusted it according to my needs.

## Continuous Integration

### GitHub Actions

Two actions are added by default:

- `main` which installs deps w/ cache, lints, tests, and builds on all pushes against a Node and OS matrix
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

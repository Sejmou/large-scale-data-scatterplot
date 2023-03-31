# Scatterplot usage example app
This example app uses React 18.

Out of the box, the app will not work as `react-big-dataset-scatterplot` is not included in the `package.json` (for deployment it would need to be added by running `yarn add react-big-dataset-scatterplot`). Instead it is meant to be used during development with the current version of the package (from the `dist` folder in the root directory of this repo). For this to work, we need to link the package like this:

1. Switch to the parent directory and run `yarn link` there.
2. Go back to the example app directory and run `yarn link react-big-dataset-scatterplot`. 

yarn should from now on use a symlink for the library during development, which means that always automatically the most recent version is used without having to run `yarn` on every change to the library package.

Additional note: The line `import 'react-big-dataset-scatterplot/dist/tailwind.css';` inside `main.tsx` is important! If this is not included Tailwind styles used by the library are not applied (or in this case, any Tailwind class that is not already used in the rest of the app does NOT work).
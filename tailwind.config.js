/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './stories/*'],
  theme: {
    extend: {},
  },
  plugins: [],
  // TODO: consider adding prefix to avoid style conflicts with existing CSS of applications consuming this library
  // - currently not implemented as I couldn't find easy way to use regular tailwind class names and add prefixes during build which would be most convenient
  //prefix: 'react-big-data-scatterplot-',
};

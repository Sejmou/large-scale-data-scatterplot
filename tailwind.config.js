/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}', './stories/*'],
  theme: {
    extend: {},
  },
  plugins: [],
  // TODO: add prefix to avoid style conflicts with existing CSS of applications consuming this library
  // prefix: 'rbdsc-',
};

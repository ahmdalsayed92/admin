/* your tailwind.config.js file */

module.exports = {
  content: ["./src/**/*.{html,js}"],
  future: {
    hoverOnlyWhenSupported: false,
  },
  theme: {
    extend: {},
  },
  plugins: [
    require("@aegov/design-system"),
    require("@tailwindcss/typography"),
    require("@tailwindcss/forms"),
  ],
};

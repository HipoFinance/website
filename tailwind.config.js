const defaultTheme = require("tailwindcss/defaultTheme");
const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./*.{html,js}", "./index.html"],
  theme: {
    screens: {
      sm: "640px",
      // => @media (min-width: 640px) { ... }

      md: "768px",
      // => @media (min-width: 768px) { ... }

      lg: "1024px",
      // => @media (min-width: 1024px) { ... }

      xl: "1200px",
      "7xl": "1200px",
      // => @media (min-width: 1280px) { ... }

      // '2xl': '1920px',
      // '3xl': '2560px',
      // => @media (min-width: 1536px) { ... }
    },
    colors: {
      primaryBrown: "#776464",
      primaryOrange: "#FF7E73",
      secondaryOrange: "#ffbeb9",
      primaryBlue: "#0088CC",
      primaryGrey: "#EFEBE5",
      secondaryGrey: "#77646433",
      white: "#FFFFFF",
    },
    extend: {
      fontFamily: {
        sans: ['"Poppins"', ...defaultTheme.fontFamily.sans],
        display: ['"Poppins"', ...defaultTheme.fontFamily.sans],
        mono: ['"Eczar"', ...defaultTheme.fontFamily.sans],
      },
      backgroundImage: {
        "hero-pattern": "url('./images/logo_hipo.png')",
      },
    },
  },
  plugins: [],
};

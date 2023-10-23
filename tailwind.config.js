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
      tertiaryOrange: "#FFF6FF",
      primaryBlue: "#0088CC",
      primaryGrey: "#EFEBE5",
      secondaryGrey: "#77646433",
      tertiaryGrey: "#776464",
      fourthGrey: "rgba(119, 100, 100, 0.6)",
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
      keyframes: {
        fadeIn: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
        fadeOut: {
          "0%": { opacity: 1 },
          "100%": { opacity: 0 },
        },
      },
      animation: {
        fadeIn: "fadeIn 1s cubic-bezier(0, 0, 0.2, 1) 0s 1 both",
        fadeInMenu: "fadeIn 0.2s cubic-bezier(0, 0, 0.2, 1) 0s 1 both",
        fadeOutMenu: "fadeOut 0.6s cubic-bezier(0, 0, 0.2, 1) 0s 1 both",
      },
      boxShadow: {
        first: "0px 4px 8px 2px rgba(0, 0, 0, 0.2), 0 6px 20px 0 #FFF6FF",
      },
    },
  },
  plugins: [],
};

import { defineConfig } from "astro/config";
import tailwind from "@tailwindcss/vite";

export default defineConfig({
  site: "https://hipo.finance",

  base: "/",

  output: "static",

  vite: {
    plugins: [tailwind()],
  },
});

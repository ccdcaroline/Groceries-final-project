import { defineConfig } from "vite";
import { resolve } from "path";
 
export default defineConfig({
  appType: "mpa",
  build: {
    rollupOptions: {
      input: {
        index: resolve(__dirname, "index.html"),
        pantry: resolve(__dirname, "pantry.html"),
        mealIdeas: resolve(__dirname, "meal-ideas.html")
      }
    }
  }
});
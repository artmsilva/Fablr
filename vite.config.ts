import path from "node:path";
import { defineConfig } from "vite";
import { importMapPlugin } from "./plugins/import-map-plugin";

const projectRoot = __dirname;

export default defineConfig(() => {
  return {
    root: path.resolve(projectRoot, "src"),
    publicDir: path.resolve(projectRoot, "public"),
    base: process.env.FABLE_BASE_PATH || "/",
    plugins: [importMapPlugin({ rootDir: projectRoot })],
    build: {
      outDir: path.resolve(projectRoot, "dist"),
      emptyOutDir: true,
    },
    server: {
      port: Number(process.env.PORT) || 3000,
      host: true,
    },
  };
});

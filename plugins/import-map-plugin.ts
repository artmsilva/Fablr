import { promises as fs } from "node:fs";
import path from "node:path";
import type { Alias, Plugin } from "vite";

interface ImportMapPluginOptions {
  mapFile?: string;
  rootDir?: string;
}

interface ImportMap {
  imports?: Record<string, string>;
}

const escapeRegex = (value: string): string =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const resolveTarget = (target: string, projectRoot: string): string | null => {
  if (target.startsWith("./")) {
    return path.resolve(projectRoot, "src", target.slice(2));
  }
  if (target.startsWith("../")) {
    return path.resolve(projectRoot, target);
  }
  if (target.startsWith("/")) {
    return path.resolve(projectRoot, target.slice(1));
  }
  // Non-local (e.g., https) – let Vite handle normally
  return null;
};

const toPosix = (value: string): string => value.split(path.sep).join("/");

const buildAliasEntries = (
  imports: Record<string, string> = {},
  projectRoot: string,
): Alias[] => {
  const dirAliases: Alias[] = [];
  const fileAliases: Alias[] = [];

  for (const [specifier, target] of Object.entries(imports)) {
    const resolved = resolveTarget(target, projectRoot);
    if (!resolved) continue;

    if (specifier.endsWith("/")) {
      dirAliases.push({
        find: new RegExp(`^${escapeRegex(specifier)}`),
        replacement: `${toPosix(resolved).replace(/\/$/, "")}/`,
      });
    } else {
      fileAliases.push({ find: specifier, replacement: toPosix(resolved) });
    }
  }

  return [...dirAliases, ...fileAliases];
};

export function importMapPlugin(options: ImportMapPluginOptions = {}): Plugin {
  const projectRoot = options.rootDir
    ? path.resolve(options.rootDir)
    : process.cwd();
  const mapFile = path.resolve(
    projectRoot,
    options.mapFile ?? "config/import-map.json",
  );
  let lastAlias: Alias[] = [];

  const loadAliases = async (): Promise<Alias[]> => {
    try {
      const json = await fs.readFile(mapFile, "utf-8");
      const map = JSON.parse(json) as ImportMap;
      lastAlias = buildAliasEntries(map.imports ?? {}, projectRoot);
      return lastAlias;
    } catch (error) {
      console.warn(`[import-map-plugin] Failed to load ${mapFile}:`, error);
      return lastAlias;
    }
  };

  return {
    name: "vite-import-map",
    async config() {
      const alias = await loadAliases();
      return {
        resolve: {
          alias,
        },
      };
    },
    configureServer(server) {
      server.watcher.add(mapFile);
      server.watcher.on("change", async (changedPath) => {
        if (path.resolve(changedPath) !== mapFile) return;
        await loadAliases();
        server.restart();
      });
    },
  };
}

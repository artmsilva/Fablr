import { createHash } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename: string = fileURLToPath(import.meta.url);
const __dirname: string = path.dirname(__filename);

const SRC_DIR = path.join(__dirname, "src");
const DIST_DIR = path.join(__dirname, "dist");

interface FileManifest {
  [originalName: string]: string;
}

interface BuildManifest {
  "app.js": string;
  "style.css": string;
  components: FileManifest;
}

/**
 * Generate SHA-256 hash of file content (first 8 characters)
 */
async function generateFileHash(filePath: string): Promise<string> {
  const content = await fs.readFile(filePath);
  return createHash("sha256").update(content).digest("hex").substring(0, 8);
}

/**
 * Get hashed filename from original filename
 */
function getHashedFilename(filename: string, hash: string): string {
  const ext = path.extname(filename);
  const base = path.basename(filename, ext);
  return `${base}.${hash}${ext}`;
}

/**
 * Clean and create dist directory
 */
async function setupDistDirectory(): Promise<void> {
  try {
    await fs.rm(DIST_DIR, { recursive: true, force: true });
  } catch (error) {
    // Directory might not exist, ignore error
  }
  await fs.mkdir(DIST_DIR, { recursive: true });
  await fs.mkdir(path.join(DIST_DIR, "components"), { recursive: true });
}

/**
 * Copy static assets that don't need fingerprinting
 */
async function copyStaticAssets(): Promise<void> {
  const staticFiles = ["404.html", "favicon.svg"];

  for (const file of staticFiles) {
    const src = path.join(SRC_DIR, file);
    const dest = path.join(DIST_DIR, file);

    try {
      await fs.copyFile(src, dest);
      console.log(`✓ Copied ${file}`);
    } catch (error) {
      // File might not exist, just skip
      console.log(`⚠ Skipped ${file} (not found)`);
    }
  }
}

/**
 * Build components with fingerprinting
 */
async function buildComponents(): Promise<FileManifest> {
  const componentsDir = path.join(SRC_DIR, "components");
  const componentFiles = await fs.readdir(componentsDir);
  const componentMap: FileManifest = {};

  for (const file of componentFiles) {
    if (!file.endsWith(".js")) continue;

    const srcPath = path.join(componentsDir, file);
    const hash = await generateFileHash(srcPath);
    const hashedName = getHashedFilename(file, hash);
    const destPath = path.join(DIST_DIR, "components", hashedName);

    await fs.copyFile(srcPath, destPath);
    componentMap[`./components/${file}`] = `./components/${hashedName}`;

    console.log(`✓ Built components/${file} → components/${hashedName}`);
  }

  return componentMap;
}

/**
 * Build app.js with updated component imports
 */
async function buildApp(componentMap: FileManifest): Promise<string> {
  const appPath = path.join(SRC_DIR, "app.js");
  let appContent = await fs.readFile(appPath, "utf-8");

  // Replace component imports with hashed versions
  for (const [original, hashed] of Object.entries(componentMap)) {
    // Escape special regex characters in the path
    const escapedOriginal = original.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    appContent = appContent.replace(
      new RegExp(
        `(import\\s+["']${escapedOriginal}["']|from\\s+["']${escapedOriginal}["'])`,
        "g"
      ),
      (match) =>
        match.includes("import") ? `import "${hashed}"` : `from "${hashed}"`
    );
  }

  // Generate hash for modified app.js content
  const appHash = createHash("sha256")
    .update(appContent)
    .digest("hex")
    .substring(0, 8);
  const hashedAppName = getHashedFilename("app.js", appHash);
  const appDestPath = path.join(DIST_DIR, hashedAppName);

  await fs.writeFile(appDestPath, appContent, "utf-8");
  console.log(`✓ Built app.js → ${hashedAppName}`);

  return hashedAppName;
}

/**
 * Build style.css with fingerprinting
 */
async function buildStyles(): Promise<string> {
  const stylePath = path.join(SRC_DIR, "style.css");
  const hash = await generateFileHash(stylePath);
  const hashedName = getHashedFilename("style.css", hash);
  const destPath = path.join(DIST_DIR, hashedName);

  await fs.copyFile(stylePath, destPath);
  console.log(`✓ Built style.css → ${hashedName}`);

  return hashedName;
}

/**
 * Build index.html with updated asset references
 */
async function buildHTML(
  hashedAppName: string,
  hashedStyleName: string
): Promise<void> {
  const indexPath = path.join(SRC_DIR, "index.html");
  let htmlContent = await fs.readFile(indexPath, "utf-8");

  // Replace stylesheet reference
  htmlContent = htmlContent.replace(
    /href="style\.css"/g,
    `href="${hashedStyleName}"`
  );

  // Replace script reference
  htmlContent = htmlContent.replace(/src="app\.js"/g, `src="${hashedAppName}"`);

  const destPath = path.join(DIST_DIR, "index.html");
  await fs.writeFile(destPath, htmlContent, "utf-8");
  console.log(`✓ Built index.html`);
}

/**
 * Create manifest file for debugging
 */
async function createManifest(
  componentMap: FileManifest,
  hashedAppName: string,
  hashedStyleName: string
): Promise<void> {
  const manifest: BuildManifest = {
    "app.js": hashedAppName,
    "style.css": hashedStyleName,
    components: {},
  };

  for (const [original, hashed] of Object.entries(componentMap)) {
    const originalFile = original.replace("./components/", "");
    const hashedFile = hashed.replace("./components/", "");
    manifest.components[originalFile] = hashedFile;
  }

  const manifestPath = path.join(DIST_DIR, "manifest.json");
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
  console.log(`✓ Created manifest.json`);
}

/**
 * Main build function
 */
async function build(): Promise<void> {
  console.log("🔨 Building Fablr for production...\n");

  try {
    // Setup
    await setupDistDirectory();

    // Copy static assets
    await copyStaticAssets();

    // Build components
    const componentMap = await buildComponents();

    // Build app.js with updated imports
    const hashedAppName = await buildApp(componentMap);

    // Build styles
    const hashedStyleName = await buildStyles();

    // Build HTML
    await buildHTML(hashedAppName, hashedStyleName);

    // Create manifest
    await createManifest(componentMap, hashedAppName, hashedStyleName);

    console.log("\n✅ Build complete! Output in dist/");
    console.log(`\nFingerprinted files:`);
    console.log(`  - ${hashedStyleName}`);
    console.log(`  - ${hashedAppName}`);
    console.log(`  - ${Object.keys(componentMap).length} component(s)\n`);
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

// Run build
build();

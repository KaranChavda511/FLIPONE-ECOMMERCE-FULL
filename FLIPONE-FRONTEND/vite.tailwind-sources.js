import fs from "node:fs";
import path from "node:path";
import { Scanner } from "@tailwindcss/oxide";

/*
 * Fallback for machines where Tailwind's native scanner (@tailwindcss/oxide-<platform>) cannot load,
 * e.g. Windows Smart App Control / App Control blocking the unsigned .node file. Tailwind then falls back to
 * its WASI build, which cannot read the Windows file system, so it finds zero class names and ships CSS
 * with no utilities at all.
 *
 * When that happens, this plugin reads src/ + index.html itself, asks the scanner to extract candidates from
 * the file *contents* (works without file system access), and appends them to src/index.css as
 * `@source inline("...")` before Tailwind compiles it. On a machine where the native scanner works it does
 * nothing.
 */

const SCAN_EXT = /\.(jsx?|tsx?|html)$/;

const toPosix = (p) => p.split(path.sep).join("/");

function listFiles(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === "node_modules" || entry.name.startsWith(".")) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) listFiles(full, out);
    else if (SCAN_EXT.test(entry.name) && !/\.test\.[jt]sx?$/.test(entry.name)) out.push(full);
  }
  return out;
}

function nativeScannerWorks(srcDir) {
  try {
    const scanner = new Scanner({ sources: [{ base: srcDir, pattern: "**/*.{js,jsx}", negated: false }] });
    scanner.scan();
    return scanner.files.length > 0;
  } catch {
    return false;
  }
}

function collectCandidates(root) {
  const files = [...listFiles(path.join(root, "src")), path.join(root, "index.html")].filter((f) => fs.existsSync(f));
  const scanner = new Scanner({});
  const candidates = scanner.scanFiles(
    files.map((file) => ({ content: fs.readFileSync(file, "utf8"), extension: path.extname(file).slice(1) }))
  );
  // @source inline() splits on whitespace and expands {a,b}; skip anything that cannot sit in that string.
  return [...new Set(candidates)].filter((c) => !/["\\{}\s]/.test(c)).sort();
}

export default function tailwindSourcesFallback({ cssEntry = "src/index.css" } = {}) {
  let root = process.cwd();
  let cssFile = "";
  let enabled = false;

  return {
    name: "flipone:tailwind-sources-fallback",
    enforce: "pre",
    configResolved(config) {
      root = config.root;
      cssFile = toPosix(path.resolve(root, cssEntry));
      enabled = !nativeScannerWorks(path.join(root, "src"));
      if (enabled) {
        config.logger.warn(
          "[flipone] Tailwind's native scanner is unavailable here; feeding class names from src/ via @source inline()."
        );
      }
    },
    transform(code, id) {
      if (!enabled) return null;
      if (toPosix(id.split("?")[0]) !== cssFile) return null;
      const list = collectCandidates(root).join(" ");
      return { code: `${code}\n@source inline("${list}");\n`, map: null };
    },
    // A source edit can add class names, so the CSS entry must be rebuilt. Two things are needed:
    //  1. @tailwindcss/vite only recompiles when a build dependency's mtime changes (the injected list changes
    //     the CSS text, not the file), so bump index.css's mtime. Its content is untouched.
    //  2. Invalidate the CSS in the client environment's module graph (Vite 6+ hotUpdate; the legacy
    //     handleHotUpdate + server.moduleGraph only reached a compatibility view).
    // Without both, new classes appeared only after a dev-server restart.
    hotUpdate({ file, modules }) {
      if (!enabled || this.environment.name !== "client") return undefined;
      if (!/\/src\/.+\.(jsx?|tsx?)$/.test(toPosix(file))) return undefined;
      try {
        const now = new Date();
        fs.utimesSync(cssFile, now, now);
      } catch {
        /* a missing entry is reported by Vite itself */
      }
      const graph = this.environment.moduleGraph;
      const cssModules = graph.getModulesByFile(cssFile);
      if (!cssModules?.size) return undefined;
      const now = Date.now();
      cssModules.forEach((mod) => graph.invalidateModule(mod, new Set(), now, true));
      return [...modules, ...cssModules];
    },
  };
}

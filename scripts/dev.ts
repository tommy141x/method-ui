#!/usr/bin/env bun

/**
 * Master development script for Method UI
 * Runs both the dev playground and component watcher from the root
 *
 * Run with: bun dev (from method root)
 */

import { spawn, type ChildProcess } from "child_process";
import { join } from "path";
import chokidar, { type FSWatcher } from "chokidar";
import { generateComponentMetadata } from "./compile.ts";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
};

function log(color: string, prefix: string, message: string) {
  console.log(`${color}${colors.bright}[${prefix}]${colors.reset} ${message}`);
}

// Track child processes for cleanup
const processes: Array<ReturnType<typeof spawn>> = [];
let watcher: FSWatcher | null = null;

async function cleanup() {
  console.log("\n");
  log(colors.yellow, "SHUTDOWN", "Stopping all processes...");

  // Close file watcher
  if (watcher) {
    await watcher.close();
  }

  // Kill child processes
  processes.forEach((proc) => {
    if (proc && !proc.killed) {
      proc.kill("SIGTERM");
    }
  });

  // Force exit after 2 seconds if processes don't stop
  setTimeout(() => {
    log(colors.red, "SHUTDOWN", "Force stopping...");
    process.exit(0);
  }, 2000);
}

// Handle shutdown signals
process.on("SIGINT", cleanup);
process.on("SIGTERM", cleanup);

// Component watcher configuration
const COMPONENTS_DIR = join(process.cwd(), "components");
const DEBOUNCE_MS = 300; // Reduced from 500ms for faster response

let debounceTimer: Timer | null = null;
let isGenerating = false;

/**
 * Run the metadata generation directly in-process (much faster than spawning)
 */
async function generateMetadata(changedFile?: string) {
  if (isGenerating) {
    log(
      colors.yellow,
      "WATCHER",
      "Generation already in progress, skipping...",
    );
    return;
  }

  isGenerating = true;

  const fileInfo = changedFile ? ` (${changedFile})` : "";
  log(
    colors.magenta,
    "WATCHER",
    `Change detected${fileInfo}, regenerating metadata...`,
  );

  try {
    // Run compilation in-process - reuses TypeScript program cache
    await generateComponentMetadata(changedFile);

    const scope = changedFile ? `for ${changedFile}` : "for all components";
    log(colors.green, "WATCHER", `✓ Metadata regenerated ${scope}!`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    log(colors.red, "WATCHER", `Metadata generation failed: ${message}`);
  } finally {
    isGenerating = false;
  }
}

/**
 * Debounced metadata generation
 */
function debouncedGenerate(changedFile?: string) {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
  }

  debounceTimer = setTimeout(() => {
    generateMetadata(changedFile);
    debounceTimer = null;
  }, DEBOUNCE_MS);
}

/**
 * Start watching the components directory with chokidar
 */
function startWatcher() {
  log(colors.magenta, "WATCHER", "Starting component watcher...");
  log(colors.magenta, "WATCHER", `Watching: ${COMPONENTS_DIR}`);

  watcher = chokidar.watch(COMPONENTS_DIR, {
    ignored: (path, stats) => {
      // Ignore files that aren't .tsx
      if (stats?.isFile() && !path.endsWith(".tsx")) {
        return true;
      }
      return false;
    },
    persistent: true,
    ignoreInitial: true, // Don't trigger on initial scan
    awaitWriteFinish: {
      stabilityThreshold: 200, // Reduced for faster response
      pollInterval: 50,
    },
    atomic: true, // Handle atomic writes (common in editors)
  });

  watcher
    .on("add", (path) => {
      const filename = path.split(/[\\/]/).pop();
      if (filename) {
        log(colors.magenta, "WATCHER", `➕ Added: ${filename}`);
        debouncedGenerate(filename);
      }
    })
    .on("change", (path) => {
      const filename = path.split(/[\\/]/).pop();
      if (filename) {
        log(colors.magenta, "WATCHER", `📝 Changed: ${filename}`);
        debouncedGenerate(filename);
      }
    })
    .on("unlink", (path) => {
      const filename = path.split(/[\\/]/).pop();
      if (filename) {
        log(colors.magenta, "WATCHER", `🗑️  Removed: ${filename}`);
        debouncedGenerate();
      }
    })
    .on("error", (error) => {
      const message = error instanceof Error ? error.message : String(error);
      log(colors.red, "WATCHER", `Error: ${message}`);
    })
    .on("ready", () => {
      log(
        colors.green,
        "WATCHER",
        "✨ Initial scan complete. Ready for changes!",
      );
    });
}

/**
 * Start the dev server
 */
function startDevServer() {
  log(colors.cyan, "DEV SERVER", "Starting documentation playground...");

  const dev = spawn("bun", ["run", "dev"], {
    stdio: "pipe",
    shell: true,
    cwd: join(process.cwd(), "docs"),
  });

  processes.push(dev);

  if (dev.stdout) {
    dev.stdout.on("data", (data) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((line: string) => {
        if (line) log(colors.cyan, "DEV SERVER", line);
      });
    });
  }

  if (dev.stderr) {
    dev.stderr.on("data", (data) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((line: string) => {
        if (line) log(colors.blue, "DEV SERVER", line);
      });
    });
  }

  dev.on("close", (code) => {
    if (code !== 0 && code !== null) {
      log(colors.red, "DEV SERVER", `Exited with code ${code}`);
    }
    cleanup();
  });

  dev.on("error", (err) => {
    log(colors.red, "DEV SERVER", `Error: ${err.message}`);
    cleanup();
  });

  return dev;
}

// Main execution
console.log(
  `\n${colors.bright}${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`,
);
log(colors.green, "METHOD UI", "Development Environment Starting...");
console.log(
  `${colors.bright}${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`,
);

// Run initial metadata generation
log(colors.magenta, "WATCHER", "Running initial metadata compilation...");
await generateMetadata();

// Start component watcher
setTimeout(() => {
  startWatcher();
}, 1000);

// Start dev server after watcher completes initial generation
setTimeout(() => {
  startDevServer();
}, 3000);

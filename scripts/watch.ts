/**
 * Component File Watcher
 * Watches the components directory for changes and automatically regenerates metadata
 *
 * Run with: bun run watch (from method root)
 */

import { watch } from "fs";
import { join } from "path";
import { spawn } from "child_process";

const COMPONENTS_DIR = join(process.cwd(), "components");
const DEBOUNCE_MS = 500;

let debounceTimer: Timer | null = null;
let isGenerating = false;

/**
 * Run the metadata generation script
 */
function generateMetadata(changedFile?: string) {
  if (isGenerating) {
    console.log("⏳ Generation already in progress, skipping...");
    return;
  }

  isGenerating = true;

  const fileInfo = changedFile ? ` (${changedFile})` : "";
  console.log(`\n🔄 Change detected${fileInfo}, regenerating metadata...`);

  const args = ["run", "scripts/compile.ts"];
  if (changedFile) {
    args.push(changedFile);
  }

  const child = spawn("bun", args, {
    stdio: "inherit",
    shell: true,
  });

  child.on("close", (code) => {
    isGenerating = false;
    if (code === 0) {
      const scope = changedFile ? `for ${changedFile}` : "for all components";
      console.log(`✅ Metadata regenerated successfully ${scope}!\n`);
    } else {
      console.error(`❌ Metadata generation failed with code ${code}\n`);
    }
  });

  child.on("error", (err) => {
    isGenerating = false;
    console.error("❌ Failed to run metadata generation:", err);
  });
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
 * Start watching the components directory
 */
function startWatching() {
  console.log("👀 Watching components directory for changes...");
  console.log(`📁 ${COMPONENTS_DIR}`);
  console.log("Press Ctrl+C to stop\n");

  try {
    const watcher = watch(
      COMPONENTS_DIR,
      { recursive: false },
      (eventType, filename) => {
        if (!filename) return;

        // Only watch .tsx files
        if (!filename.endsWith(".tsx")) return;

        console.log(`📝 ${eventType}: ${filename}`);
        debouncedGenerate(filename);
      },
    );

    watcher.on("error", (error) => {
      console.error("❌ Watcher error:", error);
    });

    // Handle graceful shutdown
    process.on("SIGINT", () => {
      console.log("\n\n👋 Stopping watcher...");
      watcher.close();
      process.exit(0);
    });

    process.on("SIGTERM", () => {
      console.log("\n\n👋 Stopping watcher...");
      watcher.close();
      process.exit(0);
    });
  } catch (error) {
    console.error("❌ Failed to start watcher:", error);
    process.exit(1);
  }
}

// Run initial compilation
console.log("🚀 Starting component watcher...\n");
console.log("📦 Running initial metadata compilation...");
generateMetadata();

// Start watching after initial generation completes
setTimeout(() => {
  startWatching();
}, 1000);

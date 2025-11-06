/**
 * Update script for Method UI
 * Runs bun install in both the root and docs directories
 *
 * Run with: bun run scripts/update.ts (from method root)
 */

import { spawn } from "child_process";
import { join } from "path";

// Color codes for terminal output
const colors = {
  reset: "\x1b[0m",
  bright: "\x1b[1m",
  cyan: "\x1b[36m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
};

function log(color: string, prefix: string, message: string) {
  console.log(`${color}${colors.bright}[${prefix}]${colors.reset} ${message}`);
}

function runInstall(dir: string, label: string): Promise<number> {
  return new Promise((resolve) => {
    log(colors.cyan, label, `Installing dependencies in ${dir}...`);

    const install = spawn("bun", ["install"], {
      stdio: "inherit",
      shell: true,
      cwd: dir,
    });

    install.on("close", (code) => {
      if (code === 0) {
        log(colors.green, label, "✓ Dependencies installed successfully");
      } else {
        log(colors.red, label, `✗ Installation failed with code ${code}`);
      }
      resolve(code || 0);
    });

    install.on("error", (err) => {
      log(colors.red, label, `✗ Error: ${err.message}`);
      resolve(1);
    });
  });
}

async function updateAll() {
  console.log(
    `\n${colors.bright}${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}`,
  );
  log(colors.green, "UPDATE", "Updating Method UI dependencies...");
  console.log(
    `${colors.bright}${colors.green}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${colors.reset}\n`,
  );

  // Install root dependencies
  const rootCode = await runInstall(process.cwd(), "ROOT");

  console.log("");

  // Install docs dependencies
  const devCode = await runInstall(join(process.cwd(), "docs"), "DOCS");

  console.log("");

  if (rootCode === 0 && devCode === 0) {
    log(colors.green, "UPDATE", "✓ All dependencies updated successfully!");
  } else {
    log(colors.red, "UPDATE", "✗ Some installations failed");
    process.exit(1);
  }
}

updateAll();

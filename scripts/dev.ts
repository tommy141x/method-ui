/**
 * Master development script for Method UI
 * Runs both the dev playground and component watcher from the root
 *
 * Run with: bun dev (from method root)
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
  magenta: "\x1b[35m",
  blue: "\x1b[34m",
};

function log(color: string, prefix: string, message: string) {
  console.log(`${color}${colors.bright}[${prefix}]${colors.reset} ${message}`);
}

// Track child processes for cleanup
const processes: Array<ReturnType<typeof spawn>> = [];

function cleanup() {
  console.log("\n");
  log(colors.yellow, "SHUTDOWN", "Stopping all processes...");

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

// Start the component watcher
function startWatcher() {
  log(colors.magenta, "WATCHER", "Starting component watcher...");

  const watcher = spawn("bun", ["run", "scripts/watch.ts"], {
    stdio: "pipe",
    shell: true,
    cwd: process.cwd(),
  });

  processes.push(watcher);

  if (watcher.stdout) {
    watcher.stdout.on("data", (data) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((line: string) => {
        if (line) log(colors.magenta, "WATCHER", line);
      });
    });
  }

  if (watcher.stderr) {
    watcher.stderr.on("data", (data) => {
      const lines = data.toString().trim().split("\n");
      lines.forEach((line: string) => {
        if (line) log(colors.red, "WATCHER", line);
      });
    });
  }

  watcher.on("close", (code) => {
    if (code !== 0 && code !== null) {
      log(colors.red, "WATCHER", `Exited with code ${code}`);
    }
  });

  watcher.on("error", (err) => {
    log(colors.red, "WATCHER", `Error: ${err.message}`);
  });

  return watcher;
}

// Start the dev server
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

// Start both processes
startWatcher();

// Give watcher a moment to complete initial generation before starting dev server
setTimeout(() => {
  startDevServer();
}, 2000);

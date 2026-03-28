import { rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { resolve } from "node:path";
import process from "node:process";

const nextCachePath = resolve(process.cwd(), ".next-dev");
const nextCliPath = resolve(
  process.cwd(),
  "node_modules",
  "next",
  "dist",
  "bin",
  "next"
);

async function main() {
  await rm(nextCachePath, {
    recursive: true,
    force: true,
  });

  const child = spawn(process.execPath, [nextCliPath, "dev"], {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
  });

  const forwardSignal = (signal) => {
    if (!child.killed) {
      child.kill(signal);
    }
  };

  process.on("SIGINT", forwardSignal);
  process.on("SIGTERM", forwardSignal);

  child.on("exit", (code, signal) => {
    if (signal) {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(code ?? 0);
  });
}

main().catch((error) => {
  console.error("Failed to start Next dev cleanly:", error);
  process.exit(1);
});

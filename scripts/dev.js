const { spawn } = require("child_process");

const useMemoryBackend = process.argv.includes("--memory");
const processes = [];
let shuttingDown = false;

function start(name, command, args, options = {}) {
  const child = spawn(command, args, {
    stdio: ["inherit", "pipe", "pipe"],
    shell: process.platform === "win32",
    ...options
  });

  const prefix = `[${name}]`;
  const log = (stream, writer) => {
    let buffered = "";

    stream.on("data", (chunk) => {
      buffered += chunk.toString();
      const lines = buffered.split(/\r?\n/);
      buffered = lines.pop() ?? "";

      for (const line of lines) {
        writer(`${prefix} ${line}\n`);
      }
    });

    stream.on("end", () => {
      if (buffered) {
        writer(`${prefix} ${buffered}\n`);
      }
    });
  };

  log(child.stdout, process.stdout.write.bind(process.stdout));
  log(child.stderr, process.stderr.write.bind(process.stderr));

  child.on("exit", (code, signal) => {
    if (shuttingDown) {
      return;
    }

    const reason = signal ? `signal ${signal}` : `code ${code}`;
    process.stderr.write(`${prefix} exited with ${reason}\n`);
    shutdown(code ?? 1);
  });

  processes.push(child);
  return child;
}

function shutdown(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;

  for (const child of processes) {
    if (!child.killed) {
      child.kill("SIGINT");
    }
  }

  process.exit(exitCode);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

start("frontend", "npm", ["run", "dev:frontend"]);
start("backend", "npm", ["run", useMemoryBackend ? "dev:backend:memory" : "dev:backend"]);


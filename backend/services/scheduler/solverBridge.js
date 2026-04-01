import path from "path";
import { fileURLToPath } from "url";
import { spawn } from "child_process";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PYTHON_BIN = process.env.ORTOOLS_PYTHON_BIN || "python3";
const SOLVER_SCRIPT = path.join(__dirname, "scheduleSolver.py");

export const runCpSatSolver = (payload) =>
  new Promise((resolve, reject) => {
    const child = spawn(PYTHON_BIN, [SOLVER_SCRIPT], {
      stdio: ["pipe", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    child.stdout.on("data", (chunk) => {
      stdout += chunk.toString();
    });

    child.stderr.on("data", (chunk) => {
      stderr += chunk.toString();
    });

    child.on("error", (error) => {
      reject(
        new Error(`Unable to start OR-Tools solver process: ${error.message}`),
      );
    });

    child.on("close", (code) => {
      if (code !== 0) {
        reject(new Error(stderr || `OR-Tools solver exited with code ${code}`));
        return;
      }

      try {
        const parsed = JSON.parse(stdout || "{}");
        resolve(parsed);
      } catch (error) {
        reject(new Error(`Invalid solver response: ${error.message}`));
      }
    });

    child.stdin.write(JSON.stringify(payload));
    child.stdin.end();
  });

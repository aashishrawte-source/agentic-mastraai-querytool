import fs from "fs";
import path from "path";

const LOG_DIR = path.join(process.cwd(), "logs");
fs.mkdirSync(LOG_DIR, { recursive: true });
const LOG_FILE = path.join(LOG_DIR, "audit.jsonl");

export function logAudit(entry: any) {
  fs.appendFileSync(
    LOG_FILE,
    JSON.stringify({ ts: new Date().toISOString(), ...entry }) + "\n"
  );
}

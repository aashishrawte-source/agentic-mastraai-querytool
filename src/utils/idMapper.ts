import crypto from "crypto";
import fs from "fs";
import path from "path";

const FILE = path.join(process.cwd(), "data", "id-map.json.enc");
const KEY = process.env.MAPPING_KEY || "default_32_byte_key_for_dev";
const ALGO = "aes-256-gcm";

function encrypt(data: any) {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv(ALGO, Buffer.from(KEY.padEnd(32, "0")), iv);
  const content = Buffer.concat([cipher.update(JSON.stringify(data), "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return Buffer.concat([iv, tag, content]);
}

function decrypt(buf: Buffer) {
  const iv = buf.slice(0, 12);
  const tag = buf.slice(12, 28);
  const data = buf.slice(28);
  const decipher = crypto.createDecipheriv(ALGO, Buffer.from(KEY.padEnd(32, "0")), iv);
  decipher.setAuthTag(tag);
  const json = Buffer.concat([decipher.update(data), decipher.final()]).toString("utf8");
  return JSON.parse(json);
}

export function makeMaskedId(realId: string) {
  return "cand_" + crypto.createHash("sha1").update(realId).digest("hex").slice(0, 8);
}

export function loadMapping(): Record<string, string> {
  if (!fs.existsSync(FILE)) return {};
  return decrypt(fs.readFileSync(FILE));
}

export function saveMapping(map: Record<string, string>) {
  const merged = { ...loadMapping(), ...map };
  fs.mkdirSync(path.dirname(FILE), { recursive: true });
  fs.writeFileSync(FILE, encrypt(merged));
}

export function resolveMaskedId(maskedId: string): string | null {
  const map = loadMapping();
  return map[maskedId] ?? null;
}

export function resolveMaskedIds(maskedIds: string[]): string[] {
  const map = loadMapping();
  return maskedIds.map(id => map[id]).filter(Boolean);
}

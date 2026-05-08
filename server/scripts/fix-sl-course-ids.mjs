import { createHash } from "crypto";
import { readFileSync, writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const p = join(__dirname, "..", "data", "sri-lanka-courses.json");
const rows = JSON.parse(readFileSync(p, "utf-8"));
for (const c of rows) {
  const u = String(c.url || "");
  c.id = `sl-${createHash("sha256").update(u).digest("hex").slice(0, 24)}`;
}
writeFileSync(p, JSON.stringify(rows, null, 2), "utf-8");
console.error("Updated", rows.length, "IDs");

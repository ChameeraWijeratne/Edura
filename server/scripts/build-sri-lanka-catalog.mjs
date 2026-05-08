/**
 * Build sri-lanka-courses.json from crawled URL list + merge existing.
 * Usage: node scripts/build-sri-lanka-catalog.mjs
 */
import { createHash } from "crypto";
import { readFileSync, writeFileSync, copyFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, "..", "data");
const slPath = join(dataDir, "sri-lanka-courses.json");
const expandedPath = join(__dirname, "sl-expanded-urls.json");

const UA = "Mozilla/5.0 EduraCatalog/1.0";

function parseJsonFile(path) {
  const buf = readFileSync(path);
  if (buf.length >= 2 && buf[0] === 0xff && buf[1] === 0xfe) {
    return JSON.parse(buf.slice(2).toString("utf16le"));
  }
  return JSON.parse(buf.toString("utf-8").replace(/^\uFEFF/, ""));
}

const JUNK =
  /vacancy|temporary|recruitment|pdf$|\.pdf|post-of-|assistant-lecturer|hands-over|symposium|ignite-fair|job-winning|journal|deans-office|wp-json|xmlrpc|feed\/?$/i;

function hostnameUniversity(host) {
  const h = host.replace(/^www\./, "");
  const map = {
    "cmb.ac.lk": "University of Colombo",
    "arts.cmb.ac.lk": "University of Colombo",
    "science.cmb.ac.lk": "University of Colombo",
    "law.cmb.ac.lk": "University of Colombo",
    "med.cmb.ac.lk": "University of Colombo",
    "fgs.cmb.ac.lk": "University of Colombo",
    "pdn.ac.lk": "University of Peradeniya",
    "eng.pdn.ac.lk": "University of Peradeniya",
    "ou.ac.lk": "Open University of Sri Lanka",
    "sliit.lk": "SLIIT",
    "nibm.lk": "NIBM",
    "iit.ac.lk": "Informatics Institute of Technology",
    "icbtcampus.edu.lk": "ICBT Campus",
    "kln.ac.lk": "University of Kelaniya",
    "sjp.ac.lk": "University of Sri Jayewardenepura",
    "jfn.ac.lk": "University of Jaffna",
    "ruh.ac.lk": "University of Ruhuna",
    "wyb.ac.lk": "Wayamba University of Sri Lanka",
    "uor.ac.lk": "University of Ruhuna",
    "uwu.ac.lk": "Uva Wellassa University",
    "nsbm.ac.lk": "NSBM Green University",
    "uom.lk": "University of Moratuwa",
  };
  if (map[h]) return map[h];
  const parts = h.split(".");
  if (parts.length >= 2) {
    const sub = parts[0];
    if (["science", "law", "med", "arts", "fgs", "eng", "foa", "foe"].includes(sub))
      return map[h] || "Sri Lankan university";
  }
  return "Sri Lankan higher education";
}

function categoryFromPath(p) {
  const x = p.toLowerCase();
  if (/phd|doctoral/.test(x)) return "PhD";
  if (/master|msc|mba|mphil|postgraduate/.test(x)) return "Masters";
  if (/diploma|nvq|certificate/.test(x)) return /certificate/.test(x) ? "Certificate" : "Diploma";
  if (/undergraduate|bachelor|bsc|degree/.test(x)) return "Degree";
  return "Professional";
}

function pricingHint(path) {
  if (/private|fee|paid|professional/i.test(path)) return "Often fee-paying; verify on the official page.";
  return null;
}

function subjectGuess(p) {
  const x = p.toLowerCase();
  if (/comput|it|software|data/.test(x)) return "Computer Science";
  if (/law|llb|legal/.test(x)) return "Law";
  if (/medic|health|nursing/.test(x)) return "Health Sciences";
  if (/eng|tech|civil|mech|elect/.test(x)) return "Engineering";
  if (/business|management|finance|commerce/.test(x)) return "Business";
  if (/art|humanities|social/.test(x)) return "Humanities";
  return "General";
}

async function headOk(url) {
  try {
    const r = await fetch(url, { method: "HEAD", headers: { "User-Agent": UA }, redirect: "follow" });
    return r.ok;
  } catch {
    return false;
  }
}

function titleFromUrl(url) {
  try {
    const u = new URL(url);
    const path = u.pathname.replace(/\/$/, "");
    const last = path.split("/").filter(Boolean).pop() || path;
    return last
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
      .slice(0, 120);
  } catch {
    return "Programme";
  }
}

async function main() {
  let expanded = [];
  if (existsSync(expandedPath)) {
    try {
      expanded = parseJsonFile(expandedPath);
    } catch {
      console.error("Could not parse sl-expanded-urls.json — run expand-sl-from-bases.mjs first");
    }
  }

  expanded = expanded.filter((u) => typeof u === "string" && u.startsWith("http") && !JUNK.test(u));

  const seen = new Set();
  const unique = [];
  for (const u of expanded) {
    const n = u.replace(/^http:/, "https:");
    if (seen.has(n)) continue;
    seen.add(n);
    unique.push(n);
  }

  console.error(`Unique expanded URLs: ${unique.length}, validating HEAD…`);
  const okUrls = [];
  for (const u of unique) {
    if (okUrls.length >= 260) break;
    if (await headOk(u)) okUrls.push(u);
  }
  console.error(`HEAD OK: ${okUrls.length}`);

  let existing = [];
  if (existsSync(slPath)) {
    try {
      existing = JSON.parse(readFileSync(slPath, "utf-8"));
    } catch {
      existing = [];
    }
  }

  const byUrl = new Map();
  for (const c of existing) {
    const u = String(c.url || "").trim();
    if (u) byUrl.set(u.replace(/^http:/, "https:"), { ...c });
  }

  for (const url of okUrls) {
    if (byUrl.has(url)) continue;
    let host;
    try {
      host = new URL(url).hostname;
    } catch {
      continue;
    }
    const uni = hostnameUniversity(host);
    const path = new URL(url).pathname;
    const id = `sl-${createHash("sha256").update(url).digest("hex").slice(0, 24)}`;
    const cat = categoryFromPath(path);
    byUrl.set(url, {
      id,
      title: titleFromUrl(url),
      university: uni,
      subject: subjectGuess(path),
      category: cat,
      pricing: /certificate|diploma|professional|fee|private/i.test(path) ? "paid" : "free",
      description: `Official programme or faculty page on ${uni} (${host}). Use the link for intake rules, fees, and prerequisites.`,
      provider: host.replace(/^www\./, ""),
      url,
      level: cat === "PhD" ? "Doctoral" : "Varies",
      duration: "Varies",
      freeNote:
        pricingHint(path) ||
        "Confirm current fees and recognition with the institution and UGC where applicable.",
    });
  }

  const merged = [...byUrl.values()];
  merged.sort((a, b) => a.title.localeCompare(b.title));

  const backup = join(dataDir, `sri-lanka-courses.backup.${Date.now()}.json`);
  if (existsSync(slPath)) copyFileSync(slPath, backup);
  writeFileSync(slPath, JSON.stringify(merged, null, 2), "utf-8");
  console.error(`Wrote ${merged.length} Sri Lanka entries (backup: ${backup})`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});

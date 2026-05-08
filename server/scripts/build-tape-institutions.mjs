/**
 * Merge institution names + domains for the homepage logo tape.
 * Run after catalog builds: node scripts/build-tape-institutions.mjs
 */
import { mkdirSync, readFileSync, writeFileSync, existsSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");
const dataDir = join(root, "data");
const clientData = join(root, "..", "client", "src", "data");

const DEFAULT = [
  { name: "Harvard University", domain: "harvard.edu" },
  { name: "MIT", domain: "mit.edu" },
  { name: "Stanford University", domain: "stanford.edu" },
  { name: "University of Oxford", domain: "ox.ac.uk" },
  { name: "University of Cambridge", domain: "cam.ac.uk" },
  { name: "Yale University", domain: "yale.edu" },
  { name: "Princeton University", domain: "princeton.edu" },
  { name: "Imperial College London", domain: "imperial.ac.uk" },
  { name: "ETH Zurich", domain: "ethz.ch" },
  { name: "National University of Singapore", domain: "nus.edu.sg" },
  { name: "Duke University", domain: "duke.edu" },
  { name: "University of Toronto", domain: "utoronto.ca" },
  { name: "University of Pennsylvania", domain: "upenn.edu" },
  { name: "Goldman Sachs", domain: "goldmansachs.com" },
  { name: "DeepLearning.AI", domain: "deeplearning.ai" },
  { name: "University of Colombo", domain: "cmb.ac.lk" },
  { name: "SLIIT", domain: "sliit.lk" },
  { name: "University of Moratuwa", domain: "uom.lk" },
];

/** Map subdomains to a root domain that resolves a recognizable favicon. */
function tapeDomain(host) {
  const h = host.replace(/^www\./, "");
  if (h.endsWith(".cmb.ac.lk")) return "cmb.ac.lk";
  if (h.endsWith(".pdn.ac.lk")) return "pdn.ac.lk";
  return h;
}

function host(u) {
  try {
    return new URL(u).hostname;
  } catch {
    return null;
  }
}

function main() {
  /** @type {Map<string, string>} domain -> display name */
  const byDomain = new Map();
  for (const x of DEFAULT) byDomain.set(x.domain, x.name);

  const domPath = join(dataDir, "catalog-institution-domains.json");
  if (existsSync(domPath)) {
    const pairs = JSON.parse(readFileSync(domPath, "utf-8"));
    for (const { domain, name } of pairs) {
      if (domain && name && !byDomain.has(domain)) byDomain.set(domain, name);
    }
  }

  const coursesPath = join(dataDir, "courses.json");
  if (existsSync(coursesPath)) {
    const courses = JSON.parse(readFileSync(coursesPath, "utf-8"));
    for (const c of courses) {
      const u = String(c.url || "");
      if (!u.includes("http")) continue;
      const h = host(u);
      if (!h || h.includes("coursera.org") || h.includes("edx.org")) continue;
      const d = tapeDomain(h);
      if (!byDomain.has(d)) byDomain.set(d, c.university || d);
    }
  }

  const slPath = join(dataDir, "sri-lanka-courses.json");
  if (existsSync(slPath)) {
    const sl = JSON.parse(readFileSync(slPath, "utf-8"));
    for (const c of sl) {
      const u = String(c.url || "");
      const h = host(u);
      if (!h) continue;
      const d = tapeDomain(h);
      const name = c.university || d;
      if (!byDomain.has(d)) byDomain.set(d, name);
    }
  }

  const out = [...byDomain.entries()]
    .map(([domain, name]) => ({ name, domain }))
    .sort((a, b) => a.name.localeCompare(b.name));

  const outPath = join(clientData, "tapeInstitutions.json");
  mkdirSync(clientData, { recursive: true });
  writeFileSync(outPath, JSON.stringify(out, null, 2), "utf-8");
  console.error(`Wrote ${out.length} institutions to ${outPath}`);
}

main();

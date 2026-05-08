/**
 * Crawl Sri Lankan university sites from seed pages; collect programme-related links.
 */
import { writeFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const BASES = [
  "https://www.nsbm.ac.lk/",
  "https://science.cmb.ac.lk/",
  "https://law.cmb.ac.lk/",
  "https://med.cmb.ac.lk/",
  "https://arts.cmb.ac.lk/",
  "https://fgs.cmb.ac.lk/",
  "https://eng.pdn.ac.lk/",
  "https://www.pdn.ac.lk/",
  "https://www.ou.ac.lk/",
  "https://www.sliit.lk/",
  "https://www.nibm.lk/",
  "https://www.iit.ac.lk/",
  "https://www.icbtcampus.edu.lk/",
  "https://www.kln.ac.lk/",
  "https://www.sjp.ac.lk/",
  "https://www.jfn.ac.lk/",
  "https://www.ruh.ac.lk/",
  "https://www.wyb.ac.lk/",
  "https://www.uwu.ac.lk/",
  "https://www.uor.ac.lk/",
  "https://www.ugc.ac.lk/",
];

const KEY = /program|programme|degree|course|diploma|bsc|msc|bachelor|master|faculty|department|undergraduate|postgraduate|study|school-of/i;

async function linksFrom(base) {
  try {
    const r = await fetch(base, {
      headers: { "User-Agent": "Mozilla/5.0 EduraCatalog/1.0" },
      redirect: "follow",
    });
    if (!r.ok) return [];
    const host = new URL(base).hostname.replace(/^www\./, "");
    const html = await r.text();
    const out = new Set();
    for (const m of html.matchAll(/href="([^"]+)"/gi)) {
      let h = m[1].split("#")[0];
      if (h.startsWith("/")) {
        try {
          h = new URL(h, base).href;
        } catch {
          continue;
        }
      }
      if (!h.startsWith("http")) continue;
      let uh;
      try {
        uh = new URL(h);
      } catch {
        continue;
      }
      if (uh.hostname.replace(/^www\./, "") !== host) continue;
      if (!KEY.test(uh.pathname)) continue;
      if (uh.pathname.length < 4) continue;
      out.add(uh.href);
    }
    return [...out];
  } catch {
    return [];
  }
}

const all = new Set();
for (const b of BASES) {
  const ls = await linksFrom(b);
  console.error(b, "->", ls.length);
  for (const x of ls) all.add(x);
}
const out = [...all].sort();
const outPath = join(__dirname, "sl-expanded-urls.json");
writeFileSync(outPath, JSON.stringify(out, null, 2), "utf-8");
console.error("Wrote", out.length, "URLs to", outPath);

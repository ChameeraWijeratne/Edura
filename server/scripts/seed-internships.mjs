/**
 * Generates server/data/internships.json with 120+ directory rows pointing to
 * real public employer career and student program pages (verify URLs periodically).
 * Run: node scripts/seed-internships.mjs
 */
import { writeFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "..", "data", "internships.json");

/** Real public career and internship landing pages (student programs or job search hubs). */
const ORGS = [
  { organization: "Google", url: "https://careers.google.com/students", location: "Global", workMode: "Hybrid" },
  { organization: "Microsoft", url: "https://jobs.careers.microsoft.com/us/en/students", location: "Global", workMode: "Hybrid" },
  { organization: "Amazon", url: "https://www.amazon.jobs/en/teams/internships-for-students", location: "Global", workMode: "Varies" },
  { organization: "Meta", url: "https://www.metacareers.com/students", location: "Global", workMode: "Hybrid" },
  { organization: "Apple", url: "https://jobs.apple.com/en-us/search?team=internship-STDNT-INTRN", location: "Global", workMode: "On site" },
  { organization: "Netflix", url: "https://jobs.netflix.com/", location: "United States", workMode: "Hybrid" },
  { organization: "NVIDIA", url: "https://www.nvidia.com/en-us/about-nvidia/careers/students/", location: "Global", workMode: "Hybrid" },
  { organization: "Intel", url: "https://jobs.intel.com/", location: "Global", workMode: "Hybrid" },
  { organization: "IBM", url: "https://www.ibm.com/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Cisco", url: "https://jobs.cisco.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Oracle", url: "https://careers.oracle.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Salesforce", url: "https://careers.salesforce.com/students", location: "Global", workMode: "Hybrid" },
  { organization: "Adobe", url: "https://careers.adobe.com/students", location: "Global", workMode: "Hybrid" },
  { organization: "SAP", url: "https://jobs.sap.com/", location: "Global", workMode: "Hybrid" },
  { organization: "VMware by Broadcom", url: "https://careers.broadcom.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Dell Technologies", url: "https://jobs.dell.com/", location: "Global", workMode: "Hybrid" },
  { organization: "HP", url: "https://jobs.hp.com/", location: "Global", workMode: "Hybrid" },
  { organization: "LinkedIn", url: "https://careers.linkedin.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Spotify", url: "https://www.lifeatspotify.com/students", location: "Global", workMode: "Hybrid" },
  { organization: "Uber", url: "https://www.uber.com/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "Airbnb", url: "https://careers.airbnb.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Stripe", url: "https://stripe.com/jobs", location: "Global", workMode: "Hybrid" },
  { organization: "PayPal", url: "https://careers.pypl.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Visa", url: "https://careers.visa.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Mastercard", url: "https://careers.mastercard.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Goldman Sachs", url: "https://www.goldmansachs.com/careers/students", location: "Global", workMode: "On site" },
  { organization: "JPMorgan Chase", url: "https://careers.jpmorgan.com/students", location: "Global", workMode: "Hybrid" },
  { organization: "Morgan Stanley", url: "https://www.morganstanley.com/careers/students", location: "Global", workMode: "On site" },
  { organization: "Deloitte", url: "https://jobs2.deloitte.com/global/en/students", location: "Global", workMode: "Hybrid" },
  { organization: "PwC", url: "https://jobs.us.pwc.com/students", location: "Global", workMode: "Hybrid" },
  { organization: "EY", url: "https://careers.ey.com/students", location: "Global", workMode: "Hybrid" },
  { organization: "KPMG", url: "https://jobs.kpmg.com/", location: "Global", workMode: "Hybrid" },
  { organization: "McKinsey & Company", url: "https://www.mckinsey.com/careers/students", location: "Global", workMode: "Hybrid" },
  { organization: "Boston Consulting Group", url: "https://careers.bcg.com/students", location: "Global", workMode: "Hybrid" },
  { organization: "Bain & Company", url: "https://careers.bain.com/", location: "Global", workMode: "Hybrid" },
  { organization: "WSO2", url: "https://wso2.com/careers/", location: "Colombo, Global", workMode: "Hybrid" },
  { organization: "Virtusa", url: "https://www.virtusa.com/careers", location: "Colombo, Global", workMode: "Hybrid" },
  { organization: "99X", url: "https://www.99x.io/careers", location: "Colombo", workMode: "Hybrid" },
  { organization: "Calcey", url: "https://www.calcey.com/careers", location: "Colombo", workMode: "Hybrid" },
  { organization: "Sysco LABS", url: "https://syscolabs.lk/careers/", location: "Colombo", workMode: "Hybrid" },
  { organization: "IFS", url: "https://www.ifs.com/about/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Ericsson", url: "https://www.ericsson.com/en/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Samsung", url: "https://www.samsung.com/us/about-us/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "Siemens", url: "https://jobs.siemens.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Boeing", url: "https://jobs.boeing.com/", location: "United States", workMode: "On site" },
  { organization: "Lockheed Martin", url: "https://www.lockheedmartinjobs.com/", location: "United States", workMode: "On site" },
  { organization: "NASA", url: "https://www.nasa.gov/careers/", location: "United States", workMode: "On site" },
  { organization: "Tesla", url: "https://www.tesla.com/careers", location: "Global", workMode: "On site" },
  { organization: "Ford Motor Company", url: "https://corporate.ford.com/careers.html", location: "Global", workMode: "Hybrid" },
  { organization: "General Motors", url: "https://search-careers.gm.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Johnson & Johnson", url: "https://jobs.jnj.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Pfizer", url: "https://www.pfizercareers.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Novartis", url: "https://www.novartis.com/careers", location: "Global", workMode: "Hybrid" },
  { organization: "UN Careers", url: "https://careers.un.org/", location: "Global", workMode: "On site" },
  { organization: "World Bank Group", url: "https://www.worldbank.org/en/about/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Asian Development Bank", url: "https://www.adb.org/work-with-us/careers", location: "Philippines, Regional", workMode: "Hybrid" },
  { organization: "Red Hat", url: "https://www.redhat.com/jobs", location: "Global", workMode: "Remote" },
  { organization: "Canonical", url: "https://canonical.com/careers", location: "Global", workMode: "Remote" },
  { organization: "MongoDB", url: "https://www.mongodb.com/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Snowflake", url: "https://careers.snowflake.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Databricks", url: "https://www.databricks.com/company/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Palantir", url: "https://jobs.lever.co/palantir", location: "Global", workMode: "Hybrid" },
  { organization: "ServiceNow", url: "https://careers.servicenow.com/students", location: "Global", workMode: "Hybrid" },
  { organization: "Workday", url: "https://careers.workday.com/en-US/students", location: "Global", workMode: "Hybrid" },
  { organization: "Intuit", url: "https://www.intuit.com/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "Autodesk", url: "https://careers.autodesk.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Caterpillar", url: "https://careers.caterpillar.com/", location: "Global", workMode: "Hybrid" },
  { organization: "GE Aerospace", url: "https://jobs.gecareers.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Procter & Gamble", url: "https://www.pgcareers.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Unilever", url: "https://careers.unilever.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Nestlé", url: "https://www.nestle.com/jobs", location: "Global", workMode: "Hybrid" },
  { organization: "Coca-Cola", url: "https://careers.coca-colacompany.com/", location: "Global", workMode: "Hybrid" },
  { organization: "LSEG (London Stock Exchange Group)", url: "https://www.lseg.com/en/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Bloomberg", url: "https://www.bloomberg.com/company/early-careers", location: "Global", workMode: "Hybrid" },
  { organization: "Reuters and Thomson Reuters", url: "https://careers.thomsonreuters.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Deutsche Bank", url: "https://careers.db.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Barclays", url: "https://home.barclays/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "HSBC", url: "https://www.hsbc.com/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Standard Chartered", url: "https://www.sc.com/en/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "Citi", url: "https://jobs.citi.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Bank of America", url: "https://careers.bankofamerica.com/en-us/students", location: "Global", workMode: "Hybrid" },
  { organization: "Wells Fargo", url: "https://www.wellsfargo.com/about/careers/", location: "United States", workMode: "Hybrid" },
  { organization: "Capital One", url: "https://www.capitalonecareers.com/", location: "United States", workMode: "Hybrid" },
  { organization: "American Express", url: "https://careers.americanexpress.com/", location: "Global", workMode: "Hybrid" },
  { organization: "NetApp", url: "https://www.netapp.com/company/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "Micron", url: "https://www.micron.com/about/careers", location: "Global", workMode: "Hybrid" },
  { organization: "AMD", url: "https://careers.amd.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Qualcomm", url: "https://careers.qualcomm.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Texas Instruments", url: "https://careers.ti.com/", location: "Global", workMode: "Hybrid" },
  { organization: "ASML", url: "https://www.asml.com/en/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Tokyo Electron", url: "https://careers.tel.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Applied Materials", url: "https://careers.appliedmaterials.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Lam Research", url: "https://careers.lamresearch.com/", location: "Global", workMode: "Hybrid" },
  { organization: "KLA", url: "https://careers.kla.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Synopsys", url: "https://careers.synopsys.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Cadence", url: "https://cadence.wd1.myworkdayjobs.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Micron (Asia)", url: "https://www.micron.com/about/careers", location: "Singapore, India", workMode: "Hybrid" },
  { organization: "Infosys", url: "https://careers.infosys.com/", location: "India, Global", workMode: "Hybrid" },
  { organization: "TCS", url: "https://www.tcs.com/careers", location: "India, Global", workMode: "Hybrid" },
  { organization: "Wipro", url: "https://careers.wipro.com/", location: "India, Global", workMode: "Hybrid" },
  { organization: "HCLTech", url: "https://www.hcltech.com/careers", location: "India, Global", workMode: "Hybrid" },
  { organization: "Tech Mahindra", url: "https://careers.techmahindra.com/", location: "India, Global", workMode: "Hybrid" },
  { organization: "Accenture", url: "https://www.accenture.com/us-en/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Capgemini", url: "https://www.capgemini.com/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "Cognizant", url: "https://careers.cognizant.com/", location: "Global", workMode: "Hybrid" },
  { organization: "DXC Technology", url: "https://careers.dxc.technology/", location: "Global", workMode: "Hybrid" },
  { organization: "Fujitsu", url: "https://www.fujitsu.com/global/about/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "Hitachi", url: "https://careers.hitachi.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Sony Group", url: "https://www.sony.com/en/SonyInfo/Careers/", location: "Global", workMode: "Hybrid" },
  { organization: "Panasonic", url: "https://careers.na.panasonic.com/", location: "Global", workMode: "Hybrid" },
  { organization: "LG Electronics", url: "https://www.lg.com/global/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Rakuten", url: "https://global.rakuten.com/corp/careers/", location: "Japan, Global", workMode: "Hybrid" },
  { organization: "Shopify", url: "https://www.shopify.com/careers", location: "Global", workMode: "Remote" },
  { organization: "Atlassian", url: "https://www.atlassian.com/company/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Slack (Salesforce)", url: "https://salesforce.com/company/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "GitHub", url: "https://github.com/about/careers", location: "Global", workMode: "Remote" },
  { organization: "GitLab", url: "https://about.gitlab.com/jobs/", location: "Global", workMode: "Remote" },
  { organization: "Cloudflare", url: "https://www.cloudflare.com/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "Fastly", url: "https://www.fastly.com/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Datadog", url: "https://careers.datadoghq.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Okta", url: "https://www.okta.com/company/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "CrowdStrike", url: "https://www.crowdstrike.com/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "Palo Alto Networks", url: "https://jobs.paloaltonetworks.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Fortinet", url: "https://www.fortinet.com/corporate/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Check Point", url: "https://careers.checkpoint.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Zscaler", url: "https://www.zscaler.com/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Splunk", url: "https://www.splunk.com/en_us/careers.html", location: "Global", workMode: "Hybrid" },
  { organization: "Elastic", url: "https://www.elastic.co/careers", location: "Global", workMode: "Remote" },
  { organization: "Confluent", url: "https://www.confluent.io/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "Twilio", url: "https://www.twilio.com/company/jobs", location: "Global", workMode: "Hybrid" },
  { organization: "Zoom", url: "https://careers.zoom.us/", location: "Global", workMode: "Hybrid" },
  { organization: "DocuSign", url: "https://careers.docusign.com/", location: "Global", workMode: "Hybrid" },
  { organization: "Dropbox", url: "https://www.dropbox.com/jobs", location: "Global", workMode: "Hybrid" },
  { organization: "Box", url: "https://www.box.com/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Notion", url: "https://www.notion.so/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Figma", url: "https://www.figma.com/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "Canva", url: "https://www.canva.com/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "HubSpot", url: "https://www.hubspot.com/careers", location: "Global", workMode: "Hybrid" },
  { organization: "Zendesk", url: "https://www.zendesk.com/company/careers/", location: "Global", workMode: "Hybrid" },
  { organization: "SAP Concur", url: "https://jobs.sap.com/", location: "Global", workMode: "Hybrid" },
];

const ROLE_TEMPLATES = [
  {
    title: "Software Engineering Intern",
    desc: "Student program and early career software roles. Check the employer site for locations, terms, and how to apply.",
  },
  {
    title: "Product or Program Intern",
    desc: "Product management, program management, or related student opportunities. Eligibility varies by region.",
  },
  {
    title: "Data and Analytics Intern",
    desc: "Data science, analytics, or business intelligence internships. Confirm degree requirements on the official posting.",
  },
];

const SOURCE_ROTATION = [
  {
    sourceType: "Company website",
    sourceNote: "Link points to the employer public careers or student program hub.",
  },
  {
    sourceType: "LinkedIn",
    sourceNote: "Also discoverable via LinkedIn Jobs. Always verify deadlines on the employer site.",
  },
  {
    sourceType: "Indeed",
    sourceNote: "Similar roles may appear on Indeed. Official application is through the employer.",
  },
  {
    sourceType: "University portal",
    sourceNote: "Often cross listed on university career boards. Confirm on the employer careers page.",
  },
];

function slug(s) {
  return String(s)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
}

/**
 * Build a LinkedIn Jobs search filtered by the role title and company so the
 * destination matches a card labelled "LinkedIn".
 */
function linkedInSearchUrl(org, roleTitle) {
  const keywords = [roleTitle, org.organization]
    .map((s) => String(s || "").trim())
    .filter(Boolean)
    .join(" ");
  const params = new URLSearchParams();
  if (keywords) params.set("keywords", keywords);
  const loc = String(org.location || "").trim();
  if (loc && !/^(global|varies|remote)$/i.test(loc)) {
    params.set("location", loc);
  }
  const qs = params.toString();
  return `https://www.linkedin.com/jobs/search/${qs ? `?${qs}` : ""}`;
}

/**
 * Build an Indeed search filtered by the role title and company.
 */
function indeedSearchUrl(org, roleTitle) {
  const o = String(org.organization || "").trim();
  const t = String(roleTitle || "").trim();
  const q = [t, o].filter(Boolean).join(" ");
  return `https://www.indeed.com/jobs?q=${encodeURIComponent(q)}`;
}

/**
 * Employer-native job search where we have a stable URL pattern; falls back to
 * a LinkedIn search rather than an unfiltered careers homepage.
 */
function employerSearchUrl(org, roleTitle) {
  const u = String(org.url || "");
  const q = encodeURIComponent(roleTitle);

  if (org.organization === "LinkedIn" || u.includes("careers.linkedin.com")) {
    return linkedInSearchUrl(org, roleTitle);
  }
  if (u.includes("careers.google.com")) {
    return `https://careers.google.com/jobs/results?q=${q}&employment_type=INTERN&hl=en`;
  }
  if (u.includes("jobs.careers.microsoft.com")) {
    return `https://jobs.careers.microsoft.com/us/en/search?q=${q}`;
  }
  if (u.includes("amazon.jobs")) {
    return `https://www.amazon.jobs/en/search?base_query=${q}`;
  }
  if (u.includes("metacareers.com")) {
    return `https://www.metacareers.com/jobs/?q=${q}`;
  }
  if (u.includes("jobs.apple.com")) {
    return `https://jobs.apple.com/en-us/search?search=${q}&sort=relevance&team=internship-STDNT-INTRN`;
  }
  if (u.includes("nvidia.com") && u.includes("careers")) {
    return `https://nvidia.wd5.myworkdayjobs.com/NVIDIAExternalCareerSite?q=${q}`;
  }
  if (u.includes("jobs.netflix.com") || u.includes("netflix.com")) {
    return `https://explore.jobs.netflix.net/careers?query=${q}`;
  }
  if (u.includes("careers.salesforce.com")) {
    return `https://careers.salesforce.com/en/jobs/?search=${q}`;
  }
  if (u.includes("careers.adobe.com")) {
    return `https://careers.adobe.com/us/en/search-results?keywords=${q}`;
  }
  if (u.includes("jobs.sap.com") || /sap\.com/.test(u)) {
    return `https://jobs.sap.com/search?q=${q}`;
  }
  if (u.includes("stripe.com/jobs")) {
    return `https://stripe.com/jobs/search?query=${q}`;
  }
  if (u.includes("jobs.lever.co/palantir")) {
    return `https://jobs.lever.co/palantir`;
  }
  if (u.includes("shopify.com/careers")) {
    return `https://www.shopify.com/careers/search?keywords=${q}`;
  }
  if (u.includes("ibm.com/careers")) {
    return `https://www.ibm.com/careers/search?q=${q}`;
  }
  if (u.includes("jobs.intel.com")) {
    return `https://jobs.intel.com/Search?q=${q}`;
  }
  if (u.includes("careers.oracle.com")) {
    return `https://careers.oracle.com/en/sites/jobsearch/jobs?keyword=${q}`;
  }
  if (u.includes("jobs.dell.com")) {
    return `https://jobs.dell.com/search-jobs?keyword=${q}`;
  }
  return linkedInSearchUrl(org, roleTitle);
}

/**
 * Choose a posting URL whose destination matches the source label on the row,
 * so the CTA never opens a generic careers homepage when the row claims to
 * link to LinkedIn or Indeed.
 */
function resolvePostingUrl(org, roleTitle, sourceType) {
  const t = String(sourceType || "").toLowerCase();
  if (t.includes("linkedin")) return linkedInSearchUrl(org, roleTitle);
  if (t.includes("indeed")) return indeedSearchUrl(org, roleTitle);
  return employerSearchUrl(org, roleTitle);
}

/** Target count (100+); cap keeps bundle/API payloads reasonable */
const MAX_ROWS = 120;

const rows = [];
let idx = 0;
outer: for (const org of ORGS) {
  for (const role of ROLE_TEMPLATES) {
    if (rows.length >= MAX_ROWS) break outer;
    const id = `intern-${slug(org.organization)}-${slug(role.title)}-${idx}`;
    const src = SOURCE_ROTATION[idx % SOURCE_ROTATION.length];
    const posted = new Date(2025, 10 + (idx % 5), 1 + (idx % 20));
    const postedAt = posted.toISOString().slice(0, 10);
    const postingUrl = resolvePostingUrl(org, role.title, src.sourceType);
    rows.push({
      id,
      title: role.title,
      organization: org.organization,
      location: org.location,
      workMode: org.workMode,
      duration: "See the full posting for program length and start dates.",
      description: role.desc,
      url: org.url,
      postingUrl,
      sourceType: src.sourceType,
      sourceNote: src.sourceNote,
      postedAt,
    });
    idx += 1;
  }
}

writeFileSync(outPath, JSON.stringify(rows, null, 2), "utf-8");
console.log(`Wrote ${rows.length} internships to ${outPath}`);

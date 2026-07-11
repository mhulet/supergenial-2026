// seo.ts — Injecte canonical + hreflang + JSON-LD dans toutes les pages, et génère
// robots.txt, sitemap.xml, llms.txt. Idempotent. Usage : bun ressources/seo.ts
// Étape de post-build SEO/GEO (à relancer après un ajout de page).

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = dirname(dirname(new URL(import.meta.url).pathname));
const BASE = "https://www.supergenial.be";

const SLUGS: Record<string, string> = {
  "rails-7-1-fin-de-support": "rails-7-1-end-of-life",
  "ruby-3-2-fin-de-vie": "ruby-3-2-end-of-life",
  "ubuntu-20-04-fin-de-support": "ubuntu-20-04-end-of-life",
  "migrer-rails-6-vers-7": "upgrade-rails-6-to-7",
  "webpacker-vers-esbuild": "webpacker-to-esbuild",
  "delayedjob-vers-solid-queue": "delayedjob-to-solid-queue",
  "utf8mb3-vers-utf8mb4-mysql": "utf8mb3-to-utf8mb4-mysql",
  "cout-mise-a-niveau-rails": "rails-upgrade-cost",
  "reprendre-application-sans-documentation": "take-over-a-rails-app-without-documentation",
  "rails-8-nouveautes": "rails-8-whats-new",
};

type Page = {
  file: string; fr: string; en: string; lang: "fr" | "en"; type: "home" | "page" | "article";
};

const pages: Page[] = [
  { file: "index.html", fr: "/", en: "/en/", lang: "fr", type: "home" },
  { file: "en/index.html", fr: "/", en: "/en/", lang: "en", type: "home" },
  { file: "maintenance/index.html", fr: "/maintenance/", en: "/en/maintenance/", lang: "fr", type: "page" },
  { file: "en/maintenance/index.html", fr: "/maintenance/", en: "/en/maintenance/", lang: "en", type: "page" },
  { file: "tarifs/index.html", fr: "/tarifs/", en: "/en/pricing/", lang: "fr", type: "page" },
  { file: "en/pricing/index.html", fr: "/tarifs/", en: "/en/pricing/", lang: "en", type: "page" },
  { file: "ressources/index.html", fr: "/ressources/", en: "/en/resources/", lang: "fr", type: "page" },
  { file: "en/resources/index.html", fr: "/ressources/", en: "/en/resources/", lang: "en", type: "page" },
];
for (const [fr, en] of Object.entries(SLUGS)) {
  pages.push({ file: `ressources/${fr}/index.html`, fr: `/ressources/${fr}/`, en: `/en/resources/${en}/`, lang: "fr", type: "article" });
  pages.push({ file: `en/resources/${en}/index.html`, fr: `/ressources/${fr}/`, en: `/en/resources/${en}/`, lang: "en", type: "article" });
}

// Réalisations / case studies — découvertes depuis les drafts JSON (source versionnée).
import { readdirSync } from "node:fs";
pages.push({ file: "realisations/index.html", fr: "/realisations/", en: "/en/case-studies/", lang: "fr", type: "page" });
pages.push({ file: "en/case-studies/index.html", fr: "/realisations/", en: "/en/case-studies/", lang: "en", type: "page" });
for (const f of readdirSync(join(ROOT, "realisations", "_drafts")).filter((f) => f.endsWith(".json"))) {
  const d = JSON.parse(readFileSync(join(ROOT, "realisations", "_drafts", f), "utf8"));
  pages.push({ file: `realisations/${d.slug}/index.html`, fr: `/realisations/${d.slug}/`, en: `/en/case-studies/${d.slug_en}/`, lang: "fr", type: "article" });
  pages.push({ file: `en/case-studies/${d.slug_en}/index.html`, fr: `/realisations/${d.slug}/`, en: `/en/case-studies/${d.slug_en}/`, lang: "en", type: "article" });
}

const grab = (h: string, re: RegExp) => (h.match(re)?.[1] ?? "").trim();

const orgLd = (lang: "fr" | "en", url: string) => ({
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": BASE + "/#business",
  name: "Super Génial",
  legalName: "Marco & Vespucci SRL",
  url,
  description: lang === "fr"
    ? "Reprise, mise à niveau et maintenance d'applications web vieillissantes (Ruby on Rails et autres) et de leurs serveurs Ubuntu, à prix fixe."
    : "Take-over, upgrade and maintenance of aging web applications (Ruby on Rails and others) and their Ubuntu servers, at a fixed price.",
  email: "team@supergenial.be",
  founder: { "@type": "Person", name: "Michael Hulet" },
  areaServed: { "@type": "Place", name: "Europe" },
  knowsAbout: ["Ruby on Rails", "Rails upgrade", "Ruby upgrade", "web application maintenance", "Ubuntu server maintenance", "legacy application modernization"],
  sameAs: ["https://www.linkedin.com/in/michaelhulet/", "https://github.com/mhulet", "https://t.me/supergenialdotbe"],
  vatID: "BE0523920556",
  address: { "@type": "PostalAddress", streetAddress: "rue Ernest Feron 64", addressLocality: "Eghezée", addressCountry: "BE" },
});

const articleLd = (p: Page, url: string, title: string, desc: string, date: string) => ({
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  headline: title,
  description: desc,
  datePublished: date,
  dateModified: date,
  inLanguage: p.lang,
  url,
  mainEntityOfPage: url,
  author: { "@type": "Organization", name: "Super Génial", url: BASE + "/" },
  publisher: { "@type": "Organization", name: "Super Génial", url: BASE + "/" },
  isPartOf: { "@type": "Blog", name: p.lang === "fr" ? "Super Génial — Ressources" : "Super Génial — Resources", url: BASE + (p.lang === "fr" ? "/ressources/" : "/en/resources/") },
});

function headInject(html: string, block: string): string {
  return html.replace("</head>", block + "\n</head>");
}

const collected: { fr: string; en: string; date: string; titleFr?: string; titleEn?: string; descFr?: string; descEn?: string }[] = [];
const byPair: Record<string, any> = {};

let n = 0;
for (const p of pages) {
  const file = join(ROOT, p.file);
  if (!existsSync(file)) { console.error(`⚠ absent : ${p.file}`); continue; }
  let html = readFileSync(file, "utf8");
  const selfUrl = BASE + (p.lang === "fr" ? p.fr : p.en);
  const bits: string[] = [];

  // canonical (si absent)
  if (!/rel="canonical"/.test(html)) bits.push(`    <link rel="canonical" href="${selfUrl}">`);
  // hreflang (si absent)
  if (!/hreflang=/.test(html)) {
    bits.push(`    <link rel="alternate" hreflang="fr" href="${BASE}${p.fr}">`);
    bits.push(`    <link rel="alternate" hreflang="en" href="${BASE}${p.en}">`);
    bits.push(`    <link rel="alternate" hreflang="x-default" href="${BASE}${p.fr}">`);
  }
  // JSON-LD (si absent)
  if (!/application\/ld\+json/.test(html)) {
    let ld: any = null;
    if (p.type === "home") ld = orgLd(p.lang, selfUrl);
    else if (p.type === "article") {
      const title = grab(html, /<title>([^<]*)<\/title>/).replace(/\s*—\s*Super Génial\s*$/, "");
      const desc = grab(html, /<meta name="description" content="([^"]*)"/);
      const date = grab(html, /<meta property="article:published_time" content="([^"]*)"/);
      if (title && date) ld = articleLd(p, selfUrl, title, desc, date);
    }
    if (ld) bits.push(`    <script type="application/ld+json">${JSON.stringify(ld)}</script>`);
  }

  if (bits.length) { html = headInject(html, bits.join("\n")); writeFileSync(file, html); n++; }

  // collecte pour sitemap / llms
  const key = p.fr;
  byPair[key] = byPair[key] || { fr: p.fr, en: p.en, date: "2026-07-11" };
  if (p.type === "article") {
    byPair[key].date = grab(html, /<meta property="article:published_time" content="([^"]*)"/) || byPair[key].date;
    byPair[key].isArticle = true;
  }
  const t = grab(html, /<title>([^<]*)<\/title>/).replace(/\s*—\s*Super Génial\s*$/, "");
  const d = grab(html, /<meta name="description" content="([^"]*)"/);
  if (p.lang === "fr") { byPair[key].titleFr = t; byPair[key].descFr = d; }
  else { byPair[key].titleEn = t; byPair[key].descEn = d; }
}
console.log(`✓ ${n} pages enrichies (canonical/hreflang/JSON-LD)`);

// ---- sitemap.xml (avec alternates hreflang) ----
const entries = Object.values(byPair) as any[];
const urlset = entries.flatMap((e) => [e.fr, e.en].map((loc) => {
  const alts = `\n    <xhtml:link rel="alternate" hreflang="fr" href="${BASE}${e.fr}"/>` +
    `\n    <xhtml:link rel="alternate" hreflang="en" href="${BASE}${e.en}"/>` +
    `\n    <xhtml:link rel="alternate" hreflang="x-default" href="${BASE}${e.fr}"/>`;
  return `  <url>\n    <loc>${BASE}${loc}</loc>\n    <lastmod>${e.date}</lastmod>${alts}\n  </url>`;
})).join("\n");
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${urlset}\n</urlset>\n`;
writeFileSync(join(ROOT, "sitemap.xml"), sitemap);
console.log(`✓ sitemap.xml (${entries.length * 2} URLs)`);

// ---- robots.txt (agents IA explicitement bienvenus) ----
const aiBots = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot", "Claude-Web", "anthropic-ai", "PerplexityBot", "Perplexity-User", "Google-Extended", "Applebot-Extended", "CCBot", "Amazonbot", "cohere-ai", "Meta-ExternalAgent", "Bytespider", "Diffbot", "YouBot"];
const robots = `# Super Génial — supergenial.be\nUser-agent: *\nAllow: /\n\n# Les agents et crawlers IA sont explicitement bienvenus (GEO)\n${aiBots.map((b) => `User-agent: ${b}\nAllow: /`).join("\n\n")}\n\nSitemap: ${BASE}/sitemap.xml\n`;
writeFileSync(join(ROOT, "robots.txt"), robots);
console.log("✓ robots.txt");

// ---- llms.txt (convention pour agents IA) ----
const articles = entries.filter((e) => e.isArticle).sort((a, b) => b.date.localeCompare(a.date));
const artLines = articles.map((e) => `- [${e.titleFr}](${BASE}${e.fr}) — ${e.descFr}`).join("\n");
const llms = `# Super Génial

> Super Génial (Marco & Vespucci SRL) est l'activité de Michael Hulet, « agentic builder » belge. Spécialité : reprendre, mettre à niveau et maintenir des applications web vieillissantes — Ruby on Rails en priorité, mais aussi toute application web hébergée sur un VPS — ainsi que leurs serveurs Ubuntu, à prix fixe.

Michael conçoit des applications avec des agents IA et remet à niveau les applications existantes (mise à jour de framework, migration de version, durcissement serveur) sans tout casser, par paliers testés. Zone : Europe. Contact : team@supergenial.be.

## Services
- [Maintenance & mises à jour](${BASE}/maintenance/) : reprise d'applications Rails et web vieillissantes + serveurs Ubuntu. Audit à prix fixe (490 €), mise à niveau au forfait, abonnement de maintenance dès 290 €/mois.
- [Tarifs](${BASE}/tarifs/) : forfait de lancement, abonnement mensuel, forfaits feature — prix annoncés d'avance, jamais à l'heure.

## Ressources (guides sur les fins de support et migrations)
${artLines}

## À propos
- Entité : Marco & Vespucci SRL (BCE BE 0523.920.556), Eghezée, Belgique.
- Fondateur : Michael Hulet.
- Site : ${BASE}/ · Version anglaise : ${BASE}/en/
- Contact : team@supergenial.be · LinkedIn : https://www.linkedin.com/in/michaelhulet/
`;
writeFileSync(join(ROOT, "llms.txt"), llms);
console.log("✓ llms.txt");

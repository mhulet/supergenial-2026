// seo2.ts — Itération 2 SEO/GEO : FAQPage + Service + BreadcrumbList + Twitter Cards.
// Idempotent (chaque bloc gardé par un marqueur de @type). Usage : bun ressources/seo2.ts

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

type Page = { file: string; url: string; lang: "fr" | "en"; type: "home" | "maintenance" | "pricing" | "resources" | "article" };
const pages: Page[] = [
  { file: "index.html", url: "/", lang: "fr", type: "home" },
  { file: "en/index.html", url: "/en/", lang: "en", type: "home" },
  { file: "maintenance/index.html", url: "/maintenance/", lang: "fr", type: "maintenance" },
  { file: "en/maintenance/index.html", url: "/en/maintenance/", lang: "en", type: "maintenance" },
  { file: "tarifs/index.html", url: "/tarifs/", lang: "fr", type: "pricing" },
  { file: "en/pricing/index.html", url: "/en/pricing/", lang: "en", type: "pricing" },
  { file: "ressources/index.html", url: "/ressources/", lang: "fr", type: "resources" },
  { file: "en/resources/index.html", url: "/en/resources/", lang: "en", type: "resources" },
];
for (const [fr, en] of Object.entries(SLUGS)) {
  pages.push({ file: `ressources/${fr}/index.html`, url: `/ressources/${fr}/`, lang: "fr", type: "article" });
  pages.push({ file: `en/resources/${en}/index.html`, url: `/en/resources/${en}/`, lang: "en", type: "article" });
}

const grab = (h: string, re: RegExp) => (h.match(re)?.[1] ?? "").trim();

function stripTags(s: string): string {
  return s
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&").replace(/&nbsp;/g, " ").replace(/&#39;|&rsquo;|&apos;/g, "'")
    .replace(/&laquo;|&raquo;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&quot;/g, '"')
    .replace(/\s+/g, " ").trim();
}

function extractFaq(html: string): { q: string; a: string }[] {
  const out: { q: string; a: string }[] = [];
  for (const m of html.matchAll(/<div class="faq-q">([\s\S]*?)<\/div>\s*<div class="faq-a">([\s\S]*?)<\/div>/g)) {
    const q = stripTags(m[1]); const a = stripTags(m[2]);
    if (q && a) out.push({ q, a });
  }
  return out;
}

const ldScript = (obj: any) => `    <script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const headInject = (html: string, block: string) => html.replace("</head>", block + "\n</head>");

let n = 0;
for (const p of pages) {
  const file = join(ROOT, p.file);
  if (!existsSync(file)) { console.error(`⚠ absent : ${p.file}`); continue; }
  let html = readFileSync(file, "utf8");
  const selfUrl = BASE + p.url;
  const add: string[] = [];

  // Twitter Cards (si absent)
  if (!/name="twitter:card"/.test(html)) {
    const ogT = grab(html, /<meta property="og:title"\s+content="([^"]*)"/);
    const ogD = grab(html, /<meta property="og:description"\s+content="([^"]*)"/);
    add.push(`    <meta name="twitter:card" content="summary">`);
    if (ogT) add.push(`    <meta name="twitter:title" content="${ogT}">`);
    if (ogD) add.push(`    <meta name="twitter:description" content="${ogD}">`);
  }

  // FAQPage (maintenance + pricing)
  if ((p.type === "maintenance" || p.type === "pricing") && !/"FAQPage"/.test(html)) {
    const faq = extractFaq(html);
    if (faq.length) {
      add.push(ldScript({
        "@context": "https://schema.org", "@type": "FAQPage", inLanguage: p.lang,
        mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
      }));
    }
  }

  // Service (maintenance)
  if (p.type === "maintenance" && !/"Service"/.test(html)) {
    add.push(ldScript({
      "@context": "https://schema.org", "@type": "Service",
      name: p.lang === "fr" ? "Maintenance et mise à niveau d'applications web" : "Web application maintenance and upgrades",
      serviceType: p.lang === "fr" ? "Reprise, mise à niveau et maintenance d'applications Rails et de serveurs Ubuntu" : "Take-over, upgrade and maintenance of Rails applications and Ubuntu servers",
      provider: { "@type": "ProfessionalService", name: "Super Génial", url: BASE + "/" },
      areaServed: { "@type": "Place", name: "Europe" },
      url: selfUrl, inLanguage: p.lang,
      offers: { "@type": "Offer", name: p.lang === "fr" ? "Audit technique" : "Technical audit", price: "490", priceCurrency: "EUR" },
    }));
  }

  // BreadcrumbList (articles)
  if (p.type === "article" && !/"BreadcrumbList"/.test(html)) {
    const title = grab(html, /<title>([^<]*)<\/title>/).replace(/\s*—\s*Super Génial\s*$/, "");
    const resUrl = p.lang === "fr" ? BASE + "/ressources/" : BASE + "/en/resources/";
    add.push(ldScript({
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Super Génial", item: BASE + (p.lang === "fr" ? "/" : "/en/") },
        { "@type": "ListItem", position: 2, name: p.lang === "fr" ? "Ressources" : "Resources", item: resUrl },
        { "@type": "ListItem", position: 3, name: title, item: selfUrl },
      ],
    }));
  }

  if (add.length) { html = headInject(html, add.join("\n")); writeFileSync(file, html); n++; console.log(`✓ ${p.file} (+${add.length})`); }
}
console.log(`\n✓ ${n} pages enrichies (itération 2)`);

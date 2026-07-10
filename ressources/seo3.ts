// seo3.ts — Itération 3 SEO/GEO on-page : chapô "En bref" (answer-first) + maillage
// interne (articles liés) sur les 20 pages d'articles. Idempotent. Usage : bun ressources/seo3.ts

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = dirname(dirname(new URL(import.meta.url).pathname));

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

// Articles liés (par pertinence thématique), en fr_slug.
const RELATED: Record<string, string[]> = {
  "rails-7-1-fin-de-support": ["ruby-3-2-fin-de-vie", "migrer-rails-6-vers-7", "rails-8-nouveautes"],
  "ruby-3-2-fin-de-vie": ["rails-7-1-fin-de-support", "rails-8-nouveautes", "migrer-rails-6-vers-7"],
  "ubuntu-20-04-fin-de-support": ["rails-7-1-fin-de-support", "cout-mise-a-niveau-rails", "reprendre-application-sans-documentation"],
  "migrer-rails-6-vers-7": ["rails-7-1-fin-de-support", "rails-8-nouveautes", "webpacker-vers-esbuild"],
  "webpacker-vers-esbuild": ["migrer-rails-6-vers-7", "delayedjob-vers-solid-queue", "rails-8-nouveautes"],
  "delayedjob-vers-solid-queue": ["rails-8-nouveautes", "webpacker-vers-esbuild", "migrer-rails-6-vers-7"],
  "utf8mb3-vers-utf8mb4-mysql": ["reprendre-application-sans-documentation", "cout-mise-a-niveau-rails", "migrer-rails-6-vers-7"],
  "cout-mise-a-niveau-rails": ["reprendre-application-sans-documentation", "rails-7-1-fin-de-support", "ubuntu-20-04-fin-de-support"],
  "reprendre-application-sans-documentation": ["cout-mise-a-niveau-rails", "utf8mb3-vers-utf8mb4-mysql", "rails-7-1-fin-de-support"],
  "rails-8-nouveautes": ["migrer-rails-6-vers-7", "ruby-3-2-fin-de-vie", "delayedjob-vers-solid-queue"],
};

const grab = (h: string, re: RegExp) => (h.match(re)?.[1] ?? "").trim();
const frFile = (s: string) => join(ROOT, "ressources", s, "index.html");
const enFile = (s: string) => join(ROOT, "en", "resources", SLUGS[s], "index.html");
const frUrl = (s: string) => `/ressources/${s}/`;
const enUrl = (s: string) => `/en/resources/${SLUGS[s]}/`;

// Titres par (lang, fr_slug), lus depuis les pages.
const titles: Record<string, string> = {};
for (const s of Object.keys(SLUGS)) {
  if (existsSync(frFile(s))) titles["fr:" + s] = grab(readFileSync(frFile(s), "utf8"), /<title>([^<]*)<\/title>/).replace(/\s*—\s*Super Génial\s*$/, "");
  if (existsSync(enFile(s))) titles["en:" + s] = grab(readFileSync(enFile(s), "utf8"), /<title>([^<]*)<\/title>/).replace(/\s*—\s*Super Génial\s*$/, "");
}

const CSS = `/*seo3*/
.article-lead{font-size:17px;line-height:1.55;color:var(--text-primary);border-left:2px solid var(--accent-1);padding-left:1rem;margin:0 0 2rem;font-weight:500}
.related{margin-top:3rem;border-top:1px solid var(--card-border);padding-top:1.5rem}
.related h2{font-size:14px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;color:var(--text-secondary);margin-bottom:.9rem}
.related ul{list-style:none;display:flex;flex-direction:column;gap:.6rem}
.related li{font-size:15px;line-height:1.4}
.related a{color:var(--text-primary)}`;

let n = 0;
for (const [lang, mkFile, mkUrl] of [["fr", frFile, frUrl] as const, ["en", enFile, enUrl] as const]) {
  for (const s of Object.keys(SLUGS)) {
    const file = mkFile(s);
    if (!existsSync(file)) { console.error(`⚠ absent : ${file}`); continue; }
    let html = readFileSync(file, "utf8");
    let changed = false;

    if (!html.includes("/*seo3*/")) { html = html.replace("</style>", CSS + "\n</style>"); changed = true; }

    // Chapô answer-first : la meta description, en tête de l'article.
    if (!html.includes('class="article-lead"')) {
      const desc = grab(html, /<meta name="description" content="([^"]*)"/);
      if (desc) {
        html = html.replace(/(<div class="article-body[^"]*">)/, `$1\n                <p class="article-lead">${desc}</p>`);
        changed = true;
      }
    }

    // Maillage interne : articles liés, avant la CTA-box.
    if (!html.includes('class="related"')) {
      const rel = (RELATED[s] || []).filter((r) => titles[lang + ":" + r]);
      if (rel.length) {
        const heading = lang === "fr" ? "À lire aussi" : "Related reading";
        const items = rel.map((r) => `                    <li><a href="${mkUrl(r)}">${titles[lang + ":" + r]}</a></li>`).join("\n");
        const block = `            <nav class="related">\n                <h2>${heading}</h2>\n                <ul>\n${items}\n                </ul>\n            </nav>\n`;
        html = html.replace(/(\s*)(<div class="cta-box)/, `\n${block}$1$2`);
        changed = true;
      }
    }

    if (changed) { writeFileSync(file, html); n++; console.log(`✓ ${lang} ${s}`); }
  }
}
console.log(`\n✓ ${n} pages d'articles enrichies (chapô + maillage interne)`);

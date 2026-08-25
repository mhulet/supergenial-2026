// langswitch.ts — Remplace l'ancien sélecteur de langue (texte « · English »)
// par un toggle segmenté FR / EN avec globe, sur toutes les pages FR et EN.
// Idempotent (marqueur /*langswitch*/). Étape de post-build. Usage : bun ressources/langswitch.ts

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = dirname(dirname(new URL(import.meta.url).pathname)); // repo root

// Correspondance FR slug → EN slug (articles).
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

// Correspondance FR slug → EN slug (études de cas / réalisations).
const CASE_SLUGS: Record<string, string> = {
  "silvea": "silvea",
  "tranches-de-vie": "tranches-de-vie",
  "claudy": "claudy",
  "terranova": "terranova",
  "site-semisto": "site-semisto",
};

// Paires d'URL { fr, en } par "clé de page".
const PAIRS: Record<string, { fr: string; en: string }> = {
  home: { fr: "/", en: "/en/" },
  maintenance: { fr: "/maintenance/", en: "/en/maintenance/" },
  pricing: { fr: "/tarifs/", en: "/en/pricing/" },
  diagnostic: { fr: "/diagnostic-ia/", en: "/en/ai-assessment/" },
  resources: { fr: "/ressources/", en: "/en/resources/" },
  cases: { fr: "/realisations/", en: "/en/case-studies/" },
};
for (const [fr, en] of Object.entries(SLUGS)) {
  PAIRS["art:" + fr] = { fr: `/ressources/${fr}/`, en: `/en/resources/${en}/` };
}
for (const [fr, en] of Object.entries(CASE_SLUGS)) {
  PAIRS["case:" + fr] = { fr: `/realisations/${fr}/`, en: `/en/case-studies/${en}/` };
}

const CSS = `/*langswitch*/
.topbar{display:flex;align-items:center;justify-content:space-between;gap:1rem;margin-bottom:2.5rem;flex-wrap:wrap}
.topbar--end{justify-content:flex-end}
.topbar .back-link{margin-bottom:0}
.lang-switch{display:inline-flex;align-items:center;padding:3px 3px 3px 1px;border-radius:999px;background:rgba(128,128,128,.10);border:1px solid rgba(128,128,128,.22);font-size:12px;font-weight:600;letter-spacing:.04em;flex-shrink:0}
.lang-switch .lang-globe{color:var(--text-secondary);margin:0 .4rem 0 .48rem;flex-shrink:0;display:block}
.lang-switch a{text-decoration:none;color:var(--text-secondary);padding:.28rem .62rem;border-radius:999px;line-height:1;transition:color .2s ease,background .2s ease,box-shadow .2s ease}
.lang-switch a::after{display:none!important}
.lang-switch a:hover{color:var(--text-primary)}
.lang-switch a.is-active,.lang-switch a.is-active:hover{color:#fff;background:linear-gradient(135deg,var(--accent-1),var(--accent-2));box-shadow:0 2px 10px -3px rgba(99,102,241,.45)}`;

const GLOBE = `<svg class="lang-globe" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18"/><ellipse cx="12" cy="12" rx="4.2" ry="9"/></svg>`;

function pill(fr: string, en: string, active: "fr" | "en"): string {
  return `<div class="lang-switch" aria-label="Language / Langue">${GLOBE}` +
    `<a href="${fr}"${active === "fr" ? ' class="is-active"' : ""}>FR</a>` +
    `<a href="${en}"${active === "en" ? ' class="is-active"' : ""}>EN</a></div>`;
}

// Nettoie l'ancien sélecteur (div home + suffixe " · <a langswitch>").
function stripOld(html: string): string {
  return html
    .replace(/<div style="font-size:14px;margin-bottom:1rem;"><a[^>]*>(?:English|Français)<\/a><\/div>\s*/g, "")
    .replace(/\s*·\s*<a href="[^"]*" class="plain"(?: data-langswitch)?>(?:English|Français|EN|FR)<\/a>/g, "");
}

type Page = { path: string; key: string; active: "fr" | "en" };
const pages: Page[] = [
  { path: "index.html", key: "home", active: "fr" },
  { path: "maintenance/index.html", key: "maintenance", active: "fr" },
  { path: "tarifs/index.html", key: "pricing", active: "fr" },
  { path: "diagnostic-ia/index.html", key: "diagnostic", active: "fr" },
  { path: "en/ai-assessment/index.html", key: "diagnostic", active: "en" },
  { path: "ressources/index.html", key: "resources", active: "fr" },
  { path: "en/index.html", key: "home", active: "en" },
  { path: "en/maintenance/index.html", key: "maintenance", active: "en" },
  { path: "en/pricing/index.html", key: "pricing", active: "en" },
  { path: "en/resources/index.html", key: "resources", active: "en" },
];
for (const [fr, en] of Object.entries(SLUGS)) {
  pages.push({ path: `ressources/${fr}/index.html`, key: "art:" + fr, active: "fr" });
  pages.push({ path: `en/resources/${en}/index.html`, key: "art:" + fr, active: "en" });
}
pages.push({ path: "realisations/index.html", key: "cases", active: "fr" });
pages.push({ path: "en/case-studies/index.html", key: "cases", active: "en" });
for (const [fr, en] of Object.entries(CASE_SLUGS)) {
  pages.push({ path: `realisations/${fr}/index.html`, key: "case:" + fr, active: "fr" });
  pages.push({ path: `en/case-studies/${en}/index.html`, key: "case:" + fr, active: "en" });
}

let done = 0;
for (const pg of pages) {
  const file = join(ROOT, pg.path);
  if (!existsSync(file)) { console.error(`⚠ absent : ${pg.path}`); continue; }
  let html = readFileSync(file, "utf8");
  const pair = PAIRS[pg.key];
  const p = pill(pair.fr, pair.en, pg.active);

  // 1. CSS (idempotent)
  if (!html.includes("/*langswitch*/")) {
    html = html.replace("</style>", CSS + "\n</style>");
  }

  // 2. Retirer l'ancien sélecteur si le nouveau n'est pas déjà là
  if (!html.includes('class="lang-switch"')) {
    html = stripOld(html);
    const backlink = html.match(/<a href="[^"]*" class="back-link plain">[^<]*<\/a>/);
    if (backlink) {
      // barre : back-link à gauche, toggle à droite
      html = html.replace(backlink[0], `<div class="topbar">${backlink[0]}${p}</div>`);
    } else {
      // pas de back-link (accueil) : toggle seul, aligné à droite, après <main>
      html = html.replace(/<main>/, `<main>\n        <div class="topbar topbar--end">${p}</div>`);
    }
  }

  writeFileSync(file, html);
  done++;
  console.log(`✓ ${pg.path}`);
}
console.log(`\n${done} pages traitées.`);

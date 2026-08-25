// mainnav.ts — Injecte le menu principal du site (marque + 5 sections + sélecteur
// de langue + burger mobile) sur toutes les pages FR et EN, en remplaçant la
// barre `.topbar` posée par langswitch.ts.
// Idempotent (marqueurs <!--mainnav-->, /*mainnav*/, /*mainnavjs*/) : relancer
// le script régénère le header en place. Étape de post-build, TOUJOURS après
// langswitch.ts. Usage : bun ressources/mainnav.ts

import { readFileSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { execSync } from "node:child_process";

const ROOT = dirname(dirname(new URL(import.meta.url).pathname)); // repo root

type Section = "diagnostic" | "pricing" | "cases" | "resources" | "maintenance" | null;

const NAV: Record<"fr" | "en", { label: string; href: string; key: Section }[]> = {
  fr: [
    { label: "Diagnostic IA", href: "/diagnostic-ia/", key: "diagnostic" },
    { label: "Tarifs", href: "/tarifs/", key: "pricing" },
    { label: "Réalisations", href: "/realisations/", key: "cases" },
    { label: "Ressources", href: "/ressources/", key: "resources" },
    { label: "Maintenance", href: "/maintenance/", key: "maintenance" },
  ],
  en: [
    { label: "AI Assessment", href: "/en/ai-assessment/", key: "diagnostic" },
    { label: "Pricing", href: "/en/pricing/", key: "pricing" },
    { label: "Case studies", href: "/en/case-studies/", key: "cases" },
    { label: "Resources", href: "/en/resources/", key: "resources" },
    { label: "Maintenance", href: "/en/maintenance/", key: "maintenance" },
  ],
};

const CSS = `/*mainnav*/
.site-head{margin-left:calc(50% - 50vw);margin-right:calc(50% - 50vw);padding:0.9rem max(1.5rem,calc(50vw - 480px));border-bottom:1px solid rgba(128,128,128,.15);margin-bottom:2.5rem}
.site-nav{display:flex;align-items:center;gap:0.9rem;flex-wrap:wrap}
.site-nav a::after{display:none!important}
.site-nav .brand{display:inline-flex;align-items:center;gap:.5rem;font-weight:600;font-size:15px;letter-spacing:-.01em;margin-right:auto;white-space:nowrap;color:var(--text-primary)}
.site-nav .brand-mark{width:11px;height:11px;border-radius:3.5px;background:linear-gradient(135deg,var(--accent-1),var(--accent-2));flex-shrink:0}
.nav-menu{display:flex;align-items:center;gap:1rem}
.nav-menu a{font-size:13.5px;color:var(--text-secondary);white-space:nowrap;padding-bottom:4px;transition:color .2s ease}
.nav-menu a:hover{color:var(--text-primary)}
.nav-menu a[aria-current]{color:var(--text-primary);background:linear-gradient(90deg,var(--accent-1),var(--accent-2)) left bottom/100% 2px no-repeat}
.nav-toggle{display:none;background:none;border:1px solid rgba(128,128,128,.22);border-radius:8px;padding:.42rem .5rem;color:var(--text-primary);cursor:pointer;line-height:0}
.nav-toggle:hover{border-color:var(--accent-1)}
.nav-toggle .i-close{display:none}
.site-nav.open .nav-toggle .i-burger{display:none}
.site-nav.open .nav-toggle .i-close{display:block}
@media (max-width:860px){
.nav-toggle{display:inline-flex;order:3}
.site-nav .lang-switch{order:2;margin-left:auto}
.site-nav .brand{margin-right:0;order:1}
.nav-menu{display:none;order:4;width:100%;flex-direction:column;align-items:stretch;gap:0;padding:.6rem 0 .2rem;border-top:1px solid rgba(128,128,128,.18);margin-top:.85rem}
.site-nav.open .nav-menu{display:flex}
.nav-menu a{font-size:15px;padding:.55rem 0;width:100%}
.nav-menu a[aria-current]{background-size:2.2rem 2px}
}
/* Illustrations : disponibles sur toutes les pages (trait noir → blanc en dark) */
.illu{display:block;margin:2.5rem auto 0;max-width:min(420px,80%);height:auto}
.illu--small{max-width:min(300px,60%)}
@media (prefers-color-scheme:dark){.illu{filter:invert(1) hue-rotate(180deg)}}`;

const JS = `<script>/*mainnavjs*/(function(){var n=document.querySelector(".site-nav"),t=document.querySelector(".nav-toggle");if(!n||!t)return;t.addEventListener("click",function(){var o=n.classList.toggle("open");t.setAttribute("aria-expanded",o?"true":"false")});})();</script>`;

const BURGER = `<svg class="i-burger" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M4 7h16M4 12h16M4 17h16"/></svg><svg class="i-close" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>`;

function sectionOf(path: string): Section {
  if (/^(diagnostic-ia|en\/ai-assessment)\//.test(path)) return "diagnostic";
  if (/^(tarifs|en\/pricing)\//.test(path)) return "pricing";
  if (/^(realisations|en\/case-studies)\//.test(path)) return "cases";
  if (/^(ressources|en\/resources)\//.test(path)) return "resources";
  if (/^(maintenance|en\/maintenance)\//.test(path)) return "maintenance";
  return null;
}

function header(lang: "fr" | "en", active: Section, pill: string): string {
  const links = NAV[lang]
    .map((l) => `<a href="${l.href}" class="plain"${l.key === active ? ' aria-current="page"' : ""}>${l.label}</a>`)
    .join("");
  const home = lang === "fr" ? "/" : "/en/";
  const navLabel = lang === "fr" ? "Navigation principale" : "Main navigation";
  const menuLabel = lang === "fr" ? "Ouvrir le menu" : "Open menu";
  return (
    `<!--mainnav--><header class="site-head"><nav class="site-nav" aria-label="${navLabel}">` +
    `<a href="${home}" class="brand plain"><span class="brand-mark" aria-hidden="true"></span>Super Génial</a>` +
    `<button class="nav-toggle plain" type="button" aria-expanded="false" aria-controls="site-menu" aria-label="${menuLabel}">${BURGER}</button>` +
    `<div class="nav-menu" id="site-menu">${links}</div>` +
    pill +
    `</nav></header><!--/mainnav-->`
  );
}

const files = execSync(`find . -name index.html -not -path "./node_modules/*"`, { cwd: ROOT })
  .toString()
  .trim()
  .split("\n")
  .map((f) => f.replace(/^\.\//, ""));

let done = 0;
const skipped: string[] = [];
for (const rel of files) {
  const file = join(ROOT, rel);
  let html = readFileSync(file, "utf8");
  const lang: "fr" | "en" = rel.startsWith("en/") ? "en" : "fr";
  const active = sectionOf(rel);

  const pillMatch = html.match(/<div class="lang-switch"[\s\S]*?<\/div>/);
  if (!pillMatch) {
    skipped.push(`${rel} (pas de lang-switch — lancer langswitch.ts d'abord)`);
    continue;
  }
  const head = header(lang, active, pillMatch[0]);

  if (html.includes("<!--mainnav-->")) {
    // Régénération en place
    html = html.replace(/<!--mainnav-->[\s\S]*?<!--\/mainnav-->/, head);
  } else {
    // Remplace la topbar (back-link éventuel + pill) posée par langswitch.ts
    const topbar = html.match(/<div class="topbar[^"]*">[\s\S]*?<\/div>\s*<\/div>/);
    if (!topbar) {
      skipped.push(`${rel} (pas de .topbar)`);
      continue;
    }
    html = html.replace(topbar[0], head);
  }

  if (html.includes("/*mainnav*/")) {
    html = html.replace(/\/\*mainnav\*\/[\s\S]*?(?=\n<\/style>|<\/style>)/, CSS);
  } else {
    html = html.replace("</style>", CSS + "\n</style>");
  }
  if (html.includes("/*mainnavjs*/")) {
    html = html.replace(/<script>\/\*mainnavjs\*\/[\s\S]*?<\/script>/, JS);
  } else {
    html = html.replace("</body>", JS + "\n</body>");
  }

  writeFileSync(file, html);
  done++;
  console.log(`✓ ${rel}`);
}
if (skipped.length) console.error(`\n⚠ ignorées :\n  ${skipped.join("\n  ")}`);
console.log(`\n${done} pages traitées.`);

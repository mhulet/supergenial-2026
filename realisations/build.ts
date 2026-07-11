// Génère la page Réalisations (FR) + une page par étude de cas à partir des drafts JSON.
// Usage : bun realisations/build.ts
// Les drafts (_drafts/*.json) sont la SOURCE VERSIONNÉE — ils ne sont jamais supprimés.
// POST-BUILD : bun realisations/en-build.ts puis bun ressources/langswitch.ts

import { readdirSync, readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";

const ROOT = dirname(new URL(import.meta.url).pathname);      // .../realisations
const SITE = dirname(ROOT);                                   // repo root
const DRAFTS = join(ROOT, "_drafts");

export type CaseImage = {
  src: string; alt: string; alt_en: string;
  caption: string; caption_en: string;
};

export type CaseStudy = {
  slug: string; slug_en: string;
  type: string; type_en: string;          // Site web | App interne | Newsletter…
  client: string; year: string;
  title: string; title_en: string;
  description: string; description_en: string;
  keywords: string; keywords_en: string;
  url_live?: string;
  stack: string[];
  images: CaseImage[];
  body_html: string; body_html_en: string;
};

const BASE_CSS = readFileSync(join(SITE, "ressources", "_css.txt"), "utf8");

export const EXTRA_CSS = `
/* Réalisations */
.case-meta { display: flex; flex-wrap: wrap; gap: 0.4rem 1.2rem; font-size: 14px; color: var(--text-secondary); margin-bottom: 2.5rem; }
.case-meta .stack-tag {
    display: inline-flex; padding: 0.1rem 0.6rem; border-radius: 999px;
    border: 1px solid var(--card-border); background: var(--soft-bg); font-size: 12.5px;
}
.case-figure { margin: 2rem 0; }
.case-figure img {
    display: block; width: 100%; max-width: 100%; height: auto;
    border: 1px solid var(--card-border); border-radius: 16px;
}
.case-figure figcaption { font-size: 13.5px; color: var(--text-secondary); margin-top: 0.6rem; }
/* Index des réalisations */
.case-item { display: block; padding: 1.75rem 0; border-bottom: 1px solid var(--card-border); transition: padding-left 0.2s ease; }
.case-item:hover { padding-left: 0.4rem; }
.case-item:hover .a-title { color: var(--link-hover); }
.case-thumb {
    display: block; width: 100%; height: auto; margin-bottom: 1rem;
    border: 1px solid var(--card-border); border-radius: 16px;
}
.case-item .a-type { font-size: 13px; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.06em; }
.case-item .a-title { font-size: 19px; font-weight: 600; margin: 0.3rem 0; letter-spacing: -0.01em; color: inherit; }
.case-item .a-desc { font-size: 15px; color: var(--text-secondary); }
`;

export const CSS = BASE_CSS + EXTRA_CSS;

export const HEAD = (lang: string, title: string, description: string, keywords: string, canonical: string, extraOg = "") => `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <meta name="author" content="Michael Hulet">
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
    <link rel="canonical" href="${canonical}">${extraOg}
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
    <style>${CSS}</style>
</head>`;

export const GLOW = `
<div class="cursor-glow" id="cursorGlow"></div>
<script>
const glow = document.getElementById('cursorGlow');
let mx=0,my=0,gx=0,gy=0;
window.addEventListener('mousemove',(e)=>{mx=e.clientX;my=e.clientY;glow.classList.add('visible');});
window.addEventListener('mouseleave',()=>glow.classList.remove('visible'));
(function a(){gx+=(mx-gx)*0.1;gy+=(my-gy)*0.1;glow.style.left=gx+'px';glow.style.top=gy+'px';requestAnimationFrame(a);})();
</script>`;

export function loadCases(): CaseStudy[] {
  const files = readdirSync(DRAFTS).filter((f) => f.endsWith(".json"));
  if (files.length === 0) { console.error("Aucun draft trouvé dans _drafts/"); process.exit(1); }
  return files
    .map((f) => JSON.parse(readFileSync(join(DRAFTS, f), "utf8")) as CaseStudy)
    .sort((a, b) => b.year.localeCompare(a.year));
}

function figures(c: CaseStudy): string {
  return c.images.map((img) => `            <figure class="case-figure animate delay-3">
                <img src="${img.src}" alt="${img.alt}" loading="lazy">
                <figcaption>${img.caption}</figcaption>
            </figure>`).join("\n");
}

function casePage(c: CaseStudy): string {
  const canonical = `https://www.supergenial.be/realisations/${c.slug}/`;
  const live = c.url_live ? ` · <a href="${c.url_live}" target="_blank" rel="noopener noreferrer">Voir le site</a>` : "";
  const stack = c.stack.map((s) => `<span class="stack-tag">${s}</span>`).join(" ");
  return `${HEAD("fr", c.title + " — Super Génial", c.description, c.keywords, canonical)}
<body>
    ${GLOW}
    <main>
        <a href="/realisations/" class="back-link plain">← Toutes les réalisations</a>
        <article>
            <h1 class="animate delay-1">${c.title}</h1>
            <p class="case-meta animate delay-2"><span>${c.type}</span><span>${c.client} · ${c.year}${live}</span><span>${stack}</span></p>
${figures(c)}
            <div class="article-body animate delay-3">
                ${c.body_html}
            </div>
            <div class="cta-box animate delay-3">
                <p>Un projet similaire en tête ?</p>
                <a href="/tarifs/" class="cta-btn">Voir mes tarifs <span>→</span></a>
            </div>
        </article>
    </main>
</body>
</html>
`;
}

function indexPage(cases: CaseStudy[]): string {
  const canonical = "https://www.supergenial.be/realisations/";
  const items = cases.map((c) => {
    const thumb = c.images[0] ? `                    <img class="case-thumb" src="${c.images[0].src}" alt="${c.images[0].alt}" loading="lazy">\n` : "";
    return `                <a href="/realisations/${c.slug}/" class="case-item plain">
${thumb}                    <div class="a-type">${c.type} · ${c.year}</div>
                    <div class="a-title">${c.title}</div>
                    <div class="a-desc">${c.description}</div>
                </a>`;
  }).join("\n");
  return `${HEAD("fr", "Réalisations — Super Génial", "Études de cas : sites web, applications internes et newsletters conçus avec des agents IA.", "réalisations, études de cas, portfolio, application web, site web, agents IA", canonical)}
<body>
    ${GLOW}
    <main>
        <a href="/" class="back-link plain">← Super Génial</a>
        <h1 class="animate delay-1">Réalisations</h1>
        <p class="subtitle">Du brief au site en ligne.</p>
        <p class="intro animate delay-3">
            Quelques projets récents — sites web, applications internes, newsletters —
            conçus avec des agents IA, de l'architecture au déploiement.
            Envie du vôtre ? <a href="/tarifs/">Voyons les tarifs</a>.
        </p>
        <div class="article-list animate delay-3">
${items}
        </div>
        <p class="footnote">D'autres études de cas arrivent. Une question ? <a href="mailto:team@supergenial.be">team@supergenial.be</a></p>
    </main>
</body>
</html>
`;
}

// ---- Build ----
if (import.meta.main) {
  const cases = loadCases();
  for (const c of cases) {
    const dir = join(ROOT, c.slug);
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "index.html"), casePage(c));
    console.log(`✓ realisations/${c.slug}/index.html`);
  }
  writeFileSync(join(ROOT, "index.html"), indexPage(cases));
  console.log(`✓ realisations/index.html (${cases.length} études de cas)`);
}

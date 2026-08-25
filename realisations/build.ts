// Génère la page Réalisations (FR) + une page par étude de cas à partir des drafts JSON.
// Usage : bun realisations/build.ts
// Les drafts (_drafts/*.json) sont la SOURCE VERSIONNÉE — ils ne sont jamais supprimés.
// POST-BUILD : bun realisations/en-build.ts puis bun ressources/langswitch.ts et bun ressources/mainnav.ts

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
  carousel?: {
    title: string; title_en: string;
    intro: string; intro_en: string;
    images: CaseImage[];
  };
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
/* Carousel de screenshots */
.case-carousel { margin: 1.5rem 0 0.5rem; }
.case-carousel-track {
    display: flex; gap: 1rem; overflow-x: auto;
    scroll-snap-type: x mandatory; -webkit-overflow-scrolling: touch;
    scrollbar-width: none; border-radius: 16px;
}
.case-carousel-track::-webkit-scrollbar { display: none; }
.case-carousel-slide { flex: 0 0 100%; scroll-snap-align: start; }
.case-carousel-slide img {
    display: block; width: 100%; height: auto;
    border: 1px solid var(--card-border); border-radius: 16px;
}
.case-carousel-slide figcaption { font-size: 13.5px; color: var(--text-secondary); margin-top: 0.6rem; }
.case-carousel-nav { display: flex; align-items: center; gap: 0.9rem; margin-top: 0.9rem; }
.case-carousel-btn {
    display: inline-flex; align-items: center; justify-content: center;
    width: 38px; height: 38px; border-radius: 999px;
    border: 1px solid var(--card-border); background: var(--soft-bg);
    color: var(--text-primary); font-size: 19px; line-height: 1;
    cursor: pointer; transition: transform 0.15s ease, border-color 0.15s ease;
}
.case-carousel-btn:hover { transform: translateY(-1px); border-color: var(--text-secondary); }
.case-carousel-count { font-size: 13.5px; color: var(--text-secondary); min-width: 3.2em; text-align: center; font-variant-numeric: tabular-nums; }
.case-carousel-dots { display: flex; gap: 0.45rem; margin-left: auto; flex-wrap: wrap; }
.case-carousel-dot {
    width: 8px; height: 8px; border-radius: 999px; padding: 0; border: none;
    background: var(--card-border); cursor: pointer; transition: background 0.15s ease, transform 0.15s ease;
}
.case-carousel-dot[aria-current="true"] { background: var(--accent-1); transform: scale(1.25); }
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

// Carousel de screenshots — vanilla JS inline, aucune dépendance (CSP stricte).
// lang: "fr" | "en" — choisit alt/caption. Rendu uniquement si c.carousel existe.
export function carouselSection(c: CaseStudy, lang: "fr" | "en"): string {
  if (!c.carousel) return "";
  const t = lang === "fr" ? c.carousel.title : c.carousel.title_en;
  const intro = lang === "fr" ? c.carousel.intro : c.carousel.intro_en;
  const prev = lang === "fr" ? "Image précédente" : "Previous image";
  const next = lang === "fr" ? "Image suivante" : "Next image";
  const goTo = lang === "fr" ? "Aller à l'image" : "Go to image";
  const slides = c.carousel.images.map((img, i) => `                    <figure class="case-carousel-slide">
                        <img src="${img.src}" alt="${lang === "fr" ? img.alt : img.alt_en}" loading="lazy">
                        <figcaption>${lang === "fr" ? img.caption : img.caption_en}</figcaption>
                    </figure>`).join("\n");
  const dots = c.carousel.images.map((_, i) =>
    `<button class="case-carousel-dot" data-index="${i}" aria-label="${goTo} ${i + 1}"${i === 0 ? ' aria-current="true"' : ""}></button>`
  ).join("");
  return `
            <section class="case-carousel animate delay-3" role="region" aria-label="${t}">
                <h2>${t}</h2>
                <p>${intro}</p>
                <div class="case-carousel-track" id="carouselTrack" tabindex="0">
${slides}
                </div>
                <div class="case-carousel-nav">
                    <button class="case-carousel-btn" id="carouselPrev" aria-label="${prev}">‹</button>
                    <span class="case-carousel-count" id="carouselCount">1 / ${c.carousel.images.length}</span>
                    <button class="case-carousel-btn" id="carouselNext" aria-label="${next}">›</button>
                    <div class="case-carousel-dots" id="carouselDots">${dots}</div>
                </div>
            </section>
            <script>
            (function () {
                const track = document.getElementById('carouselTrack');
                const count = document.getElementById('carouselCount');
                const dots = Array.from(document.getElementById('carouselDots').children);
                const total = dots.length;
                let current = 0;
                function slideWidth() { return track.firstElementChild ? track.firstElementChild.getBoundingClientRect().width + 16 : track.clientWidth; }
                function goTo(i) { track.scrollTo({ left: Math.max(0, Math.min(i, total - 1)) * slideWidth(), behavior: 'smooth' }); }
                function sync() {
                    const i = Math.round(track.scrollLeft / slideWidth());
                    if (i === current || i < 0 || i >= total) return;
                    current = i;
                    count.textContent = (i + 1) + ' / ' + total;
                    dots.forEach((d, j) => j === i ? d.setAttribute('aria-current', 'true') : d.removeAttribute('aria-current'));
                }
                track.addEventListener('scroll', () => requestAnimationFrame(sync), { passive: true });
                document.getElementById('carouselPrev').addEventListener('click', () => goTo(current - 1));
                document.getElementById('carouselNext').addEventListener('click', () => goTo(current + 1));
                dots.forEach((d, i) => d.addEventListener('click', () => goTo(i)));
                track.addEventListener('keydown', (e) => {
                    if (e.key === 'ArrowLeft') { e.preventDefault(); goTo(current - 1); }
                    if (e.key === 'ArrowRight') { e.preventDefault(); goTo(current + 1); }
                });
            })();
            </script>`;
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
            </div>${carouselSection(c, "fr")}
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

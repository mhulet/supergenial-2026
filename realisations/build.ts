// Génère la page Réalisations (FR) + une page par étude de cas à partir des drafts JSON.
// Usage : bun realisations/build.ts
// Les drafts (_drafts/*.json) sont la SOURCE VERSIONNÉE — ils ne sont jamais supprimés.
// POST-BUILD : bun realisations/en-build.ts puis bun ressources/langswitch.ts et bun ressources/mainnav.ts
// Les pages sortent avec la coquille du site (site.css, favicon, carte de partage, hreflang,
// lien d'évitement, pied de page) : le pipeline complet ne doit laisser aucun diff.

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
  order?: number;                         // position dans la liste (à année égale)
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

// Carte de partage commune à toutes les études de cas (générée par tools/og-card.html).
const SITE_URL = "https://www.supergenial.be";
const OG_IMAGE = "https://www.supergenial.be/assets/og/realisations.jpg";
const OG_ALT = "Un ordinateur portable dessiné à l'encre, à côté d'une tasse";

// alt : { fr, en } = chemins des deux versions, pour les liens hreflang.
export const HEAD = (lang: string, title: string, description: string, keywords: string, canonical: string, alt: { fr: string; en: string }) => `<!DOCTYPE html>
<html lang="${lang}">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="/assets/favicon.svg" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/assets/favicon.svg">
    <meta name="twitter:card" content="summary_large_image">
    <meta property="og:image" content="${OG_IMAGE}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${OG_ALT}">
    <meta name="twitter:image" content="${OG_IMAGE}">
    <title>${title}</title>
    <meta name="author" content="Super Génial">
    <meta name="description" content="${description}">
    <meta name="keywords" content="${keywords}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${canonical}">
    <link rel="canonical" href="${canonical}">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=EB+Garamond:wght@400..600&family=Inter:wght@400..700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/assets/css/site.css">
    <link rel="alternate" hreflang="fr" href="${SITE_URL}${alt.fr}">
    <link rel="alternate" hreflang="en" href="${SITE_URL}${alt.en}">
    <link rel="alternate" hreflang="x-default" href="${SITE_URL}${alt.fr}">
</head>`;

// Début du <body> : lien d'évitement + <main>. Le menu (<!--mainnav-->) est injecté par ressources/mainnav.ts.
export const OPEN = (lang: "fr" | "en") => `<body>
<a class="skip-link plain" href="#contenu">${lang === "fr" ? "Aller au contenu" : "Skip to content"}</a>
    <main id="contenu">`;

// Pied de page commun du site (même HTML que les autres pages), puis le script du menu mobile est
// ajouté par ressources/mainnav.ts.
export const FOOT = (lang: "fr" | "en") => (lang === "fr" ? FOOT_FR : FOOT_EN) + `
    </main>
</body>
</html>
`;

const FOOT_FR = `            <footer class="site-foot">
            <nav class="foot-nav" aria-label="Pied de page">
                <a href="/" class="plain">Accueil</a>
                <a href="/diagnostic-ia/" class="plain">Diagnostic IA</a>
                <a href="/communication/" class="plain">Communication</a>
                <a href="/tarifs/" class="plain">Tarifs</a>
                <a href="/maintenance/" class="plain">Maintenance</a>
                <a href="/realisations/" class="plain">Réalisations</a>
                <a href="/ressources/" class="plain">Ressources</a>
                <a href="/mentions-legales/" class="plain">Mentions légales</a>
            </nav>
            <p class="foot-legal">Super Génial by Semisto est l'agence web et de communication de <strong>Semisto ASBL</strong>, association sans but lucratif de droit belge. 20&nbsp;% de chaque facture financent le déploiement des forêts comestibles de <a href="https://www.semisto.org" target="_blank" rel="noopener noreferrer">Semisto</a>. Numéro d'entreprise et de TVA&nbsp;: BE&nbsp;0790.631.657. Siège&nbsp;: Fonds d'Ahinvaux 1, 5530 Yvoir, Belgique. Contact&nbsp;: <a href="mailto:team@supergenial.be">team@supergenial.be</a>. Éditeur responsable&nbsp;: Michael Hulet.</p>
            <div class="foot-social">
            <a href="https://www.linkedin.com/in/michaelhulet/" rel="noopener noreferrer" target="_blank" aria-label="LinkedIn"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21h-4V9Z"/></svg></a>
            <a href="https://github.com/mhulet" rel="noopener noreferrer" target="_blank" aria-label="GitHub"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.16.58.67.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10Z"/></svg></a>
            <a href="https://t.me/supergenialdotbe" rel="noopener noreferrer" target="_blank" aria-label="Telegram"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 4.3 18.5 19c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L5.9 13 1.1 11.5c-1-.3-1-1 .2-1.5l19-7.3c.9-.3 1.6.2 1.3 1.6Z"/></svg></a>
        </div>
        </footer>`;

const FOOT_EN = `            <footer class="site-foot">
            <nav class="foot-nav" aria-label="Footer">
                <a href="/en/" class="plain">Home</a>
                <a href="/en/ai-assessment/" class="plain">AI Assessment</a>
                <a href="/en/communication/" class="plain">Communication</a>
                <a href="/en/pricing/" class="plain">Pricing</a>
                <a href="/en/maintenance/" class="plain">Maintenance</a>
                <a href="/en/case-studies/" class="plain">Case studies</a>
                <a href="/en/resources/" class="plain">Resources</a>
                <a href="/en/legal/" class="plain">Legal notice</a>
            </nav>
            <p class="foot-legal">Super Génial by Semisto is the web and communication agency of <strong>Semisto ASBL</strong>, a Belgian non-profit association. 20% of every invoice funds the spread of <a href="https://www.semisto.org" target="_blank" rel="noopener noreferrer">Semisto</a>'s edible forests. Company and VAT number: BE&nbsp;0790.631.657. Registered office: Fonds d'Ahinvaux 1, 5530 Yvoir, Belgium. Contact: <a href="mailto:team@supergenial.be">team@supergenial.be</a>. Publisher: Michael Hulet.</p>
            <div class="foot-social">
            <a href="https://www.linkedin.com/in/michaelhulet/" rel="noopener noreferrer" target="_blank" aria-label="LinkedIn"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9h4v12H3V9Zm7 0h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V21h-4v-5.5c0-1.31-.02-3-1.83-3-1.83 0-2.11 1.43-2.11 2.9V21h-4V9Z"/></svg></a>
            <a href="https://github.com/mhulet" rel="noopener noreferrer" target="_blank" aria-label="GitHub"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.66-.22.66-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.91-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.89 1.53 2.34 1.09 2.91.83.09-.65.35-1.09.63-1.34-2.22-.25-4.56-1.11-4.56-4.94 0-1.09.39-1.98 1.03-2.68-.1-.25-.45-1.27.1-2.65 0 0 .84-.27 2.75 1.02a9.5 9.5 0 0 1 5 0c1.91-1.29 2.75-1.02 2.75-1.02.55 1.38.2 2.4.1 2.65.64.7 1.03 1.59 1.03 2.68 0 3.84-2.34 4.69-4.57 4.94.36.31.68.92.68 1.85v2.74c0 .27.16.58.67.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10Z"/></svg></a>
            <a href="https://t.me/supergenialdotbe" rel="noopener noreferrer" target="_blank" aria-label="Telegram"><svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21.6 4.3 18.5 19c-.2 1-.9 1.3-1.8.8l-4.9-3.6-2.4 2.3c-.3.3-.5.5-1 .5l.3-4.9 8.9-8c.4-.3-.1-.5-.6-.2L5.9 13 1.1 11.5c-1-.3-1-1 .2-1.5l19-7.3c.9-.3 1.6.2 1.3 1.6Z"/></svg></a>
        </div>
        </footer>`;

export const alt = (c: CaseStudy) => ({ fr: `/realisations/${c.slug}/`, en: `/en/case-studies/${c.slug_en}/` });
export const INDEX_ALT = { fr: "/realisations/", en: "/en/case-studies/" };

export function loadCases(): CaseStudy[] {
  const files = readdirSync(DRAFTS).filter((f) => f.endsWith(".json"));
  if (files.length === 0) { console.error("Aucun draft trouvé dans _drafts/"); process.exit(1); }
  return files
    .map((f) => JSON.parse(readFileSync(join(DRAFTS, f), "utf8")) as CaseStudy)
    .sort((a, b) => b.year.localeCompare(a.year) || (a.order ?? 99) - (b.order ?? 99));
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
  return `${HEAD("fr", c.title + " — Super Génial", c.description, c.keywords, canonical, alt(c))}
${OPEN("fr")}
        <article>
            <h1 class="animate delay-1">${c.title}</h1>
            <p class="case-meta animate delay-2"><span>${c.type}</span><span>${c.client} · ${c.year}${live}</span><span>${stack}</span></p>
${figures(c)}
            <div class="article-body animate delay-3">
                ${c.body_html}
            </div>${carouselSection(c, "fr")}
            <div class="cta-box animate delay-3">
                <p>Un projet similaire en tête ?</p>
                <a href="/tarifs/" class="cta-btn">Voir nos tarifs <span>→</span></a>
            </div>
        </article>
${FOOT("fr")}`;
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
  return `${HEAD("fr", "Réalisations — Super Génial", "Études de cas : sites web, applications internes et newsletters conçus avec des agents IA.", "réalisations, études de cas, portfolio, application web, site web, agents IA", canonical, INDEX_ALT)}
${OPEN("fr")}
        <h1 class="animate delay-1">Réalisations</h1>
        <p class="subtitle">Du brief au site en ligne.</p>
        <p class="intro animate delay-3">
            Quelques projets récents de notre équipe — sites web, applications internes, newsletters —
            conçus avec des agents IA, de l'architecture au déploiement.
            Envie du vôtre ? <a href="/tarifs/">Voyons les tarifs</a>.
        </p>
        <div class="article-list animate delay-3">
${items}
        </div>
        <p class="footnote">D'autres études de cas arrivent. Une question ? <a href="mailto:team@supergenial.be">team@supergenial.be</a></p>
${FOOT("fr")}`;
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

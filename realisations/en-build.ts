// Génère les pages EN des études de cas (/en/case-studies/) à partir des MÊMES
// drafts bilingues que build.ts (realisations/_drafts/*.json — jamais supprimés).
// Usage : bun realisations/en-build.ts
// POST-BUILD : bun ressources/langswitch.ts pour poser le toggle FR/EN.

import { writeFileSync, mkdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { HEAD, GLOW, loadCases, type CaseStudy } from "./build.ts";

const ROOT = dirname(new URL(import.meta.url).pathname);      // .../realisations
const SITE = dirname(ROOT);                                   // repo root
const EN_DIR = join(SITE, "en", "case-studies");

function figures(c: CaseStudy): string {
  return c.images.map((img) => `            <figure class="case-figure animate delay-3">
                <img src="${img.src}" alt="${img.alt_en}" loading="lazy">
                <figcaption>${img.caption_en}</figcaption>
            </figure>`).join("\n");
}

function casePage(c: CaseStudy): string {
  const canonical = `https://www.supergenial.be/en/case-studies/${c.slug_en}/`;
  const live = c.url_live ? ` · <a href="${c.url_live}" target="_blank" rel="noopener noreferrer">Visit the site</a>` : "";
  const stack = c.stack.map((s) => `<span class="stack-tag">${s}</span>`).join(" ");
  return `${HEAD("en", c.title_en + " — Super Génial", c.description_en, c.keywords_en, canonical)}
<body>
    ${GLOW}
    <main>
        <a href="/en/case-studies/" class="back-link plain">← All case studies</a>
        <article>
            <h1 class="animate delay-1">${c.title_en}</h1>
            <p class="case-meta animate delay-2"><span>${c.type_en}</span><span>${c.client} · ${c.year}${live}</span><span>${stack}</span></p>
${figures(c)}
            <div class="article-body animate delay-3">
                ${c.body_html_en}
            </div>
            <div class="cta-box animate delay-3">
                <p>Have a similar project in mind?</p>
                <a href="/en/pricing/" class="cta-btn">See my pricing <span>→</span></a>
            </div>
        </article>
    </main>
</body>
</html>
`;
}

function indexPage(cases: CaseStudy[]): string {
  const canonical = "https://www.supergenial.be/en/case-studies/";
  const items = cases.map((c) => {
    const thumb = c.images[0] ? `                    <img class="case-thumb" src="${c.images[0].src}" alt="${c.images[0].alt_en}" loading="lazy">\n` : "";
    return `                <a href="/en/case-studies/${c.slug_en}/" class="case-item plain">
${thumb}                    <div class="a-type">${c.type_en} · ${c.year}</div>
                    <div class="a-title">${c.title_en}</div>
                    <div class="a-desc">${c.description_en}</div>
                </a>`;
  }).join("\n");
  return `${HEAD("en", "Case studies — Super Génial", "Case studies: websites, internal apps and newsletters built with AI agents.", "case studies, portfolio, web application, website, AI agents", canonical)}
<body>
    ${GLOW}
    <main>
        <a href="/en/" class="back-link plain">← Super Génial</a>
        <h1 class="animate delay-1">Case studies</h1>
        <p class="subtitle">From brief to live site.</p>
        <p class="intro animate delay-3">
            A few recent projects — websites, internal applications, newsletters —
            built with AI agents, from architecture to deployment.
            Want yours? <a href="/en/pricing/">Have a look at the pricing</a>.
        </p>
        <div class="article-list animate delay-3">
${items}
        </div>
        <p class="footnote">More case studies coming. A question? <a href="mailto:team@supergenial.be">team@supergenial.be</a></p>
    </main>
</body>
</html>
`;
}

// ---- Build ----
const cases = loadCases();
for (const c of cases) {
  const dir = join(EN_DIR, c.slug_en);
  mkdirSync(dir, { recursive: true });
  writeFileSync(join(dir, "index.html"), casePage(c));
  console.log(`✓ en/case-studies/${c.slug_en}/index.html`);
}
writeFileSync(join(EN_DIR, "index.html"), indexPage(cases));
console.log(`✓ en/case-studies/index.html (${cases.length} case studies)`);

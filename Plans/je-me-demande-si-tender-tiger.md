# Section « Réalisations / Case studies » — supergenial.be

## Contexte

Michael veut présenter ses réalisations (sites web, apps internes, newsletters) sous forme d'études de cas : une page index + une page par réalisation, avec screenshots. Le site est 100 % statique (GitHub Pages), bilingue — FR à la racine, EN sous `/en/` — et les articles Ressources sont déjà générés par des scripts Bun à partir de drafts JSON. On réplique ce pattern.

**Décisions prises** : URLs `/realisations/` + `/en/case-studies/` · v1 = structure seule (générateur + index + 1 étude de cas exemple) · screenshots capturés par Bee pour les sites publics, versions démo avec données dummy pour les apps privées (fournée de contenu ultérieure).

## Approche

### 1. Générateur `realisations/build.ts` (+ `en-build.ts`)
Calqué sur `ressources/build.ts` (même HEAD, CSS, cursor-glow, dark mode). Source : drafts JSON dans `realisations/_drafts/*.json` — **mais contrairement aux ressources, ne pas supprimer les drafts après build** (les commiter : leçon du `_drafts/` perdu des ressources, la source doit rester versionnée pour pouvoir régénérer).

Schéma d'une étude de cas :
```json
{
  "slug": "silvea", "slug_en": "silvea",
  "title": "...", "type": "Site web | App interne | Newsletter",
  "client": "...", "year": "2025",
  "description": "...", "keywords": "...",
  "url_live": "https://... (optionnel)",
  "stack": ["Rails", "Hotwire"],
  "images": [{ "src": "/assets/realisations/silvea/home.webp", "alt": "...", "caption": "..." }],
  "body_html": "... (contexte → besoin → solution → résultat)"
}
```

Template page étude de cas : hero (titre, type, client, année), screenshots en figures avec captions (`loading="lazy"`, `max-width:100%`, bordure `--card-border` + radius 16px pour cadrer les captures), corps de texte, CTA vers `/tarifs/` ou `/maintenance/`. Index : liste de cartes avec vignette (première image), type et description — variation du `.article-item` des ressources avec une miniature.

### 2. Assets images (nouveau)
`assets/realisations/{slug}/*.webp` — premier dossier d'images du repo. WebP, ~1600px de large max pour les captures desktop, poids raisonnable (site actuellement très léger, garder ça).

### 3. Intégration au site
- **`ressources/langswitch.ts`** : ajouter la paire `/realisations/` ↔ `/en/case-studies/` dans `PAIRS`, et le mapping des slugs dans `SLUGS`; relancer l'injection.
- **Home FR (`index.html`) + EN (`en/index.html`)** : ajouter un lien `Réalisations →` dans `.hero-cta` (comme Ressources), et faire pointer la section « Quelques références » (ou ses items) vers les études de cas quand elles existeront.
- **`sitemap.xml`** et **`llms.txt`** : ajouter les nouvelles URLs.

### 4. Étude de cas exemple (v1)
Une seule, pour valider le format : **Silvéa** (site public, marqué « Nouveau » sur la home). Capture des screenshots (desktop + mobile) du site live via le skill Interceptor, conversion en WebP, draft JSON avec un contenu court réel. FR + EN.

## Fichiers touchés

| Fichier | Action |
|---|---|
| `realisations/build.ts`, `realisations/en-build.ts` | créer (calqués sur `ressources/build.ts` / `en-build.ts`) |
| `realisations/_drafts/silvea.json` (+ variante EN) | créer, versionné |
| `assets/realisations/silvea/*.webp` | créer (captures Interceptor) |
| `ressources/langswitch.ts` | ajouter PAIRS + SLUGS |
| `index.html`, `en/index.html` | lien hero-cta + section références |
| `sitemap.xml`, `llms.txt` | ajouter URLs |

## Vérification

1. `bun realisations/build.ts && bun realisations/en-build.ts` → génère `/realisations/index.html`, `/realisations/silvea/index.html` + miroirs EN.
2. Servir localement (`bunx serve .`) et **vérifier via Interceptor** : index, page Silvéa, images chargées, dark mode, toggle FR/EN fonctionnel dans les deux sens, mobile.
3. Après push : vérifier les URLs live sur www.supergenial.be via Interceptor (règle VerifyDeploy).

## Fournées suivantes (hors v1)
Autres sites publics (captures directes) puis apps privées (Notranet, etc.) : monter une instance démo avec données dummy avant capture.

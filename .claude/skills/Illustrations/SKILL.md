---
name: Illustrations
description: >
  Génère les illustrations du site Super Génial via Imagen 4 (Gemini API) :
  dessin d'encre sketchy à main levée, un objet en aplat violet débordant,
  forme taupe optionnelle en fond, livré en PNG24 transparent (RGBA) prêt à
  poser sur n'importe quel fond.
  USE WHEN: illustration, image du site, dessin au trait, line art, picto de
  section, visuel hero, "génère une illustration", PNG transparent.
  NOT FOR: photos réalistes, logos, diagrammes techniques (utiliser Art),
  captures ou vérification web (Interceptor).
---

# Illustrations Super Génial

## Style maison (v2 — validé par Michael 2026-07-11 sur 4 références)

Dessin d'encre **sketchy à main levée** : contour noir fin détendu, traits qui
se chevauchent aux angles, coins imparfaits — dessiné vite et avec charme, pas
de la « single line » stricte. **Un seul objet porte un aplat violet doux
(la couleur du site, ~#8b5cf6) posé librement, qui déborde et rate le contour
par endroits.** Le reste : trait pur. Scènes avec un peu de contexte (fenêtre,
bureau, sol) plutôt qu'objets isolés flottants ; beaucoup d'espace négatif.
Couleurs plates uniquement — jamais de dégradé, jamais d'ombrage.

| Variante | Effet | Quand |
|---|---|---|
| `fill` (défaut) | Un objet en aplat violet débordant, le reste en trait | Usage général, petites et moyennes tailles |
| `scene` | Aplat violet + une grande forme taupe plate en fond (pan de lumière, ombre portée) | Gros visuels ; attention : le taupe vire à l'ambre en dark mode |
| `none` | Trait pur, aucun aplat | Fonds chargés, très petites tailles |

L'aplat violet = la couleur d'accent du site (`#6366f1`→`#8b5cf6`) — c'est ce
qui fait la cohérence de marque. **Ne jamais écrire de code hex dans le
prompt** (voir Gotchas) : décrire la couleur verbalement ("soft violet").

## Contrainte clé : la transparence

**Imagen ne génère pas d'alpha.** Le pipeline demande un fond blanc pur
`#FFFFFF` puis reconstruit la transparence par **un-blend exact du blanc**
(`α = 255 − min(r,g,b)`, couleur dé-compositée) — ce qui préserve
l'anti-aliasing du trait ET les accents colorés. Ne jamais remplacer par un
chroma-key « blanc → transparent » binaire.

## Prérequis

- Clé API : `SUPERGENIAL_GEMINI_API_KEY` dans `~/.claude/.env`
  (fallback : `SEMISTO_GEMINI_API_KEY`). Modèle : `imagen-4.0-generate-001`.
- Outil : `Tools/GenerateIllustration.ts` (bun ; dépendance `sharp` déjà
  installée dans `Tools/`).

## Utilisation

```bash
cd .claude/skills/Illustrations/Tools
bun GenerateIllustration.ts \
  --subject "an open laptop and a coffee mug" \
  --accent gradient --aspect 1:1 \
  --out ../../../../assets/illustrations/laptop-mug.png
```

- `--subject` en **anglais** (traduire la demande FR avant l'appel).
- Sans `--out`, le fichier va dans `assets/illustrations/<slug>-<ts>.png`.
- `--dry-run` affiche le prompt composé sans appeler l'API.
- `--keep-bg` conserve aussi l'original fond blanc (`.bg.png`) pour comparaison.
- `--raw-prompt` court-circuite le template si un prompt sur mesure est requis
  — y inclure alors impérativement la clause fond blanc pur.

## Workflow

1. Traduire le sujet en anglais, choisir la variante d'accent selon la table.
2. `--dry-run` si le sujet est inhabituel, ajuster.
3. **Générer 2-3 candidats par sujet et choisir en lot** — l'épaisseur de trait
   et le niveau de détail varient d'un tirage à l'autre ; quand plusieurs
   illustrations cohabitent sur une page, les choisir ensemble pour une
   épaisseur/densité homogène.
4. Vérifier chaque résultat : `magick identify` doit montrer `8-bit sRGB` +
   canal alpha, et visuellement ouvrir le PNG (Read tool) — trait continu, un
   seul accent, pas de texte parasite, pas d'image hors-sujet.
5. Redimensionner pour le web avant intégration : `magick out.png -resize
   800x800 -strip out.png`.
6. Référencer le PNG dans le HTML avec la classe `.illu` (voir ci-dessous) ;
   ne jamais committer de clé API.

## Intégration site (dark mode inclus)

Le site a deux thèmes (`prefers-color-scheme`). Un trait noir est invisible
sur fond sombre → la classe `.illu` de `index.html` applique en dark mode :

```css
filter: invert(1) hue-rotate(180deg);
```

(noir→blanc ; le hue-rotate ramène l'accent violet près de sa teinte
d'origine). Toute nouvelle page qui intègre une illustration doit réutiliser
cette classe `.illu` (et `.illu--small` pour les pictos). Toujours vérifier le
rendu dans LES DEUX thèmes via le skill Interceptor avant de considérer
l'intégration terminée.

## Templates de prompt (référence)

Le template composé par l'outil :

```
casual hand-drawn ink illustration of {SUBJECT},
loose sketchy thin black outline, relaxed imperfect strokes with overlapping
line ends and wobbly corners, drawn quickly with charm, no ruler-straight edges,
{ACCENT_CLAUSE},
flat colors only, no gradients, no shading, no crosshatching, generous negative
space, warm and friendly editorial illustration style,
on a plain solid white background, no paper texture, no frame, no border,
no text, no letters, no numbers, no watermark
```

Historique du style : v1 = single continuous line stricte (trop CAD au goût de
Michael) → v1.5 = trait ondulant → **v2 = sketch détendu + aplat violet
débordant**, calqué sur 4 références qu'il aime (mug rouge/casque, plan
d'architecte, fauteuil/plante, bureau/mug jaune — style éditorial chaleureux).
Donner du contexte de scène dans {SUBJECT} : "on a desk", "a window in the
background", "steam rising".

Enrichissements utiles dans `{SUBJECT}` : position relative des objets
("beside", "on top of"), un détail vivant ("steam rising", "cable loosely
coiled"), échelle ("small", "oversized").

## Gotchas

- **La génération d'images requiert la facturation active** sur le projet GCP
  de la clé : depuis 2026, le tier gratuit a `limit: 0` sur TOUS les modèles
  image (Imagen ET Gemini Flash Image) pour les nouveaux projets. Symptômes :
  Imagen → 400 « only available on paid plans » ; Flash → 429
  « free_tier_requests, limit: 0 ». Solution : activer Billing sur le projet.
- `--model flash` (gemini-2.5-flash-image) coûte moins cher qu'Imagen 4 ;
  l'outil bascule automatiquement d'imagen vers flash si le plan ne couvre
  qu'un des deux.
- Clé `SEMISTO_GEMINI_API_KEY` révoquée par Google le 2026-07-11 (« reported
  as leaked ») — ne plus l'utiliser ; `SUPERGENIAL_GEMINI_API_KEY` la remplace.
- Un accent violet saturé sort avec α≈0.75-0.85 après un-blend : normal et
  exact (recomposé sur fond clair il est identique à l'original). Sur fond
  très sombre, préférer `--accent shadow` ou `none`.
- Imagen ajoute parfois une ligne de sol ou une ombre non demandée : la clause
  "no background elements" limite mais ne garantit pas — regénérer au besoin.
- **Ne jamais mettre de code hex (`#8b5cf6`) dans un prompt** : Imagen le
  prend comme signal « spec technique » et dessine une fiche cotée avec le hex
  écrit dedans. Décrire la couleur verbalement ("soft violet", "warm taupe").
- **Ne jamais dire "vector illustration", "SVG" ou "gradient" dans un prompt** :
  Imagen bascule en mode « rendu de code » et dessine du texte SVG (parfois sur
  fond noir). Vocabulaire sûr : "minimal ink illustration", "soft wash of color
  blending from indigo into violet". Le template intégré est déjà corrigé.
- Tirage aberrant possible (~1/10 : image sans rapport avec le prompt, type
  photo stock) — TOUJOURS regarder le PNG généré (Read tool) avant de le
  référencer ; regénérer si hors-sujet.
- Le fond renvoyé n'est jamais du blanc pur : l'un-blend calibre
  automatiquement le voile de fond sur les bordures (percentile 95). Pour
  retraiter un PNG existant sans rappeler l'API : `--from <fichier.png>`.

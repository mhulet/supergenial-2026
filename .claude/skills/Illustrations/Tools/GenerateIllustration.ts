#!/usr/bin/env bun
/**
 * GenerateIllustration.ts — Illustrations Super Génial via Imagen 4.
 *
 * Génère une illustration single-line minimaliste sur fond blanc pur via
 * l'API Imagen (Gemini API), puis reconstruit la transparence par un-blend
 * exact du blanc : α = 255 − min(r,g,b) ; couleur = (c − (255−α)) / (α/255).
 * Sortie : PNG24 RGBA (8-bit/canal + alpha).
 *
 * Usage:
 *   bun GenerateIllustration.ts --subject "an open laptop and a coffee mug" \
 *     [--accent dot|gradient|shadow|none] [--aspect 1:1|4:3|3:4|16:9|9:16] \
 *     [--out path.png] [--raw-prompt "full english prompt"] [--keep-bg] [--dry-run]
 *
 * Clé API : env SUPERGENIAL_GEMINI_API_KEY, fallback SEMISTO_GEMINI_API_KEY.
 */

import sharp from "sharp";
import { existsSync } from "fs";
import { mkdir } from "fs/promises";
import { dirname, resolve } from "path";

const MODELS = {
  imagen: "imagen-4.0-generate-001", // qualité max — requiert un plan payant / facturation GCP
  flash: "gemini-2.5-flash-image", // gratuit (tier AI Studio)
} as const;
type ModelKey = keyof typeof MODELS;
const API_BASE = "https://generativelanguage.googleapis.com/v1beta/models";

type Accent = "fill" | "scene" | "none";

const ACCENT_CLAUSES: Record<Accent, string> = {
  fill: "exactly one object filled with a flat solid soft-violet color wash, the paint applied loosely so it slightly overflows and misses the outline in places, every other element left as uncolored line work",
  scene:
    "exactly one object filled with a flat solid soft-violet color wash applied loosely so it slightly overflows its outline, plus one large flat muted warm-taupe shape in the background suggesting a wedge of light or a soft cast shadow, everything else uncolored line work",
  none: "no color fill anywhere, pure line work only",
};

export function buildPrompt(subject: string, accent: Accent): string {
  return [
    `casual hand-drawn ink illustration of ${subject}`,
    "loose sketchy thin black outline, relaxed imperfect strokes with overlapping line ends and wobbly corners, drawn quickly with charm, no ruler-straight edges",
    ACCENT_CLAUSES[accent],
    "flat colors only, no gradients, no shading, no crosshatching, generous negative space, warm and friendly editorial illustration style",
    "on a plain solid white background, no paper texture, no frame, no border, no text, no letters, no numbers, no watermark",
  ].join(", ");
}

// ---- un-blend white → alpha : PNG (fond blanc) → PNG24 RGBA transparent ----
// Le fond des modèles n'est jamais exactement #FFFFFF (voile ivoire) : on
// calibre un seuil de bruit sur les pixels de bordure (percentile 95, plafonné)
// et on re-normalise l'alpha au-dessus de ce seuil.
export async function unblendWhite(input: Buffer): Promise<Buffer> {
  const { data, info } = await sharp(input)
    .flatten({ background: "#ffffff" })
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  const ch = info.channels;
  const rawAlpha = (i: number) =>
    255 - Math.min(data[i * ch], data[i * ch + 1], data[i * ch + 2]);

  // Calibration du fond : alphas bruts des 4 bordures
  const border: number[] = [];
  for (let x = 0; x < info.width; x++) {
    border.push(rawAlpha(x), rawAlpha((info.height - 1) * info.width + x));
  }
  for (let y = 0; y < info.height; y++) {
    border.push(rawAlpha(y * info.width), rawAlpha(y * info.width + info.width - 1));
  }
  border.sort((a, b) => a - b);
  const noise = Math.min(border[Math.floor(border.length * 0.95)], 48);

  const out = Buffer.alloc(px * 4);
  for (let i = 0; i < px; i++) {
    const r = data[i * ch],
      g = data[i * ch + 1],
      b = data[i * ch + 2];
    const aRaw = 255 - Math.min(r, g, b);
    const a =
      aRaw <= noise ? 0 : Math.min(255, Math.round(((aRaw - noise) * 255) / (255 - noise)));
    if (a === 0) {
      out.writeUInt32BE(0, i * 4); // fully transparent
    } else {
      const w = 255 - a;
      out[i * 4] = Math.max(0, Math.min(255, Math.round(((r - w) * 255) / a)));
      out[i * 4 + 1] = Math.max(0, Math.min(255, Math.round(((g - w) * 255) / a)));
      out[i * 4 + 2] = Math.max(0, Math.min(255, Math.round(((b - w) * 255) / a)));
      out[i * 4 + 3] = a;
    }
  }
  return sharp(out, { raw: { width: info.width, height: info.height, channels: 4 } })
    .png()
    .toBuffer();
}

function usage(code = 0): never {
  console.log(`Usage: bun GenerateIllustration.ts --subject "..." [options]

Options:
  --subject <en text>   Sujet de l'illustration (anglais recommandé)
  --accent <variant>    fill | scene | none            (défaut: fill)
  --aspect <ratio>      1:1 | 4:3 | 3:4 | 16:9 | 9:16    (défaut: 1:1)
  --out <path.png>      Défaut: assets/illustrations/<slug>-<ts>.png
  --model <m>           imagen (défaut, plan payant) | flash (gratuit, fallback auto)
  --raw-prompt "<p>"    Remplace entièrement le prompt composé
  --keep-bg             Garde aussi le PNG original (fond blanc) en <out>.bg.png
  --dry-run             Affiche le prompt et sort sans appeler l'API
  --help`);
  process.exit(code);
}

async function main() {
  const args = process.argv.slice(2);
  const opt: Record<string, string | boolean> = {};
  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === "--help") usage();
    else if (a === "--keep-bg" || a === "--dry-run") opt[a.slice(2)] = true;
    else if (a.startsWith("--")) opt[a.slice(2)] = args[++i] ?? "";
  }

  const subject = (opt["subject"] as string) || "";
  const rawPrompt = (opt["raw-prompt"] as string) || "";
  if (!subject && !rawPrompt && !opt["from"]) usage(1);
  const accent = ((opt["accent"] as string) || "fill") as Accent;
  if (!(accent in ACCENT_CLAUSES)) {
    console.error(`Accent invalide: ${accent}`);
    usage(1);
  }
  const aspect = (opt["aspect"] as string) || "1:1";

  const prompt = rawPrompt || buildPrompt(subject, accent);
  if (opt["dry-run"]) {
    console.log(prompt);
    return;
  }

  // --from : retraiter un fichier local (un-blend seul, pas d'appel API ni de clé)
  if (opt["from"]) {
    const outFrom = resolve(
      (opt["out"] as string) ||
        (opt["from"] as string).replace(/(\.bg)?\.png$/, "") + "-transparent.png"
    );
    const src = Buffer.from(await Bun.file(opt["from"] as string).arrayBuffer());
    await mkdir(dirname(outFrom), { recursive: true });
    await Bun.write(outFrom, await unblendWhite(src));
    console.log(`✓ PNG24 transparent écrit (depuis ${opt["from"]}): ${outFrom}`);
    return;
  }

  const apiKey =
    process.env.SUPERGENIAL_GEMINI_API_KEY || process.env.SEMISTO_GEMINI_API_KEY;
  if (!apiKey) {
    console.error(
      "Clé API absente. Définir SUPERGENIAL_GEMINI_API_KEY (ou SEMISTO_GEMINI_API_KEY) dans ~/.claude/.env"
    );
    process.exit(1);
  }

  const slug = (subject || "illustration")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48);
  const ts = new Date().toISOString().replace(/[-:]/g, "").slice(0, 13);
  const outPath = resolve(
    (opt["out"] as string) ||
      `${import.meta.dir}/../../../../assets/illustrations/${slug}-${ts}.png`
  );

  // Appel API avec retry sur erreurs transitoires ; imagen → fallback flash si plan gratuit
  let modelKey = ((opt["model"] as string) || "imagen") as ModelKey;
  if (!(modelKey in MODELS)) {
    console.error(`Modèle invalide: ${modelKey}`);
    usage(1);
  }

  function requestFor(key: ModelKey): { url: string; body: string } {
    if (key === "imagen")
      return {
        url: `${API_BASE}/${MODELS.imagen}:predict`,
        body: JSON.stringify({
          instances: [{ prompt }],
          parameters: { sampleCount: 1, aspectRatio: aspect },
        }),
      };
    return {
      url: `${API_BASE}/${MODELS.flash}:generateContent`,
      body: JSON.stringify({
        contents: [{ parts: [{ text: `${prompt}. Aspect ratio ${aspect}.` }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    };
  }

  function extractImage(key: ModelKey, json: any): Buffer | null {
    const b64 =
      key === "imagen"
        ? json?.predictions?.[0]?.bytesBase64Encoded
        : json?.candidates?.[0]?.content?.parts?.find((p: any) => p.inlineData)
            ?.inlineData?.data;
    return b64 ? Buffer.from(b64, "base64") : null;
  }

  const transient = new Set([429, 500, 502, 503, 504]);
  let original: Buffer | undefined;
  for (let attempt = 1; attempt <= 5; attempt++) {
    const { url, body } = requestFor(modelKey);
    const res = await fetch(url, {
      method: "POST",
      headers: { "x-goog-api-key": apiKey, "Content-Type": "application/json" },
      body,
    });
    if (res.ok) {
      const json: any = await res.json();
      const img = extractImage(modelKey, json);
      if (!img)
        throw new Error(`Réponse sans image: ${JSON.stringify(json).slice(0, 300)}`);
      original = img;
      break;
    }
    const text = await res.text();
    if (modelKey === "imagen" && res.status === 400 && /paid plan/i.test(text)) {
      console.error("Imagen indisponible (plan gratuit) → fallback gemini flash image.");
      modelKey = "flash";
      continue;
    }
    if (!transient.has(res.status) || attempt === 5)
      throw new Error(`${MODELS[modelKey]} HTTP ${res.status}: ${text.slice(0, 300)}`);
    const delay = 8000 * 1.6 ** (attempt - 1);
    console.error(`HTTP ${res.status}, retry ${attempt}/5 dans ${Math.round(delay / 1000)}s…`);
    await new Promise((r) => setTimeout(r, delay));
  }
  console.log(`Modèle: ${MODELS[modelKey]}`);

  console.log(`Prompt: ${prompt}\n→ ${outPath}`);
  await mkdir(dirname(outPath), { recursive: true });
  if (opt["keep-bg"]) await Bun.write(outPath.replace(/\.png$/, ".bg.png"), original!);
  const transparent = await unblendWhite(original!);
  await Bun.write(outPath, transparent);
  console.log(`✓ PNG24 transparent écrit: ${outPath} (${transparent.length} bytes)`);
  if (!existsSync(outPath)) process.exit(1);
}

if (import.meta.main) await main();

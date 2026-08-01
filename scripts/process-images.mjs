/**
 * Image pipeline.
 *
 * Scans `src/assets/photos/` for source photographs and produces, for each one:
 *   - responsive AVIF + WebP + JPEG derivatives at several widths
 *   - a tiny blurred LQIP encoded as a base64 data URI (used as a fade-in placeholder)
 *   - intrinsic dimensions, so the layout can reserve space and avoid layout shift
 *
 * The result is written to `src/data/media.generated.js`, which the gallery,
 * memory wall and hero all read from.
 *
 * TO ADD MORE PHOTOS OF SCOOPY:
 *   1. Drop the file into `src/assets/photos/`.
 *   2. Optionally describe it in `photos.meta.json` (same folder) — see below.
 *   3. Run `npm run build` (or `npm run images`). It is picked up automatically.
 *
 * `photos.meta.json` is an optional map of `filename -> { alt, caption, date, tags,
 * feature }`. Anything omitted falls back to a sensible default derived from the
 * filename, so the pipeline never fails on an undocumented photo.
 */

import { readdir, mkdir, writeFile, readFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(ROOT, 'src', 'assets', 'photos');
const OUT_DIR = path.join(ROOT, 'public', 'media');
const DATA_OUT = path.join(ROOT, 'src', 'data', 'media.generated.js');

const SOURCE_EXT = new Set(['.jpg', '.jpeg', '.png', '.webp', '.tif', '.tiff']);

/** Widths emitted for each photo. Larger widths are skipped if the source is smaller. */
const WIDTHS = [480, 768, 1200, 1800, 2400];

/**
 * Derivative crops.
 *
 * A single source photo is also re-framed into a few different aspect ratios.
 * `sharp`'s `attention` strategy centres the crop on the most salient region —
 * for a portrait of a bird that reliably lands on the head and eye — which gives
 * the masonry gallery genuine visual variety instead of repeated identical tiles.
 */
const CROPS = [
  { id: 'portrait', ratio: 3 / 4, position: 'attention' },
  { id: 'square', ratio: 1, position: 'attention' },
  { id: 'wide', ratio: 16 / 9, position: 'attention' },
];

const titleCase = (slug) =>
  slug
    .replace(/[-_]+/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

async function loadMeta() {
  const metaPath = path.join(SRC_DIR, 'photos.meta.json');
  if (!existsSync(metaPath)) return {};
  try {
    return JSON.parse(await readFile(metaPath, 'utf8'));
  } catch (err) {
    console.warn(`[images] photos.meta.json could not be parsed, ignoring: ${err.message}`);
    return {};
  }
}

/** Encode a 20px-wide blurred version of the image as an inline data URI. */
async function makeLqip(pipeline) {
  const buf = await pipeline
    .clone()
    .resize(20, null, { fit: 'inside' })
    .blur(1.4)
    .webp({ quality: 40 })
    .toBuffer();
  return `data:image/webp;base64,${buf.toString('base64')}`;
}

/**
 * Emit avif/webp/jpeg derivatives for one framing of one photo.
 * Returns the srcset strings plus the intrinsic size of the largest output.
 */
async function emitVariants(pipeline, meta, slug, cropId, ratio, position) {
  /* The largest width a given framing can be cut at without upscaling. A 3:4
     crop of a 1280x960 source, for example, tops out at 720px wide — asking for
     more would either enlarge the pixels or silently fall back to a different
     aspect ratio. */
  const maxWidth = ratio ? Math.floor(Math.min(meta.width, meta.height * ratio)) : meta.width;

  const usableWidths = WIDTHS.filter((w) => w < maxWidth).slice(-3);
  usableWidths.push(maxWidth); // always emit the sharpest version this crop allows

  const sets = { avif: [], webp: [], jpg: [] };
  let largest = null;

  for (const width of usableWidths) {
    const height = ratio ? Math.round(width / ratio) : null;
    const base = `${slug}-${cropId}-${width}`;

    const resized = pipeline
      .clone()
      .resize({
        width,
        height: height ?? undefined,
        fit: height ? 'cover' : 'inside',
        position: height ? position : undefined,
        withoutEnlargement: !height, // fixed-ratio crops are pre-capped by maxWidth
      });

    const [avif, webp, jpg] = await Promise.all([
      resized.clone().avif({ quality: 58, effort: 4 }).toBuffer(),
      resized.clone().webp({ quality: 78 }).toBuffer(),
      resized.clone().jpeg({ quality: 82, mozjpeg: true }).toBuffer(),
    ]);

    await Promise.all([
      writeFile(path.join(OUT_DIR, `${base}.avif`), avif),
      writeFile(path.join(OUT_DIR, `${base}.webp`), webp),
      writeFile(path.join(OUT_DIR, `${base}.jpg`), jpg),
    ]);

    sets.avif.push(`media/${base}.avif ${width}w`);
    sets.webp.push(`media/${base}.webp ${width}w`);
    sets.jpg.push(`media/${base}.jpg ${width}w`);

    const actual = await sharp(jpg).metadata();
    largest = { src: `media/${base}.jpg`, width: actual.width, height: actual.height };
  }

  return {
    src: largest.src,
    width: largest.width,
    height: largest.height,
    srcset: {
      avif: sets.avif.join(', '),
      webp: sets.webp.join(', '),
      jpg: sets.jpg.join(', '),
    },
  };
}

async function run() {
  if (!existsSync(SRC_DIR)) {
    throw new Error(`No photo source folder at ${SRC_DIR}`);
  }

  const entries = (await readdir(SRC_DIR))
    .filter((f) => SOURCE_EXT.has(path.extname(f).toLowerCase()))
    .sort();

  if (entries.length === 0) {
    throw new Error(`No photos found in ${SRC_DIR}. Add at least one image.`);
  }

  await rm(OUT_DIR, { recursive: true, force: true });
  await mkdir(OUT_DIR, { recursive: true });
  await mkdir(path.dirname(DATA_OUT), { recursive: true });

  const metaMap = await loadMeta();
  const photos = [];

  for (const file of entries) {
    const slug = path.basename(file, path.extname(file)).toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const declared = metaMap[file] || metaMap[slug] || {};
    const pipeline = sharp(path.join(SRC_DIR, file)).rotate(); // honour EXIF orientation
    const meta = await pipeline.metadata();

    const lqip = await makeLqip(pipeline);
    const variants = {};

    // Natural framing (no crop), plus the fixed-ratio re-frames.
    variants.natural = await emitVariants(pipeline, meta, slug, 'natural', null, null);
    for (const crop of CROPS) {
      variants[crop.id] = await emitVariants(pipeline, meta, slug, crop.id, crop.ratio, crop.position);
    }

    photos.push({
      id: slug,
      alt: declared.alt || `Scoopy the Sun Conure — ${titleCase(slug)}`,
      caption: declared.caption || '',
      // Prose shown under the Photo of the Day heading. Kept separate from
      // `alt`, which is written for screen readers and reads like metadata if
      // it is put on the page as visible copy.
      story: declared.story || '',
      date: declared.date || '',
      tags: declared.tags || [],
      feature: declared.feature === true,
      lqip,
      variants,
    });

    console.log(`[images] ${file} -> ${Object.keys(variants).length} framings`);
  }

  const banner = `// AUTO-GENERATED by scripts/process-images.mjs — do not edit by hand.\n// Regenerate with: npm run images\n`;
  await writeFile(
    DATA_OUT,
    `${banner}\nexport const photos = ${JSON.stringify(photos, null, 2)};\n\nexport default photos;\n`,
    'utf8'
  );

  console.log(`[images] ${photos.length} photo(s) processed -> src/data/media.generated.js`);
}

run().catch((err) => {
  console.error('[images] failed:', err);
  process.exit(1);
});

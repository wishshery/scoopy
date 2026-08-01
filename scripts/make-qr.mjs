/**
 * Generate the Instagram QR code.
 *
 * The code Instagram hands you in the app is a stylised, non-standard graphic —
 * reliably readable only by Instagram's own scanner, not by a phone's camera.
 * This produces a real, spec-compliant QR encoding the same profile URL, so any
 * camera app can read it.
 *
 * It is generated rather than committed as a fixed asset so the code can never
 * drift from the URL in src/data/site.js, and the result is verified by decoding
 * it back at the sizes the page actually renders it.
 *
 * Run with:  npm run qr
 */

import QRCode from 'qrcode';
import sharp from 'sharp';
import jsQR from 'jsqr';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { social } from '../src/data/site.js';

const root = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(root, '..', 'public', 'brand', 'instagram-qr.png');

/** Rendered at 1440px so it stays crisp on high-density screens. */
const SIZE = 1440;

/** Deep teal rather than pure black — on-brand, and still ~19:1 against white,
 *  far beyond the contrast a decoder needs. */
const DARK = '#04191b';
const LIGHT = '#ffffff';

/**
 * Instagram glyph on a white plate, sized to sit in the middle of the code.
 * Error correction level H tolerates roughly 30% of the code being obscured, so
 * a mark at this scale is well within budget — but the result is decoded back
 * below rather than assumed.
 */
function centreMark(size) {
  const plate = Math.round(size * 0.2);
  const inset = Math.round(plate * 0.14);
  const glyph = plate - inset * 2;
  const r = glyph * 0.28;

  return Buffer.from(
    `<svg xmlns="http://www.w3.org/2000/svg" width="${plate}" height="${plate}" viewBox="0 0 ${plate} ${plate}">
       <rect width="${plate}" height="${plate}" rx="${plate * 0.22}" fill="${LIGHT}"/>
       <g transform="translate(${inset},${inset})" fill="none" stroke="${DARK}" stroke-width="${glyph * 0.09}">
         <rect x="${glyph * 0.06}" y="${glyph * 0.06}" width="${glyph * 0.88}" height="${glyph * 0.88}" rx="${r}"/>
         <circle cx="${glyph * 0.5}" cy="${glyph * 0.5}" r="${glyph * 0.22}"/>
         <circle cx="${glyph * 0.73}" cy="${glyph * 0.27}" r="${glyph * 0.055}" fill="${DARK}" stroke="none"/>
       </g>
     </svg>`
  );
}

async function generate({ withMark }) {
  const base = await QRCode.toBuffer(social.instagram.url, {
    type: 'png',
    width: SIZE,
    // High error correction, so the code still reads if part of it is obscured,
    // smudged on a printed copy, or caught at an angle.
    errorCorrectionLevel: 'H',
    // 4 modules is the quiet zone the spec requires; less and scanners struggle.
    margin: 4,
    color: { dark: DARK, light: LIGHT },
  });

  if (!withMark) return base;

  return sharp(base)
    .composite([{ input: centreMark(SIZE), gravity: 'centre' }])
    .png()
    .toBuffer();
}

/** Decode a PNG buffer back at `size` px square, the way a camera would. */
async function decodesAt(buffer, size) {
  const { data, info } = await sharp(buffer)
    .flatten({ background: LIGHT })
    .resize(size, size, { fit: 'contain', background: LIGHT })
    .removeAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const rgba = new Uint8ClampedArray(info.width * info.height * 4);
  for (let i = 0, p = 0; i < data.length; i += 3, p += 4) {
    const grey = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    rgba[p] = rgba[p + 1] = rgba[p + 2] = grey;
    rgba[p + 3] = 255;
  }

  const result = jsQR(rgba, info.width, info.height, { inversionAttempts: 'dontInvert' });
  return result ? result.data : null;
}

/* The sizes the page renders the code at, plus smaller, so a change to styling
   or sizing that breaks scanning fails the build rather than shipping. */
const CHECK_SIZES = [1440, 512, 295, 200, 168, 120, 92];

/** Decode at every size; returns the smallest that worked, or null on any failure. */
async function verify(png, label) {
  let smallest = null;

  for (const size of CHECK_SIZES) {
    const decoded = await decodesAt(png, size);
    if (decoded !== social.instagram.url) {
      console.log(`[qr] ${label}: fails at ${size}px`);
      return null;
    }
    smallest = size;
  }

  console.log(`[qr] ${label}: decodes at every size, down to ${smallest}px`);
  return smallest;
}

/**
 * The card animates a translucent sweep across the code. Worst case is that
 * tint covering the whole thing at the moment a camera samples, so the code is
 * decoded through it here rather than the contrast being assumed safe.
 */
async function decodesThroughScanTint(png) {
  const tinted = await sharp(png)
    .composite([
      {
        input: {
          create: {
            width: SIZE,
            height: SIZE,
            channels: 4,
            // --sun-400 (#ffc01e) at the 26% the stylesheet uses.
            background: { r: 255, g: 192, b: 30, alpha: 0.26 },
          },
        },
        blend: 'over',
      },
    ])
    .png()
    .toBuffer();

  return (await decodesAt(tinted, 295)) === social.instagram.url;
}

async function run() {
  console.log(`[qr] ${social.instagram.url}`);

  /* Preferred output carries the Instagram glyph. If that ever stops decoding —
     a bigger mark, a denser URL — fall back to the plain code rather than ship
     something a camera cannot read. */
  let png = await generate({ withMark: true });
  let ok = await verify(png, 'with centre mark');

  if (!ok) {
    console.log('[qr] falling back to the plain code');
    png = await generate({ withMark: false });
    ok = await verify(png, 'plain');
  }

  if (!ok) throw new Error('generated QR did not decode at the required sizes');

  const survivesTint = await decodesThroughScanTint(png);
  console.log(`[qr] under the card's scan-line tint: ${survivesTint ? 'still decodes' : 'FAILS'}`);
  if (!survivesTint) throw new Error('QR stops decoding under the scan-line overlay');

  await mkdir(path.dirname(OUT), { recursive: true });
  await writeFile(OUT, png);
  console.log(`[qr] wrote ${path.relative(path.resolve(root, '..'), OUT)} (${SIZE}px, EC level H)`);
}

run().catch((err) => {
  console.error('[qr] failed:', err.message);
  process.exit(1);
});

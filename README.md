# Scoopy

An interactive single-page tribute to Scoopy, a Sun Conure with endless curiosity and
a heart full of affection.

**Instagram:** [@scoopsforoops](https://www.instagram.com/scoopsforoops?utm_source=qr)

---

## Running it

```bash
npm install
npm run dev
```

The dev server prints a local URL (default `http://localhost:5173`). `npm run dev`
regenerates the image derivatives first, so a newly added photo appears immediately.

```bash
npm run build     # production bundle into dist/
npm run preview   # serve the built bundle locally
```

---

## Adding photos

1. Drop the image into `src/assets/photos/`.
2. *(Optional)* Describe it in `src/assets/photos/photos.meta.json`:

   ```json
   "scoopy-on-the-windowsill.jpg": {
     "alt": "Scoopy sitting on a sunlit windowsill, looking out",
     "caption": "Supervising the street",
     "date": "2026-08-14",
     "tags": ["window", "morning"],
     "feature": false
   }
   ```

   Every field is optional. Set `"feature": true` on the photo you want used as the
   hero — exactly one photo should carry it.
3. Run `npm run build` (or `npm run dev`).

The pipeline picks the file up automatically and adds it to the gallery, the
lightbox, and the Photo of the Day rotation.

### What the pipeline produces

`scripts/process-images.mjs` reads each source photo and emits:

- **AVIF, WebP and JPEG** derivatives at several widths, so browsers download the
  smallest format they support at the size they actually need
- **four framings** — `natural`, `portrait` (3:4), `square`, `wide` (16:9) — each cut
  with sharp's `attention` strategy, which reliably centres on the bird's head
- a **blurred LQIP** inlined as a data URI, used as the fade-in placeholder
- **intrinsic dimensions**, so no image causes layout shift

Output goes to `public/media/` and `src/data/media.generated.js`. Both are generated
and git-ignored — never edit them by hand.

Widths are capped per framing so a crop is never upscaled: a 3:4 cut of a 1280×960
source tops out at 720px wide, and the pipeline emits exactly that.

---

## Adding a memory

Put a new object at the **top** of the `memories` array in `src/data/site.js`:

```js
{
  date: 'September 2026',
  title: 'First word',
  body: 'It was "hello". It has been "hello" roughly four hundred times since.',
  photo: 'scoopy-on-the-windowsill', // optional: a photo id (filename, no extension)
}
```

---

## Editing the words

All copy lives in `src/data/site.js` — the story, the personality cards, the daily
routine, the fun facts, the quotes, the Instagram details, and the footer. No markup
or styling decisions belong in that file.

---

## How it is put together

Plain ES modules and Vite. No UI framework: the page is a fixed composition of
sections, so a render-once-then-attach-behaviour approach is smaller and faster than
a runtime that exists to re-render.

```
src/
  main.js                 composes the page, then initialises each behaviour
  data/
    site.js               all written content
    media.generated.js    photo manifest (generated)
  components/             one module per section; each exports render() and sometimes init()
  effects/                cross-cutting behaviour (ambient canvas, parallax, reveal, theme, audio)
  styles/
    tokens.css            colour, type, space, motion and elevation primitives
    base.css              reset, document defaults, layout primitives
    animations.css        keyframes, the reveal system, reduced-motion handling
    components/*.css      one stylesheet per section
  utils/                  DOM helpers, motion preferences, the shared rAF ticker, icons
scripts/
  process-images.mjs      the image pipeline
```

### Performance notes

- Every ambient effect subscribes to **one shared `requestAnimationFrame` loop**
  (`utils/motion.js`), which pauses when the tab is hidden.
- All animation is **transform and opacity only**, so it stays on the compositor.
- Scroll and pointer handlers are **rAF-throttled** and passive.
- Parallax targets are tracked with an `IntersectionObserver`; off-screen sections
  cost nothing per frame.
- Particle, feather and bird counts **scale with viewport area** and are reduced on
  devices reporting low core count or memory.
- Reveal observers **unobserve after firing** — the observer sheds work as you scroll.
- Ambient canvas DPR is capped at 2; blur at 3× is expensive for no visible gain.

### Accessibility

- Semantic landmarks, one `<h1>`, and a skip link.
- The lightbox is a native `<dialog>` opened with `showModal()`, so focus trapping,
  background inertness and Escape-to-close come from the platform. Arrow keys step
  between photos and focus returns to the tile that opened it.
- Visible focus rings throughout; the mobile menu closes on Escape and returns focus.
- `prefers-reduced-motion` is fully honoured — the ambient canvas and cursor trail are
  removed entirely, and every revealed element is shown outright rather than left hidden.
- Sound is **off by default** and only ever starts from a click.
- The QR code sits on a white plate in both themes, because scanners need the light
  quiet zone.

### Audio

The bird song is **synthesised with the Web Audio API**, not loaded as a file: it costs
no bandwidth, never repeats identically, and raises no licensing question.

---

## Deployment

Live at **https://scoopsforoops.com** — GitHub Pages, via `.github/workflows/deploy.yml`.
Every push to `main` builds the site and publishes `dist/`.

The custom domain is declared in `public/CNAME`, and the workflow builds with
`BASE_PATH=/` because a custom domain serves from the domain root. If you ever remove
`public/CNAME`, change `BASE_PATH` back to `/${{ github.event.repository.name }}/` so
assets resolve under the `/scoopy/` project path again.

### DNS (at GoDaddy)

| Type  | Name | Value                                                     |
| ----- | ---- | --------------------------------------------------------- |
| A     | `@`  | `185.199.108.153` `.109.153` `.110.153` `.111.153`         |
| CNAME | `www`| `wishshery.github.io`                                      |

Those four A records are GitHub Pages' anycast addresses. After changing DNS, GitHub
provisions a Let's Encrypt certificate automatically; that usually lands within an hour.
Once it does, turn on **Enforce HTTPS** in Settings → Pages (or
`gh api -X PUT repos/wishshery/scoopy/pages -F https_enforced=true`).

/**
 * About — the storytelling section.
 * Prose column on the left, an offset parallax portrait on the right.
 */

import { esc, html } from '../utils/dom.js';
import { about } from '../data/site.js';
import { renderMedia } from './Media.js';
import { renderLeaf } from './Decor.js';

export function renderAbout(photo) {
  return `
    <section class="section about" id="about" aria-labelledby="about-title">
      ${renderLeaf('tl')}
      ${renderLeaf('br')}

      <div class="shell about__grid">
        <div class="about__body">
          <p class="eyebrow" data-reveal>${esc(about.eyebrow)}</p>
          <h2 id="about-title" data-reveal style="--reveal-delay:80ms">
            <span class="text-gradient">${esc(about.heading)}</span>
          </h2>

          ${html(
            about.paragraphs.map(
              (text, i) =>
                `<p class="${i === 0 ? 'about__lead' : ''}" data-reveal style="--reveal-delay:${
                  160 + i * 90
                }ms">${esc(text)}</p>`
            )
          )}

          <ul class="about__highlights">
            ${html(
              about.highlights.map(
                (item, i) => `
              <li class="about__chip" data-reveal style="--reveal-delay:${420 + i * 90}ms">
                <b>${esc(item.value)}</b>
                <span>${esc(item.label)}</span>
              </li>`
              )
            )}
          </ul>
        </div>

        ${
          photo
            ? `<figure class="about__figure" data-parallax="0.1" data-parallax-target data-reveal="right">
                 ${renderMedia(photo, {
                   framing: 'portrait',
                   sizes: '(max-width: 900px) 90vw, 42vw',
                   className: 'about__frame',
                   ratio: '3 / 4',
                 })}
               </figure>`
            : ''
        }
      </div>
    </section>`;
}

/**
 * Memory wall — an extendable timeline of moments.
 *
 * Entries come from `memories` in src/data/site.js. Adding a memory is a matter
 * of putting a new object at the top of that array; if it names a `photo`, the
 * matching image from the pipeline is rendered with it.
 */

import { esc, html } from '../utils/dom.js';
import { memories } from '../data/site.js';
import { renderMedia } from './Media.js';
import { renderLeaf } from './Decor.js';

export function renderMemoryWall(photos) {
  const byId = new Map(photos.map((photo) => [photo.id, photo]));

  return `
    <section class="section memories" id="memories" aria-labelledby="memories-title">
      ${renderLeaf('tr')}

      <div class="shell">
        <div class="section__head section__head--center">
          <p class="eyebrow" data-reveal>The memory wall</p>
          <h2 id="memories-title" data-reveal style="--reveal-delay:80ms">
            Moments worth <span class="text-gradient">keeping</span>
          </h2>
        </div>

        <ol class="wall">
          ${html(
            memories.map((memory, i) => {
              const photo = memory.photo ? byId.get(memory.photo) : null;
              return `
            <li class="memory" data-reveal="${i % 2 === 0 ? 'left' : 'right'}">
              <span class="memory__node" aria-hidden="true"></span>
              <article class="memory__card">
                <p class="memory__date">${esc(memory.date)}</p>
                <h3 class="memory__title">${esc(memory.title)}</h3>
                <p class="memory__body">${esc(memory.body)}</p>
                ${
                  photo
                    ? renderMedia(photo, {
                        framing: 'wide',
                        sizes: '(max-width: 820px) 88vw, 40vw',
                        className: 'memory__media',
                        ratio: '16 / 9',
                      })
                    : ''
                }
              </article>
            </li>`;
            })
          )}
        </ol>

        <p class="memories__note" data-reveal>
          New memories go at the top of the <code>memories</code> list in <code>src/data/site.js</code>.
        </p>
      </div>
    </section>`;
}

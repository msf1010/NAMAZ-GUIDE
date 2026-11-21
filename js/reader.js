// Reusable reading-page components: every Surah, Dua or recitation uses the same stacked layout.
import { store, versesOf, routeFor, CATEGORY_LABEL } from './content-loader.js';

export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

const STATUS = {
  verified: { cls: 'ok', label: 'Verified' },
  'needs-review': { cls: 'warn', label: 'Needs review' },
};

function wordsBlock(words) {
  if (!words || !words.length) return '';
  return `<details class="wbw"><summary><span>Word by word</span><span class="ur-s" lang="ur">لفظی ترجمہ</span></summary>
    <div class="words" dir="rtl">${words.map(w => `<div class="w"><span class="w-ar" lang="ar">${esc(w.arabic)}</span><span class="w-ur" lang="ur">${esc(w.urdu)}</span><span class="w-en" lang="en" dir="ltr">${esc(w.english)}</span></div>`).join('')}</div></details>`;
}

function verseBlock(v) {
  const label = v.number != null ? `<span class="vnum" aria-label="Verse ${v.number}">${v.number}</span>` : (v.label ? `<span class="vlabel">${esc(v.label)}</span>` : '');
  return `<article class="verse"${v.number != null ? ` id="v${v.number}"` : ''}>
    ${label}
    <p class="ar" lang="ar" dir="rtl">${esc(v.arabic)}</p>
    <p class="ur" lang="ur" dir="rtl">${esc(v.urdu)}</p>
    <p class="en" lang="en">${esc(v.english)}</p>
    ${wordsBlock(v.words)}
  </article>`;
}

function links(ids, cls = 'chip-link') {
  return ids.map(id => { const it = store.byId.get(id); return it ? `<a class="${cls}" href="${routeFor(it)}">${esc(it.title)}</a>` : ''; }).join('');
}

function metaLine(item) {
  const bits = [];
  if (item.surahNumber) bits.push(`Surah ${item.surahNumber}`);
  const n = (item.verses || []).length;
  if (item.surahNumber && n) bits.push(`${n} verse${n > 1 ? 's' : ''}`);
  return bits.join(' · ');
}

/** One reading entry. opts: { level: 1|2, step } */
export function entryHtml(item, opts = {}) {
  const level = opts.level || 1;
  const verses = versesOf(item);
  const st = STATUS[item.verificationStatus] || STATUS['needs-review'];
  const bis = item.bismillah ? store.byId.get('namaz-tasmiyah')?.verses?.[0]?.arabic : '';
  const hasArabic = verses.length > 0;
  const refs = (item.references || []).map(r => `<li>${esc(r.text)}</li>`).join('');

  return `<section class="entry" id="e-${esc(item.id)}" data-id="${esc(item.id)}">
  <header class="entry-head">
    ${opts.step ? `<span class="step" aria-label="Step ${opts.step}">${opts.step}</span>` : ''}
    <div class="titles">
      <h${level + 1} class="entry-title">${esc(item.title)}</h${level + 1}>
      <p class="entry-title-ar" lang="ur" dir="rtl">${esc(item.titleUrdu)}</p>
      ${metaLine(item) ? `<p class="meta">${esc(metaLine(item))}</p>` : ''}
    </div>
    <div class="tools">
      ${hasArabic ? `<button class="tool" data-copy="${esc(item.id)}" aria-label="Copy Arabic text" title="Copy Arabic"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V6a2 2 0 0 1 2-2h9"/></svg></button>` : ''}
      <button class="tool" data-share="${esc(routeFor(item))}" data-title="${esc(item.title)}" aria-label="Share link" title="Share"><svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4"/></svg></button>
    </div>
  </header>
  ${item.ruling ? `<p class="ruling"><span class="chip">${esc(item.ruling)}</span>${item.rulingUrdu ? `<span class="chip" lang="ur" dir="rtl">${esc(item.rulingUrdu)}</span>` : ''}</p>` : ''}
  ${item.posture ? `<p class="posture">${esc(item.posture)}</p>` : ''}
  ${bis ? `<p class="ar bismillah" lang="ar" dir="rtl">${esc(bis)}</p>` : ''}
  ${verses.length ? `<div class="verses">${verses.map(verseBlock).join('')}</div>` : ''}
  ${item.surahRef ? `<p class="more"><a href="${routeFor(store.byId.get(item.surahRef))}">Open the full Surah page →</a></p>` : ''}
  ${item.surahRefs ? `<div class="chips">${links(item.surahRefs)}</div>` : ''}
  ${item.see ? `<p class="see">See also: ${links(item.see, 'inline-link')}</p>` : ''}
  ${(item.explanationEnglish || item.explanationUrdu) ? `<div class="expl">
      ${item.explanationUrdu ? `<p class="ur" lang="ur" dir="rtl">${esc(item.explanationUrdu)}</p>` : ''}
      ${item.explanationEnglish ? `<p class="en" lang="en">${esc(item.explanationEnglish)}</p>` : ''}</div>` : ''}
  ${(item.notesEnglish || item.notesUrdu) ? `<div class="note-box"><strong>Note</strong>
      ${item.notesUrdu ? `<p class="ur" lang="ur" dir="rtl">${esc(item.notesUrdu)}</p>` : ''}
      ${item.notesEnglish ? `<p class="en" lang="en">${esc(item.notesEnglish)}</p>` : ''}</div>` : ''}
  <details class="source"><summary><span class="badge ${st.cls}">${st.label}</span><span>Source &amp; verification</span></summary>
    ${refs ? `<ul>${refs}</ul>` : ''}
    ${item.verificationNote ? `<p class="small">${esc(item.verificationNote)}</p>` : ''}
  </details>
</section>`;
}

/** Full page for a single item (Surah, Dua, …). */
export function itemPage(item) {
  const back = { 'four-quls': ['#/quls', 'Four Quls'], 'short-surah': ['#/surahs', 'Short Surahs'], dua: ['#/duas', 'Duas & Adhkar'], namaz: ['#/namaz', 'Complete Namaz'] }[item.category] || ['#/', 'Home'];
  return `<div class="page reading">
    <a class="back" href="${back[0]}">‹ ${esc(back[1])}</a>
    <div class="page-tools"><button class="btn-soft" id="btn-wbw" aria-pressed="false">Expand all word meanings</button></div>
    ${entryHtml(item)}
  </div>`;
}

export function categoryLabel(item) { return CATEGORY_LABEL[item.category] || ''; }

/** Plain Arabic text of an item (for Copy). */
export function arabicText(item) {
  return versesOf(item).map(v => v.arabic).join('\n');
}

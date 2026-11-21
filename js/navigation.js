// Hash-based router (works on GitHub Pages sub-paths without server config) and page views.
import { store, routeFor, CATEGORY_LABEL } from './content-loader.js';
import { entryHtml, itemPage, esc, categoryLabel } from './reader.js';
import { search, highlight } from './search.js';
import { getRecent, pushRecent } from './theme.js';

const view = () => document.getElementById('view');

const ICON = {
  home: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  namaz: '<path d="M2 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H2z"/><path d="M22 4h-7a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h8z"/>',
  quls: '<path d="M6 3h12v18l-6-4-6 4z"/>',
  surahs: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  duas: '<path d="M12 21s-7-4.5-9.5-9A5.5 5.5 0 0 1 12 6a5.5 5.5 0 0 1 9.5 6c-2.5 4.5-9.5 9-9.5 9z"/>',
};
const NAV = [
  ['home', '#/', 'Home'], ['namaz', '#/namaz', 'Namaz'], ['quls', '#/quls', '4 Quls'], ['surahs', '#/surahs', 'Surahs'], ['duas', '#/duas', 'Duas'],
];

export function buildNav() {
  document.getElementById('nav').innerHTML = NAV.map(([k, href, label]) =>
    `<a href="${href}" data-nav="${k}"><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICON[k]}</svg><span>${label}</span></a>`).join('');
}

function setActive(key) {
  document.querySelectorAll('#nav a').forEach(a => {
    const on = a.dataset.nav === key; a.classList.toggle('active', on);
    if (on) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
  });
}

// ---------------------------------------------------------------- views
function searchField(value = '') {
  return `<form class="searchbox" role="search" onsubmit="return false">
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
    <input id="q" type="search" inputmode="search" enterkeyhint="search" autocomplete="off" autocapitalize="off" spellcheck="false" value="${esc(value)}"
      placeholder="Search Arabic, Urdu or English…" aria-label="Search the library">
    <button type="button" class="clear" id="q-clear" aria-label="Clear search" ${value ? '' : 'hidden'}>✕</button>
  </form>`;
}

function homeView() {
  const recent = getRecent().map(id => store.byId.get(id)).filter(Boolean).slice(0, 6);
  const quick = ['namaz-tashahhud', 'namaz-durood', 'namaz-qunoot', 'dua-ayat-ul-kursi', 'dua-sayyidul-istighfar', 'dua-rabbana-hasanah']
    .map(id => store.byId.get(id)).filter(Boolean);
  return `<div class="page home">
    <section class="hero">
      <h1>My Salah</h1>
      <p class="lede">Your reference for every recitation.</p>
      <div id="home-search">${searchField()}</div>
    </section>
    <section class="tiles" aria-label="Library">
      <a class="tile" href="#/namaz"><strong>Complete Namaz</strong><span lang="ur" dir="rtl">مکمل نماز</span><small>Takbeer to Salam · Witr</small></a>
      <a class="tile" href="#/quls"><strong>Four Quls</strong><span lang="ur" dir="rtl">چار قُل</span><small>Kafirun · Ikhlas · Falaq · Nas</small></a>
      <a class="tile" href="#/surahs"><strong>Short Surahs</strong><span lang="ur" dir="rtl">مختصر سورتیں</span><small>${store.sets['short-surahs'].length} Surahs</small></a>
      <a class="tile" href="#/duas"><strong>Duas &amp; Adhkar</strong><span lang="ur" dir="rtl">دعائیں اور اذکار</span><small>${store.sets.duas.length} entries</small></a>
    </section>
    <section><h2 class="sec">Common</h2><div class="chips">${quick.map(i => `<a class="chip-link" href="${routeFor(i)}">${esc(i.title)}</a>`).join('')}</div></section>
    ${recent.length ? `<section><h2 class="sec">Recently viewed</h2><ul class="list">${recent.map(rowHtml).join('')}</ul></section>` : ''}
    <p class="foot"><a href="#/about">Sources, licences &amp; verification</a></p>
  </div>`;
}

function rowHtml(item) {
  const n = item.surahNumber ? `<span class="num">${item.surahNumber}</span>` : `<span class="num dot"></span>`;
  return `<li><a class="row-link" href="${routeFor(item)}">${n}<span class="r-main"><strong>${esc(item.title)}</strong><small>${esc(categoryLabel(item))}</small></span><span class="r-ar" lang="ur" dir="rtl">${esc(item.titleUrdu)}</span></a></li>`;
}

function listView(title, titleUr, sub, items, groupBy) {
  let body;
  if (groupBy) {
    const groups = new Map();
    for (const it of items) { const g = groupBy(it); (groups.get(g) || groups.set(g, []).get(g)).push(it); }
    body = [...groups].map(([g, arr]) => `<h2 class="sec">${esc(g)}</h2><ul class="list">${arr.map(rowHtml).join('')}</ul>`).join('');
  } else body = `<ul class="list">${items.map(rowHtml).join('')}</ul>`;
  return `<div class="page"><div class="page-title"><h1>${esc(title)}</h1><span class="ar-title" lang="ur" dir="rtl">${esc(titleUr)}</span></div><p class="sub">${esc(sub)}</p>${body}</div>`;
}

function duaGroup(it) {
  if (it.id.startsWith('adhkar-')) return 'Morning & Evening';
  if (it.id.startsWith('dhikr-')) return 'Dhikr';
  if (/\d+:\d+/.test(it.verses?.[0]?.label || '')) return 'Quranic duas';
  return 'Duas from the Sunnah';
}

function namazView() {
  const all = store.sets.namaz;
  const prayer = all.filter(i => i.group === 'prayer'), witr = all.filter(i => i.group === 'witr');
  return `<div class="page reading">
    <div class="page-title"><h1>Complete Namaz</h1><span class="ar-title" lang="ur" dir="rtl">مکمل نماز</span></div>
    <p class="sub">Hanafi method, in the order of the prayer. Not every recitation is read in every rak‘ah — see the ruling and note on each step.</p>
    <details class="note-box rakah"><summary><strong>Which rak‘ah? (quick summary)</strong></summary>
      <ul>
        <li><b>1st rak‘ah:</b> Takbeer-e-Tahreema, Sana, Ta‘awwudh, Tasmiyah, Al-Fatiha, a Surah, Ruku, two Sajdahs.</li>
        <li><b>2nd rak‘ah:</b> Al-Fatiha, a Surah, Ruku, two Sajdahs, then sit: Tashahhud (plus Durood, dua and Salam if it is a 2-rak‘ah prayer).</li>
        <li><b>3rd and 4th rak‘ah of a Fard prayer:</b> Al-Fatiha only. In Sunnah/Nafl prayers a Surah is added too.</li>
        <li><b>Final sitting:</b> Tashahhud, Durood, dua, Salam.</li>
      </ul><p class="small">This is a summary to aid memory; confirm details with your scholar.</p></details>
    <div class="jump" aria-label="Jump to step">${prayer.map(i => `<a href="#/namaz/${i.id}" title="${esc(i.title)}">${i.step}</a>`).join('')}<a href="#/namaz/${witr[0].id}" class="wide">Witr</a></div>
    <div class="page-tools"><button class="btn-soft" id="btn-wbw" aria-pressed="false">Expand all word meanings</button></div>
    <h2 class="sec">Prayer sequence</h2>
    ${prayer.map(i => entryHtml(i, { level: 2, step: i.step })).join('')}
    <h2 class="sec" id="witr">Witr</h2>
    ${witr.map(i => entryHtml(i, { level: 2 })).join('')}
  </div>`;
}

function searchView(q = '') {
  return `<div class="page"><div class="searchbar">${searchField(q)}</div><div id="results" aria-live="polite"></div></div>`;
}

function resultHtml(r, q) {
  const arabicQ = /[؀-ۿ]/.test(q);
  const v = r.verse;
  const snippet = v ? `<span class="s-ar" lang="ar" dir="rtl">${highlight(v.arabic, q)}</span>
     ${arabicQ ? `<span class="s-tr" lang="ur" dir="rtl">${highlight(v.urdu, q)}</span>` : `<span class="s-tr" lang="en">${highlight(v.english, q)}</span>`}` : '';
  return `<li><a class="result" href="${routeFor(r.item)}"><span class="r-top"><span class="cat">${esc(categoryLabel(r.item))}</span><strong>${highlight(r.item.title, q)}</strong></span>${snippet}</a></li>`;
}

export function runSearch(q) {
  const box = document.getElementById('results');
  if (!box) return;
  q = q.trim();
  if (!q) { box.innerHTML = `<p class="empty">Type to search — try <em>Ruku</em>, <em>Attahiyyat</em>, <em>Glory be to my Lord</em>, <em>قل هو الله</em> or <em>سبحان</em>.</p>`; return; }
  const res = search(q);
  box.innerHTML = res.length
    ? `<p class="count">${res.length} result${res.length > 1 ? 's' : ''}</p><ul class="results">${res.map(r => resultHtml(r, q)).join('')}</ul>`
    : `<p class="empty">No matches for “${esc(q)}”.<br>Try a different spelling, a shorter word, or search in Arabic, Urdu or English.</p>`;
}

function aboutView() {
  const review = store.items.filter(i => i.verificationStatus !== 'verified');
  return `<div class="page reading about">
    <a class="back" href="#/">‹ Home</a>
    <div class="page-title"><h1>Sources &amp; verification</h1></div>
    <h2 class="sec">Content sources</h2>
    <ul class="plain">
      <li><b>Qur’anic Arabic (Indo-Pak script) and word-by-word:</b> Quran.com API (Tanzil-based text), imported at build time and cross-checked letter-by-letter against Tanzil.</li>
      <li><b>Urdu translation:</b> Fatah Muhammad Jalandhari.</li>
      <li><b>English translation:</b> Saheeh International.</li>
      <li><b>Hadith-based recitations:</b> entered by hand with references; hadith numbers must be confirmed before they are marked verified.</li>
    </ul>
    <h2 class="sec">Fonts (all SIL Open Font License 1.1)</h2>
    <ul class="plain"><li>Scheherazade New — Arabic / Qur’anic text</li><li>Noto Nastaliq Urdu — Urdu</li><li>Inter — English and interface</li></ul>
    <h2 class="sec">Needs manual review (${review.length})</h2>
    <p class="small">Nothing in this library has yet been marked “Verified”. Please check these entries against a trusted printed source before relying on them.</p>
    <ul class="plain cols">${review.map(i => `<li><a href="${routeFor(i)}">${esc(i.title)}</a></li>`).join('')}</ul>
  </div>`;
}

// ---------------------------------------------------------------- router
function parse() {
  const h = decodeURIComponent(location.hash.replace(/^#\/?/, ''));
  const [name = '', ...rest] = h.split('/');
  return { name, arg: rest.join('/') };
}

export function render() {
  const { name, arg } = parse();
  const el = view();
  let navKey = 'home', anchor = null, recentId = null;

  if (name === 'namaz') { el.innerHTML = namazView(); navKey = 'namaz'; if (arg) { anchor = 'e-' + arg; recentId = arg; } }
  else if (name === 'quls') { el.innerHTML = listView('Four Quls', 'چار قُل', 'The four short Surahs commonly recited for protection and in prayer.', store.sets['four-quls']); navKey = 'quls'; }
  else if (name === 'surahs') { el.innerHTML = listView('Short Surahs', 'مختصر سورتیں', 'Commonly memorised Surahs, including those recited in prayer.', store.sets['short-surahs']); navKey = 'surahs'; }
  else if (name === 'duas') { el.innerHTML = listView('Duas & Adhkar', 'دعائیں اور اذکار', 'Quranic supplications, duas from the Sunnah and common dhikr.', store.sets.duas, duaGroup); navKey = 'duas'; }
  else if (name === 'item') {
    const item = store.byId.get(arg);
    if (item) { el.innerHTML = itemPage(item); recentId = item.id; navKey = { 'four-quls': 'quls', 'short-surah': 'surahs', dua: 'duas', namaz: 'namaz' }[item.category]; }
    else el.innerHTML = `<div class="page"><p class="empty">That page was not found. <a href="#/">Go home</a></p></div>`;
  }
  else if (name === 'search') { el.innerHTML = searchView(arg); navKey = ''; runSearch(arg); }
  else if (name === 'about') { el.innerHTML = aboutView(); navKey = ''; }
  else { el.innerHTML = homeView(); }

  setActive(navKey);
  if (recentId) pushRecent(recentId);
  document.title = name === 'item' && store.byId.get(arg) ? `${store.byId.get(arg).title} · My Salah` : 'My Salah';

  if (anchor) {
    const target = document.getElementById(anchor);
    if (target) { requestAnimationFrame(() => { target.scrollIntoView({ block: 'start' }); target.classList.add('flash'); setTimeout(() => target.classList.remove('flash'), 1600); }); }
  } else if (name === 'namaz' && location.hash === '#/namaz') window.scrollTo(0, 0);
  else window.scrollTo(0, 0);

  if (name === 'search') document.getElementById('q')?.focus({ preventScroll: true });
}

export function startRouter() {
  window.addEventListener('hashchange', render);
  render();
}

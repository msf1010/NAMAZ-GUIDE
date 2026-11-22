import { loadContent, store } from './content-loader.js';
import { buildIndex } from './search.js';
import { initTheme, toggleView, bump } from './theme.js';
import { buildNav, startRouter, runSearch } from './navigation.js';
import { arabicText } from './reader.js';

const $ = s => document.querySelector(s);

function toast(msg, action) {
  const t = $('#toast');
  t.innerHTML = '';
  t.append(document.createTextNode(msg));
  if (action) { const b = document.createElement('button'); b.textContent = action.label; b.onclick = action.run; t.append(b); }
  t.hidden = false;
  clearTimeout(toast.timer);
  if (!action) toast.timer = setTimeout(() => (t.hidden = true), 2200);
}

async function copyText(text) {
  try { await navigator.clipboard.writeText(text); toast('Arabic text copied'); }
  catch {
    const ta = document.createElement('textarea'); ta.value = text; document.body.append(ta); ta.select();
    try { document.execCommand('copy'); toast('Arabic text copied'); } catch { toast('Copy not available'); }
    ta.remove();
  }
}

function wireGlobalEvents() {
  document.addEventListener('click', async e => {
    const copy = e.target.closest('[data-copy]');
    if (copy) { const it = store.byId.get(copy.dataset.copy); if (it) copyText(arabicText(it)); return; }

    const share = e.target.closest('[data-share]');
    if (share) {
      const url = location.href.split('#')[0] + share.dataset.share;
      if (navigator.share) { try { await navigator.share({ title: share.dataset.title + ' · My Salah', url }); } catch { /* cancelled */ } }
      else { try { await navigator.clipboard.writeText(url); toast('Link copied'); } catch { toast(url); } }
      return;
    }

    const tg = e.target.closest('[data-toggle]');
    if (tg) { toggleView(tg.dataset.toggle); return; }
    const bp = e.target.closest('[data-bump]');
    if (bp) { bump('ar', Number(bp.dataset.bump)); return; }

    // "Test me": tap a verse to reveal its translation
    if (document.documentElement.classList.contains('cover')) {
      const v = e.target.closest('.verse');
      if (v && !e.target.closest('summary')) { v.classList.toggle('revealed'); return; }
    }

    if (e.target.closest('#q-clear')) { const q = $('#q'); q.value = ''; q.focus(); onQuery(''); return; }
  });

  // Search: instant results while typing. Home field hands over to the search page.
  document.addEventListener('input', e => { if (e.target.id === 'q') onQuery(e.target.value); });
  document.addEventListener('focusin', e => {
    if (e.target.id === 'q' && e.target.closest('#home-search')) { location.hash = '#/search'; }
  });
  document.addEventListener('keydown', e => {
    if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); location.hash = '#/search'; }
  });

  // Print: expand word-by-word so nothing is hidden on paper.
  let prior = [];
  window.addEventListener('beforeprint', () => { prior = [...document.querySelectorAll('details')].map(d => [d, d.open]); prior.forEach(([d]) => (d.open = true)); });
  window.addEventListener('afterprint', () => prior.forEach(([d, o]) => (d.open = o)));

  const pill = $('#offline-pill');
  const net = () => (pill.hidden = navigator.onLine);
  addEventListener('online', net); addEventListener('offline', net); net();
}

function onQuery(q) {
  const clear = $('#q-clear'); if (clear) clear.hidden = !q;
  if (location.hash.startsWith('#/search')) history.replaceState(null, '', '#/search' + (q ? '/' + encodeURIComponent(q) : ''));
  runSearch(q);
}

function registerServiceWorker() {
  if (!('serviceWorker' in navigator) || !/^https?:$/.test(location.protocol)) return;
  navigator.serviceWorker.register('service-worker.js').then(reg => {
    const announce = sw => toast('A new version is ready.', { label: 'Refresh', run: () => sw.postMessage('SKIP_WAITING') });
    if (reg.waiting && navigator.serviceWorker.controller) announce(reg.waiting);
    reg.addEventListener('updatefound', () => {
      const sw = reg.installing;
      sw?.addEventListener('statechange', () => { if (sw.state === 'installed' && navigator.serviceWorker.controller) announce(sw); });
    });
  }).catch(() => { /* app still works online */ });
  // Reload once when an *update* takes over; the very first install (no previous controller) must not reload.
  const hadController = !!navigator.serviceWorker.controller;
  let reloaded = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (hadController && !reloaded) { reloaded = true; location.reload(); } });
}

async function main() {
  initTheme();
  buildNav();
  wireGlobalEvents();
  try {
    await loadContent();
  } catch (err) {
    $('#view').innerHTML = `<div class="page"><p class="empty">Could not load the library. Please check your connection and reload.</p></div>`;
    console.error(err); return;
  }
  buildIndex();
  startRouter();
  registerServiceWorker();
}
main();

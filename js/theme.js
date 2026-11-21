// Theme + reading-size preferences. Stored in localStorage; the service worker never touches them.

const KEY = 'mysalah.';
const get = k => { try { return localStorage.getItem(KEY + k); } catch { return null; } };
const set = (k, v) => { try { localStorage.setItem(KEY + k, v); } catch { /* storage unavailable */ } };

const SIZES = {
  ar: { min: 80, max: 200, step: 10, def: 100 },
  ur: { min: 80, max: 200, step: 10, def: 100 },
  en: { min: 85, max: 160, step: 5, def: 100 },
};
export const prefs = { ar: 100, ur: 100, en: 100 };

export function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('meta-theme')?.setAttribute('content', t === 'dark' ? '#121614' : '#f7f3ea');
  set('theme', t);
  document.querySelectorAll('[data-theme-set]').forEach(b => b.classList.toggle('on', b.dataset.themeSet === t));
}

export function applySizes() {
  const root = document.documentElement.style;
  for (const k of Object.keys(SIZES)) {
    root.setProperty('--' + k + '-scale', prefs[k] / 100);
    const out = document.querySelector(`.stepper[data-size="${k}"] output`);
    if (out) out.textContent = prefs[k] + '%';
  }
}

export function initTheme() {
  applyTheme(document.documentElement.getAttribute('data-theme') || 'light');
  for (const k of Object.keys(SIZES)) {
    const v = parseInt(get('size-' + k), 10);
    prefs[k] = Number.isFinite(v) ? Math.min(SIZES[k].max, Math.max(SIZES[k].min, v)) : SIZES[k].def;
  }
  applySizes();

  const sheet = document.getElementById('settings');
  const btn = document.getElementById('btn-settings');
  const toggle = open => { sheet.hidden = !open; btn.setAttribute('aria-expanded', String(open)); };
  btn.addEventListener('click', () => toggle(sheet.hidden));
  document.getElementById('settings-close').addEventListener('click', () => toggle(false));
  sheet.addEventListener('click', e => { if (e.target === sheet) toggle(false); });
  document.addEventListener('keydown', e => { if (e.key === 'Escape') toggle(false); });

  sheet.addEventListener('click', e => {
    const t = e.target.closest('[data-theme-set]');
    if (t) applyTheme(t.dataset.themeSet);
    const s = e.target.closest('.stepper[data-size] button[data-dir]');
    if (s) {
      const k = s.closest('.stepper').dataset.size, cfg = SIZES[k];
      prefs[k] = Math.min(cfg.max, Math.max(cfg.min, prefs[k] + cfg.step * Number(s.dataset.dir)));
      set('size-' + k, prefs[k]); applySizes();
    }
  });
  document.getElementById('btn-print').addEventListener('click', () => { toggle(false); setTimeout(() => window.print(), 150); });
}

// ---- recently viewed
export function getRecent() { try { return JSON.parse(get('recent') || '[]'); } catch { return []; } }
export function pushRecent(id) {
  const list = [id, ...getRecent().filter(x => x !== id)].slice(0, 8);
  set('recent', JSON.stringify(list));
}

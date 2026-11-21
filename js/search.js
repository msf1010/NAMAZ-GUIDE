// Local, offline search over the JSON library.
// - Arabic/Urdu: diacritics, Quranic marks, alef/hamza forms and Urdu/Arabic letter variants are ignored.
// - English/transliteration: case, punctuation, macrons and common spelling variants are ignored.
import { store, versesOf } from './content-loader.js';

const AR_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ​-‏ٕ࣓ٔ-ࣿ]/g;
const AR_JUNK = '\\u0621\\u0622\\u0623\\u0625\\u0627\\u0671\\u0610-\\u061A\\u064B-\\u065F\\u0670\\u06D6-\\u06ED\\u0640\\u200b-\\u200f';

/** Normalise Arabic-script text (Arabic or Urdu). Alef/hamza are dropped on purpose: Indo-Pak and Urdu spellings differ there. */
export function normAr(s) {
  return String(s || '').normalize('NFKD').replace(AR_MARKS, '')
    .replace(/[ءآأإاٱٲٳﷺ]/g, '')
    .replace(/[ىيیےئۓ]/g, 'ي')
    .replace(/[كک]/g, 'ك')
    .replace(/[ةہھۃهە]/g, 'ه')
    .replace(/[ؤ]/g, 'و')
    .replace(/[^ؠ-يٮ-ۓ\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

/** Normalise Latin text: lower-case, strip accents/punctuation, collapse common transliteration variants. */
export function normLat(s) {
  return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[‘’'`ʿʾ-]/g, '')
    .replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
    .replace(/dh/g, 'z').replace(/th/g, 's').replace(/q/g, 'k')
    .replace(/(.)\1+/g, '$1').replace(/e/g, 'i').replace(/o/g, 'u');
}

const isArabicScript = s => /[؀-ۿݐ-ݿﭐ-﷿ﹰ-﻿]/.test(s);

let docs = [];

export function buildIndex() {
  docs = store.items.map(item => {
    const verses = versesOf(item);
    const own = !item.surahRef; // Fatiha step in Namaz points to the canonical Surah; don't duplicate its text
    return {
      item,
      titleLat: normLat(item.title),
      aliasLat: normLat((item.aliases || '') + ' ' + (item.transliteration || '')),
      titleAr: normAr(item.titleUrdu),
      verses: own ? verses.map(v => ({
        ar: normAr(v.arabic), ur: normAr(v.urdu), en: normLat(v.english),
        wAr: normAr((v.words || []).map(w => w.arabic).join(' ') + ' ' + (v.words || []).map(w => w.urdu).join(' ')),
        wEn: normLat((v.words || []).map(w => w.english).join(' ')),
        raw: v,
      })) : [],
    };
  });
}

// Latin matching works on word starts (so "sana" does not match "hasanah"); longer fragments may match inside a word.
const latHit = (hay, t) => hay.startsWith(t) || hay.includes(' ' + t) || (t.length >= 5 && hay.includes(t));
const includesAll = (hay, toks, lat) => toks.every(t => (lat ? latHit(hay, t) : hay.includes(t)));

export function search(query, limit = 40) {
  const q = query.trim();
  if (!q) return [];
  const arabic = isArabicScript(q);
  const qn = arabic ? normAr(q) : normLat(q);
  const toks = qn.split(' ').filter(Boolean);
  if (!toks.length || qn.length < 2) return [];
  const out = [];

  for (const d of docs) {
    let score = 0, best = null;
    if (arabic) {
      if (includesAll(d.titleAr, toks)) score = Math.max(score, d.titleAr.includes(qn) ? 95 : 70);
      for (const v of d.verses) {
        let s = 0;
        if (v.ar.includes(qn) || v.ur.includes(qn)) s = 85;
        else if (includesAll(v.ar, toks) || includesAll(v.ur, toks)) s = 60;
        else if (includesAll(v.wAr, toks)) s = 40;
        if (s > score || (s && !best && s === score)) { score = Math.max(score, s); best = v.raw; }
        else if (s && !best) best = v.raw;
      }
    } else {
      if (latHit(d.titleLat, qn)) score = 100;
      else if (latHit(d.aliasLat, qn)) score = 90;
      else if (includesAll(d.titleLat + ' ' + d.aliasLat, toks, true)) score = 75;
      for (const v of d.verses) {
        let s = 0;
        if (latHit(v.en, qn)) s = 70;
        else if (includesAll(v.en, toks, true)) s = 50;
        else if (includesAll(v.wEn, toks, true)) s = 30;
        if (s && (!best || s > score)) { best = v.raw; }
        score = Math.max(score, s);
      }
    }
    if (score) out.push({ item: d.item, score, verse: best || d.verses[0]?.raw || null });
  }
  out.sort((a, b) => b.score - a.score);
  return out.slice(0, limit);
}

// ---------------------------------------------------------------- highlighting
const esc = s => s.replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const reEsc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const VARIANTS = { 'ي': 'يىیےئ', 'ك': 'كک', 'ه': 'هةہھۃە', 'و': 'وؤ' };

export function highlight(text, query) {
  text = String(text || '');
  const q = query.trim();
  if (!q) return esc(text);
  let re;
  try {
    if (isArabicScript(q)) {
      const toks = normAr(q).split(' ').filter(Boolean);
      const pat = toks.map(t => [...t].map(ch => '[' + (VARIANTS[ch] || ch) + ']').join('[' + AR_JUNK + ']*')).join('|');
      re = new RegExp('(' + pat + ')', 'g');
    } else {
      const toks = q.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/).filter(t => t.length > 1);
      if (!toks.length) return esc(text);
      re = new RegExp('(' + toks.map(reEsc).join('|') + ')', 'gi');
    }
  } catch { return esc(text); }
  // For Latin text strip accents only for matching positions; keep it simple and match on the raw string.
  return text.split(re).map((part, i) => (i % 2 ? '<mark>' + esc(part) + '</mark>' : esc(part))).join('');
}

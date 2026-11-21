// Loads the JSON content library and exposes it as a single in-memory store.
// Religious content lives only in /data; nothing here is hard-coded text.

const FILES = {
  namaz: 'data/namaz.json',
  'four-quls': 'data/four-quls.json',
  'short-surahs': 'data/short-surahs.json',
  duas: 'data/duas.json',
};

export const store = { items: [], byId: new Map(), sets: {} };

export async function loadContent() {
  const entries = await Promise.all(Object.entries(FILES).map(async ([key, url]) => {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Could not load ' + url);
    return [key, await res.json()];
  }));
  for (const [key, arr] of entries) {
    store.sets[key] = arr;
    for (const it of arr) { it.set = key; store.items.push(it); store.byId.set(it.id, it); }
  }
  return store;
}

/** Verses of an item; entries that reference a canonical Surah (e.g. Fatiha in Namaz) reuse its verses. */
export function versesOf(item) {
  if (item.verses) return item.verses;
  if (item.surahRef && store.byId.has(item.surahRef)) return store.byId.get(item.surahRef).verses;
  return [];
}

/** Where an item is displayed. */
export function routeFor(item) {
  return item.category === 'namaz' ? '#/namaz/' + item.id : '#/item/' + item.id;
}

export const CATEGORY_LABEL = {
  namaz: 'Complete Namaz',
  'four-quls': 'Four Quls',
  'short-surah': 'Short Surah',
  dua: 'Duas & Adhkar',
};

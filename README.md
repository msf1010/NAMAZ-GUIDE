# My Salah

A personal Islamic reference library — a mobile-first, offline-capable Progressive Web App.
Search for a recitation, read the Arabic (Indo-Pak script) with Urdu and English meanings, word-by-word breakdown, and sources.

Plain HTML + CSS + vanilla JavaScript + JSON. **No build step, no backend, no external APIs at runtime.**

## What is inside

| Section | Contents |
|---|---|
| Complete Namaz | 19 steps in prayer order (Takbeer-e-Tahreema → Salam) with Hanafi rulings, plus Witr and Dua-e-Qunoot |
| Four Quls | Al-Kafirun, Al-Ikhlas, Al-Falaq, An-Nas |
| Short Surahs | Al-Fatiha + 16 short Surahs (Kawthar … Ad-Duha) |
| Duas & Adhkar | Quranic duas, Sayyidul Istighfar, Astaghfirullah, SubhanAllah/Alhamdulillah/Allahu Akbar/La ilaha illallah, Tasbeeh after Salah, Ayat-ul-Kursi, morning/evening adhkar |

Features: instant offline search (Arabic with/without diacritics, Urdu, English, transliterations), light/dark theme, independent Arabic / Urdu / English text sizes, expandable word-by-word meanings, copy Arabic, share link, recently viewed, print / Save as PDF, installable, works offline.

## Run locally

Service workers need `http://localhost` (opening `index.html` directly with `file://` will not work).

```powershell
node tools/serve.mjs 8080
```

Open <http://localhost:8080/>. (Any static server works, e.g. `python -m http.server 8080`.)

**Developing with the service worker:** it caches aggressively, so after editing files either bump `VERSION` in `service-worker.js` or, in Chrome DevTools → Application → Service Workers, tick *Update on reload*.

## Deploy to GitHub Pages

1. Create a repository named `my-salah` and push this folder's contents to the `main` branch (the files `index.html`, `manifest.json`, `service-worker.js`, `css/`, `js/`, `data/`, `assets/` at the repository root; `tools/` may stay or be removed).
2. Repository → **Settings → Pages** → *Build and deployment*: **Deploy from a branch**, branch `main`, folder `/ (root)`.
3. After a minute the app is live at `https://USERNAME.github.io/my-salah/`.
4. On your Android phone open that URL in Chrome, let it load once (this caches everything), then menu → **Install app / Add to Home screen**.

All paths are relative and navigation uses `#/…` routes, so it works inside the `/my-salah/` sub-folder with no server configuration.

### Shipping an update
Edit content or code, then bump `VERSION` in `service-worker.js` (e.g. `v1.0.1`) and push. Users get a "A new version is ready — Refresh" prompt; the old cache is deleted when the new one activates. Preferences (theme, text sizes, recents) live in `localStorage` and are never cleared.

If you add or rename a file the app needs, add it to the `ASSETS` list in `service-worker.js`.

## Project layout

```
index.html  manifest.json  service-worker.js
css/style.css
js/  app.js · content-loader.js · navigation.js · reader.js · search.js · theme.js
data/  namaz.json · four-quls.json · short-surahs.json · duas.json
assets/fonts (OFL fonts + licences) · assets/icons
tools/  build-quran.mjs · build-content.mjs · make-icons.mjs · serve.mjs   (build-time helpers; not used by the app)
```

### Content schema (every entry)
`id, title, titleUrdu, aliases/transliteration, category, verses[{number|label, arabic, urdu, english, words[{arabic,urdu,english}]}], explanationUrdu/English, notesUrdu/English, ruling/rulingUrdu/posture (Namaz), references[{text}], verificationStatus ("verified" | "needs-review"), verificationNote`.
Namaz's Fatiha step uses `surahRef: "surah-fatiha"` so it displays the canonical Surah entry — no duplicated text.

### Regenerating content
`tools/build-quran.mjs` (needs internet) fetches the Qur'anic text/translations/word meanings and rewrites the Surah JSON files plus `tools/quran-ayat.json`; `tools/build-content.mjs` then writes `namaz.json` and `duas.json` (Quranic duas pull their text from that file; hadith-based text is hand-entered in the script). You can also edit the JSON files directly.

## Sources & licences

- Qur'anic Arabic (Indo-Pak script) and word-by-word meanings: Quran.com API v4 (Tanzil-based text). Tanzil's text is distributed under its own terms (attribution, no alteration) — keep the credit.
- Urdu: Fatah Muhammad Jalandhari. English: Saheeh International.
- Fonts: Scheherazade New, Noto Nastaliq Urdu, Inter — all SIL OFL 1.1 (`assets/fonts/LICENSES.md`).
- **AlQalam Quran Majeed was not used**: its redistribution terms could not be confirmed. Scheherazade New renders the Indo-Pak mark set (jazm ۡ, dagger alif, waqf signs ۚ ۖ ۗ etc.) correctly in testing, but its letterforms are Naskh, not the calligraphic Indo-Pak style of a printed mushaf. If you obtain a properly licensed Indo-Pak font, drop it into `assets/fonts/`, change the `--font-ar` / `@font-face` in `css/style.css`, and update `service-worker.js`.

## Verification status — please read

**Nothing in this library is marked "Verified".** Every entry is `needs-review`, and the app says so (Source & verification on each page, and *Sources, licences & verification* on the home page).

What *was* checked:
- All 145 verses of the 21 Surahs were cross-checked letter-by-letter (ignoring diacritics) against the Tanzil text. The only differences are orthographic conventions between Indo-Pak and Uthmani spelling (e.g. صلوة vs الصلاة, يومئذ, alif placement). See `tools/check.mjs`.

What still needs a human check against a printed Indo-Pak mushaf / trusted books:
1. **All Qur'anic text, marks and verse numbering** — imported programmatically; compare with a recognised Indo-Pak printing (e.g. Taj Company / Pakistan-printed 16-line or 13-line mushaf).
2. **Urdu and English translations** — taken as published by the translators via Quran.com; confirm attributions you want displayed.
3. **Word-by-word meanings** — from Quran.com's crowd-sourced data; Urdu word meanings in particular should be reviewed.
4. **Every hand-entered text** (Sana, Ta'awwudh, Tasmiyah, Tashahhud, Durood Ibrahim, Dua after Durood, Salam, jalsa dua, Dua-e-Qunoot, Sayyidul Istighfar, Astaghfirullah, dhikr entries, Tasbeeh after Salah, Allahumma Antas-Salam, morning/evening adhkar): Arabic wording, harakat, Urdu/English translations and word-by-word meanings were written by hand.
5. **All hadith references** (book and number) were written from memory and are marked "verify" — confirm each on sunnah.com or a printed collection before marking verified. No authenticity gradings are claimed.
6. **Hanafi rulings and posture notes** (Fard/Wajib/Sunnah labels, who says Sami'Allah/Rabbana lakal hamd, Tasmiyah before the Surah, jalsa dua, Qunoot alternatives, finger-raising at Tashahhud, Durood/dua in the final sitting, tasbeeh/dhikr ordering) are brief summaries and need checking against a Hanafi text (e.g. Qudūrī, Bahār-e-Sharī‘at, Radd al-Muḥtār) or your scholar. The Qunoot and Jalsa-dua notes in particular are points where practice differs.
7. **Short explanations** of each Surah are brief original summaries.

To mark an entry verified, set `"verificationStatus": "verified"` in its JSON (or in the build script) once you have checked it.

## Testing checklist (Phase 6)

Automated here: app loads without console errors; search for Attahiyyat, Ruku/Rukoo, "Glory be to my Lord", "قل هو الله", "سبحان", "قُلْ هُوَ" (with diacritics), Urdu "رکوع"; word-by-word, light/dark layout at 375px width; service worker precache (20 files) and full offline load with the server stopped.

**Not yet tested — please check on your devices:** real Android Chrome (install prompt, home-screen icon, standalone mode), narrow phones other than 375 px, tablet/desktop layouts, print / Save-as-PDF output, and a careful visual review of Arabic and Urdu rendering of every page (especially long Urdu lines and waqf marks).

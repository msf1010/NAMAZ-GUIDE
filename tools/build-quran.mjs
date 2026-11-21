// Build-time script (not used by the app at runtime).
// Fetches Quran text (Indo-Pak script), Urdu (Fatah Muhammad Jalandhari),
// English (Saheeh International) and word-by-word data from the Quran.com API,
// cross-checks the consonantal skeleton against Tanzil "quran-simple" (alquran.cloud),
// and writes data/four-quls.json, data/short-surahs.json and tools/quran-ayat.json.
import fs from 'node:fs';

const API = 'https://api.quran.com/api/v4';
const clean = s => s.replace(/[​‌‍‎‏]/g, '').replace(/\s+/g, ' ').trim();
const stripTags = s => s.replace(/<sup[^>]*>.*?<\/sup>/g, '').replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();

async function j(url) { const r = await fetch(url); if (!r.ok) throw new Error(url + ' ' + r.status); return r.json(); }

async function fetchVerses(ch) {
  const q = (lang) => `${API}/verses/by_chapter/${ch}?words=true&word_fields=text_indopak&language=${lang}&translations=234,20&per_page=300`;
  const [ur, en] = await Promise.all([j(q('ur')), j(q('en'))]);
  return ur.verses.map((v, i) => {
    const enWords = en.verses[i].words.filter(x => x.char_type_name === 'word');
    const words = v.words.filter(w => w.char_type_name === 'word').map((w, k) => ({
      arabic: clean(w.text_indopak),
      urdu: clean(w.translation.text),
      english: clean(enWords[k].translation.text),
    }));
    return {
      number: v.verse_number,
      arabic: words.map(w => w.arabic).join(' '),
      urdu: stripTags(v.translations.find(t => t.resource_id === 234).text),
      english: stripTags(v.translations.find(t => t.resource_id === 20).text),
      words,
    };
  });
}

const skeleton = s => s.normalize('NFD')
  .replace(/[ؐ-ًؚ-ٰٟۖ-ۭـ​-‏࣓-ࣿ]/g, '')
  .replace(/[آأإٱٲٳا]/g, 'ا').replace(/[ىیيے]/g, 'ي')
  .replace(/[ة]/g, 'ه').replace(/[کك]/g, 'ك').replace(/[ہھه]/g, 'ه')
  .replace(/[^ء-ي]/g, '');

const SURAHS = {
  1: { slug: 'fatiha', t: 'Surah Al-Fatiha', u: 'سورۃ الفاتحہ', tr: 'Al-Faatihah, Fatiha', cat: 'short-surah', n: 'The Opening — recited in prayer; praise of Allah and a request for the straight path.', nu: 'قرآن کی پہلی سورت؛ نماز میں پڑھی جاتی ہے۔ اس میں اللہ کی حمد اور سیدھے راستے کی دعا ہے۔' },
  109: { slug: 'kafirun', t: 'Surah Al-Kafirun', u: 'سورۃ الکافرون', tr: 'Al-Kaafiroon, Kafiroon, Qul ya ayyuhal kafirun', cat: 'four-quls', n: 'A clear declaration of freedom from disbelief and of devotion to worshipping Allah alone.', nu: 'کفر سے براءت اور صرف اللہ کی عبادت کا واضح اعلان۔' },
  112: { slug: 'ikhlas', t: 'Surah Al-Ikhlas', u: 'سورۃ الاخلاص', tr: 'Al-Ikhlaas, Ikhlaas, Qul huwallahu ahad', cat: 'four-quls', n: 'The pure statement of Allah’s oneness: He is One, Self-Sufficient, neither begets nor is begotten, and has no equal.', nu: 'اللہ تعالیٰ کی توحید کا خالص بیان: وہ ایک ہے، بے نیاز ہے، نہ اس کی اولاد ہے نہ وہ کسی کی اولاد، اور اس کا کوئی ہمسر نہیں۔' },
  113: { slug: 'falaq', t: 'Surah Al-Falaq', u: 'سورۃ الفلق', tr: 'Al-Falaq, Falaq, Qul audhu bi rabbil falaq', cat: 'four-quls', n: 'Seeking refuge with the Lord of daybreak from the evil of creation, darkness, sorcery and envy.', nu: 'صبح کے رب کی پناہ مانگنا: مخلوق کے شر، اندھیرے، جادو اور حسد کے شر سے۔' },
  114: { slug: 'nas', t: 'Surah An-Nas', u: 'سورۃ الناس', tr: 'An-Naas, Naas, Qul audhu bi rabbin nas', cat: 'four-quls', n: 'Seeking refuge with the Lord, King and God of mankind from the whispering of the retreating whisperer.', nu: 'انسانوں کے رب، بادشاہ اور معبود کی پناہ مانگنا: وسوسہ ڈالنے والے پیچھے ہٹ جانے والے کے شر سے۔' },
  108: { slug: 'kawthar', t: 'Surah Al-Kawthar', u: 'سورۃ الکوثر', tr: 'Al-Kauthar, Kausar, Inna aataina kal kawthar', cat: 'short-surah', n: 'Allah’s abundant gift to the Prophet ﷺ; the command to pray and sacrifice for Him alone.', nu: 'نبی کریم ﷺ کو عطا کی گئی خیرِ کثیر؛ اپنے رب کے لیے نماز اور قربانی کا حکم۔' },
  103: { slug: 'asr', t: 'Surah Al-Asr', u: 'سورۃ العصر', tr: 'Al-Asr, Wal asr', cat: 'short-surah', n: 'By time, mankind is in loss — except those who believe, do good, and urge one another to truth and patience.', nu: 'زمانے کی قسم! انسان خسارے میں ہے، سوائے ان کے جو ایمان لائے، نیک عمل کیے، اور ایک دوسرے کو حق اور صبر کی تلقین کی۔' },
  110: { slug: 'nasr', t: 'Surah An-Nasr', u: 'سورۃ النصر', tr: 'An-Nasr, Idha jaa a nasrullah', cat: 'short-surah', n: 'On Allah’s help and victory and people entering Islam in crowds, respond with praise and seeking forgiveness.', nu: 'اللہ کی مدد اور فتح آنے اور لوگوں کے جوق در جوق اسلام میں داخل ہونے پر تسبیح، حمد اور استغفار کا حکم۔' },
  111: { slug: 'masad', t: 'Surah Al-Masad (Al-Lahab)', u: 'سورۃ المسد (اللہب)', tr: 'Al-Masad, Lahab, Tabbat yada, Tabbat yada abi lahab', cat: 'short-surah', n: 'The ruin of Abu Lahab and his wife, despite his wealth and standing.', nu: 'ابولہب اور اس کی بیوی کی ہلاکت اور ناکامی؛ اس کا مال اور کمائی اس کے کام نہ آئے گی۔' },
  107: { slug: 'maun', t: 'Surah Al-Ma’un', u: 'سورۃ الماعون', tr: 'Al-Maaoon, Maun, Araaytal ladhi yukadhdhibu bid din', cat: 'short-surah', n: 'Condemns denying the Judgement, mistreating the orphan, not urging the feeding of the poor, heedless prayer, showing off and withholding small help.', nu: 'روزِ جزا کو جھٹلانے، یتیم کو دھتکارنے، مسکین کو کھانا کھلانے کی ترغیب نہ دینے، نماز سے غفلت، ریاکاری اور معمولی چیز روکنے کی مذمت۔' },
  106: { slug: 'quraysh', t: 'Surah Quraysh', u: 'سورۃ قریش', tr: 'Quraish, Li ilafi quraysh', cat: 'short-surah', n: 'Reminds Quraysh of their secure trade journeys and calls them to worship the Lord of this House, who fed and secured them.', nu: 'قریش کو ان کے سردی گرمی کے محفوظ تجارتی سفروں کی یاد دہانی اور اس گھر کے رب کی عبادت کا حکم جس نے انہیں کھلایا اور امن دیا۔' },
  105: { slug: 'fil', t: 'Surah Al-Fil', u: 'سورۃ الفیل', tr: 'Al-Feel, Fil, Alam tara kayfa', cat: 'short-surah', n: 'How Allah destroyed the army of the elephant that came against the Ka‘bah.', nu: 'ہاتھی والوں کے لشکر کا ذکر جسے اللہ نے کعبہ پر چڑھائی کرنے پر ہلاک کر دیا۔' },
  97: { slug: 'qadr', t: 'Surah Al-Qadr', u: 'سورۃ القدر', tr: 'Al-Qadr, Inna anzalnahu fi laylatil qadr', cat: 'short-surah', n: 'The Night of Decree, in which the Qur’an was sent down; it is better than a thousand months.', nu: 'شبِ قدر کا بیان جس میں قرآن نازل ہوا؛ یہ رات ہزار مہینوں سے بہتر ہے۔' },
  95: { slug: 'tin', t: 'Surah At-Tin', u: 'سورۃ التین', tr: 'At-Teen, Tin, Wat tini waz zaytun', cat: 'short-surah', n: 'Man was created in the best form; those who believe and do righteous deeds have a never-ending reward.', nu: 'انسان کو بہترین ساخت پر پیدا کیا گیا؛ ایمان اور نیک عمل والوں کے لیے کبھی نہ ختم ہونے والا اجر ہے۔' },
  104: { slug: 'humazah', t: 'Surah Al-Humazah', u: 'سورۃ الہمزہ', tr: 'Al-Humazah, Humaza, Waylul likulli humazatil lumazah', cat: 'short-surah', n: 'A warning to the slanderer and backbiter who hoards wealth.', nu: 'عیب جوئی اور طعنہ زنی کرنے والے اور مال جمع کر کے گننے والے کے لیے وعید۔' },
  100: { slug: 'adiyat', t: 'Surah Al-‘Adiyat', u: 'سورۃ العادیات', tr: 'Al-Aadiyaat, Adiyat, Wal adiyati dabha', cat: 'short-surah', n: 'By the charging horses: man is ungrateful to his Lord and will be held to account when the graves are overturned.', nu: 'دوڑتے گھوڑوں کی قسم! انسان اپنے رب کا ناشکرا ہے اور قبریں اکھاڑے جانے پر حساب ہوگا۔' },
  99: { slug: 'zalzalah', t: 'Surah Az-Zalzalah', u: 'سورۃ الزلزال', tr: 'Az-Zalzalah, Zilzal, Idha zulzilatil ard', cat: 'short-surah', n: 'The earthquake of the Last Day; every deed, even an atom’s weight, will be seen.', nu: 'قیامت کے زلزلے کا بیان؛ ہر ذرہ برابر نیکی اور برائی سامنے آ جائے گی۔' },
  98: { slug: 'bayyinah', t: 'Surah Al-Bayyinah', u: 'سورۃ البینہ', tr: 'Al-Bayyinah, Bayyina, Lam yakunil ladhina kafaru', cat: 'short-surah', n: 'The Clear Proof — the Messenger and pure scriptures; sincere worship, prayer and zakat are the right religion; the fate of believers and rejecters.', nu: 'روشن دلیل (رسول اور پاک صحیفے)؛ خالص عبادت، نماز اور زکوٰۃ ہی سیدھا دین ہے؛ ایمان والوں اور منکروں کا انجام۔' },
  96: { slug: 'alaq', t: 'Surah Al-‘Alaq', u: 'سورۃ العلق', tr: 'Al-Alaq, Iqra, Iqra bismi rabbika', cat: 'short-surah', n: 'The first revelation: “Read in the name of your Lord”; creation of man, the pen, and the warning against transgression.', nu: 'پہلی وحی: “اپنے رب کے نام سے پڑھیے”؛ انسان کی تخلیق، قلم کی نعمت اور سرکشی پر تنبیہ۔', notes: { en: 'Hanafi note: this Surah contains a sajdah of recitation (Sajdat at-Tilawah) at verse 19.', ur: 'حنفی فقہ کے مطابق اس سورت کی آیت 19 پر سجدۂ تلاوت ہے۔' } },
  94: { slug: 'sharh', t: 'Surah Ash-Sharh (Al-Inshirah)', u: 'سورۃ الشرح (الانشراح)', tr: 'Ash-Sharh, Inshirah, Alam nashrah laka sadrak', cat: 'short-surah', n: 'Allah relieved the Prophet ﷺ’s heart; with hardship comes ease.', nu: 'اللہ نے نبی ﷺ کا سینہ کھول دیا؛ بے شک ہر مشکل کے ساتھ آسانی ہے۔' },
  93: { slug: 'duha', t: 'Surah Ad-Duha', u: 'سورۃ الضحیٰ', tr: 'Ad-Duhaa, Duha, Wad duha', cat: 'short-surah', n: 'Allah has not abandoned His Messenger; a reminder of His favours and the duty to care for the orphan and the beggar.', nu: 'اللہ نے اپنے رسول کو نہ چھوڑا نہ ناراض ہوا؛ اپنی نعمتوں کی یاد دہانی اور یتیم و سائل کے ساتھ حسنِ سلوک کا حکم۔' },
};

const SOURCE = [
  { type: 'quran-text', text: 'Arabic (Indo-Pak script) and word-by-word: Quran.com API v4 (Tanzil-based text).' },
  { type: 'translation-ur', text: 'Urdu: Fatah Muhammad Jalandhari (via Quran.com, resource 234).' },
  { type: 'translation-en', text: 'English: Saheeh International (via Quran.com, resource 20).' },
];

const out = { 'four-quls': [], 'short-surahs': [] };
const report = [];
for (const [id, m] of Object.entries(SURAHS)) {
  const ch = +id;
  const verses = await fetchVerses(ch);
  const ref = await j(`https://api.alquran.cloud/v1/surah/${ch}/quran-simple`);
  let bad = 0;
  verses.forEach((v, i) => {
    let r = ref.data.ayahs[i].text;
    if (ch !== 1 && i === 0) r = r.replace(/^بسم الله الرحمن الرحيم\s*/, '');
    if (skeleton(v.arabic) !== skeleton(r)) { bad++; report.push(`${ch}:${v.number}\n  ours: ${skeleton(v.arabic)}\n  ref : ${skeleton(r)}`); }
  });
  console.log(`Surah ${ch} ${m.t}: ${verses.length} verses, skeleton mismatches: ${bad}`);
  const item = {
    id: 'surah-' + m.slug, surahNumber: ch, title: m.t, titleUrdu: m.u, transliteration: m.tr,
    category: m.cat, bismillah: ch !== 1 && ch !== 9, arabic: verses.map(v => v.arabic).join(' '),
    verses, explanationEnglish: m.n, explanationUrdu: m.nu,
    ...(m.notes ? { notesEnglish: m.notes.en, notesUrdu: m.notes.ur } : {}),
    references: SOURCE, verificationStatus: 'needs-review',
    verificationNote: 'Text imported programmatically; consonant skeleton cross-checked with Tanzil. Not yet compared with a printed Indo-Pak mushaf. Explanation is a brief original summary.',
  };
  (m.cat === 'four-quls' ? out['four-quls'] : out['short-surahs']).push(item);
}
const order = [109, 112, 113, 114];
out['four-quls'].sort((a, b) => order.indexOf(a.surahNumber) - order.indexOf(b.surahNumber));
const so = [1, 108, 103, 110, 111, 107, 106, 105, 97, 95, 104, 100, 99, 98, 96, 94, 93];
out['short-surahs'].sort((a, b) => so.indexOf(a.surahNumber) - so.indexOf(b.surahNumber));

const AYAT = ['2:201', '7:23', '2:255', '2:286', '14:40', '14:41', '3:8', '20:25', '20:26', '20:27', '20:28', '23:118', '21:87', '2:127', '17:24', '25:74', '20:114'];
const ayat = {};
const cache = {};
for (const key of AYAT) {
  const [c, n] = key.split(':').map(Number);
  cache[c] = cache[c] || await fetchVerses(c);
  ayat[key] = cache[c].find(x => x.number === n);
}
fs.writeFileSync('data/four-quls.json', JSON.stringify(out['four-quls'], null, 1));
fs.writeFileSync('data/short-surahs.json', JSON.stringify(out['short-surahs'], null, 1));
fs.writeFileSync('tools/quran-ayat.json', JSON.stringify(ayat, null, 1));
fs.writeFileSync('tools/skeleton-mismatches.txt', report.join('\n'));
console.log('mismatch entries:', report.length);

// Build-time script: writes data/namaz.json and data/duas.json.
// Quranic duas pull Arabic/translations/word-by-word from tools/quran-ayat.json
// (produced by build-quran.mjs). Hadith-based texts are hand-entered and flagged for review.
import fs from 'node:fs';
const AY = JSON.parse(fs.readFileSync('tools/quran-ayat.json', 'utf8'));

// "arabic|urdu|english ; arabic|urdu|english"
const W = s => s.split(';').map(x => x.trim()).filter(Boolean).map(x => { const [a, u, e] = x.split('|').map(t => t.trim()); return { arabic: a, urdu: u, english: e }; });
const P = (arabic, urdu, english, words, label) => ({ ...(label ? { label } : {}), arabic, urdu, english, words: W(words) });
const AYAH = (key, label) => { const v = AY[key]; return { label: label || key, arabic: v.arabic, urdu: v.urdu, english: v.english, words: v.words }; };
const R = (...t) => t.map(text => ({ text }));
const NR = 'needs-review';
const NOTE_HADITH = 'Arabic wording and Urdu/English translations entered by hand; hadith references given from memory — confirm the book and number (e.g. on sunnah.com) before marking verified.';
const QNOTE = 'Quranic text, Urdu (Jalandhari), English (Saheeh International) and word meanings imported from Quran.com; not yet compared with a printed Indo-Pak mushaf.';
const mk = o => ({ verificationStatus: NR, ...o, arabic: o.verses ? o.verses.map(v => v.arabic).join(' ') : undefined });

const TAKBEER_WORDS = 'اللّٰهُ|اللہ|Allah ; أَكْبَرُ|سب سے بڑا ہے|(is) the Greatest';
const TAKBEER = () => [P('اللّٰهُ أَكْبَرُ', 'اللہ سب سے بڑا ہے۔', 'Allah is the Greatest.', TAKBEER_WORDS)];

// ---------------------------------------------------------------- NAMAZ
const namaz = [];
const N = (step, o) => namaz.push(mk({ category: 'namaz', group: 'prayer', step, ...o }));

N(1, { id: 'namaz-takbeer-tahreema', title: 'Takbeer-e-Tahreema', titleUrdu: 'تکبیرِ تحریمہ', aliases: 'Allahu Akbar, opening takbeer, Takbir Tahrima, niyyat, start of namaz',
  ruling: 'Fard', rulingUrdu: 'فرض',
  posture: 'Standing (Qiyam). Men raise both hands to the ears, then fold them below the navel (right hand over left). Make the intention (niyyah) in the heart.',
  verses: TAKBEER(),
  explanationEnglish: 'Saying “Allahu Akbar” begins the prayer; from this point worldly speech and actions are forbidden.', explanationUrdu: 'اللہ اکبر کہنے سے نماز شروع ہوتی ہے؛ اس کے بعد دنیوی کلام اور کام حرام ہو جاتے ہیں۔',
  references: R('Abu Dawud 61; Jami at-Tirmidhi 3 — “its tahrim is the takbir”'), verificationNote: NOTE_HADITH });

N(2, { id: 'namaz-sana', title: 'Sana (Thana)', titleUrdu: 'ثنا', aliases: 'Subhanakallahumma, Subhanaka Allahumma, Thana, opening supplication',
  ruling: 'Sunnah', rulingUrdu: 'سنت',
  posture: 'Standing, hands folded. Read silently after the Takbeer-e-Tahreema.',
  verses: [P('سُبْحَانَكَ اللّٰهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَىٰ جَدُّكَ وَلَا إِلٰهَ غَيْرُكَ', 'اے اللہ! تو پاک ہے اور تیری تعریف کے ساتھ، تیرا نام بابرکت ہے، تیری شان بلند ہے، اور تیرے سوا کوئی معبود نہیں۔', 'Glory be to You, O Allah, and with Your praise; blessed is Your name, exalted is Your majesty, and there is no god other than You.',
    'سُبْحَانَكَ|تو پاک ہے|Glory be to You ; اللّٰهُمَّ|اے اللہ|O Allah ; وَبِحَمْدِكَ|اور تیری تعریف کے ساتھ|and with Your praise ; وَتَبَارَكَ|اور بابرکت ہے|and blessed is ; اسْمُكَ|تیرا نام|Your name ; وَتَعَالَىٰ|اور بلند ہے|and exalted is ; جَدُّكَ|تیری شان|Your majesty ; وَلَا إِلٰهَ|اور کوئی معبود نہیں|and there is no god ; غَيْرُكَ|تیرے سوا|other than You')],
  notesEnglish: 'Recited only in the first rak‘ah, silently. A Hanafi practice; other schools prefer other opening supplications.', notesUrdu: 'صرف پہلی رکعت میں آہستہ پڑھی جاتی ہے۔ یہ حنفی معمول ہے۔',
  references: R('Abu Dawud 775; Jami at-Tirmidhi 243 (Hanafi practice is also based on the report from ‘Umar, may Allah be pleased with him)'), verificationNote: NOTE_HADITH });

N(3, { id: 'namaz-tawwudh', title: 'Ta‘awwudh', titleUrdu: 'تعوذ', aliases: 'Audhu billahi minash shaytanir rajeem, Aoozu billah, seeking refuge',
  ruling: 'Sunnah', rulingUrdu: 'سنت', posture: 'Standing; silent, before reciting the Qur’an.',
  verses: [P('أَعُوذُ بِاللّٰهِ مِنَ الشَّيْطَانِ الرَّجِيمِ', 'میں اللہ کی پناہ مانگتا ہوں شیطان مردود سے۔', 'I seek refuge in Allah from the accursed Shaytan.',
    'أَعُوذُ|میں پناہ مانگتا ہوں|I seek refuge ; بِاللّٰهِ|اللہ کی|in Allah ; مِنَ الشَّيْطَانِ|شیطان سے|from the Shaytan ; الرَّجِيمِ|مردود|the accursed')],
  notesEnglish: 'Recited once, at the beginning of the first rak‘ah only.', notesUrdu: 'صرف پہلی رکعت کے شروع میں ایک بار پڑھا جاتا ہے۔',
  references: R('Qur’an 16:98'), verificationNote: NOTE_HADITH });

N(4, { id: 'namaz-tasmiyah', title: 'Tasmiyah (Bismillah)', titleUrdu: 'تسمیہ', aliases: 'Bismillahir Rahmanir Raheem, Bismillah',
  ruling: 'Sunnah', rulingUrdu: 'سنت', posture: 'Standing; silent, before Surah Al-Fatiha.',
  verses: [P('بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيمِ', 'اللہ کے نام سے جو نہایت مہربان، بہت رحم والا ہے۔', 'In the name of Allah, the Most Gracious, the Most Merciful.',
    'بِسْمِ|نام سے|In the name ; اللّٰهِ|اللہ کے|of Allah ; الرَّحْمٰنِ|نہایت مہربان|the Most Gracious ; الرَّحِيمِ|بہت رحم والا|the Most Merciful')],
  notesEnglish: 'In the Hanafi school it is recited silently, even in loud (jahri) prayers, at the start of the rak‘ah before Al-Fatiha. Scholars differ on repeating it before the additional Surah — ask your scholar.', notesUrdu: 'حنفی مسلک میں جہری نمازوں میں بھی تسمیہ آہستہ پڑھی جاتی ہے۔ سورت سے پہلے دوبارہ پڑھنے کے بارے میں علماء کا اختلاف ہے۔',
  references: R('Hanafi fiqh manuals (e.g. Radd al-Muhtar) — exact page references to be added'), verificationNote: NOTE_HADITH });

N(5, { id: 'namaz-fatiha', title: 'Surah Al-Fatiha', titleUrdu: 'سورۃ الفاتحہ', aliases: 'Alhamdu, Fatihah, Alhamdu lillahi rabbil alameen, Ameen',
  ruling: 'Wajib', rulingUrdu: 'واجب', surahRef: 'surah-fatiha',
  posture: 'Standing. Recited in the first two rak‘ahs of every Fard prayer and in every rak‘ah of Sunnah, Nafl and Witr. After it, say “Ameen” silently.',
  notesEnglish: 'In the 3rd and 4th rak‘ah of a Fard prayer only Al-Fatiha is recited (no additional Surah), and reciting it is preferred over silence or tasbih. The muqtadi (follower) does not recite behind the imam in Hanafi fiqh. “Ameen” is said silently.',
  notesUrdu: 'فرض کی تیسری اور چوتھی رکعت میں صرف سورۃ الفاتحہ پڑھی جاتی ہے، کوئی اور سورت نہیں۔ حنفی مسلک میں مقتدی امام کے پیچھے نہیں پڑھتا۔ آمین آہستہ کہی جاتی ہے۔',
  references: R('Qur’an 1:1-7 (see the full Surah page)'), verificationNote: 'Text, translations and word-by-word are shown from the canonical Surah entry.' });

N(6, { id: 'namaz-additional-surah', title: 'Additional Surah', titleUrdu: 'ملائی جانے والی سورت', aliases: 'zam surah, Surah milana, Qul huwallahu ahad, short surah in namaz',
  ruling: 'Wajib', rulingUrdu: 'واجب', surahRefs: ['surah-ikhlas', 'surah-kafirun', 'surah-kawthar', 'surah-asr', 'surah-nasr', 'surah-falaq', 'surah-nas', 'surah-quraysh', 'surah-fil', 'surah-maun'],
  posture: 'Standing, after Al-Fatiha.',
  explanationEnglish: 'Choose any Surah (or three short verses / one long verse). Common choices are linked below — each opens its complete page with translation.', explanationUrdu: 'فاتحہ کے بعد کوئی بھی سورت (یا تین چھوٹی آیات / ایک بڑی آیت) پڑھی جاتی ہے۔ عام طور پر پڑھی جانے والی سورتیں نیچے دی گئی ہیں۔',
  notesEnglish: 'Wajib in the first two rak‘ahs of a Fard prayer and in every rak‘ah of Sunnah, Nafl and Witr. Not recited in the 3rd/4th rak‘ah of a Fard prayer.', notesUrdu: 'فرض کی پہلی دو رکعتوں میں اور سنت، نفل اور وتر کی ہر رکعت میں واجب ہے۔ فرض کی تیسری/چوتھی رکعت میں نہیں پڑھی جاتی۔',
  references: R('Hanafi fiqh manuals — to be referenced'), verificationNote: 'Ruling summary needs checking against a Hanafi text.' });

N(7, { id: 'namaz-takbeer-ruku', title: 'Takbeer for Ruku', titleUrdu: 'رکوع کی تکبیر', aliases: 'Allahu Akbar going into ruku',
  ruling: 'Sunnah', rulingUrdu: 'سنت', posture: 'Say “Allahu Akbar” while bowing down into Ruku (hands are not raised again).',
  verses: TAKBEER(), references: R('Sahih al-Bukhari / Sahih Muslim (Kitab al-Adhan) — numbers to be added'), verificationNote: NOTE_HADITH });

N(8, { id: 'namaz-ruku', title: 'Ruku Tasbeeh', titleUrdu: 'رکوع کی تسبیح', aliases: 'Subhana Rabbiyal Azeem, Subhaana Rabbiyal Adheem, Ruku, Rukoo, Glory be to my Lord the Magnificent, bowing',
  ruling: 'Ruku is Fard; the tasbeeh is Sunnah', rulingUrdu: 'رکوع فرض ہے؛ تسبیح سنت ہے',
  posture: 'Bowing with back level, hands on knees. Recite three times (an odd number is preferred).',
  verses: [P('سُبْحَانَ رَبِّيَ الْعَظِيمِ', 'پاک ہے میرا رب جو بڑی عظمت والا ہے۔', 'Glory be to my Lord, the Magnificent.',
    'سُبْحَانَ|پاک ہے|Glory be ; رَبِّيَ|میرا رب|(to) my Lord ; الْعَظِيمِ|بڑی عظمت والا|the Magnificent')],
  references: R('Sahih Muslim 772 (Hudhayfah, may Allah be pleased with him); Abu Dawud 869, Jami at-Tirmidhi 261 (Ibn Mas‘ud) — verify'), verificationNote: NOTE_HADITH });

N(9, { id: 'namaz-tasmee', title: 'Qawmah: Sami‘Allahu liman hamidah', titleUrdu: 'قومہ: سمع اللہ لمن حمدہ', aliases: 'Sami Allahu liman hamidah, Samiallahu, tasmee, rising from ruku',
  ruling: 'Sunnah', rulingUrdu: 'سنت', posture: 'Rising from Ruku to stand straight (Qawmah). Hands hang at the sides.',
  verses: [P('سَمِعَ اللّٰهُ لِمَنْ حَمِدَهُ', 'اللہ نے اس کی سن لی جس نے اس کی تعریف کی۔', 'Allah has heard the one who praises Him.',
    'سَمِعَ|سن لی|has heard ; اللّٰهُ|اللہ نے|Allah ; لِمَنْ|اس کی|(the one) who ; حَمِدَهُ|جس نے اس کی تعریف کی|praised Him')],
  notesEnglish: 'Hanafi: the imam says only “Sami‘Allahu liman hamidah”; the muqtadi (follower) says only “Rabbana lakal hamd”; one praying alone says both.', notesUrdu: 'حنفی مسلک: امام صرف “سمع اللہ لمن حمدہ” کہتا ہے، مقتدی صرف “ربنا لک الحمد”، اور اکیلا نمازی دونوں کہتا ہے۔',
  references: R('Sahih al-Bukhari / Sahih Muslim (Kitab al-Adhan) — numbers to be added'), verificationNote: NOTE_HADITH });

N(10, { id: 'namaz-tahmeed', title: 'Rabbana Lakal Hamd', titleUrdu: 'ربنا لک الحمد', aliases: 'Rabbana lakal hamd, Rabbana wa lakal hamd, tahmeed, Allahumma Rabbana',
  ruling: 'Sunnah', rulingUrdu: 'سنت', posture: 'Standing straight after Ruku.',
  verses: [P('رَبَّنَا لَكَ الْحَمْدُ', 'اے ہمارے رب! تیرے ہی لیے تمام تعریف ہے۔', 'Our Lord, to You belongs all praise.', 'رَبَّنَا|اے ہمارے رب|Our Lord ; لَكَ|تیرے ہی لیے|to You ; الْحَمْدُ|تمام تعریف|(is) all praise', 'Common wording'),
    P('رَبَّنَا وَلَكَ الْحَمْدُ', 'اے ہمارے رب! اور تیرے ہی لیے تمام تعریف ہے۔', 'Our Lord, and to You belongs all praise.', 'رَبَّنَا|اے ہمارے رب|Our Lord ; وَلَكَ|اور تیرے ہی لیے|and to You ; الْحَمْدُ|تمام تعریف|(is) all praise', 'Variant with “wa”')],
  notesEnglish: 'Both wordings are acceptable. See the note under Qawmah for who says what.', notesUrdu: 'دونوں الفاظ درست ہیں۔ کون کیا کہے گا، اس کے لیے قومہ کا نوٹ دیکھیں۔',
  references: R('Sahih al-Bukhari / Sahih Muslim (Kitab al-Adhan) — numbers to be added'), verificationNote: NOTE_HADITH });

N(11, { id: 'namaz-takbeer-sajdah', title: 'Takbeer for Sajdah', titleUrdu: 'سجدہ کی تکبیر', aliases: 'Allahu Akbar going to sajda sujood',
  ruling: 'Sunnah', rulingUrdu: 'سنت', posture: 'Say “Allahu Akbar” while going down into Sajdah (knees, then hands, then nose and forehead).',
  verses: TAKBEER(), references: R('Sahih al-Bukhari / Sahih Muslim — numbers to be added'), verificationNote: NOTE_HADITH });

N(12, { id: 'namaz-sajdah-tasbeeh', title: 'Sajdah Tasbeeh', titleUrdu: 'سجدہ کی تسبیح', aliases: 'Subhana Rabbiyal A\'la, Subhaana Rabbiyal Ala, Sajda, Sujood, prostration, Glory be to my Lord the Most High',
  ruling: 'Sajdah is Fard (two per rak‘ah); the tasbeeh is Sunnah', rulingUrdu: 'سجدہ فرض ہے (ہر رکعت میں دو)؛ تسبیح سنت ہے',
  posture: 'Forehead, nose, both palms, both knees and toes touching the ground. Recite three times (odd number preferred).',
  verses: [P('سُبْحَانَ رَبِّيَ الْأَعْلَىٰ', 'پاک ہے میرا رب جو سب سے بلند ہے۔', 'Glory be to my Lord, the Most High.',
    'سُبْحَانَ|پاک ہے|Glory be ; رَبِّيَ|میرا رب|(to) my Lord ; الْأَعْلَىٰ|سب سے بلند|the Most High')],
  references: R('Sahih Muslim 772 (Hudhayfah); Abu Dawud 870, Jami at-Tirmidhi 262 (Ibn Mas‘ud) — verify'), verificationNote: NOTE_HADITH });

N(13, { id: 'namaz-jalsa', title: 'Jalsa (Sitting between the two Sajdahs)', titleUrdu: 'جلسہ (دو سجدوں کے درمیان بیٹھنا)', aliases: 'sitting between sajdas, jalsah, qa\'dah',
  ruling: 'Sitting calmly is Wajib (ta‘dil al-arkan)', rulingUrdu: 'اطمینان سے بیٹھنا واجب ہے',
  posture: 'Say “Allahu Akbar” while rising from the first Sajdah and sit upright on the left foot with the right foot upright; hands on thighs. Pause until settled, then say “Allahu Akbar” and go into the second Sajdah.',
  see: ['namaz-takbeer-sajdah'], references: R('Hanafi fiqh manuals — to be referenced'), verificationNote: 'Ruling and posture summary to be checked against a Hanafi text.' });

N(14, { id: 'namaz-jalsa-dua', title: 'Dua between the two Sajdahs', titleUrdu: 'دو سجدوں کے درمیان کی دعا', aliases: 'Rabbighfir li, Allahummaghfir li warhamni, jalsa dua',
  ruling: 'Not required in Hanafi Fard prayers; permitted/commonly read in Nafl', rulingUrdu: 'حنفی مسلک میں فرض میں لازم نہیں؛ نفل میں پڑھنا جائز ہے',
  posture: 'Sitting between the two Sajdahs.',
  verses: [P('رَبِّ اغْفِرْ لِي رَبِّ اغْفِرْ لِي', 'اے میرے رب! مجھے بخش دے، اے میرے رب! مجھے بخش دے۔', 'My Lord, forgive me; my Lord, forgive me.', 'رَبِّ|اے میرے رب|My Lord ; اغْفِرْ|بخش دے|forgive ; لِي|مجھے|me', 'Short wording'),
    P('اللّٰهُمَّ اغْفِرْ لِي وَارْحَمْنِي وَاهْدِنِي وَعَافِنِي وَارْزُقْنِي', 'اے اللہ! مجھے بخش دے، مجھ پر رحم فرما، مجھے ہدایت دے، مجھے عافیت دے اور مجھے رزق دے۔', 'O Allah, forgive me, have mercy on me, guide me, grant me well-being and provide for me.',
      'اللّٰهُمَّ|اے اللہ|O Allah ; اغْفِرْ لِي|مجھے بخش دے|forgive me ; وَارْحَمْنِي|اور مجھ پر رحم کر|and have mercy on me ; وَاهْدِنِي|اور مجھے ہدایت دے|and guide me ; وَعَافِنِي|اور مجھے عافیت دے|and grant me well-being ; وَارْزُقْنِي|اور مجھے رزق دے|and provide for me', 'Longer wording')],
  notesEnglish: 'Hanafi books generally describe only sitting calmly between the two Sajdahs in Fard prayers; these supplications are commonly read in Nafl prayers. This is a point where practice differs — confirm with your scholar.',
  notesUrdu: 'حنفی کتب میں فرض نمازوں میں عموماً صرف اطمینان سے بیٹھنے کا ذکر ہے؛ یہ دعائیں احادیث میں آئی ہیں اور نفل میں عموماً پڑھی جاتی ہیں۔ اس بارے میں اپنے عالم سے رجوع کریں۔',
  references: R('Abu Dawud 874 (Hudhayfah, short wording); Abu Dawud 850 / Ibn Majah 898 (Ibn ‘Abbas, longer wording) — verify numbers'), verificationNote: NOTE_HADITH + ' Hanafi ruling needs checking.' });

N(15, { id: 'namaz-second-sajdah', title: 'Second Sajdah', titleUrdu: 'دوسرا سجدہ', aliases: 'second prostration, rising for next rakat',
  posture: 'Say “Allahu Akbar”, go into the second Sajdah and recite the Sajdah tasbeeh again. Then rise (hands on knees) saying “Allahu Akbar” for the next rak‘ah, or sit for Tashahhud after the 2nd/last rak‘ah.',
  see: ['namaz-takbeer-sajdah', 'namaz-sajdah-tasbeeh'], references: R('—'), verificationNote: 'Instructional summary.' });

const TASH = P('التَّحِيَّاتُ لِلّٰهِ وَالصَّلَوَاتُ وَالطَّيِّبَاتُ، اَلسَّلَامُ عَلَيْكَ أَيُّهَا النَّبِيُّ وَرَحْمَةُ اللّٰهِ وَبَرَكَاتُهُ، اَلسَّلَامُ عَلَيْنَا وَعَلَىٰ عِبَادِ اللّٰهِ الصَّالِحِينَ، أَشْهَدُ أَنْ لَا إِلٰهَ إِلَّا اللّٰهُ وَأَشْهَدُ أَنَّ مُحَمَّدًا عَبْدُهُ وَرَسُولُهُ',
  'تمام قولی، بدنی اور مالی عبادتیں اللہ ہی کے لیے ہیں۔ اے نبی! آپ پر سلام ہو اور اللہ کی رحمت اور برکتیں۔ ہم پر اور اللہ کے نیک بندوں پر سلام ہو۔ میں گواہی دیتا ہوں کہ اللہ کے سوا کوئی معبود نہیں اور میں گواہی دیتا ہوں کہ محمد (ﷺ) اللہ کے بندے اور اس کے رسول ہیں۔',
  'All greetings, prayers and good words are for Allah. Peace be upon you, O Prophet, and the mercy of Allah and His blessings. Peace be upon us and upon the righteous servants of Allah. I bear witness that there is no god but Allah, and I bear witness that Muhammad is His servant and Messenger.',
  'التَّحِيَّاتُ|تمام قولی عبادتیں اور تعظیمیں|All greetings ; لِلّٰهِ|اللہ کے لیے|are for Allah ; وَالصَّلَوَاتُ|اور تمام بدنی عبادتیں|and the prayers ; وَالطَّيِّبَاتُ|اور تمام مالی عبادتیں / پاکیزہ باتیں|and the good words ; اَلسَّلَامُ|سلام|Peace ; عَلَيْكَ|آپ پر|be upon you ; أَيُّهَا النَّبِيُّ|اے نبی|O Prophet ; وَرَحْمَةُ اللّٰهِ|اور اللہ کی رحمت|and the mercy of Allah ; وَبَرَكَاتُهُ|اور اس کی برکتیں|and His blessings ; اَلسَّلَامُ|سلام|Peace ; عَلَيْنَا|ہم پر|be upon us ; وَعَلَىٰ عِبَادِ اللّٰهِ|اور اللہ کے بندوں پر|and upon the servants of Allah ; الصَّالِحِينَ|نیک|the righteous ; أَشْهَدُ|میں گواہی دیتا ہوں|I bear witness ; أَنْ لَا إِلٰهَ|کہ کوئی معبود نہیں|that there is no god ; إِلَّا اللّٰهُ|سوائے اللہ کے|except Allah ; وَأَشْهَدُ|اور میں گواہی دیتا ہوں|and I bear witness ; أَنَّ مُحَمَّدًا|کہ محمد|that Muhammad ; عَبْدُهُ|اس کے بندے|(is) His servant ; وَرَسُولُهُ|اور اس کے رسول ہیں|and His Messenger');
N(16, { id: 'namaz-tashahhud', title: 'Tashahhud (At-Tahiyyat)', titleUrdu: 'تشہد (التحیات)', aliases: 'Attahiyyat, Attahiyyatu, At-Tahiyyat, Attahiyat, Tahiyat, Tashahud, Tashahhud, sitting in namaz, qa\'da',
  ruling: 'Wajib (in the 2nd-rak‘ah sitting and in the final sitting)', rulingUrdu: 'واجب (دوسری رکعت کے قعدہ اور قعدۂ اخیرہ میں)',
  posture: 'Sit on the left foot with the right foot upright (men). At “Ash-hadu an lā ilāha” raise the index finger, and lower it at “illallāh” (Hanafi practice). In a 3- or 4-rak‘ah prayer recite Tashahhud only in the first sitting, then stand up for the next rak‘ah.',
  verses: [TASH],
  references: R('Sahih al-Bukhari 831; Sahih Muslim 402 (Ibn Mas‘ud, may Allah be pleased with him) — wording as adopted by the Hanafi school'), verificationNote: NOTE_HADITH });

N(17, { id: 'namaz-durood', title: 'Durood Ibrahim', titleUrdu: 'درودِ ابراہیمی', aliases: 'Durood Ibrahimi, Durood Sharif, Salawat, Allahumma salli ala Muhammad, Salli ala',
  ruling: 'Sunnah (in the final sitting)', rulingUrdu: 'سنت (قعدۂ اخیرہ میں)',
  posture: 'Final sitting only, after the Tashahhud.',
  verses: [P('اللّٰهُمَّ صَلِّ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ', 'اے اللہ! محمد (ﷺ) پر اور آلِ محمد پر رحمت نازل فرما، جیسا کہ تو نے ابراہیم (علیہ السلام) پر اور آلِ ابراہیم پر رحمت نازل فرمائی؛ بے شک تو تعریف کے لائق، بڑی شان والا ہے۔', 'O Allah, send blessings upon Muhammad and the family of Muhammad, as You sent blessings upon Ibrahim and the family of Ibrahim; indeed You are Praiseworthy and Glorious.',
    'اللّٰهُمَّ|اے اللہ|O Allah ; صَلِّ|رحمت نازل فرما|send blessings ; عَلَىٰ مُحَمَّدٍ|محمد ﷺ پر|upon Muhammad ; وَعَلَىٰ آلِ مُحَمَّدٍ|اور آلِ محمد پر|and upon the family of Muhammad ; كَمَا صَلَّيْتَ|جیسا کہ تو نے رحمت نازل فرمائی|as You sent blessings ; عَلَىٰ إِبْرَاهِيمَ|ابراہیم پر|upon Ibrahim ; وَعَلَىٰ آلِ إِبْرَاهِيمَ|اور آلِ ابراہیم پر|and upon the family of Ibrahim ; إِنَّكَ|بے شک تو|indeed You ; حَمِيدٌ|تعریف کے لائق|(are) Praiseworthy ; مَجِيدٌ|بڑی شان والا|Glorious'),
    P('اللّٰهُمَّ بَارِكْ عَلَىٰ مُحَمَّدٍ وَعَلَىٰ آلِ مُحَمَّدٍ كَمَا بَارَكْتَ عَلَىٰ إِبْرَاهِيمَ وَعَلَىٰ آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ', 'اے اللہ! محمد (ﷺ) پر اور آلِ محمد پر برکت نازل فرما، جیسا کہ تو نے ابراہیم (علیہ السلام) پر اور آلِ ابراہیم پر برکت نازل فرمائی؛ بے شک تو تعریف کے لائق، بڑی شان والا ہے۔', 'O Allah, bless Muhammad and the family of Muhammad, as You blessed Ibrahim and the family of Ibrahim; indeed You are Praiseworthy and Glorious.',
      'اللّٰهُمَّ|اے اللہ|O Allah ; بَارِكْ|برکت نازل فرما|bless ; عَلَىٰ مُحَمَّدٍ|محمد ﷺ پر|upon Muhammad ; وَعَلَىٰ آلِ مُحَمَّدٍ|اور آلِ محمد پر|and upon the family of Muhammad ; كَمَا بَارَكْتَ|جیسا کہ تو نے برکت نازل فرمائی|as You blessed ; عَلَىٰ إِبْرَاهِيمَ|ابراہیم پر|upon Ibrahim ; وَعَلَىٰ آلِ إِبْرَاهِيمَ|اور آلِ ابراہیم پر|and upon the family of Ibrahim ; إِنَّكَ|بے شک تو|indeed You ; حَمِيدٌ|تعریف کے لائق|(are) Praiseworthy ; مَجِيدٌ|بڑی شان والا|Glorious')],
  references: R('Sahih al-Bukhari 3370 and Sahih Muslim 406 (Ka‘b ibn ‘Ujrah, may Allah be pleased with him) — verify'), verificationNote: NOTE_HADITH });

N(18, { id: 'namaz-dua-after-durood', title: 'Dua after Durood', titleUrdu: 'درود کے بعد کی دعا', aliases: 'Dua e Masura, Dua-e-Masura, Allahumma inni zalamtu nafsi, Rabbana atina, Rabbij alni muqeemas salah',
  ruling: 'Sunnah / recommended (final sitting)', rulingUrdu: 'سنت / مستحب (قعدۂ اخیرہ میں)',
  posture: 'Final sitting, after Durood and before Salam. Any one of the following may be read.',
  verses: [P('اللّٰهُمَّ إِنِّي ظَلَمْتُ نَفْسِي ظُلْمًا كَثِيرًا وَلَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ فَاغْفِرْ لِي مَغْفِرَةً مِنْ عِنْدِكَ وَارْحَمْنِي إِنَّكَ أَنْتَ الْغَفُورُ الرَّحِيمُ', 'اے اللہ! میں نے اپنی جان پر بہت ظلم کیا اور تیرے سوا کوئی گناہوں کو نہیں بخش سکتا؛ پس تو اپنی طرف سے مجھے بخش دے اور مجھ پر رحم فرما، بے شک تو ہی بخشنے والا، مہربان ہے۔', 'O Allah, I have greatly wronged myself, and none forgives sins except You. So grant me forgiveness from Yourself and have mercy on me; indeed You are the Forgiving, the Merciful.',
      'اللّٰهُمَّ|اے اللہ|O Allah ; إِنِّي ظَلَمْتُ|بے شک میں نے ظلم کیا|indeed I have wronged ; نَفْسِي|اپنی جان پر|myself ; ظُلْمًا كَثِيرًا|بہت زیادہ ظلم|a great wrong ; وَلَا يَغْفِرُ الذُّنُوبَ|اور گناہ کوئی نہیں بخشتا|and none forgives sins ; إِلَّا أَنْتَ|سوائے تیرے|except You ; فَاغْفِرْ لِي|پس مجھے بخش دے|so forgive me ; مَغْفِرَةً|بخشش|a forgiveness ; مِنْ عِنْدِكَ|اپنی طرف سے|from Yourself ; وَارْحَمْنِي|اور مجھ پر رحم کر|and have mercy on me ; إِنَّكَ أَنْتَ|بے شک تو ہی|indeed You are ; الْغَفُورُ|بخشنے والا|the Forgiving ; الرَّحِيمُ|مہربان|the Merciful', 'Dua'),
    AYAH('2:201', 'Qur’an 2:201'), AYAH('14:40', 'Qur’an 14:40'), AYAH('14:41', 'Qur’an 14:41')],
  notesEnglish: 'Hanafi fiqh requires the dua in prayer to resemble the words of the Qur’an and Sunnah (not ordinary requests in one’s own words). Any one of the supplications above may be recited.', notesUrdu: 'حنفی فقہ کے مطابق نماز میں وہی دعا پڑھی جائے جو قرآن و سنت کے الفاظ سے ملتی ہو؛ اوپر دی گئی دعاؤں میں سے کوئی ایک پڑھی جا سکتی ہے۔',
  references: R('Sahih al-Bukhari 834 and Sahih Muslim 2705 (Abu Bakr as-Siddiq, may Allah be pleased with him)', 'Qur’an 2:201; Qur’an 14:40-41'), verificationNote: NOTE_HADITH + ' ' + QNOTE });

N(19, { id: 'namaz-salam', title: 'Salam', titleUrdu: 'سلام', aliases: 'Assalamu Alaikum wa Rahmatullah, Assalamualaikum, ending namaz, tasleem',
  ruling: 'Wajib', rulingUrdu: 'واجب',
  posture: 'Say first to the right, then to the left, turning the face so the cheek is visible; intend greeting the angels and the worshippers. The prayer ends here.',
  verses: [P('اَلسَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللّٰهِ', 'تم پر سلامتی ہو اور اللہ کی رحمت۔', 'Peace be upon you and the mercy of Allah.', 'اَلسَّلَامُ|سلامتی|Peace ; عَلَيْكُمْ|تم پر|be upon you ; وَرَحْمَةُ اللّٰهِ|اور اللہ کی رحمت|and the mercy of Allah')],
  references: R('Abu Dawud 996; Jami at-Tirmidhi 295 (Ibn Mas‘ud); Sahih Muslim 582 (Sa‘d) — verify'), verificationNote: NOTE_HADITH });

// ---- Witr group
const WITR = (step, o) => namaz.push(mk({ category: 'namaz', group: 'witr', step, ...o }));
WITR(1, { id: 'namaz-witr-overview', title: 'Witr Prayer — Overview', titleUrdu: 'نمازِ وتر — مختصر طریقہ', aliases: 'Witr, Vitr, Isha witr, three rakat',
  ruling: 'Wajib (Hanafi)', rulingUrdu: 'واجب (حنفی)',
  posture: 'Three rak‘ahs with one Salam. Sit after the 2nd rak‘ah and recite Tashahhud only, then stand. In the 3rd rak‘ah recite Al-Fatiha and a Surah, then say “Allahu Akbar” raising the hands to the ears, fold the hands and recite Dua-e-Qunoot, then go into Ruku. Finish the 3rd rak‘ah with Tashahhud, Durood, dua and Salam as usual.',
  see: ['namaz-qunoot'], references: R('Hanafi fiqh manuals — to be referenced'), verificationNote: 'Method summary needs checking against a Hanafi text.' });
WITR(2, { id: 'namaz-qunoot', title: 'Dua-e-Qunoot', titleUrdu: 'دعائے قنوت', aliases: 'Dua Qunoot, Qunut, Allahumma inna nasta inuka, Allahumma inna nastaeenuka, witr dua',
  ruling: 'Wajib (in the 3rd rak‘ah of Witr)', rulingUrdu: 'واجب (وتر کی تیسری رکعت میں)',
  posture: 'Standing in the 3rd rak‘ah of Witr, after the Surah and before Ruku.',
  verses: [P('اللّٰهُمَّ إِنَّا نَسْتَعِينُكَ وَنَسْتَغْفِرُكَ وَنُؤْمِنُ بِكَ وَنَتَوَكَّلُ عَلَيْكَ وَنُثْنِي عَلَيْكَ الْخَيْرَ وَنَشْكُرُكَ وَلَا نَكْفُرُكَ وَنَخْلَعُ وَنَتْرُكُ مَنْ يَفْجُرُكَ', 'اے اللہ! ہم تجھ سے مدد مانگتے ہیں اور تجھ سے بخشش طلب کرتے ہیں، تجھ پر ایمان رکھتے ہیں اور تجھ پر بھروسا کرتے ہیں، اور بہترین انداز میں تیری تعریف کرتے ہیں، تیرا شکر ادا کرتے ہیں اور تیری ناشکری نہیں کرتے، اور ہم اس شخص سے الگ ہوتے اور اسے چھوڑتے ہیں جو تیری نافرمانی کرے۔', 'O Allah, we seek Your help and Your forgiveness; we believe in You and rely on You; we praise You with the best of praise, we thank You and are not ungrateful to You; and we cast off and forsake whoever disobeys You.',
      'اللّٰهُمَّ|اے اللہ|O Allah ; إِنَّا نَسْتَعِينُكَ|ہم تجھ سے مدد مانگتے ہیں|we seek Your help ; وَنَسْتَغْفِرُكَ|اور تجھ سے بخشش مانگتے ہیں|and Your forgiveness ; وَنُؤْمِنُ بِكَ|اور تجھ پر ایمان لاتے ہیں|and we believe in You ; وَنَتَوَكَّلُ عَلَيْكَ|اور تجھ پر بھروسا کرتے ہیں|and we rely on You ; وَنُثْنِي عَلَيْكَ|اور تیری تعریف کرتے ہیں|and we praise You ; الْخَيْرَ|بہترین طریقے سے|with the best (praise) ; وَنَشْكُرُكَ|اور تیرا شکر کرتے ہیں|and we thank You ; وَلَا نَكْفُرُكَ|اور تیری ناشکری نہیں کرتے|and we are not ungrateful to You ; وَنَخْلَعُ|اور ہم الگ ہوتے ہیں|and we cast off ; وَنَتْرُكُ|اور چھوڑتے ہیں|and forsake ; مَنْ يَفْجُرُكَ|جو تیری نافرمانی کرے|whoever disobeys You'),
    P('اللّٰهُمَّ إِيَّاكَ نَعْبُدُ وَلَكَ نُصَلِّي وَنَسْجُدُ وَإِلَيْكَ نَسْعَىٰ وَنَحْفِدُ وَنَرْجُو رَحْمَتَكَ وَنَخْشَىٰ عَذَابَكَ إِنَّ عَذَابَكَ بِالْكُفَّارِ مُلْحِقٌ', 'اے اللہ! ہم تیری ہی عبادت کرتے ہیں، اور تیرے ہی لیے نماز پڑھتے اور سجدہ کرتے ہیں، اور تیری ہی طرف دوڑتے اور حاضر ہوتے ہیں، تیری رحمت کی امید رکھتے ہیں اور تیرے عذاب سے ڈرتے ہیں؛ بے شک تیرا عذاب کافروں کو پہنچنے والا ہے۔', 'O Allah, You alone we worship; to You we pray and prostrate; to You we hasten and are ready to serve; we hope for Your mercy and fear Your punishment. Indeed Your punishment will overtake the disbelievers.',
      'اللّٰهُمَّ|اے اللہ|O Allah ; إِيَّاكَ نَعْبُدُ|ہم تیری ہی عبادت کرتے ہیں|You alone we worship ; وَلَكَ نُصَلِّي|اور تیرے ہی لیے نماز پڑھتے ہیں|and to You we pray ; وَنَسْجُدُ|اور سجدہ کرتے ہیں|and prostrate ; وَإِلَيْكَ نَسْعَىٰ|اور تیری ہی طرف دوڑتے ہیں|and to You we hasten ; وَنَحْفِدُ|اور خدمت میں حاضر ہوتے ہیں|and are ready to serve ; وَنَرْجُو رَحْمَتَكَ|اور تیری رحمت کی امید رکھتے ہیں|and we hope for Your mercy ; وَنَخْشَىٰ عَذَابَكَ|اور تیرے عذاب سے ڈرتے ہیں|and fear Your punishment ; إِنَّ عَذَابَكَ|بے شک تیرا عذاب|indeed Your punishment ; بِالْكُفَّارِ|کافروں کو|(will) the disbelievers ; مُلْحِقٌ|پہنچنے والا ہے|overtake')],
  notesEnglish: 'If you do not yet know Dua-e-Qunoot, Hanafi scholars say to recite “Rabbana atina fid-dunya hasanatan wa fil-akhirati hasanatan wa qina ‘adhaban-nar” (2:201), or “Allahummaghfir li” three times, until it is memorised — confirm with your scholar.',
  notesUrdu: 'اگر دعائے قنوت یاد نہ ہو تو یاد ہونے تک علماء “ربنا آتنا فی الدنیا حسنۃ…” (2:201) یا تین بار “اللہم اغفر لی” پڑھنے کی گنجائش بتاتے ہیں — اپنے عالم سے تصدیق کریں۔',
  references: R('Reported from ‘Umar, may Allah be pleased with him (Musannaf Ibn Abi Shaybah; Sunan al-Bayhaqi) and adopted in Hanafi books — exact numbers to be added'), verificationNote: 'Wording is the standard Hanafi text; check against a printed Hanafi manual and add precise references.' });

// ---------------------------------------------------------------- DUAS
const duas = [];
const D = o => duas.push(mk({ category: 'dua', ...o }));
const Q = (id, key, title, titleUrdu, aliases, expl, explUr, refs, extra = {}) => D({ id, title, titleUrdu, aliases, verses: [AYAH(key, 'Qur’an ' + key)], explanationEnglish: expl, explanationUrdu: explUr, references: R(...refs), verificationNote: QNOTE, ...extra });

Q('dua-rabbana-hasanah', '2:201', 'Rabbana Atina Fid-Dunya Hasanah', 'ربنا آتنا فی الدنیا حسنۃ', 'Rabbana atina fid dunya hasanatan, Rabbana aatina, comprehensive dua, Rabbana atina',
  'A comprehensive supplication for good in this world and the Hereafter.', 'دنیا اور آخرت کی بھلائی کی جامع دعا۔',
  ['Qur’an 2:201', 'Sahih al-Bukhari 4522; Sahih Muslim 2690 (Anas) — verify numbers']);
Q('dua-rabbana-zalamna', '7:23', 'Rabbana Zalamna Anfusana', 'ربنا ظلمنا انفسنا', 'Rabbana zalamna anfusana wa in lam taghfir lana, Adam alayhis salam dua, repentance dua',
  'The supplication of Adam and Hawwa (peace be upon them) when they asked forgiveness.', 'حضرت آدم اور حضرت حوا علیہما السلام کی دعا جب انہوں نے مغفرت طلب کی۔', ['Qur’an 7:23']);
Q('dua-rabbana-la-tuakhidhna', '2:286', 'Rabbana La Tu’akhidhna (end of Al-Baqarah)', 'ربنا لا تؤاخذنا', 'Rabbana la tuakhidhna in nasina, Amanar Rasul, last verse of baqarah, la yukallifullahu nafsan',
  'The final verse of Surah Al-Baqarah: a plea for ease, pardon and mercy.', 'سورۃ البقرہ کی آخری آیت: آسانی، معافی اور رحمت کی دعا۔', ['Qur’an 2:286', 'The last two verses of Al-Baqarah: Sahih al-Bukhari 5008 (verify)']);
Q('dua-rabbana-la-tuzigh', '3:8', 'Rabbana La Tuzigh Qulubana', 'ربنا لا تزغ قلوبنا', 'Rabbana la tuzigh qulubana, steadfast heart, guidance dua',
  'A supplication for steadfastness of the heart after guidance.', 'ہدایت کے بعد دل کے ثابت قدم رہنے کی دعا۔', ['Qur’an 3:8']);
D({ id: 'dua-rabbij-alni', title: 'Rabbij‘alni Muqimas-Salati', titleUrdu: 'رب اجعلنی مقیم الصلوٰۃ', aliases: 'Rabbij alni muqeemas salah, Ibrahim alayhis salam dua, Rabbana taqabbal dua, forgive me my parents',
  verses: [AYAH('14:40', 'Qur’an 14:40'), AYAH('14:41', 'Qur’an 14:41')],
  explanationEnglish: 'The supplication of Ibrahim (peace be upon him) for steadfastness in prayer and forgiveness; commonly recited after Durood in the final sitting.', explanationUrdu: 'حضرت ابراہیم علیہ السلام کی دعا: نماز قائم رکھنے اور مغفرت کے لیے۔ قعدۂ اخیرہ میں درود کے بعد بھی پڑھی جاتی ہے۔',
  references: R('Qur’an 14:40-41'), verificationNote: QNOTE });
Q('dua-rabbana-taqabbal', '2:127', 'Rabbana Taqabbal Minna', 'ربنا تقبل منا', 'Rabbana taqabbal minna innaka antas samiul alim, acceptance dua',
  'The supplication of Ibrahim and Isma‘il (peace be upon them) while raising the foundations of the Ka‘bah, asking that the deed be accepted.', 'حضرت ابراہیم و اسماعیل علیہما السلام کی دعا جو انہوں نے کعبہ کی بنیادیں اٹھاتے وقت کی: ہمارا عمل قبول فرما۔', ['Qur’an 2:127']);
D({ id: 'dua-rabbish-rahli', title: 'Rabbish-rah li Sadri', titleUrdu: 'رب اشرح لی صدری', aliases: 'Rabbish rah li sadri, Musa alayhis salam dua, ease my affair, fluency, exam dua',
  verses: [AYAH('20:25', 'Qur’an 20:25'), AYAH('20:26', 'Qur’an 20:26'), AYAH('20:27', 'Qur’an 20:27'), AYAH('20:28', 'Qur’an 20:28')],
  explanationEnglish: 'The supplication of Musa (peace be upon him) asking for an open heart, ease in his task and clarity of speech.', explanationUrdu: 'حضرت موسیٰ علیہ السلام کی دعا: سینہ کھول دینے، کام آسان کرنے اور زبان کی گرہ کھولنے کے لیے۔',
  references: R('Qur’an 20:25-28'), verificationNote: QNOTE });
Q('dua-rabbi-zidni-ilma', '20:114', 'Rabbi Zidni Ilma', 'رب زدنی علما', 'Rabbi zidni ilma, increase knowledge, study dua',
  'A short Quranic supplication to increase in knowledge.', 'علم میں اضافے کی مختصر قرآنی دعا۔', ['Qur’an 20:114']);
Q('dua-rabbighfir-warham', '23:118', 'Rabbighfir Warham', 'رب اغفر وارحم', 'Rabbighfir warham wa anta khayrur rahimin, forgiveness and mercy',
  'A brief, complete supplication for forgiveness and mercy.', 'مغفرت اور رحمت کی مختصر جامع دعا۔', ['Qur’an 23:118']);
Q('dua-yunus', '21:87', 'Dua of Yunus (La ilaha illa anta subhanaka)', 'دعائے یونس', 'La ilaha illa anta subhanaka inni kuntu minaz zalimin, Dhun Nun, Yunus alayhis salam, Ayat Karima',
  'The supplication of Yunus (peace be upon him) from the belly of the fish — also called Ayat-e-Karimah.', 'حضرت یونس علیہ السلام کی دعا جو انہوں نے مچھلی کے پیٹ میں کی؛ اسے آیتِ کریمہ بھی کہتے ہیں۔', ['Qur’an 21:87']);
Q('dua-rabbir-hamhuma', '17:24', 'Rabbir-hamhuma (Dua for Parents)', 'ربّ ارحمہما', 'Rabbir hamhuma kama rabbayani saghira, dua for parents, walidain',
  'A supplication for one’s parents.', 'والدین کے لیے دعا۔', ['Qur’an 17:24']);
Q('dua-rabbana-hab-lana', '25:74', 'Rabbana Hab Lana Min Azwajina', 'ربنا ھب لنا من ازواجنا', 'Rabbana hab lana min azwajina wa dhurriyyatina qurrata ayun, family dua, spouse and children',
  'A supplication for a righteous spouse and children.', 'نیک شریکِ حیات اور اولاد کے لیے دعا۔', ['Qur’an 25:74']);

D({ id: 'dua-sayyidul-istighfar', title: 'Sayyidul Istighfar', titleUrdu: 'سید الاستغفار', aliases: 'Sayyid al-Istighfar, master of istighfar, Allahumma anta rabbi la ilaha illa anta khalaqtani, forgiveness dua morning evening',
  verses: [P('اللّٰهُمَّ أَنْتَ رَبِّي لَا إِلٰهَ إِلَّا أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ، وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي، فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ إِلَّا أَنْتَ', 'اے اللہ! تو میرا رب ہے، تیرے سوا کوئی معبود نہیں، تو نے مجھے پیدا کیا اور میں تیرا بندہ ہوں، اور میں اپنی استطاعت کے مطابق تیرے عہد اور وعدے پر قائم ہوں۔ میں اپنے کیے کے شر سے تیری پناہ مانگتا ہوں۔ میں مجھ پر تیری نعمت کا اقرار کرتا ہوں اور اپنے گناہ کا اعتراف کرتا ہوں، پس مجھے بخش دے، کیونکہ تیرے سوا کوئی گناہوں کو نہیں بخش سکتا۔', 'O Allah, You are my Lord; there is no god but You. You created me and I am Your servant, and I keep Your covenant and promise as best I can. I seek refuge in You from the evil of what I have done. I acknowledge Your favour upon me and I acknowledge my sin, so forgive me, for none forgives sins except You.',
    'اللّٰهُمَّ|اے اللہ|O Allah ; أَنْتَ رَبِّي|تو میرا رب ہے|You are my Lord ; لَا إِلٰهَ إِلَّا أَنْتَ|تیرے سوا کوئی معبود نہیں|there is no god but You ; خَلَقْتَنِي|تو نے مجھے پیدا کیا|You created me ; وَأَنَا عَبْدُكَ|اور میں تیرا بندہ ہوں|and I am Your servant ; وَأَنَا عَلَىٰ عَهْدِكَ وَوَعْدِكَ|اور میں تیرے عہد اور وعدے پر ہوں|and I am upon Your covenant and promise ; مَا اسْتَطَعْتُ|جتنی مجھ سے ہو سکے|as much as I can ; أَعُوذُ بِكَ|میں تیری پناہ مانگتا ہوں|I seek refuge in You ; مِنْ شَرِّ مَا صَنَعْتُ|اس کے شر سے جو میں نے کیا|from the evil of what I have done ; أَبُوءُ لَكَ|میں اقرار کرتا ہوں|I acknowledge ; بِنِعْمَتِكَ عَلَيَّ|تیری نعمت کا جو مجھ پر ہے|Your favour upon me ; وَأَبُوءُ بِذَنْبِي|اور میں اپنے گناہ کا اعتراف کرتا ہوں|and I admit my sin ; فَاغْفِرْ لِي|پس مجھے بخش دے|so forgive me ; فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ|کیونکہ گناہوں کو کوئی نہیں بخشتا|for none forgives sins ; إِلَّا أَنْتَ|سوائے تیرے|except You')],
  explanationEnglish: 'Called the “master of seeking forgiveness”. Recited in the morning and evening with conviction.', explanationUrdu: 'اسے استغفار کا سردار کہا جاتا ہے؛ صبح و شام یقین کے ساتھ پڑھی جاتی ہے۔',
  references: R('Sahih al-Bukhari 6306 (Shaddad ibn Aws, may Allah be pleased with him) — verify'), verificationNote: NOTE_HADITH });

D({ id: 'dua-astaghfirullah', title: 'Astaghfirullah', titleUrdu: 'استغفار', aliases: 'Astaghfirullah, Astaghfirullaha, istighfar, seeking forgiveness, Astaghfirullah hal azeem',
  verses: [P('أَسْتَغْفِرُ اللّٰهَ', 'میں اللہ سے بخشش مانگتا ہوں۔', 'I seek forgiveness from Allah.', 'أَسْتَغْفِرُ|میں بخشش مانگتا ہوں|I seek forgiveness ; اللّٰهَ|اللہ سے|(from) Allah', 'Short form'),
    P('أَسْتَغْفِرُ اللّٰهَ الْعَظِيمَ الَّذِي لَا إِلٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ', 'میں اللہ عظیم سے بخشش مانگتا ہوں جس کے سوا کوئی معبود نہیں، وہ زندہ اور قائم رکھنے والا ہے، اور میں اس کی طرف توبہ کرتا ہوں۔', 'I seek forgiveness from Allah, the Magnificent, there is no god but Him, the Ever-Living, the Self-Sustaining, and I turn to Him in repentance.',
      'أَسْتَغْفِرُ|میں بخشش مانگتا ہوں|I seek forgiveness ; اللّٰهَ الْعَظِيمَ|اللہ عظیم سے|(from) Allah the Magnificent ; الَّذِي|وہ جو|the One who ; لَا إِلٰهَ إِلَّا هُوَ|اس کے سوا کوئی معبود نہیں|there is no god but Him ; الْحَيُّ|زندہ|the Ever-Living ; الْقَيُّومُ|قائم رکھنے والا|the Self-Sustaining ; وَأَتُوبُ إِلَيْهِ|اور میں اس کی طرف توبہ کرتا ہوں|and I repent to Him', 'Fuller form')],
  notesEnglish: 'The short form is said three times after the Fard prayer; the fuller form may be recited at any time.', notesUrdu: 'مختصر صورت فرض نماز کے بعد تین بار پڑھی جاتی ہے؛ تفصیلی صورت کسی بھی وقت پڑھی جا سکتی ہے۔',
  references: R('Short form: Sahih Muslim 591 (Thawban); fuller form: Abu Dawud 1517, Jami at-Tirmidhi 3577 — verify numbers and grading'), verificationNote: NOTE_HADITH });

D({ id: 'dhikr-subhanallah', title: 'SubhanAllah', titleUrdu: 'سبحان اللہ', aliases: 'Subhanallah, SubhanAllahi wa bihamdihi, SubhanAllahil Azeem, glory be to Allah, tasbeeh',
  verses: [P('سُبْحَانَ اللّٰهِ', 'اللہ پاک ہے۔', 'Glory be to Allah.', 'سُبْحَانَ|پاک ہے|Glory be ; اللّٰهِ|اللہ|(to) Allah', 'Short form'),
    P('سُبْحَانَ اللّٰهِ وَبِحَمْدِهِ سُبْحَانَ اللّٰهِ الْعَظِيمِ', 'اللہ پاک ہے اور اپنی تعریف کے ساتھ؛ عظمت والا اللہ پاک ہے۔', 'Glory be to Allah and with His praise; glory be to Allah, the Magnificent.', 'سُبْحَانَ اللّٰهِ|اللہ پاک ہے|Glory be to Allah ; وَبِحَمْدِهِ|اور اس کی تعریف کے ساتھ|and with His praise ; سُبْحَانَ اللّٰهِ|اللہ پاک ہے|Glory be to Allah ; الْعَظِيمِ|عظمت والا|the Magnificent', 'Fuller form')],
  explanationEnglish: 'Declares Allah free of all imperfection. The fuller form is light on the tongue and heavy on the scale.', explanationUrdu: 'اللہ تعالیٰ کو ہر عیب سے پاک قرار دینا۔ تفصیلی صورت زبان پر ہلکی اور میزان میں بھاری ہے۔',
  references: R('Sahih al-Bukhari 6406; Sahih Muslim 2694 (Abu Hurairah) — verify'), verificationNote: NOTE_HADITH });
D({ id: 'dhikr-alhamdulillah', title: 'Alhamdulillah', titleUrdu: 'الحمد للہ', aliases: 'Alhamdulillah, Alhamdu lillah, praise be to Allah, hamd',
  verses: [P('اَلْحَمْدُ لِلّٰهِ', 'تمام تعریف اللہ کے لیے ہے۔', 'All praise is for Allah.', 'اَلْحَمْدُ|تمام تعریف|All praise ; لِلّٰهِ|اللہ کے لیے|(is) for Allah')],
  explanationEnglish: 'Praise and gratitude to Allah.', explanationUrdu: 'اللہ کی حمد و شکر۔',
  references: R('Jami at-Tirmidhi 3383; Sunan Ibn Majah 3800 — verify numbers and grading'), verificationNote: NOTE_HADITH });
D({ id: 'dhikr-allahu-akbar', title: 'Allahu Akbar', titleUrdu: 'اللہ اکبر', aliases: 'Allahu Akbar, takbeer, Allah is the greatest',
  verses: TAKBEER(), explanationEnglish: 'Proclaims that Allah is greater than everything; also part of the tasbeeh recited after Salah.', explanationUrdu: 'اللہ ہر چیز سے بڑا ہے؛ نماز کے بعد کی تسبیح کا بھی حصہ ہے۔',
  references: R('Sahih Muslim 597 (as part of the tasbeeh after Salah)'), verificationNote: NOTE_HADITH });
D({ id: 'dhikr-la-ilaha-illallah', title: 'La ilaha illallah', titleUrdu: 'لا الٰہ الا اللہ', aliases: 'La ilaha illallah, La ilaha illAllah, tahleel, Kalimah, there is no god but Allah',
  verses: [P('لَا إِلٰهَ إِلَّا اللّٰهُ', 'اللہ کے سوا کوئی معبود نہیں۔', 'There is no god but Allah.', 'لَا إِلٰهَ|کوئی معبود نہیں|there is no god ; إِلَّا اللّٰهُ|سوائے اللہ کے|except Allah')],
  explanationEnglish: 'The statement of Tawhid; described in hadith as the best dhikr.', explanationUrdu: 'کلمۂ توحید؛ حدیث میں اسے افضل ذکر فرمایا گیا ہے۔',
  references: R('Jami at-Tirmidhi 3383; Sunan Ibn Majah 3800 — verify'), verificationNote: NOTE_HADITH });

D({ id: 'dhikr-tasbeeh-after-salah', title: 'Tasbeeh after Salah', titleUrdu: 'نماز کے بعد کی تسبیح', aliases: 'Tasbih Fatima, Tasbeeh e Fatimah, 33 33 34, after namaz dhikr, Subhanallah Alhamdulillah Allahu Akbar',
  verses: [P('سُبْحَانَ اللّٰهِ', 'اللہ پاک ہے۔ (۳۳ بار)', 'Glory be to Allah. (33 times)', 'سُبْحَانَ|پاک ہے|Glory be ; اللّٰهِ|اللہ|(to) Allah', '× 33'),
    P('اَلْحَمْدُ لِلّٰهِ', 'تمام تعریف اللہ کے لیے ہے۔ (۳۳ بار)', 'All praise is for Allah. (33 times)', 'اَلْحَمْدُ|تمام تعریف|All praise ; لِلّٰهِ|اللہ کے لیے|(is) for Allah', '× 33'),
    P('اللّٰهُ أَكْبَرُ', 'اللہ سب سے بڑا ہے۔ (۳۳ یا ۳۴ بار)', 'Allah is the Greatest. (33 or 34 times)', TAKBEER_WORDS, '× 33 / 34'),
    P('لَا إِلٰهَ إِلَّا اللّٰهُ وَحْدَهُ لَا شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَىٰ كُلِّ شَيْءٍ قَدِيرٌ', 'اللہ کے سوا کوئی معبود نہیں، وہ اکیلا ہے، اس کا کوئی شریک نہیں؛ اسی کی بادشاہی ہے اور اسی کے لیے تمام تعریف ہے، اور وہ ہر چیز پر قادر ہے۔', 'There is no god but Allah, alone, without partner. His is the dominion and His is the praise, and He is capable of all things.',
      'لَا إِلٰهَ إِلَّا اللّٰهُ|اللہ کے سوا کوئی معبود نہیں|there is no god but Allah ; وَحْدَهُ|وہ اکیلا ہے|alone ; لَا شَرِيكَ لَهُ|اس کا کوئی شریک نہیں|no partner has He ; لَهُ الْمُلْكُ|اسی کی بادشاہی ہے|His is the dominion ; وَلَهُ الْحَمْدُ|اور اسی کے لیے تعریف ہے|and His is the praise ; وَهُوَ عَلَىٰ كُلِّ شَيْءٍ|اور وہ ہر چیز پر|and He is over all things ; قَدِيرٌ|قادر ہے|capable', 'To complete the hundred')],
  explanationEnglish: 'Recited after the Fard prayer: 33 + 33 + 33 (or 34), completed with the final dhikr. The Hanafi practice is to recite the Sunnah prayers that follow the Fard before extended dhikr.', explanationUrdu: 'فرض نماز کے بعد ۳۳ + ۳۳ + ۳۳ (یا ۳۴) اور پھر آخری ذکر۔ حنفی معمول میں فرض کے بعد سنتیں پڑھی جاتی ہیں۔',
  references: R('Sahih Muslim 597 (Abu Hurairah); Sahih al-Bukhari 3113 (Tasbih of Fatimah) — verify'), verificationNote: NOTE_HADITH + ' The Hanafi note on ordering needs checking.' });

D({ id: 'dua-after-salam', title: 'Allahumma Antas-Salam', titleUrdu: 'اللّٰھم انت السلام', aliases: 'Allahumma antas salam wa minkas salam, dua after fard salah, tabarakta ya dhal jalali wal ikram',
  verses: [P('اللّٰهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ', 'اے اللہ! تو سلامتی والا ہے اور تجھ ہی سے سلامتی ہے؛ تو بڑی برکت والا ہے، اے جلال اور اکرام والے!', 'O Allah, You are Peace and from You comes peace; blessed are You, O Possessor of majesty and honour.',
    'اللّٰهُمَّ|اے اللہ|O Allah ; أَنْتَ السَّلَامُ|تو سلامتی والا ہے|You are Peace ; وَمِنْكَ السَّلَامُ|اور تجھ ہی سے سلامتی ہے|and from You is peace ; تَبَارَكْتَ|تو بڑی برکت والا ہے|blessed are You ; يَا ذَا الْجَلَالِ|اے جلال والے|O Possessor of majesty ; وَالْإِكْرَامِ|اور اکرام والے|and honour')],
  explanationEnglish: 'Recited right after the Salam of the Fard prayer.', explanationUrdu: 'فرض نماز کے سلام کے فوراً بعد پڑھی جاتی ہے۔',
  references: R('Sahih Muslim 591 (Thawban) — verify'), verificationNote: NOTE_HADITH });

D({ id: 'dua-ayat-ul-kursi', title: 'Ayat-ul-Kursi', titleUrdu: 'آیۃ الکرسی', aliases: 'Ayatul Kursi, Ayat al-Kursi, Allahu la ilaha illa huwal hayyul qayyum, Throne verse, 2:255',
  verses: [AYAH('2:255', 'Al-Baqarah 2:255')],
  explanationEnglish: 'The Throne Verse, the greatest verse of the Qur’an. Commonly recited after every Fard prayer, in the morning and evening and before sleep.', explanationUrdu: 'آیۃ الکرسی، قرآن کی عظیم ترین آیت۔ ہر فرض نماز کے بعد، صبح و شام اور سونے سے پہلے پڑھی جاتی ہے۔',
  references: R('Qur’an 2:255', 'Sahih Muslim 810 (Ubayy ibn Ka‘b); Sahih al-Bukhari 2311 (Abu Hurairah) — verify numbers'), verificationNote: QNOTE });

D({ id: 'adhkar-three-quls', title: 'Morning & Evening: The Three Quls', titleUrdu: 'صبح و شام: تین قُل', aliases: 'morning evening adhkar, subah shaam, Ikhlas Falaq Nas three times, Muawwidhat',
  groupLabel: 'Morning & Evening', surahRefs: ['surah-ikhlas', 'surah-falaq', 'surah-nas'],
  explanationEnglish: 'Surah Al-Ikhlas, Al-Falaq and An-Nas are recited three times each in the morning and evening. Tap a Surah below to open its full page.', explanationUrdu: 'سورۃ الاخلاص، الفلق اور الناس صبح و شام تین تین بار پڑھی جاتی ہیں۔ مکمل متن کے لیے نیچے سورت منتخب کریں۔',
  references: R('Abu Dawud 5082; Jami at-Tirmidhi 3575 — verify'), verificationNote: NOTE_HADITH });
D({ id: 'adhkar-bismillahil-ladhi', title: 'Bismillahil-ladhi la yadurru', titleUrdu: 'بسم اللہ الذی لا یضر مع اسمہ', aliases: 'Bismillahil ladhi la yadurru maasmihi shayun, protection dua morning evening, three times',
  groupLabel: 'Morning & Evening',
  verses: [P('بِسْمِ اللّٰهِ الَّذِي لَا يَضُرُّ مَعَ اسْمِهِ شَيْءٌ فِي الْأَرْضِ وَلَا فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ', 'اللہ کے نام سے، جس کے نام کے ساتھ زمین و آسمان میں کوئی چیز نقصان نہیں پہنچا سکتی، اور وہ سننے والا، جاننے والا ہے۔', 'In the name of Allah, with whose name nothing on earth or in heaven can harm, and He is the All-Hearing, the All-Knowing.',
    'بِسْمِ اللّٰهِ|اللہ کے نام سے|In the name of Allah ; الَّذِي|وہ جس کے|the One who ; لَا يَضُرُّ|نقصان نہیں پہنچاتی|does not harm ; مَعَ اسْمِهِ|اس کے نام کے ساتھ|along with His name ; شَيْءٌ|کوئی چیز|anything ; فِي الْأَرْضِ|زمین میں|on the earth ; وَلَا فِي السَّمَاءِ|اور نہ آسمان میں|nor in the heaven ; وَهُوَ السَّمِيعُ|اور وہ سننے والا ہے|and He is the All-Hearing ; الْعَلِيمُ|جاننے والا|the All-Knowing')],
  explanationEnglish: 'Recited three times in the morning and three times in the evening for protection.', explanationUrdu: 'حفاظت کے لیے صبح اور شام تین تین بار پڑھی جاتی ہے۔',
  references: R('Abu Dawud 5088; Jami at-Tirmidhi 3388 — verify numbers and grading'), verificationNote: NOTE_HADITH });
D({ id: 'adhkar-radeetu-billahi', title: 'Radeetu Billahi Rabba', titleUrdu: 'رضیت باللہ ربا', aliases: 'Radeetu billahi rabban, Raditu billahi, content with Allah as Lord, morning evening dua',
  groupLabel: 'Morning & Evening',
  verses: [P('رَضِيتُ بِاللّٰهِ رَبًّا وَبِالْإِسْلَامِ دِينًا وَبِمُحَمَّدٍ نَبِيًّا', 'میں اللہ کے رب ہونے، اسلام کے دین ہونے اور محمد (ﷺ) کے نبی ہونے پر راضی ہوں۔', 'I am pleased with Allah as my Lord, Islam as my religion, and Muhammad as my Prophet.',
    'رَضِيتُ|میں راضی ہوں|I am pleased ; بِاللّٰهِ رَبًّا|اللہ کے رب ہونے پر|with Allah as Lord ; وَبِالْإِسْلَامِ دِينًا|اور اسلام کے دین ہونے پر|and with Islam as religion ; وَبِمُحَمَّدٍ نَبِيًّا|اور محمد ﷺ کے نبی ہونے پر|and with Muhammad as Prophet')],
  explanationEnglish: 'Recited three times in the morning and evening.', explanationUrdu: 'صبح و شام تین بار پڑھی جاتی ہے۔',
  references: R('Abu Dawud 1529, 5072; Jami at-Tirmidhi 3389 — verify numbers and grading'), verificationNote: NOTE_HADITH });

fs.writeFileSync('data/namaz.json', JSON.stringify(namaz, null, 1));
fs.writeFileSync('data/duas.json', JSON.stringify(duas, null, 1));
console.log('namaz items', namaz.length, 'duas', duas.length);

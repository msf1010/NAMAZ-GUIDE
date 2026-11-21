import fs from 'node:fs';
const sk = s => s.normalize('NFD').replace(/[\u0610-\u061A\u064B-\u065F\u0670\u06D6-\u06ED\u0640\u200b-\u200f\u08D3-\u08FF]/g,'').replace(/[\u0622\u0623\u0625\u0671\u0672\u0673\u0627\u0621\u0624\u0626]/g,'').replace(/[\u0649\u06CC\u064A\u06D2]/g,'ي').replace(/[\u0629\u06C1\u06BE\u0647]/g,'ه').replace(/[\u06A9\u0643]/g,'ك').replace(/[^\u0621-\u064A]/g,'');
const all=[...JSON.parse(fs.readFileSync('data/four-quls.json','utf8')),...JSON.parse(fs.readFileSync('data/short-surahs.json','utf8'))];
let bad=0,tot=0;
for(const s of all){const r=await (await fetch(`https://api.alquran.cloud/v1/surah/${s.surahNumber}/quran-simple`)).json();
 s.verses.forEach((v,i)=>{tot++;let t=sk(r.data.ayahs[i].text);if(s.surahNumber!==1&&i===0)t=t.replace(sk('بسم الله الرحمن الرحيم'),'');if(sk(v.arabic)!==t){bad++;console.log(s.surahNumber,v.number,sk(v.arabic),t)}})}
console.log('verses',tot,'mismatch',bad)

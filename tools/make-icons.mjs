// Generates PNG icons (no dependencies): green field with a white crescent.
import fs from 'node:fs';
import zlib from 'node:zlib';

function crc32(buf) { let c, crc = ~0; for (let n = 0; n < buf.length; n++) { c = (crc ^ buf[n]) & 0xff; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; crc = (crc >>> 8) ^ c; } return ~crc >>> 0; }
function chunk(type, data) { const len = Buffer.alloc(4); len.writeUInt32BE(data.length); const td = Buffer.concat([Buffer.from(type), data]); const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td)); return Buffer.concat([len, td, crc]); }
function png(size, pixel) {
  const raw = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y++) {
    raw[y * (size * 4 + 1)] = 0;
    for (let x = 0; x < size; x++) { const [r, g, b] = pixel(x / size, y / size); const o = y * (size * 4 + 1) + 1 + x * 4; raw[o] = r; raw[o + 1] = g; raw[o + 2] = b; raw[o + 3] = 255; }
  }
  const ihdr = Buffer.alloc(13); ihdr.writeUInt32BE(size, 0); ihdr.writeUInt32BE(size, 4); ihdr[8] = 8; ihdr[9] = 6;
  return Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw)), chunk('IEND', Buffer.alloc(0))]);
}
const BG = [47, 93, 70], FG = [247, 243, 234];
function crescent(scale) { // scale<1 shrinks the glyph toward the centre (maskable safe zone)
  return (u, v) => {
    let cover = 0; const S = 3;
    for (let i = 0; i < S; i++) for (let j = 0; j < S; j++) {
      const x = (u + (i + .5) / S / 512), y = (v + (j + .5) / S / 512);
      const cx = (x - .5) / scale + .5, cy = (y - .5) / scale + .5;
      const inA = Math.hypot(cx - .5, cy - .5) < .27, inB = Math.hypot(cx - .6, cy - .46) < .225;
      if (inA && !inB) cover++;
    }
    const t = cover / (S * S);
    return BG.map((b, k) => Math.round(b + (FG[k] - b) * t));
  };
}
fs.mkdirSync('assets/icons', { recursive: true });
fs.writeFileSync('assets/icons/icon-512.png', png(512, crescent(1)));
fs.writeFileSync('assets/icons/icon-192.png', png(192, crescent(1)));
fs.writeFileSync('assets/icons/icon-maskable-512.png', png(512, crescent(.78)));
console.log('icons written');

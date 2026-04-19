// Generates simple solid-color PNG icons for the PWA.
// Run with: node scripts/gen-icons.mjs
import { writeFileSync, mkdirSync } from "node:fs";
import { createHash } from "node:crypto";
import { deflateSync } from "node:zlib";

function crc32(buf) {
  let c;
  const table = [];
  for (let n = 0; n < 256; n++) {
    c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    table[n] = c >>> 0;
  }
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = table[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, "ascii");
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(Buffer.concat([typeBuf, data])), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function solidPng(size, rgb, glyphColor) {
  const w = size, h = size;
  const bpp = 4; // RGBA
  const raw = Buffer.alloc((w * bpp + 1) * h);
  const [r, g, b] = rgb;
  const [gr, gg, gb] = glyphColor;
  for (let y = 0; y < h; y++) {
    raw[y * (w * bpp + 1)] = 0; // filter: None
    for (let x = 0; x < w; x++) {
      // Draw a simple rounded calendar-ish glyph: centered square 60% with top bar.
      const cx = w / 2, cy = h / 2;
      const half = w * 0.3;
      const inSquare = Math.abs(x - cx) < half && Math.abs(y - cy) < half;
      const inBar = inSquare && y - cy < -half + w * 0.12;
      const i = y * (w * bpp + 1) + 1 + x * bpp;
      if (inBar) {
        raw[i] = gr; raw[i + 1] = gg; raw[i + 2] = gb; raw[i + 3] = 255;
      } else if (inSquare) {
        raw[i] = 0xe5; raw[i + 1] = 0xe7; raw[i + 2] = 0xeb; raw[i + 3] = 255;
      } else {
        raw[i] = r; raw[i + 1] = g; raw[i + 2] = b; raw[i + 3] = 255;
      }
    }
  }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(w, 0);
  ihdr.writeUInt32BE(h, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type RGBA
  ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0;
  const idat = deflateSync(raw);
  return Buffer.concat([
    sig,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0)),
  ]);
}

mkdirSync("public", { recursive: true });
const bg = [0x0b, 0x0f, 0x14];
const accent = [0x60, 0xa5, 0xfa];
writeFileSync("public/icon-192.png", solidPng(192, bg, accent));
writeFileSync("public/icon-512.png", solidPng(512, bg, accent));
writeFileSync("public/apple-touch-icon.png", solidPng(180, bg, accent));
const hash = createHash("sha1");
hash.update("life-admin-icons");
console.log("wrote icons", hash.digest("hex").slice(0, 8));

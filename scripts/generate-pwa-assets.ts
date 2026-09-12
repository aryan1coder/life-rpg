import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf: Buffer): number {
  let crc = 0 ^ -1;
  for (let i = 0; i < buf.length; i++) {
    let byte = buf[i];
    for (let j = 0; j < 8; j++) {
      if ((crc ^ byte) & 1) {
        crc = (crc >>> 1) ^ 0xedb88320;
      } else {
        crc = crc >>> 1;
      }
      byte = byte >>> 1;
    }
  }
  return (crc ^ -1) >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const typeBuf = Buffer.from(type, 'ascii');
  const crcBuf = Buffer.alloc(4);
  const crcVal = crc32(Buffer.concat([typeBuf, data]));
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width: number, height: number): Buffer {
  const header = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // color type: RGBA
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Raw pixel data with filter byte 0 per scanline
  const rowSize = 1 + width * 4;
  const rawData = Buffer.alloc(rowSize * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = width * 0.46;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowSize;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      const dx = x - cx;
      const dy = y - cy;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const normDist = dist / radius;

      let r = 11;
      let g = 14;
      let b = 23;
      let a = 255;

      if (dist > radius + 1) {
        // Transparent corner
        a = 0;
      } else if (dist > radius) {
        // Anti-aliased outer edge
        const t = 1 - (dist - radius);
        a = Math.floor(255 * Math.max(0, Math.min(1, t)));
      } else if (dist > radius - width * 0.06) {
        // Outer gold / amber ring
        const t = (dist - (radius - width * 0.06)) / (width * 0.06);
        r = Math.floor(245 + 10 * t);
        g = Math.floor(158 + 66 * t);
        b = Math.floor(11 + 60 * t);
      } else if (dist > radius - width * 0.12) {
        // Dark spacer
        r = 15;
        g = 20;
        b = 32;
      } else if (Math.abs(dx) + Math.abs(dy) < width * 0.32) {
        // Inner glowing cybernetic RPG shard
        const innerRatio = (Math.abs(dx) + Math.abs(dy)) / (width * 0.32);
        if (Math.abs(dx) + Math.abs(dy) < width * 0.14) {
          // White-hot core
          r = 255;
          g = 255;
          b = 255;
        } else {
          // Electric violet / indigo / cyan
          r = Math.floor(99 + 120 * (1 - innerRatio));
          g = Math.floor(102 + 100 * (1 - innerRatio));
          b = Math.floor(241);
        }
      } else if (dist < radius * 0.72 && (Math.abs(dx) < 2 || Math.abs(dy) < 2)) {
        // Crosshair reticle accents
        r = 99;
        g = 102;
        b = 241;
      } else {
        // Deep obsidian body
        r = Math.floor(11 + 10 * (1 - normDist));
        g = Math.floor(14 + 12 * (1 - normDist));
        b = Math.floor(23 + 20 * (1 - normDist));
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressed);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([header, ihdrChunk, idatChunk, iendChunk]);
}

function createIco(png32: Buffer, png16: Buffer): Buffer {
  // ICONDIR header
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // Reserved
  header.writeUInt16LE(1, 2); // Type 1 = ICO
  header.writeUInt16LE(2, 4); // 2 images (32x32 and 16x16)

  const dirEntrySize = 16;
  const offset0 = 6 + dirEntrySize * 2;
  const offset1 = offset0 + png32.length;

  // Entry 0: 32x32
  const entry0 = Buffer.alloc(16);
  entry0.writeUInt8(32, 0); // width
  entry0.writeUInt8(32, 1); // height
  entry0.writeUInt8(0, 2); // color count
  entry0.writeUInt8(0, 3); // reserved
  entry0.writeUInt16LE(1, 4); // color planes
  entry0.writeUInt16LE(32, 6); // bits per pixel
  entry0.writeUInt32LE(png32.length, 8);
  entry0.writeUInt32LE(offset0, 12);

  // Entry 1: 16x16
  const entry1 = Buffer.alloc(16);
  entry1.writeUInt8(16, 0); // width
  entry1.writeUInt8(16, 1); // height
  entry1.writeUInt8(0, 2); // color count
  entry1.writeUInt8(0, 3); // reserved
  entry1.writeUInt16LE(1, 4); // color planes
  entry1.writeUInt16LE(32, 6); // bits per pixel
  entry1.writeUInt32LE(png16.length, 8);
  entry1.writeUInt32LE(offset1, 12);

  return Buffer.concat([header, entry0, entry1, png32, png16]);
}

const publicDir = path.join(process.cwd(), 'public');
const appDir = path.join(process.cwd(), 'src', 'app');

console.log('Generating high-resolution PWA assets and favicon...');

const png16 = createPng(16, 16);
fs.writeFileSync(path.join(publicDir, 'favicon-16x16.png'), png16);

const png32 = createPng(32, 32);
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), png32);

const png180 = createPng(180, 180);
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), png180);

const png192 = createPng(192, 192);
fs.writeFileSync(path.join(publicDir, 'icon-192x192.png'), png192);

const png512 = createPng(512, 512);
fs.writeFileSync(path.join(publicDir, 'icon-512x512.png'), png512);

const icoBuf = createIco(png32, png16);
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), icoBuf);
fs.writeFileSync(path.join(appDir, 'favicon.ico'), icoBuf);

console.log('✓ Assets generated successfully in public/ and src/app/');

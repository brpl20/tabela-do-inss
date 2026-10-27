import { readdir, readFile } from 'node:fs/promises';
import { resolve, sep } from 'node:path';
import sharp from 'sharp';

// Validate the emitted HTML and assets, so a successful build cannot advertise
// a missing local social image. Remote CDN images require a separate HTTP check.
const output = resolve(process.argv[2] ?? 'dist');
const images = new Map();
let checked = 0;
let remote = 0;

async function* htmlFiles(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const path = resolve(directory, entry.name);
    if (entry.isDirectory()) yield* htmlFiles(path);
    else if (entry.name.endsWith('.html')) yield path;
  }
}

for await (const file of htmlFiles(output)) {
  const html = await readFile(file, 'utf8');
  const meta = new Map();
  let canonical;
  for (const tag of html.matchAll(/<(?:meta|link)\b[^>]*>/gi)) {
    const attrs = Object.fromEntries([...tag[0].matchAll(/([\w:-]+)\s*=\s*["']([^"']*)["']/g)]
      .map((match) => [match[1], match[2]]));
    if (attrs.rel === 'canonical') canonical = attrs.href;
    if (attrs.property || attrs.name) meta.set(attrs.property ?? attrs.name, attrs.content);
  }
  if (!meta.get('og:image') || !meta.get('twitter:image')) {
    throw new Error(`${file}: missing Open Graph or Twitter image`);
  }
  if (meta.get('og:image') !== meta.get('twitter:image')) {
    throw new Error(`${file}: Open Graph and Twitter images differ`);
  }
  const page = new URL(canonical);
  const image = new URL(meta.get('og:image'));
  if (image.origin !== page.origin) {
    remote++;
    continue;
  }
  const path = resolve(output, `.${decodeURIComponent(image.pathname)}`);
  if (!path.startsWith(`${output}${sep}`)) throw new Error(`${file}: invalid image path`);
  if (!images.has(path)) {
    const bytes = await readFile(path);
    const info = await sharp(bytes).metadata();
    // metadata() alone does not prove the pixel data can be decoded.
    await sharp(bytes).raw().toBuffer();
    if (!['jpeg', 'png', 'webp', 'gif'].includes(info.format)) {
      throw new Error(`${path}: unsupported social image format ${info.format}`);
    }
    images.set(path, info);
  }
  const info = images.get(path);
  if (Number(meta.get('og:image:width')) !== info.width
    || Number(meta.get('og:image:height')) !== info.height) {
    throw new Error(`${file}: declared image dimensions differ from ${info.width}x${info.height}`);
  }
  checked++;
}
if (!checked) throw new Error('No local social images were validated');
console.log(`Social images: ${checked} pages, ${images.size} local assets validated; ${remote} remote images skipped.`);

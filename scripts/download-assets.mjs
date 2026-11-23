import { access, mkdir, writeFile } from 'node:fs/promises';

const origin = 'https://ninja-star.co.il/wp-content/uploads/';
const assets = {
  'logo.png': '2020/06/newlogo.png',
  'hero.jpg': '2024/10/WhatsApp-Image-2024-10-03-at-10.15.22.jpeg',
  'park.jpg': '2021/07/DSC01591-scaled.jpg',
  'rehovot.jpg': '2024/10/WhatsApp-Image-2024-10-03-at-10.15.14.jpeg',
  'ashdod.jpg': '2021/07/DSC01409_800x534.jpg',
  'hod-hasharon.jpg': '2024/10/WhatsApp-Image-2024-10-03-at-10.15.23.jpeg',
  'venue.jpg': '2024/09/WhatsApp-Image-2024-09-03-at-12.43.21.jpeg',
  'birthday.jpg': '2020/06/birthday2-768x512.jpg',
  'birthday-room.jpg': '2020/06/birthday-1-768x512.jpg',
  'trampolines.jpg': '2024/03/45.jpeg',
  'ninja.jpg': '2024/03/WhatsApp-Image-2024-03-13-at-10.51.28-1.jpeg',
  'ball-pool.jpg': '2024/03/WhatsApp-Image-2024-03-13-at-10.51.28.jpeg',
  'cars.jpg': '2024/03/WhatsApp-Image-2024-03-13-at-10.40.37-2.jpeg',
  'kids.jpg': '2020/06/kids2.jpg',
  'foam.jpg': '2020/06/gomi.jpg',
  'climbing.jpg': '2020/06/ninja_kir_3.jpg',
};
await mkdir('public/images', { recursive: true });
const entries = Object.entries(assets);
for (let i = 0; i < entries.length; i += 4) {
  await Promise.all(entries.slice(i, i + 4).map(async ([name, path]) => {
    try { await access(`public/images/${name}`); return; } catch {}
    const response = await fetch(origin + path);
    if (!response.ok) throw new Error(`${name}: HTTP ${response.status}`);
    await writeFile(`public/images/${name}`, Buffer.from(await response.arrayBuffer()));
    console.log(`Downloaded ${name}`);
  }));
}
await mkdir('public/fonts', { recursive: true });
const css = await (await fetch('https://fonts.googleapis.com/css2?family=Rubik:wght@400..900&display=swap', { headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36' } })).text();
const hebrew = css.match(/\/\* hebrew \*\/[\s\S]*?url\(([^)]+)\)/);
const allFonts = [...css.matchAll(/url\(([^)]+)\)/g)];
const fontUrl = hebrew?.[1] || allFonts[0]?.[1];
if (!fontUrl) throw new Error('No Rubik font URL found');
const fontResponse = await fetch(fontUrl);
await writeFile('public/fonts/rubik-hebrew.woff2', Buffer.from(await fontResponse.arrayBuffer()));
const latinUrl = allFonts.at(-1)?.[1];
if (latinUrl && latinUrl !== fontUrl) {
  await writeFile('public/fonts/rubik-latin.woff2', Buffer.from(await (await fetch(latinUrl)).arrayBuffer()));
}
const license = await fetch('https://raw.githubusercontent.com/google/fonts/main/ofl/rubik/OFL.txt');
if (!license.ok) throw new Error('Could not download Rubik font license');
await writeFile('public/fonts/OFL.txt', await license.text());
await writeFile('public/images/sources.json', JSON.stringify({ origin, assets, fetched: '2026-11-23', note: 'Images from the existing Ninja Star website. Venue images are illustrative; verify branch assignment before launch.' }, null, 2));
console.log('Fonts and source register saved');

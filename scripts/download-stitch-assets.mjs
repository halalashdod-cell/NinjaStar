import { mkdir, readFile, writeFile } from "node:fs/promises";

const heroUrl =
  "https://lh3.googleusercontent.com/aida/ALJJyrAjWyPhoRiRig581yuz5Q2SAreaac3I0SmbLFb5uLgEgYvvPkO2Jz0fmrzpIh3z4QQgBTKTzLyUIjETcwZSdf0Gkpcx3IahNm_nj7u2YbuATOT7H9ep0Ls36ORqC7e2B-l6Vd_OSgXorzbk-FJ3NDjUcdbpb7_f9rW_GczIdrQAt6eq6lJ6-4uF--edlEUx0Jodehn05BJGQ41O1qKrNh6uNqOqEljYl1qo1CAxdPo8_H3nzdQzwolhcFqHFbwirqhX7g";
const heroResponse = await fetch(heroUrl);
if (!heroResponse.ok)
  throw new Error(`Stitch hero: HTTP ${heroResponse.status}`);
await mkdir("public/images", { recursive: true });
await writeFile(
  "public/images/stitch-arena.jpg",
  Buffer.from(await heroResponse.arrayBuffer()),
);

const cssResponse = await fetch(
  "https://fonts.googleapis.com/css2?family=Heebo:wght@400..800&display=swap",
  {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
    },
  },
);
if (!cssResponse.ok) throw new Error("Heebo font stylesheet unavailable");
const css = await cssResponse.text();
const hebrew = css.match(/\/\* hebrew \*\/[\s\S]*?url\(([^)]+)\)/)?.[1];
const latin = [...css.matchAll(/url\(([^)]+)\)/g)].at(-1)?.[1];
if (!hebrew || !latin) throw new Error("Heebo font subsets unavailable");
for (const [name, url] of [
  ["heebo-hebrew.woff2", hebrew],
  ["heebo-latin.woff2", latin],
]) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Font download failed: ${name}`);
  await writeFile(
    `public/fonts/${name}`,
    Buffer.from(await response.arrayBuffer()),
  );
}
const license = await fetch(
  "https://raw.githubusercontent.com/google/fonts/main/ofl/heebo/OFL.txt",
);
if (!license.ok) throw new Error("Heebo license unavailable");
await writeFile("public/fonts/Heebo-OFL.txt", await license.text());
const sources = JSON.parse(
  await readFile("public/images/sources.json", "utf8"),
);
sources.stitch = {
  project: "489337128627221470",
  screen: "node_16556165105544864630",
  title: "Ninja Star — All-Star Navy, Deep Red & Blue",
  hero: {
    file: "stitch-arena.jpg",
    url: heroUrl,
    note: "Atmospheric illustration imported from the user-selected Stitch design; not a photograph of a specific Ninja Star branch.",
  },
};
await writeFile(
  "public/images/sources.json",
  JSON.stringify(sources, null, 2) + "\n",
);
console.log(
  "Saved Stitch hero, Heebo fonts, font license, and asset provenance.",
);

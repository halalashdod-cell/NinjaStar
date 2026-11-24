import { execFile } from "node:child_process";
import { mkdir, stat, writeFile } from "node:fs/promises";
import { promisify } from "node:util";
import path from "node:path";

const run = promisify(execFile);
const input = process.argv[2];
if (!input) throw new Error("Usage: node scripts/prepare-hero-video.mjs <original.mp4>");
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const ffprobe = process.env.FFPROBE_PATH || "ffprobe";
const source = path.resolve(input);
await stat(source);
await mkdir("public/videos", { recursive: true });
await mkdir("public/images", { recursive: true });

const { stdout } = await run(ffprobe, [
  "-v", "error", "-show_format", "-show_streams", "-of", "json", source,
]);
const metadata = JSON.parse(stdout);
const stream = metadata.streams.find((item) => item.codec_type === "video");
if (!stream) throw new Error("The source contains no video stream.");
const variants = [
  { name: "desktop", filter: "scale=1280:720:force_original_aspect_ratio=decrease,setsar=1,fps=30", crf: "30", maxrate: "1600k", bufsize: "3200k" },
  { name: "mobile", filter: "crop=trunc(ih*9/16/2)*2:ih:(iw-ow)/2:0,scale=540:960,setsar=1,fps=30", crf: "30", maxrate: "850k", bufsize: "1700k" },
];
const outputs = [];
for (const variant of variants) {
  const video = `public/videos/ninja-star-hero-${variant.name}.mp4`;
  const poster = `public/images/ninja-star-hero-${variant.name}.webp`;
  console.log(`Preparing ${variant.name} video and poster...`);
  await run(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-y", "-i", source,
    "-map", "0:v:0", "-an", "-map_metadata", "-1",
    "-vf", variant.filter, "-c:v", "libx264", "-preset", "slow",
    "-crf", variant.crf, "-maxrate", variant.maxrate, "-bufsize", variant.bufsize,
    "-pix_fmt", "yuv420p", "-profile:v", "high", "-level:v", "3.1",
    "-threads", "4", "-movflags", "+faststart", video,
  ]);
  await run(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-y", "-ss", "0.3", "-i", source,
    "-map", "0:v:0", "-frames:v", "1", "-vf", variant.filter,
    "-c:v", "libwebp", "-quality", "80", poster,
  ]);
  outputs.push({
    name: variant.name,
    video,
    bytes: (await stat(video)).size,
    poster,
    posterBytes: (await stat(poster)).size,
    filter: variant.filter,
  });
}
const manifest = {
  prepared: new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Jerusalem", year: "numeric", month: "2-digit", day: "2-digit",
  }).format(new Date()),
  source: {
    name: path.basename(source),
    bytes: Number(metadata.format.size),
    duration: Number(metadata.format.duration),
    width: stream.width,
    height: stream.height,
    frameRate: stream.r_frame_rate,
  },
  note: "User-provided venue footage; original edit retained. Silent H.264 MP4s with fast-start metadata. Mobile uses a centred portrait crop. Original stays outside the repository.",
  outputs,
};
await writeFile("public/videos/sources.json", JSON.stringify(manifest, null, 2) + "\n");
console.log(JSON.stringify(manifest, null, 2));

import { createFFmpeg, fetchFile } from "../../src/index.js";

const ffmpeg = createFFmpeg();

await ffmpeg.load();

ffmpeg.FS("writeFile", "flame.avi", await fetchFile("../assets/flame.avi"));

await ffmpeg.run("-i", "flame.avi", "-map", "0:v", "-r", "25", "out_%06d.bmp");

ffmpeg
  .FS("readdir", "/")
  .filter((p) => p.endsWith(".bmp"))
  .forEach(async (p) => {
    await Deno.writeFile(p, ffmpeg.FS("readFile", p));
  });

Deno.exit(0);

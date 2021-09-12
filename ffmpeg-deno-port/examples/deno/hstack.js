import { createFFmpeg, fetchFile } from "../../src/index.js";

const ffmpeg = createFFmpeg();

await ffmpeg.load();

ffmpeg.FS("writeFile", "flame.avi", await fetchFile("../assets/flame.avi"));

await ffmpeg.run(
  "-i",
  "flame.avi",
  "-i",
  "flame.avi",
  "-filter_complex",
  "hstack",
  "flame.mp4"
);

await Deno.writeFile("flame.mp4", ffmpeg.FS("readFile", "flame.mp4"));

Deno.exit(0);

import { createFFmpeg, fetchFile } from "../../src/index.js";

// instantiate ffmpeg
const ffmpeg = createFFmpeg();

// Deno supports top-level await since v0.19.0
// https://github.com/denoland/deno/releases/tag/v0.19.0?utm_campaign=Deno%20Newsletter&utm_medium=email&utm_source=Revue%20newsletter
await ffmpeg.load();

ffmpeg.FS("writeFile", "flame.avi", await fetchFile("../assets/flame.avi"));

ffmpeg.FS("writeFile", "concat_list.txt", "file flame.avi\nfile flame.avi");

await ffmpeg.run(
  "-f",
  "concat",
  "-safe",
  "0",
  "-i",
  "concat_list.txt",
  "flame.mp4"
);

await Deno.writeFile("flame.mp4", ffmpeg.FS("readFile", "flame.mp4"));

Deno.exit(0);

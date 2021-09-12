import { createFFmpeg, fetchFile } from "../../src/index.js";

const ffmpeg = createFFmpeg();

await ffmpeg.load();

ffmpeg.FS("writeFile", "flame.avi", await fetchFile("../assets/flame.avi"));

await ffmpeg.run("-i", "flame.avi", "-ss", "0", "-to", "1", "flame_trim.avi");

await Deno.writeFile("flame_trim.avi", ffmpeg.FS("readFile", "flame_trim.avi"));

Deno.exit(0);

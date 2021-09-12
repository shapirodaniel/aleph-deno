import Config from "./config.js";

// note: note shorthand of accessing <dir>/index.js does not work in Deno
// must provide explicit path to index.js
import Parser from "./utils/index.js";

const NO_LOAD = Error(
  "ffmpeg.wasm is not ready, make sure you have completed load()."
);

export default () => {
  let running = false;
  let Core = null;
  let ffmpeg = null;

  const load = async () => {
    if (!Core) {
      Core = await WebAssembly.instantiate("./ffmpeg-core.wasm");

      ffmpeg = Core.cwrap("proxy_main", "number", ["number", "number"]);
    } else {
      throw "ffmpeg.wasm was loaded, you should not load it again, use ffmpeg.isLoaded() to check next time.";
    }
  };

  const isLoaded = () => !!Core;

  /*
   * Run ffmpeg command.
   * This is the major function in ffmpeg.wasm, you can just imagine it
   * as ffmpeg native cli and what you need to pass is the same.
   *
   * For example, you can convert native command below:
   *
   * ```
   * $ ffmpeg -i video.avi -c:v libx264 video.mp4
   * ```
   *
   * To
   *
   * ```
   * await ffmpeg.run('-i', 'video.avi', '-c:v', 'libx264', 'video.mp4');
   * ```
   *
   */
  const run = (..._args) => {
    if (!Core) {
      throw NO_LOAD;
    }

    if (running) {
      throw "ffmpeg.wasm can only run one command at a time";
    }

    running = true;

    return new Promise((resolve) => {
      const cliArgs = [...Config.defaultArgs, ..._args].filter(
        (s) => s.length !== 0
      );
      resolve(ffmpeg(...Parser.parseArgs(Core, cliArgs)));
    });
  };

  /*
   * Run FS operations.
   * For input/output file of ffmpeg.wasm, it is required to save them to MEMFS
   * first so that ffmpeg.wasm is able to consume them. Here we rely on the FS
   * methods provided by Emscripten.
   *
   * Common methods to use are:
   * ffmpeg.FS('writeFile', 'video.avi', new Uint8Array(...)): writeFile writes
   * data to MEMFS. You need to use Uint8Array for binary data.
   * ffmpeg.FS('readFile', 'video.mp4'): readFile from MEMFS.
   * ffmpeg.FS('unlink', 'video.map'): delete file from MEMFS.
   *
   * For more info, check https://emscripten.org/docs/api_reference/Filesystem-API.html
   *
   */
  const FS = (method, ...args) => {
    if (!Core) {
      throw NO_LOAD;
    }

    let result = null;

    try {
      result = Core.FS[method](...args);
    } catch (e) {
      if (method === "readdir") {
        throw `ffmpeg.FS('readdir', '${args[0]}') error. Check if the path exists, ex: ffmpeg.FS('readdir', '/')`;
      }

      if (method === "readFile") {
        throw `ffmpeg.FS('readFile', '${args[0]}') error. Check if the path exists`;
      }

      throw "Oops, something went wrong in FS operation.";
    }

    return result;
  };

  /**
   * forcibly terminate the ffmpeg program.
   */
  const exit = () => {
    if (!Core) {
      throw NO_LOAD;
    }

    running = false;
    Core.exit(1);
    Core = null;
    ffmpeg = null;
  };

  const setProgress = (_progress) => {
    progress = _progress;
  };

  return {
    setProgress,
    load,
    isLoaded,
    run,
    exit,
    FS,
  };
};

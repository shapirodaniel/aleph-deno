const require = createRequire(import.meta.url);

const { log } = require("../utils/log");

export default ({ corePath }) =>
  new Promise((resolve) => {
    log("info", `fetch ffmpeg.wasm-core script from ${corePath}`);
    // eslint-disable-next-line import/no-dynamic-require
    resolve({ createFFmpegCore: require(corePath) });
  });

import { useDeno } from "aleph/react";
import React, { useRef } from "react";
import FFmpeg from "../ffmpeg-deno-port/src/index.js";

type Target = {
  files: Array<File>;
};

type PartialContext = {
  target: Target;
};

export default function Home() {
  const messageRef = useRef(null);
  const outputVideoRef = useRef(null);
  const uploaderRef = useRef(null);

  const run_ffmpeg = () => {
    const ffmpeg = FFmpeg.createFFmpeg();

    const transcode = async ({ target: { files } }: PartialContext) => {
      await ffmpeg.load();

      const inputPaths = [];

      for (const file of files) {
        const { name } = file;
        ffmpeg.FS("writeFile", name, await FFmpeg.fetchFile(file));
        inputPaths.push(`file ${name}`);
      }

      ffmpeg.FS("writeFile", "concat_list.txt", inputPaths.join("\n"));

      await ffmpeg.run(
        "-f",
        "concat",
        "-safe",
        "0",
        "-i",
        "concat_list.txt",
        "output.mp4"
      );

      const data = ffmpeg.FS("readFile", "output.mp4");

      const video = outputVideoRef.current as any;

      video.src = URL.createObjectURL(
        new Blob([data.buffer], {
          type: "video/mp4",
        })
      );
    };

    const elm = uploaderRef.current as any;

    elm.addEventListener("change", transcode);
  };

  return (
    <html>
      <head>
        <style>
          {`html,
      body {
        margin: 0;
        width: 100%;
        height: 100%;
      }

      body {
        display: flex;
        flex-direction: column;
        align-items: center;
      }`}
        </style>
      </head>

      <body>
        <h3>Select multiple video files to Concatenate</h3>
        <video ref={outputVideoRef} controls></video>
        <br />
        <input ref={uploaderRef} type="file" id="uploader" multiple />
        <p ref={messageRef}></p>
      </body>
    </html>
  );
}

const encoder = new TextEncoder();

// validate URL
const isURL = (str: string): Boolean => {
  const pattern = new RegExp(
    "^(https?:\\/\\/)?" + // protocol
      "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|" + // domain name
      "((\\d{1,3}\\.){3}\\d{1,3}))" + // OR ip (v4) address
      "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
      "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
      "(\\#[-a-z\\d_]*)?$",
    "i"
  ); // fragment locator

  return !!pattern.test(str);
};

// validate extension or local protocol (catch valid local URLs)
const isExtensionOrLocalProtocol = (input: string) => {
  switch (true) {
    case input.startsWith("moz-extension://"):
      return true;
    case input.startsWith("chrome-extension://"):
      return true;
    case input.startsWith("file://"):
      return true;
    default:
      return false;
  }
};

async function dataHandler(
  _data: string | ArrayBuffer | Blob | File
): Promise<Uint8Array> {
  let data = _data;

  if (typeof _data === "undefined") {
    return new Uint8Array();
  }

  if (typeof _data === "string") {
    if (isURL(_data) || isExtensionOrLocalProtocol(_data)) {
      const res = await fetch(_data);

      data = await res.arrayBuffer();

      // is base64
    } else if (/data:_data\/([a-zA-Z]*);base64,([^"]*)/.test(_data)) {
      data = encoder.encode(_data.split(",")[1]);

      // is from local file path
    } else {
      data = await Deno.readFile(_data);
    }
  }

  if (ArrayBuffer.isView(_data)) {
    data = _data;
  }

  return new Uint8Array(data as ArrayBuffer);
}

export default dataHandler;

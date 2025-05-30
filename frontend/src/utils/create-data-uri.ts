import svgToTinyDataUri from "mini-svg-data-uri";

const createDataUri = async (data: Uint8Array<ArrayBufferLike>, mimeType?: string) => {
  if (mimeType === "image/svg+xml") {
    const decoder = new TextDecoder();
    return svgToTinyDataUri(decoder.decode(data));
  } else {
    return new Promise<string>((resolve, reject) => {
      const blob = new Blob([data]);
      const fileReader = new FileReader();
      fileReader.addEventListener("load", () => resolve(fileReader.result as string));
      fileReader.addEventListener("abort", () => reject(new Error("Data read aborted")));
      fileReader.addEventListener("error", () => reject(fileReader.error));
      fileReader.readAsDataURL(blob);
    });
  }
};

export default createDataUri;

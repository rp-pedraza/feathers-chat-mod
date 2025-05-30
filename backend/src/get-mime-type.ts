import { detectXml } from "@file-type/xml";
import { FileTypeParser, FileTypeResult } from "file-type";

export const getMimeType = async (fileOrBuffer: string | File | Uint8Array | ArrayBuffer) => {
  let fileType: FileTypeResult | undefined;
  const parser = new FileTypeParser({ customDetectors: [detectXml] });

  if (typeof fileOrBuffer === "string") {
    fileType = await parser.fromFile(fileOrBuffer);
  } else {
    const buffer = fileOrBuffer instanceof File ? await fileOrBuffer.arrayBuffer() : fileOrBuffer;
    fileType = await parser.fromBuffer(buffer);
  }

  if (fileType === undefined) {
    throw new Error("Failed to detect mime type.");
  }

  return fileType.mime;
};

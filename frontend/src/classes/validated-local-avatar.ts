import {
  getMimeType,
  type LocalAvatar,
  UPLOADED_AVATAR_MAXIMUM_SIZE,
  validateImageMimeType
} from "@rp-pedraza/feathers-chat-mod-backend";

export default class ValidatedLocalAvatar {
  avatar: Required<Pick<LocalAvatar, "data" | "size" | "mimeType">> &
    Partial<Omit<LocalAvatar, "data" | "size" | "mimeType">>;

  private constructor(avatar: typeof this.avatar) {
    this.avatar = avatar;
  }

  public static async create(
    avatar: Partial<Omit<LocalAvatar, "data"> & { data: LocalAvatar["data"] | File }> | undefined
  ) {
    if (!avatar) {
      throw new Error("Avatar parameter undefined.");
    } else if (!avatar.data) {
      throw new Error("Avatar data undefined.");
    }

    const { data, mimeType, size } = avatar;
    const isFile = data instanceof File;
    const finalData = isFile ? await data.bytes() : data;
    const realMimeType = await getMimeType(finalData);
    const realSize = isFile ? data.size : data.byteLength;

    if (!(realSize > 0 && realSize <= UPLOADED_AVATAR_MAXIMUM_SIZE)) {
      throw new Error("Invalid image data size");
    } else if (size !== undefined && realSize !== size) {
      throw new Error("Original size is inconsient data");
    } else if (!validateImageMimeType(realMimeType)) {
      throw new Error("Invalid mime type");
    } else if (mimeType !== undefined && mimeType !== realMimeType) {
      throw new Error("Original mime type is inconsistent with data");
    }

    return new ValidatedLocalAvatar({
      ...avatar,
      data: finalData,
      size: realSize,
      mimeType: realMimeType
    });
  }
}

import { resolve } from "@feathersjs/schema";
import { type Static, getValidator, Type, querySyntax } from "@feathersjs/typebox";
import { UPLOADED_AVATAR_MAXIMUM_SIZE } from "../../constants.js";
import type { HookContext, NextFunction } from "../../declarations.js";
import { getMimeType } from "../../get-mime-type.js";
import { Nullable } from "../../nullable.js";
import {
  dataValidator,
  queryValidator,
  validateImageMimeType
} from "../../validators.js";

export const localAvatarSchema = Type.Object(
  {
    id: Type.Number(),
    data: Type.Unsafe<Uint8Array>({ type: "object", instanceOf: "Uint8Array" }),
    size: Type.Number({ minimum: 1, maximum: UPLOADED_AVATAR_MAXIMUM_SIZE }),
    mimeType: Type.String({ format: "image-mime-type" }),
    filename: Type.Optional(Nullable(Type.String())),
    uploadedAt: Type.Number(),
    userId: Type.Number(),
    version: Type.Number()
  },
  { $id: "LocalAvatar", additionalProperties: false }
);
export type LocalAvatar = Static<typeof localAvatarSchema>;
export const localAvatarValidator = getValidator<unknown, LocalAvatar>(
  localAvatarSchema,
  dataValidator
);
export const localAvatarResolver = resolve<LocalAvatar, HookContext>({});
export const localAvatarExternalResolver = resolve<LocalAvatar, HookContext>({});

export const localAvatarValidatorExtended = async (localAvatar: LocalAvatar) => {
  localAvatarValidator(localAvatar);

  if (localAvatar.size !== localAvatar.data.byteLength) {
    throw new Error("Recorded local avatar size don't match detected size");
  } else if (localAvatar.mimeType !== (await getMimeType(localAvatar.data))) {
    throw new Error("Recorded local avatar mime type don't match detected mime type");
  } else {
    return localAvatar;
  }
};

export const localAvatarMimeTypeValidator = async (
  context: HookContext,
  next?: NextFunction
): Promise<unknown> => {
  const mimeType = context.data?.mimeType;

  if (!validateImageMimeType(mimeType)) {
    throw new Error(`Invalid image mime type: ${mimeType}`);
  }

  return next ? await next() : undefined;
};

export const localAvatarDataSchema = Type.Pick(localAvatarSchema, ["data", "filename"], {
  $id: "LocalAvatarData"
});
export type LocalAvatarData = Static<typeof localAvatarDataSchema>;
export const localAvatarDataValidator = getValidator<unknown, LocalAvatarData>(
  localAvatarDataSchema,
  dataValidator
);
export const localAvatarDataResolver = resolve<LocalAvatar, HookContext>({
  mimeType: async (_value, localAvatarData, _context) => await getMimeType(localAvatarData.data),
  size: async (_value, localAvatarData, _context) => localAvatarData.data.length,
  userId: async (_value, _localAvatarData, context) => context.params.user.id,
  uploadedAt: async () => Date.now()
});

export const localAvatarPatchSchema = Type.Pick(
  localAvatarSchema,
  ["data", "filename", "version"],
  {
    $id: "LocalAvatarPatch"
  }
);
export type LocalAvatarPatch = Static<typeof localAvatarPatchSchema>;
export const localAvatarPatchValidator = getValidator<unknown, LocalAvatarPatch>(
  localAvatarPatchSchema,
  dataValidator
);
export const localAvatarPatchResolver = resolve<LocalAvatar, HookContext>({
  mimeType: async (_value, localAvatar, _context) => await getMimeType(localAvatar.data),
  size: async (_value, localAvatar, _context) => localAvatar.data.length,
  uploadedAt: async () => Date.now()
});

export const localAvatarQueryProperties = Type.Pick(localAvatarSchema, ["id", "userId"]);
export const localAvatarQuerySchema = Type.Intersect(
  [querySyntax(localAvatarQueryProperties), Type.Object({}, { additionalProperties: false })],
  { $id: "LocalAvatarQuery", additionalProperties: false }
);
export type LocalAvatarQuery = Static<typeof localAvatarQuerySchema>;
export const localAvatarQueryValidator = getValidator<unknown, LocalAvatarQuery>(
  localAvatarQuerySchema,
  queryValidator
);
export const localAvatarQueryResolver = resolve<LocalAvatarQuery, HookContext>({
  async userId(value, _user, context) {
    if (context.params.user && context.method !== "find") {
      return context.params.user.id;
    }

    return value;
  }
});

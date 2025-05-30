// For more information about this file see https://dove.feathersjs.com/guides/cli/validators.html
import { addFormats, type FormatsPluginOptions } from "@feathersjs/schema";
import { getValidator } from "@feathersjs/typebox";
import { TypeGuard } from "@sinclair/typebox";
import { Value } from "@sinclair/typebox/value";
import { Ajv, type Options as AjvOptions, type AnySchemaObject } from "ajv";

import { ALLOWED_IMAGE_MIME_TYPES, USERNAME_FORMAT } from "./constants.js";
import { getMimeType } from "./get-mime-type.js";
import { emailSchema } from "./schemas/email-schema.js";
import { imageMimeTypeSchema } from "./schemas/image-mime-type-schema.js";
import { uint8ArrayImageSchema } from "./schemas/uint-array-image-schema.js";
import { usernameSchema } from "./schemas/username-schema.js";

export const ajvFormats: FormatsPluginOptions = [
  "date-time",
  "time",
  "date",
  "email",
  "hostname",
  "ipv4",
  "ipv6",
  "uri",
  "uri-reference",
  "uuid",
  "uri-template",
  "json-pointer",
  "relative-json-pointer",
  "regex"
];

// https://feathersjs.com/api/schema/typebox#extended-configuration
// https://github.com/sinclairzx81/typebox/blob/master/test/runtime/compiler-ajv/validate.ts#L8

async function validateInstanceOrType(
  schema: string,
  data: unknown,
  parentSchema?: AnySchemaObject
): Promise<boolean> {
  switch (schema) {
    case "Constructor":
      return TypeGuard.IsConstructor(parentSchema) && Value.Check(parentSchema, data); // not supported
    case "Function":
      return TypeGuard.IsFunction(parentSchema) && Value.Check(parentSchema, data); // not supported
    case "Date":
      return TypeGuard.IsDate(parentSchema) && Value.Check(parentSchema, data);
    case "Promise":
      return TypeGuard.IsPromise(parentSchema) && Value.Check(parentSchema, data); // not supported
    case "Uint8Array":
      return TypeGuard.IsUint8Array(parentSchema) && Value.Check(parentSchema, data);
    case "Undefined":
      return TypeGuard.IsUndefined(parentSchema) && Value.Check(parentSchema, data); // not supported
    case "Void":
      return TypeGuard.IsVoid(parentSchema) && Value.Check(parentSchema, data);
    default:
      return false;
  }
}

async function validateBinaryFormat(schema: string, data: unknown): Promise<boolean> {
  switch (schema) {
    case "image": {
      if (typeof data === "object") {
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const buffer = Buffer.from(data as any);
          const mimeType = await getMimeType(buffer);
          return ALLOWED_IMAGE_MIME_TYPES.some((t) => t === mimeType);
        } catch (_error: unknown) {}
      }
    }
  }

  return false;
}

const imageMimeTypeFormat = (mimeType: string) => {
  return ALLOWED_IMAGE_MIME_TYPES.some((m) => m === mimeType);
};

const createValidator = (opts?: AjvOptions): Ajv =>
  addFormats(new Ajv(opts ?? {}), ajvFormats)
    .addFormat("username", USERNAME_FORMAT)
    .addFormat("image-mime-type", imageMimeTypeFormat)
    .addKeyword({ type: "object", keyword: "instanceOf", validate: validateInstanceOrType })
    .addKeyword({ type: "null", keyword: "typeOf", validate: validateInstanceOrType })
    .addKeyword("exclusiveMinimumTimestamp")
    .addKeyword("exclusiveMaximumTimestamp")
    .addKeyword("minimumTimestamp")
    .addKeyword("maximumTimestamp")
    .addKeyword("minByteLength")
    .addKeyword("maxByteLength")
    .addKeyword({ type: "object", keyword: "binaryFormat", validate: validateBinaryFormat });

export const dataValidator: Ajv = createValidator();
export const queryValidator: Ajv = createValidator({ coerceTypes: true });

export const validateUsername = dataValidator.compile(usernameSchema);
export const validateEmail = dataValidator.compile(emailSchema);
export const validateUint8ArrayImage = dataValidator.compile(uint8ArrayImageSchema);
export const validateImageMimeType = dataValidator.compile(imageMimeTypeSchema);

export const getValidatorDebug = <T = unknown, R = T>(
  ...[schema, validator]: Parameters<typeof getValidator>
) => {
  const schemaValidator = getValidator<T, R>(schema, validator);
  return (data: T) => {
    console.debug(`getValidatorDebug: schema: ${schema.$id}, data:`, data);
    return schemaValidator(data);
  };
};

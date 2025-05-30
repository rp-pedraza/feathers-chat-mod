import type { Static } from "@feathersjs/typebox";
import { Type, defaultAppConfiguration, getValidator } from "@feathersjs/typebox";

import { dataValidator } from "./validators.js";

export const configurationSchema = Type.Object(
  {
    ...defaultAppConfiguration.properties,
    host: Type.String(),
    port: Type.Number(),
    public: Type.String(),
    proxy: Type.Object({
      host: Type.String()
    })
  },
  {
    additionalProperties: false,
    $id: "CustomApplicationConfiguration"
  }
);

export type ApplicationConfiguration = Static<typeof configurationSchema>;

export const configurationValidator = getValidator(configurationSchema, dataValidator);

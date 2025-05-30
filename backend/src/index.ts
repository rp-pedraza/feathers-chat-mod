import { Type } from "@sinclair/typebox";
import Ajv from "ajv";
import { app } from "./app.js";
import { logger } from "./logger.js";

const port = app.get("port");
const host = app.get("host");

process.on("unhandledRejection", (reason, p) => {
  console.error(reason);
  logger.error("Unhandled Rejection: ", p, reason);
});

const someIntersectionSchema = Type.Intersect(
  [
    Type.Object(
      {
        a: Type.Number()
      },
      {
        additionalProperties: false
      }
    ),
    Type.Object({
      b: Type.Number()
    })
  ],
  {
    $id: "SomeIntersection",
    additionalProperties: false
  }
);

console.log(new Ajv().validate(someIntersectionSchema, { a: 1234, b: 1234 }));

app.listen(port).then(() => {
  logger.info(`Feathers app listening on http://${host}:${port}`);
});

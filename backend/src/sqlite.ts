// For more information about this file see https://dove.feathersjs.com/guides/cli/databases.html
import type { Knex } from "knex";
import knex from "knex";
import type { Application } from "./declarations.js";

declare module "./declarations.js" {
  interface Configuration {
    sqliteClient: Knex;
  }
}

export const sqlite = (app: Application) => {
  const config = app.get("sqlite");
  const db = knex(config!);

  app.set("sqliteClient", db);
};

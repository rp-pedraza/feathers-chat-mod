// For more information about this file see https://dove.feathersjs.com/guides/cli/service.class.html#database-services
import type { Params } from "@feathersjs/feathers";
import type { KnexAdapterOptions, KnexAdapterParams } from "@feathersjs/knex";
import { KnexService } from "@feathersjs/knex";
import { Application } from "../../declarations.js";
import type { User, UserData, UserPatch, UserQuery } from "./users.schema.js";

export type UserParams = KnexAdapterParams<UserQuery>;

// By default calls the standard Knex adapter service methods but can be customized with your own functionality.
export class UserService extends KnexService<User, UserData, UserParams, UserPatch> {
  async getUsernameAvailability(_data: unknown, params: Params) {
    const username = params.query?.username;
    if (!username || typeof username !== "string") {
      throw new Error("Invalid username parameter.");
    }
    const query = { username };
    const available = (await this.find({ query })).total === 0;
    return { username, available };
  }

  async getEmailAvailability(_data: unknown, params: Params) {
    const email = params.query?.email;
    if (!email || typeof email !== "string") {
      throw new Error("Invalid email parameter.");
    }
    const query = { email };
    const available = (await this.find({ query })).total === 0;
    return { email, available };
  }
}

export const getOptions = (app: Application): KnexAdapterOptions => {
  return {
    paginate: app.get("paginate"),
    Model: app.get("sqliteClient"),
    name: "users"
  };
};

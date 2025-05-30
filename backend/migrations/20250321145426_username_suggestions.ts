import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.table("users", (t) => t.string("usernameSuggestions"));
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table("users", (t) => t.dropColumn("usernameSuggestions"));
}

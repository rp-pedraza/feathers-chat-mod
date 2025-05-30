import type { Knex } from "knex";

const tables = ["users", "messages", "local_avatars"];

export async function up(knex: Knex): Promise<void> {
  for (const table of tables) {
    await knex.schema.table(table, (t) => t.integer("version").notNullable().defaultTo(1));
  }
}

export async function down(knex: Knex): Promise<void> {
  for (const table of tables) {
    await knex.schema.table(table, (t) => t.dropColumn("version"));
  }
}

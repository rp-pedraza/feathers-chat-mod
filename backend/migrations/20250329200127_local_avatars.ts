import type { Knex } from "knex";

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable("local_avatars", (table) => {
    table.increments("id");
    table.integer("userId").unique();

    // https://github.com/knex/knex/issues/2585
    // https://stackoverflow.com/a/5775601/10580490
    switch (knex.client.config.client) {
      case "mysql":
      case "mysql2":
      case "mariasql":
        table.specificType("data", "MEDIUMBLOB");
        break;
      default:
        table.binary("data");
    }

    table.integer("size");
    table.string("mimeType");
    table.bigint("uploadedAt");
    table.string("filename");
  });
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.dropTable("local_avatars");
}

import { sql } from "drizzle-orm";
import {
  bigint,
  check,
  index,
  pgTable,
  smallint,
  text,
  timestamp,
  unique,
  uuid,
} from "drizzle-orm/pg-core";

export const sponsors = pgTable.withRLS(
  "sponsors",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id").notNull(),
    name: text().notNull(),
    tier: smallint().notNull(),
    aliases: text()
      .array()
      .notNull()
      .default(sql`ARRAY[]::text[]`),
    obligation: text().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    unique("sponsors_user_id_name_key").on(table.userId, table.name),
    index("sponsors_user_id_idx").on(table.userId),
    check("sponsors_tier_check", sql`${table.tier} between 1 and 3`),
  ],
);

export const incidents = pgTable.withRLS(
  "incidents",
  {
    id: bigint({ mode: "number" }).primaryKey().generatedAlwaysAsIdentity(),
    userId: uuid("user_id").notNull(),
    source: text({ enum: ["whatsapp", "email", "phone"] }).notNull(),
    rawMessage: text("raw_message").notNull(),
    sponsorId: bigint("sponsor_id", { mode: "number" }).references(
      () => sponsors.id,
      { onDelete: "set null" },
    ),
    sponsorName: text("sponsor_name").notNull(),
    sponsorLink: text("sponsor_link", {
      enum: ["named", "inferred", "unknown"],
    }).notNull(),
    contractTier: smallint("contract_tier"),
    tier: smallint().notNull(),
    priority: text({ enum: ["critical", "urgent", "routine"] }).notNull(),
    summary: text().notNull(),
    issue: text().notNull(),
    action: text().notNull(),
    routeTo: text("route_to").notNull(),
    deadline: text().notNull(),
    status: text({ enum: ["open", "acknowledged", "resolved"] })
      .notNull()
      .default("open"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    index("incidents_user_id_idx").on(table.userId),
    index("incidents_sponsor_id_idx").on(table.sponsorId),
    index("incidents_created_at_idx").on(table.createdAt),
    check("incidents_tier_check", sql`${table.tier} between 1 and 3`),
    check(
      "incidents_contract_tier_check",
      sql`${table.contractTier} is null or ${table.contractTier} between 1 and 3`,
    ),
    check(
      "incidents_message_length_check",
      sql`char_length(${table.rawMessage}) between 1 and 4000`,
    ),
    check(
      "incidents_source_check",
      sql`${table.source} in ('whatsapp', 'email', 'phone')`,
    ),
    check(
      "incidents_sponsor_link_check",
      sql`${table.sponsorLink} in ('named', 'inferred', 'unknown')`,
    ),
    check(
      "incidents_priority_check",
      sql`${table.priority} in ('critical', 'urgent', 'routine')`,
    ),
    check(
      "incidents_status_check",
      sql`${table.status} in ('open', 'acknowledged', 'resolved')`,
    ),
  ],
);

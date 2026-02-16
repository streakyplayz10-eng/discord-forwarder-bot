import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const botConfig = pgTable("bot_config", {
  id: serial("id").primaryKey(),
  sourceChannel: text("source_channel").notNull().default("live-alerts"),
  targetChannel1: text("target_channel_1").notNull().default("himothy-alerts"),
  targetChannel2: text("target_channel_2").notNull().default("himothy-trades"),
  isEnabled: boolean("is_enabled").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const messageLogs = pgTable("message_logs", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  sourceGuild: text("source_guild").notNull(),
  targetGuilds: text("target_guilds").notNull(), // JSON string of guild names
  status: text("status").notNull(), // 'success', 'partial', 'failed'
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertBotConfigSchema = createInsertSchema(botConfig);
export const insertMessageLogSchema = createInsertSchema(messageLogs);

export type BotConfig = typeof botConfig.$inferSelect;
export type InsertBotConfig = z.infer<typeof insertBotConfigSchema>;
export type MessageLog = typeof messageLogs.$inferSelect;
export type InsertMessageLog = z.infer<typeof insertMessageLogSchema>;

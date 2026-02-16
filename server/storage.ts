import { db } from "./db";
import {
  botConfig,
  messageLogs,
  type BotConfig,
  type InsertBotConfig,
  type MessageLog,
  type InsertMessageLog
} from "@shared/schema";
import { eq, desc } from "drizzle-orm";

export interface IStorage {
  getBotConfig(): Promise<BotConfig | undefined>;
  updateBotConfig(config: Partial<InsertBotConfig>): Promise<BotConfig>;
  createMessageLog(log: InsertMessageLog): Promise<MessageLog>;
  getMessageLogs(): Promise<MessageLog[]>;
}

export class DatabaseStorage implements IStorage {
  async getBotConfig(): Promise<BotConfig | undefined> {
    const configs = await db.select().from(botConfig).limit(1);
    if (configs.length === 0) {
      // Create default config if none exists
      const [newConfig] = await db.insert(botConfig).values({
        sourceChannel: "live-alerts",
        targetChannel1: "himothy-alerts",
        targetChannel2: "himothy-trades",
        isEnabled: true
      }).returning();
      return newConfig;
    }
    return configs[0];
  }

  async updateBotConfig(updates: Partial<InsertBotConfig>): Promise<BotConfig> {
    const existing = await this.getBotConfig();
    if (!existing) throw new Error("Config not initialized");
    
    const [updated] = await db.update(botConfig)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(botConfig.id, existing.id))
      .returning();
    return updated;
  }

  async createMessageLog(log: InsertMessageLog): Promise<MessageLog> {
    const [entry] = await db.insert(messageLogs).values(log).returning();
    return entry;
  }

  async getMessageLogs(): Promise<MessageLog[]> {
    return await db.select()
      .from(messageLogs)
      .orderBy(desc(messageLogs.createdAt))
      .limit(50);
  }
}

export const storage = new DatabaseStorage();

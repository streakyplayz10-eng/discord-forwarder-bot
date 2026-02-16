import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api } from "@shared/routes";
import { z } from "zod";
import { startDiscordBot } from "./bot";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  
  // API Routes
  app.get(api.config.get.path, async (_req, res) => {
    const config = await storage.getBotConfig();
    res.json(config);
  });

  app.post(api.config.update.path, async (req, res) => {
    try {
      const input = api.config.update.input.parse(req.body);
      const updated = await storage.updateBotConfig(input);
      // Restart or notify bot about config change if needed
      // For now, the bot loop reads config periodically or on event
      res.json(updated);
    } catch (err) {
      if (err instanceof z.ZodError) {
        return res.status(400).json({
          message: err.errors[0].message,
          field: err.errors[0].path.join('.'),
        });
      }
      throw err;
    }
  });

  app.get(api.logs.list.path, async (_req, res) => {
    const logs = await storage.getMessageLogs();
    res.json(logs);
  });

  // Initialize Discord Bot
  try {
    console.log("Starting Discord bot...");
    await startDiscordBot();
    console.log("Discord bot started successfully");
  } catch (error) {
    console.error("Failed to start Discord bot:", error);
  }

  return httpServer;
}

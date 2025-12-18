import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs";
import path from "path";

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve chapter content as markdown
  app.get("/api/chapters/:id", async (req, res) => {
    const chapterId = req.params.id;
    const chapterPath = path.join(process.cwd(), "content", "chapters", `${chapterId}.md`);
    
    try {
      if (fs.existsSync(chapterPath)) {
        const content = fs.readFileSync(chapterPath, "utf-8");
        res.json({ id: chapterId, content });
      } else {
        res.status(404).json({ error: "Chapter not found" });
      }
    } catch (error) {
      console.error("Error reading chapter:", error);
      res.status(500).json({ error: "Failed to read chapter" });
    }
  });

  // List all available chapters
  app.get("/api/chapters", async (req, res) => {
    const chaptersDir = path.join(process.cwd(), "content", "chapters");
    
    try {
      if (fs.existsSync(chaptersDir)) {
        const files = fs.readdirSync(chaptersDir)
          .filter(f => f.endsWith(".md"))
          .map(f => f.replace(".md", ""));
        res.json({ chapters: files });
      } else {
        res.json({ chapters: [] });
      }
    } catch (error) {
      console.error("Error listing chapters:", error);
      res.status(500).json({ error: "Failed to list chapters" });
    }
  });

  return httpServer;
}

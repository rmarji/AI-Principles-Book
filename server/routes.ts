import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs";
import path from "path";

interface Subsection {
  id: string;
  title: string;
  level: number;
}

function extractSubsections(content: string): Subsection[] {
  const lines = content.split('\n');
  const subsections: Subsection[] = [];
  
  for (const line of lines) {
    const h2Match = line.match(/^## (.+)$/);
    const h3Match = line.match(/^### (.+)$/);
    
    if (h2Match) {
      const title = h2Match[1].trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      subsections.push({ id, title, level: 2 });
    } else if (h3Match) {
      const title = h3Match[1].trim();
      const id = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      subsections.push({ id, title, level: 3 });
    }
  }
  
  return subsections;
}

function countWords(content: string): number {
  const textOnly = content
    .replace(/^#+\s+.+$/gm, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[*_`#\[\]]/g, '')
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`[^`]+`/g, '')
    .trim();
  
  const words = textOnly.split(/\s+/).filter(word => word.length > 0);
  return words.length;
}

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  // Serve chapter content as markdown with metadata
  app.get("/api/chapters/:id", async (req, res) => {
    const chapterId = req.params.id;
    const chapterPath = path.join(process.cwd(), "content", "chapters", `${chapterId}.md`);
    
    try {
      if (fs.existsSync(chapterPath)) {
        const content = fs.readFileSync(chapterPath, "utf-8");
        const wordCount = countWords(content);
        const subsections = extractSubsections(content);
        res.json({ id: chapterId, content, wordCount, subsections });
      } else {
        res.status(404).json({ error: "Chapter not found" });
      }
    } catch (error) {
      console.error("Error reading chapter:", error);
      res.status(500).json({ error: "Failed to read chapter" });
    }
  });

  // List all available chapters with metadata
  app.get("/api/chapters", async (req, res) => {
    const chaptersDir = path.join(process.cwd(), "content", "chapters");
    
    try {
      if (fs.existsSync(chaptersDir)) {
        const files = fs.readdirSync(chaptersDir).filter(f => f.endsWith(".md"));
        const chapters = files.map(f => {
          const id = f.replace(".md", "");
          const filePath = path.join(chaptersDir, f);
          const content = fs.readFileSync(filePath, "utf-8");
          const wordCount = countWords(content);
          const subsections = extractSubsections(content);
          return { id, wordCount, subsections };
        });
        res.json({ chapters });
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

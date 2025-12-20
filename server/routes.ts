import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.AI_INTEGRATIONS_OPENAI_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
});

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

  // Serve critique files for chapters
  app.get("/api/critiques/:id", async (req, res) => {
    const chapterId = req.params.id;
    const critiquePath = path.join(process.cwd(), "critiques", `${chapterId}-critique.md`);
    
    try {
      if (fs.existsSync(critiquePath)) {
        const content = fs.readFileSync(critiquePath, "utf-8");
        res.json({ id: chapterId, content });
      } else {
        res.status(404).json({ error: "Critique not found" });
      }
    } catch (error) {
      console.error("Error reading critique:", error);
      res.status(500).json({ error: "Failed to read critique" });
    }
  });

  // List all available critiques
  app.get("/api/critiques", async (req, res) => {
    const critiquesDir = path.join(process.cwd(), "critiques");
    
    try {
      if (fs.existsSync(critiquesDir)) {
        const files = fs.readdirSync(critiquesDir).filter(f => f.endsWith("-critique.md"));
        const critiques = files.map(f => {
          const id = f.replace("-critique.md", "");
          return { id, filename: f };
        });
        res.json({ critiques });
      } else {
        res.json({ critiques: [] });
      }
    } catch (error) {
      console.error("Error listing critiques:", error);
      res.status(500).json({ error: "Failed to list critiques" });
    }
  });

  // AI Chat endpoint with streaming
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages } = req.body;
      
      if (!messages || !Array.isArray(messages)) {
        return res.status(400).json({ error: "Messages array required" });
      }

      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const stream = await openai.chat.completions.create({
        model: "gpt-4.1-mini",
        messages: messages,
        stream: true,
        max_completion_tokens: 1024,
      });

      for await (const chunk of stream) {
        const content = chunk.choices[0]?.delta?.content || "";
        if (content) {
          res.write(`data: ${JSON.stringify({ content })}\n\n`);
        }
      }

      res.write("data: [DONE]\n\n");
      res.end();
    } catch (error) {
      console.error("Chat error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ error: "Chat failed" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to process chat" });
      }
    }
  });

  return httpServer;
}

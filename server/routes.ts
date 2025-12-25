import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import fs from "fs";
import path from "path";
import OpenAI from "openai";
import Anthropic from "@anthropic-ai/sdk";
import { db } from "./db";
import { critiques, critiqueFindings, editorialGuidelines } from "@shared/schema";
import { eq, desc } from "drizzle-orm";

// Initialize OpenAI only if API key is available
const apiKey = process.env.AI_INTEGRATIONS_OPENAI_API_KEY || process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({
  apiKey,
  baseURL: process.env.AI_INTEGRATIONS_OPENAI_BASE_URL,
}) : null;

// Initialize Anthropic/Claude
const anthropic = new Anthropic({
  apiKey: process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY,
  baseURL: process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL,
});

// Critique perspective definitions
const CRITIQUE_PERSPECTIVES = {
  executive_editor: {
    name: "Executive Editor",
    icon: "Edit3",
    color: "blue",
    prompt: `You are a senior Executive Editor at a major business publisher. Analyze this chapter for:
- Structure and flow (does the narrative arc work?)
- Clarity of arguments and key takeaways
- Writing quality (wordiness, redundancy, passive voice)
- Chapter length and pacing (target: 10,000-11,000 words)
- Opening hook and closing call-to-action strength
- Consistency with the book's overall voice and style`
  },
  marketing_strategist: {
    name: "Marketing Strategist",
    icon: "TrendingUp",
    color: "green",
    prompt: `You are a Marketing Strategist specializing in business books. Analyze this chapter for:
- Hook strength and reader engagement potential
- Quotable moments and shareable insights
- Value proposition clarity (what does the reader GET from this?)
- Competitive differentiation (how is this different from other AI books?)
- Target audience alignment (busy executives who need practical guidance)
- Call-to-action effectiveness and next steps`
  },
  subject_matter_expert: {
    name: "AI/Tech Expert",
    icon: "Brain",
    color: "purple",
    prompt: `You are a Senior AI/Technology Expert and consultant. Analyze this chapter for:
- Technical accuracy of AI concepts and terminology
- Practical applicability of the advice given
- Current relevance (is this advice up-to-date for 2025?)
- Missing important considerations or edge cases
- Balance between simplification and accuracy
- Credibility of examples and case studies`
  },
  reader_advocate: {
    name: "Reader Experience",
    icon: "User",
    color: "orange",
    prompt: `You are a Reader Experience Advocate representing the target audience (busy executives, non-technical). Analyze this chapter for:
- Accessibility (can a non-technical leader understand this?)
- Actionability (can they implement this immediately?)
- Engagement (is this interesting or boring?)
- Overwhelm factor (too much information at once?)
- Motivation and inspiration (do they feel empowered?)
- Practical examples and real-world scenarios`
  }
};

type PerspectiveKey = keyof typeof CRITIQUE_PERSPECTIVES;

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
    // Also check appendices directory
    const appendixPath = path.join(process.cwd(), "content", "appendices", `${chapterId}.md`);

    try {
      let filePath = null;
      if (fs.existsSync(chapterPath)) {
        filePath = chapterPath;
      } else if (fs.existsSync(appendixPath)) {
        filePath = appendixPath;
      }

      if (filePath) {
        const content = fs.readFileSync(filePath, "utf-8");
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

  // List all available chapters with metadata (includes appendices)
  app.get("/api/chapters", async (_req, res) => {
    const chaptersDir = path.join(process.cwd(), "content", "chapters");
    const appendicesDir = path.join(process.cwd(), "content", "appendices");

    try {
      const chapters: Array<{ id: string; wordCount: number; subsections: Subsection[] }> = [];

      // Read chapters
      if (fs.existsSync(chaptersDir)) {
        const files = fs.readdirSync(chaptersDir).filter(f => f.endsWith(".md"));
        for (const f of files) {
          const id = f.replace(".md", "");
          const filePath = path.join(chaptersDir, f);
          const content = fs.readFileSync(filePath, "utf-8");
          const wordCount = countWords(content);
          const subsections = extractSubsections(content);
          chapters.push({ id, wordCount, subsections });
        }
      }

      // Read appendices
      if (fs.existsSync(appendicesDir)) {
        const files = fs.readdirSync(appendicesDir).filter(f => f.endsWith(".md"));
        for (const f of files) {
          const id = f.replace(".md", "");
          const filePath = path.join(appendicesDir, f);
          const content = fs.readFileSync(filePath, "utf-8");
          const wordCount = countWords(content);
          const subsections = extractSubsections(content);
          chapters.push({ id, wordCount, subsections });
        }
      }

      res.json({ chapters });
    } catch (error) {
      console.error("Error listing chapters:", error);
      res.status(500).json({ error: "Failed to list chapters" });
    }
  });

  // Serve critique files for chapters (prefer JSON, fall back to markdown)
  app.get("/api/critiques/:id", async (req, res) => {
    const chapterId = req.params.id;
    const jsonPath = path.join(process.cwd(), "critiques", `${chapterId}-critique.json`);
    const mdPath = path.join(process.cwd(), "critiques", `${chapterId}-critique.md`);

    try {
      // Try JSON first (structured format)
      if (fs.existsSync(jsonPath)) {
        const content = fs.readFileSync(jsonPath, "utf-8");
        const critique = JSON.parse(content);
        res.json(critique);
      }
      // Fall back to markdown (legacy format)
      else if (fs.existsSync(mdPath)) {
        const content = fs.readFileSync(mdPath, "utf-8");
        res.json({ id: chapterId, content, legacy: true });
      } else {
        res.status(404).json({ error: "Critique not found" });
      }
    } catch (error) {
      console.error("Error reading critique:", error);
      res.status(500).json({ error: "Failed to read critique" });
    }
  });

  // Serve just the scorecard for quick loading in chapter header
  app.get("/api/critiques/:id/scorecard", async (req, res) => {
    const chapterId = req.params.id;
    const jsonPath = path.join(process.cwd(), "critiques", `${chapterId}-critique.json`);

    try {
      if (fs.existsSync(jsonPath)) {
        const content = fs.readFileSync(jsonPath, "utf-8");
        const critique = JSON.parse(content);
        res.json({
          id: chapterId,
          scorecard: critique.scorecard
        });
      } else {
        res.status(404).json({ error: "Scorecard not found" });
      }
    } catch (error) {
      console.error("Error reading scorecard:", error);
      res.status(500).json({ error: "Failed to read scorecard" });
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

  // Get available critique perspectives
  app.get("/api/critique/perspectives", async (_req, res) => {
    const perspectives = Object.entries(CRITIQUE_PERSPECTIVES).map(([key, value]) => ({
      id: key,
      name: value.name,
      icon: value.icon,
      color: value.color
    }));
    res.json({ perspectives });
  });

  // Get AI critiques for a chapter
  app.get("/api/critique/chapter/:chapterId", async (req, res) => {
    try {
      const { chapterId } = req.params;
      
      const chapterCritiques = await db.select().from(critiques)
        .where(eq(critiques.chapterId, chapterId))
        .orderBy(desc(critiques.createdAt));
      
      if (chapterCritiques.length === 0) {
        return res.json({ critiques: [], findings: [] });
      }

      const latestCritique = chapterCritiques[0];
      const findings = await db.select().from(critiqueFindings)
        .where(eq(critiqueFindings.critiqueId, latestCritique.id));

      res.json({ 
        critique: latestCritique, 
        findings: findings,
        history: chapterCritiques 
      });
    } catch (error) {
      console.error("Error fetching critiques:", error);
      res.status(500).json({ error: "Failed to fetch critiques" });
    }
  });

  // Generate AI critique for a chapter
  app.post("/api/critique/generate", async (req, res) => {
    try {
      const { chapterId, perspectives: selectedPerspectives } = req.body;

      if (!chapterId || !selectedPerspectives || !Array.isArray(selectedPerspectives)) {
        return res.status(400).json({ error: "chapterId and perspectives array required" });
      }

      // Validate perspectives
      const validPerspectives = selectedPerspectives.filter(
        (p: string) => p in CRITIQUE_PERSPECTIVES
      ) as PerspectiveKey[];

      if (validPerspectives.length === 0) {
        return res.status(400).json({ error: "No valid perspectives provided" });
      }

      // Load chapter content
      const chapterPath = path.join(process.cwd(), "content", "chapters", `${chapterId}.md`);
      const appendixPath = path.join(process.cwd(), "content", "appendices", `${chapterId}.md`);
      
      let content = "";
      if (fs.existsSync(chapterPath)) {
        content = fs.readFileSync(chapterPath, "utf-8");
      } else if (fs.existsSync(appendixPath)) {
        content = fs.readFileSync(appendixPath, "utf-8");
      } else {
        return res.status(404).json({ error: "Chapter not found" });
      }

      // Create critique record
      const [critiqueRecord] = await db.insert(critiques).values({
        chapterId,
        perspectives: validPerspectives,
        status: "generating"
      }).returning();

      // Set up SSE for streaming progress
      res.setHeader("Content-Type", "text/event-stream");
      res.setHeader("Cache-Control", "no-cache");
      res.setHeader("Connection", "keep-alive");

      const sendEvent = (event: object) => {
        res.write(`data: ${JSON.stringify(event)}\n\n`);
      };

      sendEvent({ type: "started", critiqueId: critiqueRecord.id, totalPerspectives: validPerspectives.length });

      const allFindings: typeof critiqueFindings.$inferSelect[] = [];

      // Load editorial guidelines
      const [guidelines] = await db.select().from(editorialGuidelines).limit(1);
      let guidelinesContext = "";
      if (guidelines?.critiqueRules) {
        guidelinesContext = `\n\nEDITORIAL CRITIQUE RULES TO FOLLOW:\n${guidelines.critiqueRules}`;
      }

      // Generate critique for each perspective
      for (let i = 0; i < validPerspectives.length; i++) {
        const perspectiveKey = validPerspectives[i];
        const perspective = CRITIQUE_PERSPECTIVES[perspectiveKey];

        sendEvent({ 
          type: "perspective_started", 
          perspective: perspectiveKey, 
          name: perspective.name,
          index: i + 1,
          total: validPerspectives.length
        });

        try {
          const systemPrompt = `${perspective.prompt}${guidelinesContext}

You are analyzing a chapter from "The Leader's Guide to AI Teams" by Rayo Marji and Rich Bello.

Provide your critique as a JSON array of findings. Each finding should have:
- category: A category like "Structure", "Clarity", "Engagement", "Accuracy", "Actionability", etc.
- title: A brief title for the issue (under 10 words)
- description: Detailed explanation of the issue (2-3 sentences)
- suggestion: Specific recommendation for improvement (1-2 sentences)
- priority: "high", "medium", or "low"
- sectionReference: The heading or section this refers to (if applicable)

Return ONLY valid JSON array, no markdown formatting, no explanation text.
Example: [{"category":"Structure","title":"Weak opening hook","description":"The chapter starts with definitions rather than a compelling story or problem.","suggestion":"Begin with a real executive's story about AI adoption challenges.","priority":"high","sectionReference":"Introduction"}]`;

          const response = await anthropic.messages.create({
            model: "claude-sonnet-4-5",
            max_tokens: 4096,
            messages: [
              { role: "user", content: `Analyze this chapter:\n\n${content}` }
            ],
            system: systemPrompt
          });

          const textContent = response.content.find(c => c.type === "text");
          if (textContent && textContent.type === "text") {
            try {
              // Robust JSON parsing function with multiple fallback strategies
              function parseRobustJSON(rawText: string): any[] {
                let jsonStr = rawText.trim();
                
                // Step 1: Remove markdown code fences
                if (jsonStr.includes("```")) {
                  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
                  if (jsonMatch) {
                    jsonStr = jsonMatch[1].trim();
                  } else {
                    jsonStr = jsonStr.replace(/```json?\s*/g, "").replace(/```\s*/g, "").trim();
                  }
                }
                
                // Step 2: Extract just the JSON array
                const arrayStart = jsonStr.indexOf("[");
                const arrayEnd = jsonStr.lastIndexOf("]");
                if (arrayStart !== -1 && arrayEnd !== -1 && arrayEnd > arrayStart) {
                  jsonStr = jsonStr.slice(arrayStart, arrayEnd + 1);
                }
                
                // Step 3: Clean up common JSON issues
                jsonStr = jsonStr
                  .replace(/[\u2018\u2019]/g, "'")  // Smart single quotes
                  .replace(/[\u201C\u201D]/g, '"')  // Smart double quotes
                  .replace(/,\s*}/g, '}')           // Trailing commas before }
                  .replace(/,\s*]/g, ']');          // Trailing commas before ]
                
                // Try parsing the cleaned JSON
                try {
                  return JSON.parse(jsonStr);
                } catch (e) {
                  // Fallback: Extract individual objects using balanced brace matching
                  const findings: any[] = [];
                  let depth = 0;
                  let objectStart = -1;
                  
                  for (let i = 0; i < jsonStr.length; i++) {
                    const char = jsonStr[i];
                    if (char === '{') {
                      if (depth === 0) objectStart = i;
                      depth++;
                    } else if (char === '}') {
                      depth--;
                      if (depth === 0 && objectStart !== -1) {
                        const objectStr = jsonStr.slice(objectStart, i + 1);
                        try {
                          const obj = JSON.parse(objectStr);
                          if (obj && (obj.title || obj.description || obj.category)) {
                            findings.push(obj);
                          }
                        } catch {
                          // Try with additional cleanup
                          try {
                            const cleaned = objectStr
                              .replace(/:\s*"([^"]*)"([^,}\s])/g, ': "$1"$2') // Fix missing escapes
                              .replace(/\n/g, '\\n');
                            const obj = JSON.parse(cleaned);
                            if (obj && (obj.title || obj.description || obj.category)) {
                              findings.push(obj);
                            }
                          } catch {
                            // Skip unparseable object
                          }
                        }
                        objectStart = -1;
                      }
                    }
                  }
                  
                  if (findings.length > 0) return findings;
                  throw e; // Re-throw if no findings recovered
                }
              }
              
              const findings = parseRobustJSON(textContent.text);
              
              if (Array.isArray(findings) && findings.length > 0) {
                for (const finding of findings) {
                  const [savedFinding] = await db.insert(critiqueFindings).values({
                    critiqueId: critiqueRecord.id,
                    perspective: perspectiveKey,
                    category: finding.category || "General",
                    title: finding.title || "Untitled Finding",
                    description: finding.description || "",
                    suggestion: finding.suggestion || null,
                    priority: ["high", "medium", "low"].includes(finding.priority) ? finding.priority : "medium",
                    sectionReference: finding.sectionReference || null,
                    status: "pending"
                  }).returning();

                  allFindings.push(savedFinding);
                }

                sendEvent({
                  type: "perspective_complete",
                  perspective: perspectiveKey,
                  findingsCount: findings.length
                });
              } else {
                sendEvent({
                  type: "perspective_complete",
                  perspective: perspectiveKey,
                  findingsCount: 0,
                  warning: "No findings extracted"
                });
              }
            } catch (parseError) {
              console.error("Failed to parse critique JSON:", parseError, textContent.text.slice(0, 200));
              sendEvent({
                type: "perspective_error",
                perspective: perspectiveKey,
                error: "Failed to parse AI response - please try again"
              });
            }
          }
        } catch (aiError) {
          console.error("AI critique error:", aiError);
          sendEvent({
            type: "perspective_error",
            perspective: perspectiveKey,
            error: aiError instanceof Error ? aiError.message : "AI generation failed"
          });
        }
      }

      // Update critique status
      await db.update(critiques)
        .set({ status: "completed" })
        .where(eq(critiques.id, critiqueRecord.id));

      sendEvent({
        type: "complete",
        critiqueId: critiqueRecord.id,
        totalFindings: allFindings.length
      });

      res.end();
    } catch (error) {
      console.error("Critique generation error:", error);
      if (res.headersSent) {
        res.write(`data: ${JSON.stringify({ type: "error", error: "Critique generation failed" })}\n\n`);
        res.end();
      } else {
        res.status(500).json({ error: "Failed to generate critique" });
      }
    }
  });

  // Update finding status (approve/reject)
  app.patch("/api/critique/finding/:findingId", async (req, res) => {
    try {
      const { findingId } = req.params;
      const { status } = req.body;

      if (!["pending", "approved", "rejected", "addressed"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      const [updated] = await db.update(critiqueFindings)
        .set({ status })
        .where(eq(critiqueFindings.id, parseInt(findingId)))
        .returning();

      res.json(updated);
    } catch (error) {
      console.error("Error updating finding:", error);
      res.status(500).json({ error: "Failed to update finding" });
    }
  });

  // AI Chat endpoint with streaming
  app.post("/api/chat", async (req, res) => {
    try {
      if (!openai) {
        return res.status(503).json({ error: "AI chat is not configured. Please set OPENAI_API_KEY." });
      }

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

  // Editorial Guidelines endpoints
  app.get("/api/editorial-guidelines", async (req, res) => {
    try {
      const [guidelines] = await db.select().from(editorialGuidelines).limit(1);
      res.json(guidelines || null);
    } catch (error) {
      console.error("Error fetching guidelines:", error);
      res.status(500).json({ error: "Failed to fetch editorial guidelines" });
    }
  });

  app.post("/api/editorial-guidelines", async (req, res) => {
    try {
      const { critiqueRules, rewritingInstructions, toneVoice, formattingRequirements, targetAudience, contentStructure } = req.body;

      const existing = await db.select().from(editorialGuidelines).limit(1);

      if (existing.length > 0) {
        const [updated] = await db.update(editorialGuidelines)
          .set({
            critiqueRules,
            rewritingInstructions,
            toneVoice,
            formattingRequirements,
            targetAudience,
            contentStructure,
            updatedAt: new Date()
          })
          .where(eq(editorialGuidelines.id, existing[0].id))
          .returning();
        res.json(updated);
      } else {
        const [created] = await db.insert(editorialGuidelines)
          .values({
            critiqueRules,
            rewritingInstructions,
            toneVoice,
            formattingRequirements,
            targetAudience,
            contentStructure
          })
          .returning();
        res.json(created);
      }
    } catch (error) {
      console.error("Error saving guidelines:", error);
      res.status(500).json({ error: "Failed to save editorial guidelines" });
    }
  });

  // AI Fix endpoint - generates a fix for a critique finding
  app.post("/api/critique/fix", async (req, res) => {
    try {
      const { findingId, chapterId } = req.body;

      if (!findingId || !chapterId) {
        return res.status(400).json({ error: "Finding ID and chapter ID required" });
      }

      const [finding] = await db.select().from(critiqueFindings).where(eq(critiqueFindings.id, findingId));
      if (!finding) {
        return res.status(404).json({ error: "Finding not found" });
      }

      const chapterPath = path.join(process.cwd(), "content", "chapters", `${chapterId}.md`);
      if (!fs.existsSync(chapterPath)) {
        return res.status(404).json({ error: "Chapter not found" });
      }
      const chapterContent = fs.readFileSync(chapterPath, "utf-8");

      const [guidelines] = await db.select().from(editorialGuidelines).limit(1);

      let guidelinesContext = "";
      if (guidelines) {
        guidelinesContext = `
EDITORIAL GUIDELINES TO FOLLOW:
${guidelines.toneVoice ? `Tone & Voice: ${guidelines.toneVoice}` : ""}
${guidelines.formattingRequirements ? `Formatting: ${guidelines.formattingRequirements}` : ""}
${guidelines.rewritingInstructions ? `Rewriting Instructions: ${guidelines.rewritingInstructions}` : ""}
${guidelines.targetAudience ? `Target Audience: ${guidelines.targetAudience}` : ""}
${guidelines.contentStructure ? `Content Structure: ${guidelines.contentStructure}` : ""}
`;
      }

      const systemPrompt = `You are an expert book editor tasked with addressing a specific critique finding.
${guidelinesContext}

FINDING TO ADDRESS:
Title: ${finding.title}
Category: ${finding.category}
Description: ${finding.description}
Suggestion: ${finding.suggestion || "No specific suggestion provided"}
Section Reference: ${finding.sectionReference || "Not specified"}

INSTRUCTIONS:
1. Identify the relevant section in the chapter that needs to be addressed
2. Provide a rewritten/improved version of that section that addresses the critique
3. Keep the same overall structure and flow
4. Maintain consistency with the rest of the chapter
5. Return your response as JSON with the following format:
{
  "originalSection": "The original text that needs to be changed (copy exact text from chapter)",
  "revisedSection": "Your improved version of the text",
  "explanation": "Brief explanation of what you changed and why"
}

IMPORTANT: The originalSection must be an EXACT match of text from the chapter so it can be found and replaced.`;

      const response = await anthropic.messages.create({
        model: "claude-sonnet-4-5",
        max_tokens: 4096,
        messages: [
          { role: "user", content: `Chapter Content:\n\n${chapterContent}` }
        ],
        system: systemPrompt
      });

      const textContent = response.content.find(c => c.type === "text");
      if (!textContent || textContent.type !== "text") {
        return res.status(500).json({ error: "No response from AI" });
      }

      let jsonStr = textContent.text.trim();
      if (jsonStr.includes("```")) {
        const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
        if (jsonMatch) {
          jsonStr = jsonMatch[1].trim();
        }
      }

      const fix = JSON.parse(jsonStr);
      res.json({
        findingId,
        originalSection: fix.originalSection,
        revisedSection: fix.revisedSection,
        explanation: fix.explanation
      });
    } catch (error) {
      console.error("Error generating fix:", error);
      res.status(500).json({ error: "Failed to generate fix" });
    }
  });

  // Apply fix to chapter
  app.post("/api/critique/apply-fix", async (req, res) => {
    try {
      const { findingId, chapterId, originalSection, revisedSection } = req.body;

      if (!chapterId || !originalSection || !revisedSection) {
        return res.status(400).json({ error: "Chapter ID, original section, and revised section required" });
      }

      const chapterPath = path.join(process.cwd(), "content", "chapters", `${chapterId}.md`);
      if (!fs.existsSync(chapterPath)) {
        return res.status(404).json({ error: "Chapter not found" });
      }

      let chapterContent = fs.readFileSync(chapterPath, "utf-8");
      
      if (!chapterContent.includes(originalSection)) {
        return res.status(400).json({ error: "Original section not found in chapter - the text may have already been changed" });
      }

      chapterContent = chapterContent.replace(originalSection, revisedSection);
      fs.writeFileSync(chapterPath, chapterContent, "utf-8");

      if (findingId) {
        await db.update(critiqueFindings)
          .set({ status: "addressed" })
          .where(eq(critiqueFindings.id, findingId));
      }

      res.json({ success: true, message: "Fix applied successfully" });
    } catch (error) {
      console.error("Error applying fix:", error);
      res.status(500).json({ error: "Failed to apply fix" });
    }
  });

  return httpServer;
}

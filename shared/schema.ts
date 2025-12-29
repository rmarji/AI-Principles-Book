import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Books - the core entity for multi-book platform
export const books = pgTable("books", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  authors: text("authors").notNull(),
  description: text("description"),
  coverColor: text("cover_color").default("#6366f1"),
  coverPrompt: text("cover_prompt"),
  coverImageUrl: text("cover_image_url"),
  outlineSummary: text("outline_summary"),
  status: text("status").notNull().default("draft"), // draft, editing, review, published
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertBookSchema = createInsertSchema(books).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Book = typeof books.$inferSelect;
export type InsertBook = z.infer<typeof insertBookSchema>;

// Chapters - stored in database, linked to books
export const chapters = pgTable("chapters", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  slug: text("slug").notNull(),
  title: text("title").notNull(),
  subtitle: text("subtitle"),
  content: text("content"),
  sortOrder: integer("sort_order").notNull().default(0),
  wordCount: integer("word_count").default(0),
  status: text("status").notNull().default("draft"), // draft, editing, review, approved
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertChapterSchema = createInsertSchema(chapters).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export type Chapter = typeof chapters.$inferSelect;
export type InsertChapter = z.infer<typeof insertChapterSchema>;

// Book Outline Chapters - top-level chapter entries in the outline with approval workflow
export const outlineChapters = pgTable("outline_chapters", {
  id: serial("id").primaryKey(),
  bookId: integer("book_id").notNull().references(() => books.id, { onDelete: "cascade" }),
  sortOrder: integer("sort_order").notNull().default(0),
  title: text("title").notNull(),
  summary: text("summary"),
  guidanceNotes: text("guidance_notes"),
  approvalStatus: text("approval_status").notNull().default("draft"), // draft, in_review, approved
  approvedAt: timestamp("approved_at"),
  aiGenerated: boolean("ai_generated").default(false),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertOutlineChapterSchema = createInsertSchema(outlineChapters).omit({
  id: true,
  createdAt: true,
  approvedAt: true,
});

export type OutlineChapter = typeof outlineChapters.$inferSelect;
export type InsertOutlineChapter = z.infer<typeof insertOutlineChapterSchema>;

// Outline Sections - hierarchical subsections within outline chapters
export const outlineSections = pgTable("outline_sections", {
  id: serial("id").primaryKey(),
  outlineChapterId: integer("outline_chapter_id").notNull().references(() => outlineChapters.id, { onDelete: "cascade" }),
  parentSectionId: integer("parent_section_id"),
  sortOrder: integer("sort_order").notNull().default(0),
  level: integer("level").notNull().default(1), // 1 = direct child of chapter, 2+ = nested
  title: text("title").notNull(),
  summary: text("summary"),
  guidanceNotes: text("guidance_notes"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertOutlineSectionSchema = createInsertSchema(outlineSections).omit({
  id: true,
  createdAt: true,
});

export type OutlineSection = typeof outlineSections.$inferSelect;
export type InsertOutlineSection = z.infer<typeof insertOutlineSectionSchema>;

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export const conversations = pgTable("conversations", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  chapterId: text("chapter_id"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").notNull().references(() => conversations.id, { onDelete: "cascade" }),
  role: text("role").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertConversationSchema = createInsertSchema(conversations).omit({
  id: true,
  createdAt: true,
});

export const insertMessageSchema = createInsertSchema(messages).omit({
  id: true,
  createdAt: true,
});

export type Conversation = typeof conversations.$inferSelect;
export type InsertConversation = z.infer<typeof insertConversationSchema>;
export type Message = typeof messages.$inferSelect;
export type InsertMessage = z.infer<typeof insertMessageSchema>;

// AI Critique System
export const critiques = pgTable("critiques", {
  id: serial("id").primaryKey(),
  chapterId: text("chapter_id").notNull(),
  perspectives: text("perspectives").array().notNull(),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const critiqueFindings = pgTable("critique_findings", {
  id: serial("id").primaryKey(),
  critiqueId: integer("critique_id").notNull().references(() => critiques.id, { onDelete: "cascade" }),
  perspective: text("perspective").notNull(),
  category: text("category").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  suggestion: text("suggestion"),
  priority: text("priority").notNull().default("medium"),
  sectionReference: text("section_reference"),
  status: text("status").notNull().default("pending"),
  createdAt: timestamp("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertCritiqueSchema = createInsertSchema(critiques).omit({
  id: true,
  createdAt: true,
});

export const insertCritiqueFindingSchema = createInsertSchema(critiqueFindings).omit({
  id: true,
  createdAt: true,
});

export type Critique = typeof critiques.$inferSelect;
export type InsertCritique = z.infer<typeof insertCritiqueSchema>;
export type CritiqueFinding = typeof critiqueFindings.$inferSelect;
export type InsertCritiqueFinding = z.infer<typeof insertCritiqueFindingSchema>;

// Editorial Guidelines
export const editorialGuidelines = pgTable("editorial_guidelines", {
  id: serial("id").primaryKey(),
  critiqueRules: text("critique_rules"),
  rewritingInstructions: text("rewriting_instructions"),
  toneVoice: text("tone_voice"),
  formattingRequirements: text("formatting_requirements"),
  targetAudience: text("target_audience"),
  contentStructure: text("content_structure"),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertEditorialGuidelinesSchema = createInsertSchema(editorialGuidelines).omit({
  id: true,
  updatedAt: true,
});

export type EditorialGuidelines = typeof editorialGuidelines.$inferSelect;
export type InsertEditorialGuidelines = z.infer<typeof insertEditorialGuidelinesSchema>;

// AI Prompts Configuration
export const promptsConfig = pgTable("prompts_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
});

export const insertPromptsConfigSchema = createInsertSchema(promptsConfig).omit({
  id: true,
  updatedAt: true,
});

export type PromptsConfigRow = typeof promptsConfig.$inferSelect;
export type InsertPromptsConfig = z.infer<typeof insertPromptsConfigSchema>;

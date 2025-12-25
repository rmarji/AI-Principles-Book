import { sql } from "drizzle-orm";
import { pgTable, text, varchar, serial, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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

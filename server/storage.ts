import { 
  type User, type InsertUser,
  type Book, type InsertBook, books,
  type Chapter, type InsertChapter, chapters,
  type OutlineChapter, type InsertOutlineChapter, outlineChapters,
  type OutlineSection, type InsertOutlineSection, outlineSections,
  users
} from "@shared/schema";
import { db } from "./db";
import { eq, asc, and } from "drizzle-orm";

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Books
  getBooks(): Promise<Book[]>;
  getBook(id: number): Promise<Book | undefined>;
  getDefaultBook(): Promise<Book | undefined>;
  createBook(book: InsertBook): Promise<Book>;
  updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined>;
  deleteBook(id: number): Promise<boolean>;
  
  // Chapters
  getChaptersByBook(bookId: number): Promise<Chapter[]>;
  getChapter(id: number): Promise<Chapter | undefined>;
  getChapterBySlug(bookId: number, slug: string): Promise<Chapter | undefined>;
  createChapter(chapter: InsertChapter): Promise<Chapter>;
  updateChapter(id: number, chapter: Partial<InsertChapter>): Promise<Chapter | undefined>;
  deleteChapter(id: number): Promise<boolean>;
  
  // Outline Chapters (hierarchical outline top-level)
  getOutlineChaptersByBook(bookId: number): Promise<OutlineChapter[]>;
  getOutlineChapter(id: number): Promise<OutlineChapter | undefined>;
  createOutlineChapter(chapter: InsertOutlineChapter): Promise<OutlineChapter>;
  updateOutlineChapter(id: number, chapter: Partial<InsertOutlineChapter>): Promise<OutlineChapter | undefined>;
  deleteOutlineChapter(id: number): Promise<boolean>;
  deleteOutlineChaptersByBook(bookId: number): Promise<boolean>;
  approveOutlineChapter(id: number): Promise<OutlineChapter | undefined>;
  
  // Outline Sections (subsections within outline chapters)
  getOutlineSectionsByChapter(outlineChapterId: number): Promise<OutlineSection[]>;
  getOutlineSection(id: number): Promise<OutlineSection | undefined>;
  createOutlineSection(section: InsertOutlineSection): Promise<OutlineSection>;
  updateOutlineSection(id: number, section: Partial<InsertOutlineSection>): Promise<OutlineSection | undefined>;
  deleteOutlineSection(id: number): Promise<boolean>;
  deleteOutlineSectionsByChapter(outlineChapterId: number): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Books
  async getBooks(): Promise<Book[]> {
    return db.select().from(books).orderBy(asc(books.createdAt));
  }

  async getBook(id: number): Promise<Book | undefined> {
    const result = await db.select().from(books).where(eq(books.id, id));
    return result[0];
  }

  async getDefaultBook(): Promise<Book | undefined> {
    const result = await db.select().from(books).where(eq(books.isDefault, true));
    return result[0];
  }

  async createBook(book: InsertBook): Promise<Book> {
    const result = await db.insert(books).values(book).returning();
    return result[0];
  }

  async updateBook(id: number, book: Partial<InsertBook>): Promise<Book | undefined> {
    const result = await db.update(books)
      .set({ ...book, updatedAt: new Date() })
      .where(eq(books.id, id))
      .returning();
    return result[0];
  }

  async deleteBook(id: number): Promise<boolean> {
    const result = await db.delete(books).where(eq(books.id, id)).returning();
    return result.length > 0;
  }

  // Chapters
  async getChaptersByBook(bookId: number): Promise<Chapter[]> {
    return db.select().from(chapters)
      .where(eq(chapters.bookId, bookId))
      .orderBy(asc(chapters.sortOrder));
  }

  async getChapter(id: number): Promise<Chapter | undefined> {
    const result = await db.select().from(chapters).where(eq(chapters.id, id));
    return result[0];
  }

  async getChapterBySlug(bookId: number, slug: string): Promise<Chapter | undefined> {
    const result = await db.select().from(chapters)
      .where(and(eq(chapters.bookId, bookId), eq(chapters.slug, slug)));
    return result[0];
  }

  async createChapter(chapter: InsertChapter): Promise<Chapter> {
    const result = await db.insert(chapters).values(chapter).returning();
    return result[0];
  }

  async updateChapter(id: number, chapter: Partial<InsertChapter>): Promise<Chapter | undefined> {
    const result = await db.update(chapters)
      .set({ ...chapter, updatedAt: new Date() })
      .where(eq(chapters.id, id))
      .returning();
    return result[0];
  }

  async deleteChapter(id: number): Promise<boolean> {
    const result = await db.delete(chapters).where(eq(chapters.id, id)).returning();
    return result.length > 0;
  }

  // Outline Chapters
  async getOutlineChaptersByBook(bookId: number): Promise<OutlineChapter[]> {
    return db.select().from(outlineChapters)
      .where(eq(outlineChapters.bookId, bookId))
      .orderBy(asc(outlineChapters.sortOrder));
  }

  async getOutlineChapter(id: number): Promise<OutlineChapter | undefined> {
    const result = await db.select().from(outlineChapters).where(eq(outlineChapters.id, id));
    return result[0];
  }

  async createOutlineChapter(chapter: InsertOutlineChapter): Promise<OutlineChapter> {
    const result = await db.insert(outlineChapters).values(chapter).returning();
    return result[0];
  }

  async updateOutlineChapter(id: number, chapter: Partial<InsertOutlineChapter>): Promise<OutlineChapter | undefined> {
    const result = await db.update(outlineChapters)
      .set(chapter)
      .where(eq(outlineChapters.id, id))
      .returning();
    return result[0];
  }

  async deleteOutlineChapter(id: number): Promise<boolean> {
    const result = await db.delete(outlineChapters).where(eq(outlineChapters.id, id)).returning();
    return result.length > 0;
  }

  async deleteOutlineChaptersByBook(bookId: number): Promise<boolean> {
    const result = await db.delete(outlineChapters).where(eq(outlineChapters.bookId, bookId)).returning();
    return result.length >= 0;
  }

  async approveOutlineChapter(id: number): Promise<OutlineChapter | undefined> {
    const result = await db.update(outlineChapters)
      .set({ approvalStatus: "approved", approvedAt: new Date() })
      .where(eq(outlineChapters.id, id))
      .returning();
    return result[0];
  }

  // Outline Sections
  async getOutlineSectionsByChapter(outlineChapterId: number): Promise<OutlineSection[]> {
    return db.select().from(outlineSections)
      .where(eq(outlineSections.outlineChapterId, outlineChapterId))
      .orderBy(asc(outlineSections.sortOrder));
  }

  async getOutlineSection(id: number): Promise<OutlineSection | undefined> {
    const result = await db.select().from(outlineSections).where(eq(outlineSections.id, id));
    return result[0];
  }

  async createOutlineSection(section: InsertOutlineSection): Promise<OutlineSection> {
    const result = await db.insert(outlineSections).values(section).returning();
    return result[0];
  }

  async updateOutlineSection(id: number, section: Partial<InsertOutlineSection>): Promise<OutlineSection | undefined> {
    const result = await db.update(outlineSections)
      .set(section)
      .where(eq(outlineSections.id, id))
      .returning();
    return result[0];
  }

  async deleteOutlineSection(id: number): Promise<boolean> {
    const result = await db.delete(outlineSections).where(eq(outlineSections.id, id)).returning();
    return result.length > 0;
  }

  async deleteOutlineSectionsByChapter(outlineChapterId: number): Promise<boolean> {
    const result = await db.delete(outlineSections).where(eq(outlineSections.outlineChapterId, outlineChapterId)).returning();
    return result.length >= 0;
  }
}

export const storage = new DatabaseStorage();

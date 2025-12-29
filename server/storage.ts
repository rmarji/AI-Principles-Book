import { 
  type User, type InsertUser,
  type Book, type InsertBook, books,
  type Chapter, type InsertChapter, chapters,
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
}

export const storage = new DatabaseStorage();

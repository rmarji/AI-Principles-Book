import { Link, useRoute } from "wouter";
import { ArrowLeft, BookOpen, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Book, Chapter, IndexEntry } from "@shared/schema";

interface ChapterMap {
  [id: number]: Chapter;
}

const CATEGORY_COLORS: Record<string, string> = {
  concepts: "bg-blue-100 text-blue-800",
  people: "bg-purple-100 text-purple-800",
  tools: "bg-green-100 text-green-800",
  frameworks: "bg-orange-100 text-orange-800",
  "best-practices": "bg-yellow-100 text-yellow-800",
  general: "bg-gray-100 text-gray-800",
};

export default function BookIndex() {
  const [, params] = useRoute("/book/:bookId/index");
  const bookId = params?.bookId ? parseInt(params.bookId) : null;
  
  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<ChapterMap>({});
  const [indexEntries, setIndexEntries] = useState<IndexEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!bookId) return;
    
    setLoading(true);
    Promise.all([
      fetch(`/api/books/${bookId}`).then(r => r.json()),
      fetch(`/api/books/${bookId}/chapters`).then(r => r.json()),
      fetch(`/api/books/${bookId}/index`).then(r => r.json()),
    ]).then(([bookData, chaptersData, indexData]) => {
      setBook(bookData);
      const chapMap: ChapterMap = {};
      chaptersData.forEach((ch: Chapter) => {
        chapMap[ch.id] = ch;
      });
      setChapters(chapMap);
      setIndexEntries(indexData);
      setLoading(false);
    }).catch(err => {
      console.error('Failed to fetch index data:', err);
      setError('Failed to load index');
      setLoading(false);
    });
  }, [bookId]);

  // Group entries by first letter
  const groupedEntries = indexEntries.reduce((acc, entry) => {
    const letter = entry.term.charAt(0).toUpperCase();
    if (!acc[letter]) {
      acc[letter] = [];
    }
    acc[letter].push(entry);
    return acc;
  }, {} as Record<string, IndexEntry[]>);

  const sortedLetters = Object.keys(groupedEntries).sort();

  if (!bookId) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-8 text-center">
        <p className="text-muted-foreground">No book selected</p>
        <Link href="/dashboard">
          <Button variant="link">Go to Dashboard</Button>
        </Link>
      </div>
    );
  }

  return (
    <motion.div 
      className="max-w-4xl mx-auto py-12 px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-6 flex items-center justify-between">
        <Link href={`/book/${bookId}`}>
          <Button variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground" data-testid="button-back-to-toc">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Contents
          </Button>
        </Link>
      </div>

      <div className="mb-12 text-center">
        <h1 className="font-heading text-4xl font-bold mb-4" data-testid="text-index-title">Index</h1>
        {book && (
          <p className="text-lg text-muted-foreground">{book.title}</p>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Loading index...</p>
        </div>
      ) : error ? (
        <div className="text-center py-12">
          <p className="text-red-500">{error}</p>
        </div>
      ) : indexEntries.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent className="pt-6">
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground mb-2">No index available yet</p>
            <p className="text-sm text-muted-foreground">Generate an index from the Dashboard</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Letter navigation */}
          <div className="flex flex-wrap gap-2 mb-8 justify-center" data-testid="index-letter-nav">
            {sortedLetters.map(letter => (
              <a
                key={letter}
                href={`#index-${letter}`}
                className="w-8 h-8 flex items-center justify-center rounded bg-muted hover:bg-primary hover:text-primary-foreground transition-colors text-sm font-medium"
                data-testid={`link-letter-${letter}`}
              >
                {letter}
              </a>
            ))}
          </div>

          {/* Index entries by letter */}
          <div className="space-y-8">
            {sortedLetters.map(letter => (
              <div key={letter} id={`index-${letter}`}>
                <h2 className="text-2xl font-bold mb-4 border-b pb-2" data-testid={`heading-letter-${letter}`}>
                  {letter}
                </h2>
                <div className="space-y-4">
                  {groupedEntries[letter].map((entry, idx) => (
                    <motion.div
                      key={entry.id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className="pl-4"
                      data-testid={`index-entry-${entry.id}`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium text-foreground">{entry.term}</span>
                            {entry.category && (
                              <Badge 
                                variant="secondary" 
                                className={`text-xs ${CATEGORY_COLORS[entry.category] || CATEGORY_COLORS.general}`}
                              >
                                {entry.category}
                              </Badge>
                            )}
                          </div>
                          {entry.description && (
                            <p className="text-sm text-muted-foreground mb-2">{entry.description}</p>
                          )}
                          <div className="flex flex-wrap gap-2">
                            {entry.chapterIds?.map(chapterId => {
                              const chapter = chapters[chapterId];
                              if (!chapter) return null;
                              return (
                                <Link 
                                  key={chapterId} 
                                  href={`/book/${bookId}/chapter/${chapter.slug || chapter.id}`}
                                >
                                  <Badge 
                                    variant="outline" 
                                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
                                    data-testid={`link-chapter-${chapterId}`}
                                  >
                                    Ch. {chapter.sortOrder + 1}: {chapter.title?.substring(0, 30)}{chapter.title && chapter.title.length > 30 ? '...' : ''}
                                  </Badge>
                                </Link>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Back to top */}
          <div className="mt-12 text-center">
            <a 
              href="#" 
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
            >
              Back to top
            </a>
          </div>
        </>
      )}
    </motion.div>
  );
}

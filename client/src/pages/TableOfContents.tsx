import { Link } from "wouter";
import { bookContent } from "../lib/bookContent";
import { BOOK_TITLE, AUTHORS } from "../lib/exportBook";
import { ChevronRight, CheckCircle2, Clock, Lock } from "lucide-react";
import { cn } from "../lib/utils";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

interface Subsection {
  id: string;
  title: string;
  level: number;
}

interface ChapterMeta {
  id: string;
  wordCount: number;
  subsections: Subsection[];
}

function formatWordCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k words`;
  }
  return `${count} words`;
}

export default function TableOfContents() {
  const [chapterMeta, setChapterMeta] = useState<Record<string, ChapterMeta>>({});

  useEffect(() => {
    fetch('/api/chapters')
      .then(res => res.json())
      .then(data => {
        const metaMap: Record<string, ChapterMeta> = {};
        data.chapters.forEach((ch: ChapterMeta) => {
          metaMap[ch.id] = ch;
        });
        setChapterMeta(metaMap);
      })
      .catch(err => console.error('Failed to fetch chapter metadata:', err));
  }, []);

  const chapters = bookContent.filter(c => c.id !== 'overview');

  return (
    <motion.div 
      className="max-w-4xl mx-auto py-12 px-8"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="mb-12 text-center">
        <h1 className="font-heading text-4xl font-bold mb-4">Table of Contents</h1>
        <p className="text-lg text-muted-foreground">{BOOK_TITLE}</p>
        <p className="text-sm text-muted-foreground mt-2">
          By {AUTHORS.map(a => a.name).join(' & ')}
        </p>
      </div>

      <div className="space-y-4">
        {chapters.map((chapter, index) => {
          const meta = chapterMeta[chapter.id];
          const isLocked = chapter.status === 'locked';

          return (
            <motion.div
              key={chapter.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              {isLocked ? (
                <div className="p-4 rounded-lg border bg-muted/30 opacity-60">
                  <div className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted text-muted-foreground shrink-0">
                      <Lock size={18} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h2 className="font-heading font-semibold text-lg text-muted-foreground">
                          {chapter.title}
                        </h2>
                        <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">Locked</span>
                      </div>
                      {chapter.subtitle && (
                        <h3 className="text-sm text-muted-foreground mb-2">{chapter.subtitle}</h3>
                      )}
                      <p className="text-sm text-muted-foreground/70">{chapter.description}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <Link 
                  href={`/chapter/${chapter.id}`}
                  className="block"
                  data-testid={`toc-link-${chapter.id}`}
                >
                  <div className={cn(
                    "p-4 rounded-lg border transition-all hover:border-primary/50 hover:bg-muted/30 hover:shadow-sm group"
                  )}>
                    <div className="flex items-start gap-4">
                      <div className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full shrink-0",
                        chapter.status === 'completed' 
                          ? "bg-primary/10 text-primary" 
                          : "bg-muted text-muted-foreground"
                      )}>
                        {chapter.status === 'completed' ? (
                          <CheckCircle2 size={20} />
                        ) : (
                          <Clock size={18} />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h2 className="font-heading font-semibold text-lg group-hover:text-primary transition-colors">
                            {chapter.title}
                          </h2>
                          {meta?.wordCount && (
                            <span className="text-xs text-muted-foreground px-2 py-0.5 rounded bg-muted">
                              {formatWordCount(meta.wordCount)}
                            </span>
                          )}
                        </div>
                        {chapter.subtitle && (
                          <h3 className="text-sm font-medium text-muted-foreground mb-2">{chapter.subtitle}</h3>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">{chapter.description}</p>
                        
                        {meta?.subsections && meta.subsections.length > 0 && (
                          <div className="mt-3 flex flex-wrap gap-2">
                            {meta.subsections
                              .filter(s => s.level === 2)
                              .slice(0, 5)
                              .map((sub, idx) => (
                                <span 
                                  key={idx}
                                  className="text-xs px-2 py-1 rounded bg-muted text-muted-foreground"
                                >
                                  {sub.title}
                                </span>
                              ))}
                            {meta.subsections.filter(s => s.level === 2).length > 5 && (
                              <span className="text-xs px-2 py-1 text-muted-foreground">
                                +{meta.subsections.filter(s => s.level === 2).length - 5} more
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="shrink-0 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" size={20} />
                    </div>
                  </div>
                </Link>
              )}
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}

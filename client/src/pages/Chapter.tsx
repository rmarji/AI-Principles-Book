import { useEffect, useRef, useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { ReaderLayout } from "@/components/ReaderLayout";
import { bookContent } from "@/lib/bookContent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sparkles, ArrowRight, MessageSquare, Share2, Bookmark, Brain, Loader2, FileText } from "lucide-react";
import { motion } from "framer-motion";
import { marked } from "marked";
import { QualityChecklist } from "@/components/QualityChecklist";
import { AIDiscussion } from "@/components/AIDiscussion";
import { CritiquePanel } from "@/components/CritiquePanel";

function generateSlug(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function configureMarked(): void {
  marked.use({
    renderer: {
      heading(token) {
        const text = token.text;
        const depth = token.depth;
        const slug = generateSlug(text);
        return `<h${depth} id="${slug}">${text}</h${depth}>`;
      }
    }
  });
}

function formatWordCount(count: number): string {
  if (count >= 1000) {
    return `${(count / 1000).toFixed(1)}k`;
  }
  return `${count}`;
}

export default function Chapter() {
  const [match, params] = useRoute("/chapter/:id");
  const [location] = useLocation();
  const chapterId = params?.id;
  const chapter = bookContent.find(c => c.id === chapterId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fullContent, setFullContent] = useState<string | null>(null);
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wordCount, setWordCount] = useState<number | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
    
    setLoading(true);
    setFullContent(null);
    setRawContent(null);
    setWordCount(null);
    
    if (chapterId) {
      fetch(`/api/chapters/${chapterId}`)
        .then(res => {
          if (!res.ok) throw new Error('Chapter not found');
          return res.json();
        })
        .then(data => {
          configureMarked();
          const htmlContent = marked.parse(data.content, { async: false }) as string;
          setFullContent(htmlContent);
          setRawContent(data.content);
          setWordCount(data.wordCount || null);
          setLoading(false);
          
          setTimeout(() => {
            const hash = window.location.hash.slice(1);
            if (hash) {
              const element = document.getElementById(hash);
              if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }
          }, 100);
        })
        .catch(() => {
          setFullContent(null);
          setLoading(false);
        });
    }
  }, [chapterId]);

  if (!chapter) return <div className="flex items-center justify-center h-screen">Chapter not found</div>;

  const nextChapterIndex = bookContent.findIndex(c => c.id === chapterId) + 1;
  const nextChapter = bookContent[nextChapterIndex];

  const displayContent = fullContent || chapter.content;

  return (
    <ReaderLayout>
      <div className="flex h-full">
        {/* Main Content */}
        <div className="flex-1 flex flex-col h-full overflow-hidden relative">
          
          {/* Header */}
          <header className="h-16 border-b border-border bg-background/80 backdrop-blur z-10 flex items-center justify-between px-8 shrink-0">
             <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {chapter.title}
                </span>
                {chapter.status === 'in-progress' && (
                    <Badge variant="secondary" className="text-[10px] h-5">Reading</Badge>
                )}
                {wordCount && (
                  <Badge variant="outline" className="text-[10px] h-5 gap-1" data-testid="word-count-badge">
                    <FileText className="w-3 h-3" />
                    {formatWordCount(wordCount)} words
                  </Badge>
                )}
             </div>
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-bookmark">
                    <Bookmark className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8" data-testid="button-share">
                    <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="gap-2 ml-2 h-8 text-xs" data-testid="button-ai-assistant">
                    <Sparkles className="w-3 h-3 text-primary" />
                    Ask AI Assistant
                </Button>
             </div>
          </header>

          {/* Reading Area */}
          <div className="flex-1 overflow-y-auto" ref={scrollRef}>
            <div className="max-w-3xl mx-auto px-8 py-12 md:py-16">
              
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                key={chapter.id}
              >
                <h1 className="text-3xl md:text-4xl font-heading font-bold text-foreground mb-4">
                  {chapter.subtitle || chapter.title}
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed mb-8 border-l-4 border-primary pl-4 py-1">
                  {chapter.description}
                </p>

                <div className="flex flex-wrap gap-2 mb-10">
                  {chapter.topics.slice(0, 3).map(topic => (
                    <Badge key={topic} variant="secondary" className="bg-secondary/50 font-normal">
                      {topic.split(':')[0]} 
                    </Badge>
                  ))}
                </div>

                {loading ? (
                  <div className="flex items-center justify-center py-20">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                    <span className="ml-3 text-muted-foreground">Loading chapter content...</span>
                  </div>
                ) : (
                  <article 
                    className="chapter-content max-w-none"
                    data-testid="chapter-content"
                  >
                     <div dangerouslySetInnerHTML={{ __html: displayContent }} />
                  </article>
                )}

                <Separator className="my-12" />

                <div className="bg-muted/30 rounded-xl p-8 border border-border/50">
                    <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        Key Takeaways
                    </h3>
                    <ul className="grid gap-3">
                        {chapter.topics.map((topic, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground" data-testid={`takeaway-${i}`}>
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                {topic}
                            </li>
                        ))}
                    </ul>
                </div>

                {nextChapter && (
                    <div className="mt-16 flex justify-end">
                         <Link href={`/chapter/${nextChapter.id}`} className="group block text-right" data-testid="link-next-chapter">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1">Up Next</span>
                            <div className="flex items-center justify-end gap-2 text-xl font-heading font-bold text-foreground group-hover:text-primary transition-colors">
                                {nextChapter.title}: {nextChapter.subtitle}
                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </div>
                         </Link>
                    </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>

        {/* AI Assistant Context Panel */}
        <div className="hidden xl:flex w-96 border-l border-border bg-background flex-col shrink-0">
            {/* Quality Checklist */}
            <QualityChecklist 
              wordCount={wordCount} 
              content={rawContent}
              chapterId={chapterId || ''}
            />
            
            {/* Critique Panel */}
            <div className="flex-1 min-h-0 border-b border-border">
              <CritiquePanel 
                chapterId={chapterId || ''}
                onNavigateToLine={(lineNumber) => {
                  if (rawContent && scrollRef.current) {
                    const lines = rawContent.split('\n');
                    const targetLine = Math.min(lineNumber - 1, lines.length - 1);
                    const targetText = lines[targetLine]?.trim();
                    
                    if (targetText) {
                      const headingMatch = targetText.match(/^#{1,3}\s+(.+)$/);
                      if (headingMatch) {
                        const slug = headingMatch[1].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                        const element = document.getElementById(slug);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          element.classList.add('bg-yellow-200/30');
                          setTimeout(() => element.classList.remove('bg-yellow-200/30'), 2000);
                          return;
                        }
                      }
                      
                      const percentPosition = targetLine / lines.length;
                      const scrollHeight = scrollRef.current.scrollHeight;
                      const targetPosition = scrollHeight * percentPosition;
                      scrollRef.current.scrollTo({ top: targetPosition, behavior: 'smooth' });
                    }
                  }
                }}
              />
            </div>
            
            {/* AI Discussion Header */}
            <div className="p-3 border-b border-border font-medium flex items-center gap-2 text-sm shrink-0">
                <MessageSquare className="w-4 h-4 text-primary" />
                AI Discussion
            </div>
            
            {/* AI Discussion Component */}
            <AIDiscussion 
              chapterId={chapterId || ''}
              chapterTitle={chapter?.subtitle || chapter?.title || ''}
              chapterContent={rawContent}
            />
        </div>
      </div>
    </ReaderLayout>
  );
}

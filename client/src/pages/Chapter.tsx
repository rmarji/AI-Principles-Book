import { useEffect, useRef, useState } from "react";
import { useRoute, Link, useLocation } from "wouter";
import { ReaderLayout } from "@/components/ReaderLayout";
import { bookContent } from "@/lib/bookContent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { Sparkles, ArrowRight, MessageSquare, Share2, Bookmark, Brain, Loader2, FileText, ListChecks, AlertTriangle, ChevronDown, PanelRightClose, PanelRight, Download } from "lucide-react";
import { motion } from "framer-motion";
import { marked } from "marked";
import { QualityChecklist } from "@/components/QualityChecklist";
import { AIDiscussion } from "@/components/AIDiscussion";
import { CritiquePanel } from "@/components/CritiquePanel";
import { AICritiquePanel } from "@/components/AICritiquePanel";
import { exportChapterToWord } from "@/lib/exportBook";
import { ScorecardBadge } from "@/components/ScorecardBadge";
import { MermaidDiagram } from "@/components/MermaidDiagram";
import { getDiagramsForChapter } from "@/lib/chapterDiagrams";

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

type RightPanel = 'quality' | 'critique' | 'ai_critique' | 'discussion' | null;

export default function Chapter() {
  const [match, params] = useRoute("/chapter/:id");
  const [location] = useLocation();
  const chapterId = params?.id;
  const chapter = bookContent.find(c => c.id === chapterId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [fullContent, setFullContent] = useState<string | null>(null);
  const [activeRightPanel, setActiveRightPanel] = useState<RightPanel>('quality');
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  const [rawContent, setRawContent] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [wordCount, setWordCount] = useState<number | null>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadChapter = async () => {
    if (!chapterId) return;
    setIsDownloading(true);
    try {
      await exportChapterToWord(chapterId);
    } catch (error) {
      console.error('Download failed:', error);
    } finally {
      setIsDownloading(false);
    }
  };

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
        .catch((err) => {
          console.error('Failed to load chapter content:', chapterId, err);
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
      <ResizablePanelGroup direction="horizontal" className="h-full min-h-0">
        {/* Main Content */}
        <ResizablePanel defaultSize={rightSidebarOpen ? 75 : 100} minSize={50}>
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
                {chapterId && <ScorecardBadge chapterId={chapterId} />}
             </div>
             <div className="flex items-center gap-2">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8" 
                  onClick={handleDownloadChapter}
                  disabled={isDownloading}
                  title="Download this chapter as Word"
                  data-testid="button-download-chapter"
                >
                    {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                </Button>
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
                ) : displayContent ? (
                  <>
                    <article
                      className="chapter-content max-w-none"
                      data-testid="chapter-content"
                    >
                       <div dangerouslySetInnerHTML={{ __html: displayContent }} />
                    </article>
                    
                    {/* Chapter Diagrams */}
                    {chapterId && getDiagramsForChapter(chapterId).length > 0 && (
                      <div className="mt-12 space-y-6" data-testid="chapter-diagrams">
                        <h2 className="text-2xl font-heading font-bold text-foreground">Visual References</h2>
                        {getDiagramsForChapter(chapterId).map((diagram) => (
                          <MermaidDiagram
                            key={diagram.id}
                            id={diagram.id}
                            title={diagram.title}
                            definition={diagram.definition}
                            caption={diagram.caption}
                          />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <AlertTriangle className="w-10 h-10 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">Content could not be loaded.</p>
                    <p className="text-sm text-muted-foreground/70 mt-2">Please try refreshing the page.</p>
                  </div>
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
        </ResizablePanel>

        {/* Right Sidebar Toggle Button (when collapsed) */}
        {!rightSidebarOpen && (
          <Button
            variant="ghost"
            size="icon"
            className="fixed right-2 top-2 z-50 h-8 w-8 hidden xl:flex"
            onClick={() => setRightSidebarOpen(true)}
            data-testid="button-open-right-sidebar"
          >
            <PanelRight className="h-4 w-4" />
          </Button>
        )}

        {/* AI Assistant Context Panel - Resizable */}
        {rightSidebarOpen && (
          <>
            <ResizableHandle withHandle className="hidden xl:flex" />
            <ResizablePanel defaultSize={25} minSize={15} maxSize={50} className="hidden xl:flex flex-col border-l border-border bg-background">
            {/* Header with close button */}
            <div className="p-2 border-b border-border flex items-center justify-between bg-muted/30">
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Tools</span>
              <Button
                variant="ghost"
                size="icon"
                className="h-6 w-6"
                onClick={() => setRightSidebarOpen(false)}
                data-testid="button-close-right-sidebar"
              >
                <PanelRightClose className="h-4 w-4" />
              </Button>
            </div>

            {/* Panel Tabs */}
            <div className="flex border-b border-border flex-wrap">
              <button
                onClick={() => setActiveRightPanel(activeRightPanel === 'quality' ? null : 'quality')}
                className={`flex-1 p-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  activeRightPanel === 'quality' 
                    ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
                data-testid="tab-quality"
              >
                <ListChecks className="w-3.5 h-3.5" />
                Quality
              </button>
              <button
                onClick={() => setActiveRightPanel(activeRightPanel === 'critique' ? null : 'critique')}
                className={`flex-1 p-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  activeRightPanel === 'critique' 
                    ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
                data-testid="tab-critique"
              >
                <AlertTriangle className="w-3.5 h-3.5" />
                Review
              </button>
              <button
                onClick={() => setActiveRightPanel(activeRightPanel === 'ai_critique' ? null : 'ai_critique')}
                className={`flex-1 p-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  activeRightPanel === 'ai_critique' 
                    ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
                data-testid="tab-ai-critique"
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI Critic
              </button>
              <button
                onClick={() => setActiveRightPanel(activeRightPanel === 'discussion' ? null : 'discussion')}
                className={`flex-1 p-2 text-xs font-medium flex items-center justify-center gap-1.5 transition-colors ${
                  activeRightPanel === 'discussion' 
                    ? 'bg-primary/10 text-primary border-b-2 border-primary' 
                    : 'text-muted-foreground hover:bg-muted/50'
                }`}
                data-testid="tab-discussion"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                Chat
              </button>
            </div>
            
            {/* Panel Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
              {activeRightPanel === 'quality' && (
                <QualityChecklist 
                  wordCount={wordCount} 
                  content={rawContent}
                  chapterId={chapterId || ''}
                />
              )}
              
              {activeRightPanel === 'critique' && (
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
              )}
              
              {activeRightPanel === 'ai_critique' && (
                <div className="h-full flex flex-col p-4 min-h-0">
                  <AICritiquePanel 
                    chapterId={chapterId || ''}
                    onHighlightSection={(sectionRef) => {
                      // Try multiple matching strategies
                      const slug = sectionRef.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
                      
                      // Strategy 1: Direct ID match
                      let element: HTMLElement | null = document.getElementById(slug);
                      
                      // Strategy 2: Partial ID match
                      if (!element) {
                        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
                        for (const heading of headings) {
                          if (heading.id && heading.id.includes(slug.split('-')[0])) {
                            element = heading as HTMLElement;
                            break;
                          }
                        }
                      }
                      
                      // Strategy 3: Text content match
                      if (!element) {
                        const headings = Array.from(document.querySelectorAll('h1, h2, h3, h4'));
                        const searchTerms = sectionRef.toLowerCase().split(/\s+/);
                        for (const heading of headings) {
                          const text = heading.textContent?.toLowerCase() || '';
                          if (searchTerms.some(term => text.includes(term))) {
                            element = heading as HTMLElement;
                            break;
                          }
                        }
                      }
                      
                      if (element) {
                        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        element.classList.add('bg-yellow-200/30');
                        setTimeout(() => element?.classList.remove('bg-yellow-200/30'), 2000);
                      }
                    }}
                  />
                </div>
              )}
              
              {activeRightPanel === 'discussion' && (
                <AIDiscussion 
                  chapterId={chapterId || ''}
                  chapterTitle={chapter?.subtitle || chapter?.title || ''}
                  chapterContent={rawContent}
                />
              )}
              
              {activeRightPanel === null && (
                <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                  Select a panel above
                </div>
              )}
            </div>
            </ResizablePanel>
          </>
        )}
      </ResizablePanelGroup>
    </ReaderLayout>
  );
}

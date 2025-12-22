import { Link, useLocation } from "wouter";
import { bookContent } from "../lib/bookContent";
import { cn } from "../lib/utils";
import { 
  BookOpen, 
  ChevronRight, 
  ChevronDown,
  Circle, 
  CheckCircle2, 
  Lock, 
  BrainCircuit,
  LayoutTemplate,
  User,
  FileDown,
  FileText,
  PanelLeftClose
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { exportToPDF, exportToWord } from "@/lib/exportBook";
import { useState, useEffect } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { useLayout } from "./ReaderLayout";

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

export function Sidebar() {
  const [location] = useLocation();
  const [isExporting, setIsExporting] = useState(false);
  const [chapterMeta, setChapterMeta] = useState<Record<string, ChapterMeta>>({});
  const [expandedChapters, setExpandedChapters] = useState<Set<string>>(new Set());
  const { setLeftSidebarOpen } = useLayout();

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

  useEffect(() => {
    const match = location.match(/\/chapter\/(.+)/);
    if (match) {
      setExpandedChapters(prev => new Set(prev).add(match[1]));
    }
  }, [location]);

  const handleExportPDF = async () => {
    setIsExporting(true);
    try {
      await exportToPDF();
    } catch (error) {
      console.error('Export to PDF failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportWord = async () => {
    setIsExporting(true);
    try {
      await exportToWord();
    } catch (error) {
      console.error('Export to Word failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const toggleChapter = (chapterId: string) => {
    setExpandedChapters(prev => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="w-72 h-screen border-r bg-sidebar flex flex-col shrink-0">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-1">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded bg-primary flex items-center justify-center text-primary-foreground">
              <BrainCircuit size={16} />
            </div>
            <span className="font-heading font-bold text-base tracking-tight">AI Leadership</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setLeftSidebarOpen(false)}
            data-testid="button-close-sidebar"
          >
            <PanelLeftClose size={16} />
          </Button>
        </div>
        <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium ml-9">Interactive Guide</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div className="space-y-1">
             <Link href="/" className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                location === "/" 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
              )} data-testid="link-cover">
                <LayoutTemplate size={16} />
                Cover & Overview
              </Link>
          </div>

          <div className="space-y-4">
            <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Chapters
            </div>
            <nav className="space-y-1">
              {bookContent.filter(ch => !ch.id.startsWith('appendix-')).map((chapter) => {
                if (chapter.id === 'overview') return null;
                
                const isActive = location === `/chapter/${chapter.id}`;
                const isLocked = chapter.status === 'locked';
                const meta = chapterMeta[chapter.id];
                const isExpanded = expandedChapters.has(chapter.id);
                const hasSubsections = meta?.subsections && meta.subsections.length > 0;

                if (isLocked) {
                    return (
                        <div key={chapter.id} className={cn(
                            "flex items-start gap-3 px-3 py-3 text-sm rounded-md transition-all relative opacity-50 cursor-not-allowed text-muted-foreground"
                        )}>
                            <div className="mt-0.5 shrink-0">
                                <Lock size={16} />
                            </div>
                            <div className="flex-1">
                                <span className="block font-medium leading-none mb-1">{chapter.title}</span>
                                <span className="text-xs text-muted-foreground line-clamp-1">
                                    {chapter.subtitle}
                                </span>
                            </div>
                        </div>
                    );
                }

                return (
                  <Collapsible key={chapter.id} open={isExpanded} onOpenChange={() => toggleChapter(chapter.id)}>
                    <div className={cn(
                        "group flex items-start gap-2 px-2 py-2 text-sm rounded-md transition-all",
                        isActive 
                          ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                          : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                      )}>
                      
                      {/* Collapse/Expand Toggle - Always visible */}
                      <CollapsibleTrigger asChild>
                        <button 
                          className={cn(
                            "mt-0.5 p-1 rounded hover:bg-sidebar-accent transition-colors shrink-0",
                            isActive ? "text-primary" : "text-muted-foreground"
                          )}
                          data-testid={`toggle-chapter-${chapter.id}`}
                        >
                          {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                        </button>
                      </CollapsibleTrigger>
                      
                      {/* Chapter Link */}
                      <Link href={`/chapter/${chapter.id}`} className="flex-1 min-w-0" data-testid={`link-chapter-${chapter.id}`}>
                        <div className="flex items-start gap-2">
                          <div className="mt-0.5 shrink-0">
                            {chapter.status === 'completed' ? (
                              <CheckCircle2 size={14} className="text-primary" />
                            ) : (
                              <div className={cn(
                                "w-3.5 h-3.5 rounded-full border-2 flex items-center justify-center",
                                isActive ? "border-primary" : "border-muted-foreground/30"
                              )}>
                                {isActive && <div className="w-1 h-1 rounded-full bg-primary" />}
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="block font-medium leading-none mb-1 text-xs">{chapter.title}</span>
                            <span className="text-[11px] text-muted-foreground line-clamp-1 group-hover:text-foreground/80 transition-colors">
                              {chapter.subtitle}
                            </span>
                            {meta?.wordCount && (
                              <span className="text-[10px] text-muted-foreground/70 mt-0.5 block">
                                {formatWordCount(meta.wordCount)}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    </div>
                    
                    {hasSubsections && (
                      <CollapsibleContent>
                        <div className="ml-7 pl-3 border-l border-border/50 space-y-0.5 py-1">
                          {meta.subsections
                            .filter(sub => sub.level === 2 || sub.level === 3)
                            .slice(0, 15)
                            .map((sub, idx) => (
                              <Link 
                                key={`${sub.id}-${idx}`}
                                href={`/chapter/${chapter.id}#${sub.id}`}
                                onClick={(e) => {
                                  if (isActive) {
                                    e.preventDefault();
                                    scrollToSection(sub.id);
                                  }
                                }}
                                className={cn(
                                  "block text-xs py-1.5 px-2 rounded transition-colors truncate",
                                  sub.level === 3 ? "ml-2 text-muted-foreground/80" : "text-muted-foreground",
                                  "hover:bg-sidebar-accent/30 hover:text-foreground"
                                )}
                                data-testid={`link-section-${sub.id}`}
                              >
                                {sub.title}
                              </Link>
                            ))}
                        </div>
                      </CollapsibleContent>
                    )}
                  </Collapsible>
                );
              })}
            </nav>
          </div>

          {/* Appendices Section */}
          <div className="space-y-4">
            <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Appendices
            </div>
            <nav className="space-y-1">
              {bookContent.filter(ch => ch.id.startsWith('appendix-')).map((appendix) => {
                const isActive = location === `/chapter/${appendix.id}`;
                const meta = chapterMeta[appendix.id];

                return (
                  <Link
                    key={appendix.id}
                    href={`/chapter/${appendix.id}`}
                    className={cn(
                      "flex items-start gap-2 px-3 py-2 text-sm rounded-md transition-all",
                      isActive
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm"
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                    )}
                    data-testid={`link-${appendix.id}`}
                  >
                    <CheckCircle2 size={14} className="mt-0.5 text-primary shrink-0" />
                    <div className="flex-1 min-w-0">
                      <span className="block font-medium leading-none mb-1 text-xs">{appendix.title}</span>
                      <span className="text-[11px] text-muted-foreground line-clamp-1">
                        {appendix.subtitle}
                      </span>
                      {meta?.wordCount && (
                        <span className="text-[10px] text-muted-foreground/70 mt-0.5 block">
                          {formatWordCount(meta.wordCount)}
                        </span>
                      )}
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Export Section */}
          <div className="space-y-2">
            <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Export
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  className="w-full justify-start gap-2 h-9"
                  disabled={isExporting}
                  data-testid="button-export"
                >
                  <FileDown size={16} />
                  {isExporting ? 'Exporting...' : 'Download Book'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem onClick={handleExportPDF} className="gap-2 cursor-pointer" data-testid="button-export-pdf">
                  <FileText size={16} />
                  Export as PDF
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleExportWord} className="gap-2 cursor-pointer" data-testid="button-export-word">
                  <FileText size={16} />
                  Export as Word
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </ScrollArea>

      <div className="p-4 border-t border-sidebar-border bg-sidebar-accent/10">
        <div className="flex items-center gap-3">
          <Avatar className="h-9 w-9 border border-primary/20">
            <AvatarImage src="/placeholder-avatar.png" />
            <AvatarFallback className="bg-primary text-primary-foreground font-bold">RM</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">Rayo Marji</p>
            <p className="text-xs text-muted-foreground truncate">CTO, Arootah</p>
          </div>
        </div>
      </div>
    </div>
  );
}

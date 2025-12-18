import { useEffect, useRef } from "react";
import { useRoute, Link } from "wouter";
import { ReaderLayout } from "@/components/ReaderLayout";
import { bookContent } from "@/lib/bookContent";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Sparkles, ArrowRight, MessageSquare, Share2, Bookmark, Brain, User } from "lucide-react";
import { motion } from "framer-motion";

export default function Chapter() {
  const [match, params] = useRoute("/chapter/:id");
  const chapterId = params?.id;
  const chapter = bookContent.find(c => c.id === chapterId);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll to top when chapter changes
    if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
    }
  }, [chapterId]);

  if (!chapter) return <div>Chapter not found</div>;

  const nextChapterIndex = bookContent.findIndex(c => c.id === chapterId) + 1;
  const nextChapter = bookContent[nextChapterIndex];

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
             </div>
             <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Bookmark className="w-4 h-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Share2 className="w-4 h-4" />
                </Button>
                <Button variant="outline" size="sm" className="gap-2 ml-2 h-8 text-xs">
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

                <article className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-heading prose-headings:font-semibold prose-p:leading-relaxed prose-img:rounded-xl prose-img:shadow-lg">
                   <div dangerouslySetInnerHTML={{ __html: chapter.content }} />
                </article>

                <Separator className="my-12" />

                <div className="bg-muted/30 rounded-xl p-8 border border-border/50">
                    <h3 className="font-heading font-semibold text-lg mb-4 flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        Key Takeaways
                    </h3>
                    <ul className="grid gap-3">
                        {chapter.topics.map((topic, i) => (
                            <li key={i} className="flex items-start gap-3 text-sm text-muted-foreground">
                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                                {topic}
                            </li>
                        ))}
                    </ul>
                </div>

                {nextChapter && (
                    <div className="mt-16 flex justify-end">
                         <Link href={`/chapter/${nextChapter.id}`} className="group block text-right">
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

        {/* AI Assistant Context Panel - Optional/Collapsible */}
        {/* For now, just a placeholder sidebar on the right for large screens */}
        <div className="hidden xl:flex w-80 border-l border-border bg-background flex-col shrink-0">
            <div className="p-4 border-b border-border font-medium flex items-center gap-2 text-sm">
                <MessageSquare className="w-4 h-4 text-primary" />
                AI Discussion
            </div>
            <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                    <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg rounded-tl-none text-sm text-muted-foreground">
                            I've analyzed this chapter. The key concept here is distinguishing between "Tools" and "Agents". Would you like me to generate a quiz on this?
                        </div>
                    </div>
                     <div className="flex gap-3 flex-row-reverse">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center shrink-0">
                            <User className="w-4 h-4" />
                        </div>
                        <div className="bg-primary/10 p-3 rounded-lg rounded-tr-none text-sm">
                           Yes, give me 3 questions to test my understanding.
                        </div>
                    </div>
                     <div className="flex gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                            <Sparkles className="w-4 h-4 text-primary" />
                        </div>
                        <div className="bg-muted/50 p-3 rounded-lg rounded-tl-none text-sm text-muted-foreground">
                            Here are 3 questions:<br/><br/>
                            1. What is the primary difference between an AI tool and an AI agent?<br/>
                            2. Name one example of a task suited for an Agent vs a Tool.<br/>
                            3. What is "Agentic AI"?
                        </div>
                    </div>
                </div>
            </ScrollArea>
             <div className="p-4 border-t border-border">
                <div className="relative">
                    <input 
                        type="text" 
                        placeholder="Ask about this chapter..." 
                        className="w-full bg-muted/50 border border-input rounded-md pl-3 pr-10 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <button className="absolute right-2 top-2 text-muted-foreground hover:text-primary">
                        <ArrowRight className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
      </div>
    </ReaderLayout>
  );
}

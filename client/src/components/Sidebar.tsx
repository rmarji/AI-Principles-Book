import { Link, useLocation } from "wouter";
import { bookContent } from "../lib/bookContent";
import { cn } from "../lib/utils";
import { 
  BookOpen, 
  ChevronRight, 
  Circle, 
  CheckCircle2, 
  Lock, 
  BrainCircuit,
  LayoutTemplate,
  User
} from "lucide-react";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export function Sidebar() {
  const [location] = useLocation();

  return (
    <div className="w-80 h-screen border-r bg-sidebar flex flex-col shrink-0">
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground">
            <BrainCircuit size={18} />
          </div>
          <span className="font-heading font-bold text-lg tracking-tight">AI Leadership</span>
        </div>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">Interactive Guide</p>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-4 space-y-6">
          <div className="space-y-1">
             <Link href="/" className={cn(
                "flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors",
                location === "/" 
                  ? "bg-sidebar-accent text-sidebar-accent-foreground" 
                  : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
              )}>
                <LayoutTemplate size={16} />
                Cover & Overview
              </Link>
          </div>

          <div className="space-y-4">
            <div className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Chapters
            </div>
            <nav className="space-y-1">
              {bookContent.map((chapter, index) => {
                if (chapter.id === 'overview') return null;
                
                const isActive = location === `/chapter/${chapter.id}`;
                const isLocked = chapter.status === 'locked';

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
                  <Link key={chapter.id} href={`/chapter/${chapter.id}`} className={cn(
                      "group flex items-start gap-3 px-3 py-3 text-sm rounded-md transition-all relative",
                      isActive 
                        ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" 
                        : "text-muted-foreground hover:bg-sidebar-accent/50 hover:text-foreground"
                    )}>
                      <div className="mt-0.5 shrink-0">
                        {chapter.status === 'completed' ? (
                          <CheckCircle2 size={16} className="text-primary" />
                        ) : (
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center",
                            isActive ? "border-primary" : "border-muted-foreground/30"
                          )}>
                            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-primary" />}
                          </div>
                        )}
                      </div>
                      <div className="flex-1">
                        <span className="block font-medium leading-none mb-1">{chapter.title}</span>
                        <span className="text-xs text-muted-foreground line-clamp-1 group-hover:text-foreground/80 transition-colors">
                          {chapter.subtitle}
                        </span>
                      </div>
                      {isActive && (
                        <ChevronRight size={14} className="mt-0.5 text-primary opacity-100" />
                      )}
                  </Link>
                );
              })}
            </nav>
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

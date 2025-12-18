import { ReaderLayout } from "@/components/ReaderLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bookContent } from "@/lib/bookContent";
import { ArrowRight, BookOpen, Brain, Sparkles, User, Users } from "lucide-react";
import { Link } from "wouter";
// We need to import the image. Since I can't modify vite config to add alias easily, 
// I will rely on the alias I saw in vite.config.ts: "@assets": path.resolve(import.meta.dirname, "attached_assets")
import coverImage from "@assets/generated_images/futuristic_book_cover_for_ai_leadership_guide.png";

export default function Home() {
  const overview = bookContent.find(c => c.id === 'overview');

  return (
    <ReaderLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-8 py-12 md:py-20">
          
          <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                 <Badge variant="outline" className="px-3 py-1 text-primary border-primary/20 bg-primary/5 rounded-full text-xs font-medium tracking-wider uppercase">
                  Interactive Guide
                </Badge>
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  By Rayo Marji, CTO Arootah
                </span>
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-[1.1] tracking-tight text-foreground">
                The Leader's Guide to <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">AI Teams</span>
              </h1>
              <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                Stop just using tools. Start leading a digital workforce. A plain-English guide to building your own team of AI helpers.
              </p>
              
              <div className="flex flex-wrap gap-4 pt-4">
                <Button asChild size="lg" className="h-12 px-8 text-base shadow-lg shadow-primary/20 bg-primary hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 cursor-pointer">
                  <Link href="/chapter/chapter-1">
                    Start Reading <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" className="h-12 px-8 text-base border-primary/20 hover:bg-primary/5 hover:text-primary cursor-pointer">
                  See the Roles
                </Button>
              </div>
            </div>

            <div className="relative group perspective-1000">
              <div className="absolute -inset-1 bg-gradient-to-r from-primary to-purple-600 rounded-lg blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
              <div className="relative aspect-[3/4] md:aspect-[4/5] overflow-hidden rounded-lg shadow-2xl border border-white/10 bg-muted/20 backdrop-blur-sm">
                 <img 
                  src={coverImage} 
                  alt="Book Cover" 
                  className="w-full h-full object-cover transform transition-transform duration-700 hover:scale-105"
                 />
                 <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6 text-white">
                    <p className="text-sm font-medium uppercase tracking-widest opacity-80 mb-1">Arootah</p>
                    <p className="font-heading font-bold text-lg">Rayo Marji</p>
                 </div>
              </div>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-20">
            <Card icon={<Brain className="w-6 h-6 text-primary" />} title="Simple Mindset Shift" desc="Move from 'doing it yourself' to 'managing the bots'." />
            <Card icon={<Users className="w-6 h-6 text-indigo-500" />} title="Your Digital Team" desc="Learn to hire Researcher, Scheduler, and Analyst agents." />
            <Card icon={<Sparkles className="w-6 h-6 text-purple-500" />} title="Real Productivity" desc="Get 20+ hours back by delegating the busy work." />
          </div>

          <div className="space-y-8 max-w-3xl">
             <div className="flex items-center gap-3 pb-2 border-b border-border">
                <BookOpen className="w-5 h-5 text-primary" />
                <h2 className="text-2xl font-heading font-bold">What's Inside</h2>
             </div>
             
             <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground">
                <div dangerouslySetInnerHTML={{ __html: overview?.content || "" }} />
             </div>
          </div>

        </div>
      </div>
    </ReaderLayout>
  );
}

function Card({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-6 rounded-xl border border-border bg-card/50 hover:bg-card hover:shadow-lg transition-all duration-300 group">
      <div className="mb-4 p-3 rounded-lg bg-background border border-border w-fit group-hover:scale-110 transition-transform duration-300 shadow-sm">
        {icon}
      </div>
      <h3 className="text-lg font-heading font-semibold mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

import { ReaderLayout } from "@/components/ReaderLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { bookContent } from "@/lib/bookContent";
import { ArrowRight, BookOpen, Brain, Sparkles, Users, Clock, Target, Zap, CheckCircle2, Star } from "lucide-react";
import { Link } from "wouter";
import coverImage from "@assets/generated_images/futuristic_book_cover_for_ai_leadership_guide.png";

export default function Home() {
  const overview = bookContent.find(c => c.id === 'overview');

  return (
    <ReaderLayout>
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12 md:py-16">
          
          {/* Hero Section */}
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-20">
            <div className="space-y-8">
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="px-4 py-1.5 bg-gradient-to-r from-primary to-indigo-500 text-white border-0 rounded-full text-xs font-semibold tracking-wide uppercase shadow-lg shadow-primary/25">
                  New Release 2025
                </Badge>
                <Badge variant="outline" className="px-3 py-1 border-amber-500/30 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-full text-xs font-medium">
                  <Star className="w-3 h-3 mr-1 fill-current" /> Executive Playbook
                </Badge>
              </div>
              
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-[1.05] tracking-tight text-foreground">
                  Stop Using AI.
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-500 to-purple-500">Start Leading It.</span>
                </h1>
                <p className="text-xl text-muted-foreground leading-relaxed max-w-xl">
                  The definitive playbook for building your own <strong className="text-foreground">AI agent workforce</strong> — no coding required. Reclaim 20+ hours every week.
                </p>
              </div>

              {/* Author Section */}
              <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/30 border border-border/50">
                <div className="flex -space-x-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center text-white font-bold text-sm border-2 border-background">RM</div>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold text-sm border-2 border-background">RB</div>
                </div>
                <div>
                  <p className="font-semibold text-foreground">Rayo Marji & Rich Bello</p>
                  <p className="text-sm text-muted-foreground">CTO & Co-Founder, Arootah</p>
                </div>
              </div>
              
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="h-14 px-10 text-lg font-semibold shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-indigo-600 hover:from-primary/90 hover:to-indigo-600/90 transition-all hover:scale-105 active:scale-95 cursor-pointer" data-testid="button-start-reading">
                  <Link href="/chapter/chapter-1">
                    Start Reading Free <ArrowRight className="ml-2 w-5 h-5" />
                  </Link>
                </Button>
                
                <Button variant="outline" size="lg" asChild className="h-14 px-8 text-lg font-medium border-2 hover:bg-muted/50 cursor-pointer" data-testid="button-table-of-contents">
                  <Link href="/toc">
                    <BookOpen className="mr-2 w-5 h-5" /> Table of Contents
                  </Link>
                </Button>
              </div>
            </div>

            {/* Book Cover */}
            <div className="relative group perspective-1000 lg:pl-8">
              <div className="absolute -inset-4 bg-gradient-to-r from-primary via-indigo-500 to-purple-600 rounded-2xl blur-2xl opacity-20 group-hover:opacity-40 transition duration-1000"></div>
              <div className="relative aspect-[3/4] overflow-hidden rounded-2xl shadow-2xl border border-white/10 bg-gradient-to-br from-slate-900 to-slate-800 transform transition-all duration-700 group-hover:scale-[1.02] group-hover:rotate-1">
                <img 
                  src={coverImage} 
                  alt="The Leader's Guide to AI Teams - Book Cover" 
                  className="w-full h-full object-cover"
                  data-testid="img-book-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-8">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary mb-2">Arootah Presents</p>
                  <p className="font-heading font-bold text-2xl text-white mb-1">The Leader's Guide</p>
                  <p className="font-heading text-lg text-white/80">to AI Teams</p>
                </div>
              </div>
            </div>
          </div>

          {/* Value Props */}
          <div className="grid md:grid-cols-4 gap-6 mb-20">
            <StatCard number="20+" label="Hours Saved Weekly" />
            <StatCard number="10" label="Actionable Chapters" />
            <StatCard number="50+" label="Ready-to-Use Prompts" />
            <StatCard number="0" label="Coding Required" />
          </div>

          {/* Feature Cards */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-4 py-1">Why This Book?</Badge>
              <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
                From AI-Curious to AI-Commanding
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Most AI books teach you to prompt better. This one teaches you to <strong className="text-foreground">manage AI teams</strong> like the executive you are.
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <FeatureCard 
                icon={<Brain className="w-8 h-8" />}
                color="from-primary to-blue-600"
                title="Mindset Shift" 
                desc="Move from 'doing the work' to 'managing the bots'. The same leadership skills that make you effective with humans work with AI."
              />
              <FeatureCard 
                icon={<Users className="w-8 h-8" />}
                color="from-indigo-500 to-purple-600"
                title="Your Digital Team" 
                desc="Hire Researcher, Scheduler, Analyst, and Executive agents. Each one specialized. Each one working 24/7."
              />
              <FeatureCard 
                icon={<Zap className="w-8 h-8" />}
                color="from-purple-500 to-pink-600"
                title="Immediate ROI" 
                desc="Apply what you learn the same day you read it. Every chapter ends with actions you can take in under 30 minutes."
              />
            </div>
          </div>

          {/* What You'll Learn */}
          <div className="mb-20 p-8 md:p-12 rounded-3xl bg-gradient-to-br from-muted/50 to-muted/30 border border-border">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div>
                <Badge variant="outline" className="mb-4 px-4 py-1">Curriculum</Badge>
                <h2 className="text-3xl md:text-4xl font-heading font-bold mb-6">
                  10 Chapters. Zero Fluff.
                </h2>
                <p className="text-lg text-muted-foreground mb-8">
                  Every chapter follows the <strong className="text-foreground">Arootah Principles Book Formula</strong> — starting with the "why," moving to the "how," and ending with executable actions.
                </p>
                <Button asChild className="cursor-pointer" data-testid="button-explore-chapters">
                  <Link href="/toc">
                    Explore All Chapters <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                </Button>
              </div>
              <div className="space-y-4">
                <LearningItem text="Build specialized agents for research, scheduling & analysis" />
                <LearningItem text="Create AI org charts with clear delegation protocols" />
                <LearningItem text="Design decision-support systems that catch blind spots" />
                <LearningItem text="Scale AI adoption across your entire organization" />
                <LearningItem text="Implement human-AI handoff workflows" />
                <LearningItem text="Navigate ethics, governance & responsible AI use" />
              </div>
            </div>
          </div>

          {/* Authors Section */}
          <div className="mb-20">
            <div className="text-center mb-12">
              <Badge variant="outline" className="mb-4 px-4 py-1">Meet the Authors</Badge>
              <h2 className="text-3xl md:text-4xl font-heading font-bold">
                Written by Practitioners, Not Theorists
              </h2>
            </div>
            
            <div className="grid md:grid-cols-2 gap-8">
              <AuthorCard
                initials="RM"
                name="Rayo Marji"
                role="Chief Technology Officer"
                company="Arootah"
                bio="Rayo leads the intersection of technology and peak performance coaching at Arootah. He's built AI systems that power executive coaching programs and has helped hundreds of leaders integrate AI into their daily workflows."
                gradient="from-primary to-indigo-600"
              />
              <AuthorCard
                initials="RB"
                name="Rich Bello"
                role="Co-Founder"
                company="Arootah"
                bio="Rich brings decades of executive leadership experience from the highest levels of finance and business. He's seen firsthand how the best leaders adopt new technology — and how the rest get left behind."
                gradient="from-indigo-500 to-purple-600"
              />
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center py-16 px-8 rounded-3xl bg-gradient-to-br from-primary/10 via-indigo-500/10 to-purple-500/10 border border-primary/20">
            <h2 className="text-3xl md:text-4xl font-heading font-bold mb-4">
              Ready to Build Your AI Workforce?
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              Start Chapter 1 today and take your first step toward leading — not just using — artificial intelligence.
            </p>
            <Button asChild size="lg" className="h-14 px-12 text-lg font-semibold shadow-xl shadow-primary/30 bg-gradient-to-r from-primary to-indigo-600 cursor-pointer" data-testid="button-start-chapter-1">
              <Link href="/chapter/chapter-1">
                Begin Your Journey <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </Button>
          </div>

        </div>
      </div>
    </ReaderLayout>
  );
}

function StatCard({ number, label }: { number: string, label: string }) {
  return (
    <div className="text-center p-6 rounded-xl border border-border bg-card/50 hover:bg-card hover:shadow-lg transition-all duration-300" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, '-')}`}>
      <p className="text-4xl md:text-5xl font-heading font-bold text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-500">{number}</p>
      <p className="text-sm text-muted-foreground mt-2 font-medium">{label}</p>
    </div>
  );
}

function FeatureCard({ icon, color, title, desc }: { icon: React.ReactNode, color: string, title: string, desc: string }) {
  return (
    <div className="p-8 rounded-2xl border border-border bg-card/50 hover:bg-card hover:shadow-xl transition-all duration-300 group" data-testid={`feature-${title.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className={`mb-6 p-4 rounded-xl bg-gradient-to-br ${color} w-fit text-white group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
        {icon}
      </div>
      <h3 className="text-xl font-heading font-bold mb-3">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{desc}</p>
    </div>
  );
}

function LearningItem({ text }: { text: string }) {
  return (
    <div className="flex items-start gap-3 p-4 rounded-xl bg-background/50 border border-border/50">
      <CheckCircle2 className="w-6 h-6 text-primary shrink-0 mt-0.5" />
      <p className="text-foreground font-medium">{text}</p>
    </div>
  );
}

function AuthorCard({ initials, name, role, company, bio, gradient }: { initials: string, name: string, role: string, company: string, bio: string, gradient: string }) {
  return (
    <div className="p-8 rounded-2xl border border-border bg-card/50 hover:bg-card hover:shadow-xl transition-all duration-300" data-testid={`author-${name.toLowerCase().replace(/\s+/g, '-')}`}>
      <div className="flex items-center gap-4 mb-6">
        <div className={`w-16 h-16 rounded-full bg-gradient-to-br ${gradient} flex items-center justify-center text-white font-bold text-xl`}>
          {initials}
        </div>
        <div>
          <p className="font-heading font-bold text-xl">{name}</p>
          <p className="text-muted-foreground">{role}, {company}</p>
        </div>
      </div>
      <p className="text-muted-foreground leading-relaxed">{bio}</p>
    </div>
  );
}

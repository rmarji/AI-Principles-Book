import { CheckCircle, XCircle, AlertCircle, FileText, ListChecks, BookOpen, MessageSquare, Target, Quote, HelpCircle, CheckSquare, Heart, BookMarked, Ban } from "lucide-react";

interface QualityCheck {
  id: string;
  label: string;
  description: string;
  passed: boolean | null;
  icon: React.ReactNode;
}

interface QualityChecklistProps {
  wordCount: number | null;
  content: string | null;
  chapterId: string;
}

function checkSectionPresence(content: string, sectionName: string): boolean {
  const regex = new RegExp(`##?\\s*${sectionName}`, 'i');
  return regex.test(content);
}

function countHeadings(content: string): number {
  const matches = content.match(/^#{2,3}\s+.+$/gm);
  return matches ? matches.length : 0;
}

function hasOpeningQuote(content: string): boolean {
  const lines = content.split('\n').slice(0, 30);
  for (const line of lines) {
    if (line.includes('>') && line.includes('—')) return true;
    if (line.startsWith('>')) return true;
    if (/^["""].+["""]/.test(line.trim())) return true;
  }
  return false;
}

function hasKeyQuestion(content: string): boolean {
  return /key question/i.test(content) || /\*key question\*/i.test(content);
}

function hasAnchorStatistic(content: string): boolean {
  return /anchor statistic/i.test(content) || (/\d+%/.test(content) && /according to|research|study|data/i.test(content));
}

function countNumberedItems(content: string, sectionName: string): number {
  const sectionMatch = content.match(new RegExp(`##?\\s*${sectionName}[\\s\\S]*?(?=##|$)`, 'i'));
  if (!sectionMatch) return 0;
  const section = sectionMatch[0];
  const numberedItems = section.match(/^\d+\.\s+/gm);
  return numberedItems ? numberedItems.length : 0;
}

function hasHabitsSection(content: string): boolean {
  const hasHabits = checkSectionPresence(content, 'Habits');
  const hasBeneficial = /beneficial/i.test(content);
  const hasDetrimental = /detrimental/i.test(content);
  return hasHabits && (hasBeneficial || hasDetrimental);
}

function hasConclusionSection(content: string): boolean {
  return checkSectionPresence(content, 'Conclusion') || checkSectionPresence(content, 'Chapter Summary');
}

function countEmDashes(content: string): number {
  const emDashMatches = content.match(/—/g);
  return emDashMatches ? emDashMatches.length : 0;
}

export function QualityChecklist({ wordCount, content, chapterId }: QualityChecklistProps) {
  const isLoading = wordCount === null || content === null;
  
  const minWordCount = 10000;
  const maxWordCount = 11000;
  const passesWordCount = wordCount !== null && wordCount >= minWordCount;
  const wordCountStatus = wordCount !== null 
    ? (wordCount >= minWordCount && wordCount <= maxWordCount 
      ? 'Optimal' 
      : wordCount >= minWordCount 
        ? 'Above target' 
        : 'Below minimum')
    : 'Checking...';
  
  const hasQuote = content ? hasOpeningQuote(content) : false;
  const hasQuestion = content ? hasKeyQuestion(content) : false;
  const hasStatistic = content ? hasAnchorStatistic(content) : false;
  
  const headingCount = content ? countHeadings(content) : 0;
  const hasAdequateStructure = headingCount >= 8 && headingCount <= 15;
  
  const hasConclusionSec = content ? hasConclusionSection(content) : false;
  
  const summaryCount = content ? countNumberedItems(content, 'Summary') : 0;
  const hasSummary = summaryCount >= 10;
  
  const assessmentCount = content ? countNumberedItems(content, 'Assessment') : 0;
  const hasAssessment = assessmentCount >= 5 && assessmentCount <= 7;
  
  const goalsCount = content ? countNumberedItems(content, 'Goals') : 0;
  const hasGoals = goalsCount >= 8 && goalsCount <= 10;
  
  const hasHabits = content ? hasHabitsSection(content) : false;
  
  const emDashCount = content ? countEmDashes(content) : 0;
  const hasNoEmDashes = emDashCount === 0;

  const checks: QualityCheck[] = [
    {
      id: 'word-count',
      label: 'Word Count',
      description: wordCount !== null 
        ? `${wordCount.toLocaleString()} / ${minWordCount.toLocaleString()}-${maxWordCount.toLocaleString()}`
        : 'Checking...',
      passed: isLoading ? null : passesWordCount,
      icon: <FileText className="w-3.5 h-3.5" />
    },
    {
      id: 'opening-quote',
      label: 'Opening Quote',
      description: hasQuote ? 'Present' : 'Missing',
      passed: isLoading ? null : hasQuote,
      icon: <Quote className="w-3.5 h-3.5" />
    },
    {
      id: 'key-question',
      label: 'Key Question',
      description: hasQuestion ? 'Present' : 'Missing',
      passed: isLoading ? null : hasQuestion,
      icon: <HelpCircle className="w-3.5 h-3.5" />
    },
    {
      id: 'anchor-statistic',
      label: 'Anchor Statistic',
      description: hasStatistic ? 'Present' : 'Missing',
      passed: isLoading ? null : hasStatistic,
      icon: <Target className="w-3.5 h-3.5" />
    },
    {
      id: 'structure',
      label: 'Subsections',
      description: `${headingCount} (target: 8-15)`,
      passed: isLoading ? null : hasAdequateStructure,
      icon: <ListChecks className="w-3.5 h-3.5" />
    },
    {
      id: 'conclusion',
      label: 'Conclusion',
      description: hasConclusionSec ? 'Present' : 'Missing',
      passed: isLoading ? null : hasConclusionSec,
      icon: <BookOpen className="w-3.5 h-3.5" />
    },
    {
      id: 'summary',
      label: 'Summary',
      description: `${summaryCount} points (target: 10)`,
      passed: isLoading ? null : hasSummary,
      icon: <BookMarked className="w-3.5 h-3.5" />
    },
    {
      id: 'assessment',
      label: 'Assessment',
      description: `${assessmentCount} questions (target: 5-7)`,
      passed: isLoading ? null : hasAssessment,
      icon: <MessageSquare className="w-3.5 h-3.5" />
    },
    {
      id: 'goals',
      label: 'Goals',
      description: `${goalsCount} goals (target: 8-10)`,
      passed: isLoading ? null : hasGoals,
      icon: <CheckSquare className="w-3.5 h-3.5" />
    },
    {
      id: 'habits',
      label: 'Habits',
      description: hasHabits ? 'Beneficial + Detrimental' : 'Missing sections',
      passed: isLoading ? null : hasHabits,
      icon: <Heart className="w-3.5 h-3.5" />
    },
    {
      id: 'em-dashes',
      label: 'Em Dashes',
      description: emDashCount === 0 ? 'None found' : `${emDashCount} found (remove all)`,
      passed: isLoading ? null : hasNoEmDashes,
      icon: <Ban className="w-3.5 h-3.5" />
    }
  ];

  const passedCount = checks.filter(c => c.passed === true).length;
  const totalChecks = checks.length;
  const overallScore = Math.round((passedCount / totalChecks) * 100);

  return (
    <div className="h-full flex flex-col" data-testid="quality-checklist">
      <div className="p-3 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <ListChecks className="w-3.5 h-3.5" />
            Arootah Standards
          </h3>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${
            overallScore >= 80 ? 'bg-green-500/10 text-green-600' :
            overallScore >= 50 ? 'bg-yellow-500/10 text-yellow-600' :
            'bg-red-500/10 text-red-600'
          }`} data-testid="quality-score">
            {overallScore}%
          </span>
        </div>
      </div>
      
      <div className="p-3 space-y-1.5 flex-1 overflow-y-auto">
        {checks.map(check => (
          <div 
            key={check.id} 
            className="flex items-center gap-2 text-xs"
            data-testid={`check-${check.id}`}
          >
            {check.passed === null ? (
              <AlertCircle className="w-3.5 h-3.5 text-muted-foreground animate-pulse shrink-0" />
            ) : check.passed ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500 shrink-0" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-500 shrink-0" />
            )}
            <span className="text-muted-foreground flex items-center gap-1.5 truncate">
              {check.icon}
              {check.label}
            </span>
            <span className={`ml-auto text-[10px] whitespace-nowrap ${
              check.passed === null ? 'text-muted-foreground' :
              check.passed ? 'text-green-600' : 'text-red-600'
            }`}>
              {check.description}
            </span>
          </div>
        ))}
      </div>
      
      <div className="p-2 border-t border-border bg-muted/20">
        <p className="text-[10px] text-muted-foreground text-center">
          Based on Arootah Principles Book Formula
        </p>
      </div>
    </div>
  );
}

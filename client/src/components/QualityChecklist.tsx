import { CheckCircle, XCircle, AlertCircle, FileText, ListChecks, BookOpen, MessageSquare, Target } from "lucide-react";

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

export function QualityChecklist({ wordCount, content, chapterId }: QualityChecklistProps) {
  const isLoading = wordCount === null || content === null;
  
  const minWordCount = 10000;
  const passesWordCount = wordCount !== null && wordCount >= minWordCount;
  
  const hasSummary = content ? checkSectionPresence(content, 'Chapter Summary') || checkSectionPresence(content, 'Summary') : false;
  const hasKeyTakeaways = content ? checkSectionPresence(content, 'Key Takeaways') : false;
  const hasReflectionQuestions = content ? checkSectionPresence(content, 'Reflection Questions') : false;
  const hasActionItems = content ? checkSectionPresence(content, 'Action Items') : false;
  
  const headingCount = content ? countHeadings(content) : 0;
  const hasAdequateStructure = headingCount >= 8;

  const checks: QualityCheck[] = [
    {
      id: 'word-count',
      label: 'Word Count',
      description: wordCount !== null 
        ? `${wordCount.toLocaleString()} / ${minWordCount.toLocaleString()} min`
        : 'Checking...',
      passed: isLoading ? null : passesWordCount,
      icon: <FileText className="w-3.5 h-3.5" />
    },
    {
      id: 'summary',
      label: 'Chapter Summary',
      description: hasSummary ? 'Present' : 'Missing',
      passed: isLoading ? null : hasSummary,
      icon: <BookOpen className="w-3.5 h-3.5" />
    },
    {
      id: 'takeaways',
      label: 'Key Takeaways',
      description: hasKeyTakeaways ? 'Present' : 'Missing',
      passed: isLoading ? null : hasKeyTakeaways,
      icon: <ListChecks className="w-3.5 h-3.5" />
    },
    {
      id: 'reflection',
      label: 'Reflection Questions',
      description: hasReflectionQuestions ? 'Present' : 'Missing',
      passed: isLoading ? null : hasReflectionQuestions,
      icon: <MessageSquare className="w-3.5 h-3.5" />
    },
    {
      id: 'action-items',
      label: 'Action Items',
      description: hasActionItems ? 'Present' : 'Missing',
      passed: isLoading ? null : hasActionItems,
      icon: <Target className="w-3.5 h-3.5" />
    },
    {
      id: 'structure',
      label: 'Section Structure',
      description: `${headingCount} sections (min 8)`,
      passed: isLoading ? null : hasAdequateStructure,
      icon: <ListChecks className="w-3.5 h-3.5" />
    }
  ];

  const passedCount = checks.filter(c => c.passed === true).length;
  const totalChecks = checks.length;
  const overallScore = Math.round((passedCount / totalChecks) * 100);

  return (
    <div className="border-b border-border" data-testid="quality-checklist">
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <ListChecks className="w-3.5 h-3.5" />
            Chapter Quality
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
      
      <div className="p-3 space-y-2">
        {checks.map(check => (
          <div 
            key={check.id} 
            className="flex items-center gap-2 text-xs"
            data-testid={`check-${check.id}`}
          >
            {check.passed === null ? (
              <AlertCircle className="w-3.5 h-3.5 text-muted-foreground animate-pulse" />
            ) : check.passed ? (
              <CheckCircle className="w-3.5 h-3.5 text-green-500" />
            ) : (
              <XCircle className="w-3.5 h-3.5 text-red-500" />
            )}
            <span className="text-muted-foreground flex items-center gap-1.5">
              {check.icon}
              {check.label}
            </span>
            <span className={`ml-auto text-[10px] ${
              check.passed === null ? 'text-muted-foreground' :
              check.passed ? 'text-green-600' : 'text-red-600'
            }`}>
              {check.description}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

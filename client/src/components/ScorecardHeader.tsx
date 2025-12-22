import { Badge } from "@/components/ui/badge";
import { FileText, AlertTriangle, Clock, TrendingUp } from "lucide-react";
import type { CritiqueScorecard } from "../../../shared/types/critique";

interface ScorecardHeaderProps {
  scorecard: CritiqueScorecard;
}

function getGradeColor(grade: string): string {
  const letter = grade.charAt(0).toUpperCase();
  switch (letter) {
    case 'A':
      return 'bg-green-500';
    case 'B':
      return 'bg-blue-500';
    case 'C':
      return 'bg-yellow-500';
    case 'D':
    case 'F':
      return 'bg-red-500';
    default:
      return 'bg-gray-500';
  }
}

function getGradeBorderColor(grade: string): string {
  const letter = grade.charAt(0).toUpperCase();
  switch (letter) {
    case 'A':
      return 'border-green-500/30';
    case 'B':
      return 'border-blue-500/30';
    case 'C':
      return 'border-yellow-500/30';
    case 'D':
    case 'F':
      return 'border-red-500/30';
    default:
      return 'border-gray-500/30';
  }
}

function getPriorityVariant(priority: string): "destructive" | "secondary" | "outline" {
  switch (priority) {
    case 'HIGH':
      return 'destructive';
    case 'MEDIUM':
      return 'secondary';
    default:
      return 'outline';
  }
}

function formatWordCount(count: number): string {
  if (count >= 1000) {
    return `~${(count / 1000).toFixed(1)}k`;
  }
  return `~${count}`;
}

export function ScorecardHeader({ scorecard }: ScorecardHeaderProps) {
  const {
    overallGrade,
    grades,
    wordCount,
    priorityLevel,
    criticalIssuesCount,
    estimatedRevisionHours,
    complexity
  } = scorecard;

  return (
    <div className={`rounded-lg border-2 ${getGradeBorderColor(overallGrade)} bg-card/50 p-3 mb-3`}>
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
          Chapter Scorecard
        </h4>
        <Badge variant={getPriorityVariant(priorityLevel)} className="text-[10px] h-4">
          {priorityLevel} Priority
        </Badge>
      </div>

      {/* Overall Grade */}
      <div className="flex items-center gap-3 mb-3">
        <div className={`${getGradeColor(overallGrade)} text-white font-bold text-lg px-3 py-1 rounded`}>
          {overallGrade}
        </div>
        <div className="text-xs text-muted-foreground">
          <span className="block">AI: {grades.aiContent}</span>
          <span className="block">Writing: {grades.writingQuality}</span>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2 text-[11px]">
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <FileText className="w-3 h-3" />
          <span>{formatWordCount(wordCount)} words</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <AlertTriangle className="w-3 h-3" />
          <span>{criticalIssuesCount} critical issues</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <Clock className="w-3 h-3" />
          <span>{estimatedRevisionHours.total > 0 ? `${estimatedRevisionHours.total}h revision` : 'Est. TBD'}</span>
        </div>
        <div className="flex items-center gap-1.5 text-muted-foreground">
          <TrendingUp className="w-3 h-3" />
          <span>{complexity || 'Medium'}</span>
        </div>
      </div>
    </div>
  );
}

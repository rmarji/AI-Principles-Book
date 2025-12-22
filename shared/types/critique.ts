export interface LineRef {
  text: string;
  startLine: number;
  endLine?: number;
}

export interface CritiqueSubsection {
  id: string;
  title: string;
  content: string;
}

export interface CritiqueSection {
  id: string;
  title: string;
  type: 'info' | 'actionable';
  priority?: 'critical' | 'high' | 'medium' | 'low';
  content: string;
  lineRefs: LineRef[];
  subsections?: CritiqueSubsection[];
}

export interface EstimatedRevisionHours {
  critical: number;
  important: number;
  enhancement: number;
  total: number;
}

export interface CritiqueGrades {
  aiContent: string;
  writingQuality: string;
}

export interface CritiqueScorecard {
  overallGrade: string;
  grades: CritiqueGrades;
  wordCount: number;
  priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW';
  criticalIssuesCount: number;
  criticalIssues: string[];
  estimatedRevisionHours: EstimatedRevisionHours;
  complexity: string;
}

export interface ChapterCritique {
  id: string;
  title: string;
  generatedAt: string;
  scorecard: CritiqueScorecard;
  sections: CritiqueSection[];
  bottomLine: string;
}

export interface ScorecardSummary {
  id: string;
  scorecard: Pick<CritiqueScorecard, 'overallGrade' | 'priorityLevel'>;
}

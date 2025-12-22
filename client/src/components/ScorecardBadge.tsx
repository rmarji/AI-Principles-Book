import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import type { CritiqueScorecard } from "../../../shared/types/critique";

interface ScorecardBadgeProps {
  chapterId: string;
}

function getGradeColor(grade: string): string {
  const letter = grade.charAt(0).toUpperCase();
  switch (letter) {
    case 'A':
      return 'bg-green-500 hover:bg-green-600';
    case 'B':
      return 'bg-blue-500 hover:bg-blue-600';
    case 'C':
      return 'bg-yellow-500 hover:bg-yellow-600';
    case 'D':
    case 'F':
      return 'bg-red-500 hover:bg-red-600';
    default:
      return 'bg-gray-500 hover:bg-gray-600';
  }
}

function getPriorityClasses(priority: string): string {
  switch (priority) {
    case 'HIGH':
      return 'bg-red-100 text-red-700 border-red-200';
    case 'MEDIUM':
      return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    default:
      return 'bg-gray-100 text-gray-700 border-gray-200';
  }
}

export function ScorecardBadge({ chapterId }: ScorecardBadgeProps) {
  const [scorecard, setScorecard] = useState<CritiqueScorecard | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/critiques/${chapterId}/scorecard`)
      .then(res => {
        if (!res.ok) return null;
        return res.json();
      })
      .then(data => {
        if (data?.scorecard) {
          setScorecard(data.scorecard);
        }
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [chapterId]);

  if (loading) {
    return (
      <Badge variant="outline" className="text-[10px] h-5 gap-1">
        <Loader2 className="w-3 h-3 animate-spin" />
      </Badge>
    );
  }

  if (!scorecard) {
    return null;
  }

  const { overallGrade, priorityLevel } = scorecard;

  return (
    <div className="flex items-center gap-1.5">
      <Badge
        className={`text-[10px] h-5 font-bold text-white ${getGradeColor(overallGrade)}`}
        data-testid="grade-badge"
      >
        {overallGrade}
      </Badge>
      {priorityLevel === 'HIGH' && (
        <Badge
          variant="outline"
          className={`text-[10px] h-5 ${getPriorityClasses(priorityLevel)}`}
          data-testid="priority-badge"
        >
          {priorityLevel}
        </Badge>
      )}
    </div>
  );
}

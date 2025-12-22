import fs from 'fs';
import path from 'path';
import type {
  ChapterCritique,
  CritiqueScorecard,
  CritiqueSection,
  LineRef,
  EstimatedRevisionHours
} from '../shared/types/critique';

const CRITIQUES_DIR = path.join(process.cwd(), 'critiques');

const INFO_SECTION_KEYWORDS = [
  'executive summary',
  'bottom line',
  'estimated revision effort',
  'overview',
  'introduction',
  'summary grade',
  'time required',
  'complexity',
  'dependencies',
];

function getSectionType(title: string): 'info' | 'actionable' {
  const lowerTitle = title.toLowerCase();
  for (const keyword of INFO_SECTION_KEYWORDS) {
    if (lowerTitle.includes(keyword)) {
      return 'info';
    }
  }
  return 'actionable';
}

function parseLineReferences(text: string): LineRef[] {
  const refs: LineRef[] = [];
  const seen = new Set<string>();

  const patterns = [
    /Lines?\s+(\d+)[-–](\d+)/gi,
    /Lines?\s+(\d+)/gi,
    /\(lines?\s+(\d+)[-–](\d+)\)/gi,
    /\(lines?\s+(\d+)\)/gi,
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      const key = match[0];
      if (!seen.has(key)) {
        seen.add(key);
        if (match[2]) {
          refs.push({ text: match[0], startLine: parseInt(match[1]), endLine: parseInt(match[2]) });
        } else {
          refs.push({ text: match[0], startLine: parseInt(match[1]) });
        }
      }
    }
  }

  return refs;
}

function getPriority(title: string, content: string): 'critical' | 'high' | 'medium' | 'low' | undefined {
  const searchText = (title + ' ' + content.slice(0, 500)).toLowerCase();
  if (searchText.includes('critical')) return 'critical';
  if (searchText.includes('high')) return 'high';
  if (searchText.includes('medium')) return 'medium';
  if (searchText.includes('low') || searchText.includes('enhancement')) return 'low';
  return undefined;
}

function parseWordCount(text: string): number {
  const match = text.match(/~?(\d+[,.]?\d*)/);
  if (match) {
    return parseInt(match[1].replace(/[,.]/, ''));
  }
  return 0;
}

function parseGrade(text: string): { overall: string; aiContent: string; writingQuality: string } {
  // Format: "C+ (AI Content) / B- (Writing Quality)" or "C (AI Content) / B (Writing Quality)"
  const match = text.match(/([A-F][+-]?)\s*\(AI Content\)\s*\/\s*([A-F][+-]?)\s*\(Writing Quality\)/i);
  if (match) {
    return {
      overall: match[1],
      aiContent: match[1],
      writingQuality: match[2]
    };
  }
  // Fallback: just a single grade
  const simpleMatch = text.match(/([A-F][+-]?)/);
  return {
    overall: simpleMatch ? simpleMatch[1] : 'N/A',
    aiContent: simpleMatch ? simpleMatch[1] : 'N/A',
    writingQuality: simpleMatch ? simpleMatch[1] : 'N/A'
  };
}

function parsePriorityLevel(text: string): 'HIGH' | 'MEDIUM' | 'LOW' {
  const upper = text.toUpperCase();
  if (upper.includes('HIGH')) return 'HIGH';
  if (upper.includes('MEDIUM')) return 'MEDIUM';
  return 'LOW';
}

function parseCriticalIssues(content: string): string[] {
  const issues: string[] = [];
  const lines = content.split('\n');
  let inCriticalIssues = false;

  for (const line of lines) {
    if (line.includes('**Critical Issues:**')) {
      inCriticalIssues = true;
      continue;
    }
    if (inCriticalIssues) {
      if (line.match(/^\s*\d+\.\s+/)) {
        const issue = line.replace(/^\s*\d+\.\s+/, '').trim();
        issues.push(issue);
      } else if (line.match(/^-\s*\*\*Priority Level/)) {
        break;
      } else if (line.match(/^##\s/) || line.match(/^-\s*\*\*/)) {
        break;
      }
    }
  }

  return issues;
}

function parseEstimatedRevisionHours(content: string): EstimatedRevisionHours {
  const hours: EstimatedRevisionHours = {
    critical: 0,
    important: 0,
    enhancement: 0,
    total: 0
  };

  // Look for patterns like "12-16 hours" or "8-10 hours"
  const criticalMatch = content.match(/Critical fixes?[:\s]+(\d+)[-–]?(\d+)?\s*hours?/i);
  const importantMatch = content.match(/Important fixes?[:\s]+(\d+)[-–]?(\d+)?\s*hours?/i);
  const enhancementMatch = content.match(/Enhancement fixes?[:\s]+(\d+)[-–]?(\d+)?\s*hours?/i);
  const totalMatch = content.match(/Total[:\s]+(\d+)[-–]?(\d+)?\s*hours?/i);

  if (criticalMatch) {
    hours.critical = criticalMatch[2] ? parseInt(criticalMatch[2]) : parseInt(criticalMatch[1]);
  }
  if (importantMatch) {
    hours.important = importantMatch[2] ? parseInt(importantMatch[2]) : parseInt(importantMatch[1]);
  }
  if (enhancementMatch) {
    hours.enhancement = enhancementMatch[2] ? parseInt(enhancementMatch[2]) : parseInt(enhancementMatch[1]);
  }
  if (totalMatch) {
    hours.total = totalMatch[2] ? parseInt(totalMatch[2]) : parseInt(totalMatch[1]);
  }

  // If total not found, calculate it
  if (hours.total === 0) {
    hours.total = hours.critical + hours.important + hours.enhancement;
  }

  return hours;
}

function parseComplexity(content: string): string {
  const match = content.match(/\*\*?Complexity\*\*?[:\s]+([^\n]+)/i);
  if (match) {
    return match[1].replace(/^\*\*?|\*\*?$/g, '').trim();
  }

  // Look for complexity mentions in Estimated Revision Effort section
  const complexityMatch = content.match(/Complexity[:\s-]+\*\*([^*]+)\*\*/i);
  if (complexityMatch) {
    return complexityMatch[1].trim();
  }

  return 'Medium';
}

function parseExecutiveSummary(content: string): Partial<CritiqueScorecard> {
  const lines = content.split('\n');
  let wordCount = 0;
  let grades = { overall: 'N/A', aiContent: 'N/A', writingQuality: 'N/A' };
  let priorityLevel: 'HIGH' | 'MEDIUM' | 'LOW' = 'MEDIUM';
  let criticalIssuesInline: string[] = [];

  for (const line of lines) {
    // Handle both formats: with and without bold markers
    if (line.match(/Current Word Count/i)) {
      wordCount = parseWordCount(line);
    }
    if (line.match(/Overall Grade/i)) {
      grades = parseGrade(line);
    }
    if (line.match(/Priority Level/i)) {
      priorityLevel = parsePriorityLevel(line);
    }
    // Handle inline critical issues format
    if (line.match(/Critical Issues?:/i) && !line.includes('\n')) {
      const issueText = line.replace(/^.*Critical Issues?:\s*/i, '').trim();
      if (issueText && !issueText.match(/^\d+\./)) {
        // Inline format like "Outdated technology references, all hypothetical examples"
        criticalIssuesInline = issueText.split(/,\s*/).map(s => s.trim()).filter(s => s);
      }
    }
  }

  // Try numbered list format first, fall back to inline
  let criticalIssues = parseCriticalIssues(content);
  if (criticalIssues.length === 0 && criticalIssuesInline.length > 0) {
    criticalIssues = criticalIssuesInline;
  }

  return {
    overallGrade: grades.overall,
    grades: {
      aiContent: grades.aiContent,
      writingQuality: grades.writingQuality
    },
    wordCount,
    priorityLevel,
    criticalIssuesCount: criticalIssues.length,
    criticalIssues
  };
}

function parseBottomLine(content: string): string {
  const bottomLineMatch = content.match(/## Bottom Line\s*\n\n?([\s\S]*?)(?=\n##|\n*$)/i);
  if (bottomLineMatch) {
    return bottomLineMatch[1].trim();
  }
  return '';
}

function parseSections(content: string): CritiqueSection[] {
  const sections: CritiqueSection[] = [];
  const parts = content.split(/^## /gm).filter(s => s.trim());

  parts.forEach((part, index) => {
    const lines = part.split('\n');
    const title = lines[0]?.trim() || `Section ${index + 1}`;
    const sectionContent = lines.slice(1).join('\n').trim();
    const sectionType = getSectionType(title);
    const priority = sectionType === 'actionable' ? getPriority(title, sectionContent) : undefined;
    const lineRefs = parseLineReferences(sectionContent);

    sections.push({
      id: `section-${index}`,
      title,
      type: sectionType,
      priority,
      content: sectionContent,
      lineRefs
    });
  });

  return sections;
}

function extractChapterTitle(content: string): string {
  const match = content.match(/^# (.+)$/m);
  return match ? match[1].replace(' - Expert Critique', '').trim() : 'Unknown Chapter';
}

function convertCritique(filePath: string): ChapterCritique {
  const content = fs.readFileSync(filePath, 'utf-8');
  const filename = path.basename(filePath);
  const id = filename.replace('-critique.md', '');

  const title = extractChapterTitle(content);
  const sections = parseSections(content);

  // Find executive summary section for scorecard data
  const execSummarySection = sections.find(s => s.title.toLowerCase().includes('executive summary'));
  const execSummaryContent = execSummarySection ? execSummarySection.content : '';
  const summaryData = parseExecutiveSummary(execSummaryContent);

  // Parse revision effort from full content
  const revisionHours = parseEstimatedRevisionHours(content);
  const complexity = parseComplexity(content);

  const scorecard: CritiqueScorecard = {
    overallGrade: summaryData.overallGrade || 'N/A',
    grades: summaryData.grades || { aiContent: 'N/A', writingQuality: 'N/A' },
    wordCount: summaryData.wordCount || 0,
    priorityLevel: summaryData.priorityLevel || 'MEDIUM',
    criticalIssuesCount: summaryData.criticalIssuesCount || 0,
    criticalIssues: summaryData.criticalIssues || [],
    estimatedRevisionHours: revisionHours,
    complexity
  };

  const bottomLine = parseBottomLine(content);

  return {
    id,
    title,
    generatedAt: new Date().toISOString(),
    scorecard,
    sections,
    bottomLine
  };
}

function main() {
  console.log('Converting markdown critiques to JSON...\n');

  const files = fs.readdirSync(CRITIQUES_DIR)
    .filter(f => f.endsWith('-critique.md') && f.startsWith('chapter-'));

  console.log(`Found ${files.length} critique files to convert.\n`);

  for (const file of files) {
    const filePath = path.join(CRITIQUES_DIR, file);
    const critique = convertCritique(filePath);

    const outputPath = filePath.replace('.md', '.json');
    fs.writeFileSync(outputPath, JSON.stringify(critique, null, 2));

    console.log(`✓ ${file} -> ${path.basename(outputPath)}`);
    console.log(`  Grade: ${critique.scorecard.overallGrade} | Priority: ${critique.scorecard.priorityLevel} | Issues: ${critique.scorecard.criticalIssuesCount}`);
  }

  console.log('\nDone! All critiques converted to JSON.');
}

main();

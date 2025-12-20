import { useState, useEffect, useCallback } from "react";
import { ChevronDown, ChevronRight, CheckCircle, XCircle, Clock, AlertTriangle, FileWarning, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";

interface CritiqueItem {
  id: string;
  title: string;
  content: string;
  lineRefs: LineRef[];
  priority?: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'approved' | 'dismissed';
}

interface LineRef {
  text: string;
  startLine: number;
  endLine?: number;
}

interface CritiquePanelProps {
  chapterId: string;
  onNavigateToLine?: (lineNumber: number) => void;
}

function parseLineReferences(text: string): LineRef[] {
  const refs: LineRef[] = [];
  const patterns = [
    /Lines?\s+(\d+)[-–](\d+)/gi,
    /Lines?\s+(\d+)/gi,
    /\(lines?\s+(\d+)[-–](\d+)\)/gi,
    /\(lines?\s+(\d+)\)/gi,
  ];
  
  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[2]) {
        refs.push({ text: match[0], startLine: parseInt(match[1]), endLine: parseInt(match[2]) });
      } else {
        refs.push({ text: match[0], startLine: parseInt(match[1]) });
      }
    }
  }
  
  return refs;
}

function parseCritique(content: string): CritiqueItem[] {
  const items: CritiqueItem[] = [];
  const sections = content.split(/^## /gm).filter(s => s.trim());
  
  sections.forEach((section, index) => {
    const lines = section.split('\n');
    const title = lines[0]?.trim() || `Section ${index + 1}`;
    const sectionContent = lines.slice(1).join('\n').trim();
    
    let priority: CritiqueItem['priority'] = undefined;
    if (/critical/i.test(title) || /critical/i.test(sectionContent.slice(0, 200))) {
      priority = 'critical';
    } else if (/high/i.test(title)) {
      priority = 'high';
    } else if (/medium/i.test(title)) {
      priority = 'medium';
    } else if (/low/i.test(title) || /enhancement/i.test(title)) {
      priority = 'low';
    }
    
    const lineRefs = parseLineReferences(sectionContent);
    
    items.push({
      id: `critique-${index}`,
      title,
      content: sectionContent,
      lineRefs,
      priority,
      status: 'pending',
    });
  });
  
  return items;
}

function getStorageKey(chapterId: string): string {
  return `critique-status-${chapterId}`;
}

function loadSavedStatus(chapterId: string): Record<string, 'pending' | 'approved' | 'dismissed'> {
  try {
    const saved = localStorage.getItem(getStorageKey(chapterId));
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
}

function saveStatus(chapterId: string, statuses: Record<string, 'pending' | 'approved' | 'dismissed'>) {
  localStorage.setItem(getStorageKey(chapterId), JSON.stringify(statuses));
}

export function CritiquePanel({ chapterId, onNavigateToLine }: CritiquePanelProps) {
  const [critique, setCritique] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<CritiqueItem[]>([]);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [statuses, setStatuses] = useState<Record<string, 'pending' | 'approved' | 'dismissed'>>({});

  useEffect(() => {
    setLoading(true);
    setError(null);
    
    fetch(`/api/critiques/${chapterId}`)
      .then(res => {
        if (!res.ok) {
          if (res.status === 404) {
            throw new Error('No critique available for this chapter');
          }
          throw new Error('Failed to load critique');
        }
        return res.json();
      })
      .then(data => {
        setCritique(data.content);
        const parsed = parseCritique(data.content);
        const savedStatuses = loadSavedStatus(chapterId);
        
        const itemsWithStatus = parsed.map(item => ({
          ...item,
          status: savedStatuses[item.id] || 'pending'
        }));
        
        setItems(itemsWithStatus);
        setStatuses(savedStatuses);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [chapterId]);

  const toggleExpand = (itemId: string) => {
    setExpandedItems(prev => {
      const next = new Set(prev);
      if (next.has(itemId)) {
        next.delete(itemId);
      } else {
        next.add(itemId);
      }
      return next;
    });
  };

  const updateStatus = (itemId: string, status: 'pending' | 'approved' | 'dismissed') => {
    const newStatuses = { ...statuses, [itemId]: status };
    setStatuses(newStatuses);
    saveStatus(chapterId, newStatuses);
    
    setItems(prev => prev.map(item => 
      item.id === itemId ? { ...item, status } : item
    ));
  };

  const handleLineClick = useCallback((lineNumber: number) => {
    if (onNavigateToLine) {
      onNavigateToLine(lineNumber);
    }
  }, [onNavigateToLine]);

  const renderContentWithLinks = (content: string) => {
    const parts: (string | React.ReactElement)[] = [];
    let lastIndex = 0;
    
    const linePattern = /Lines?\s+(\d+)(?:[-–](\d+))?/gi;
    let match;
    
    while ((match = linePattern.exec(content)) !== null) {
      if (match.index > lastIndex) {
        parts.push(content.slice(lastIndex, match.index));
      }
      
      const startLine = parseInt(match[1]);
      const endLine = match[2] ? parseInt(match[2]) : undefined;
      
      parts.push(
        <button
          key={`line-${match.index}`}
          onClick={() => handleLineClick(startLine)}
          className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
          data-testid={`link-line-${startLine}`}
        >
          {match[0]}
          <ExternalLink className="w-3 h-3" />
        </button>
      );
      
      lastIndex = match.index + match[0].length;
    }
    
    if (lastIndex < content.length) {
      parts.push(content.slice(lastIndex));
    }
    
    return parts;
  };

  const getPriorityBadge = (priority?: CritiqueItem['priority']) => {
    switch (priority) {
      case 'critical':
        return <Badge variant="destructive" className="text-[10px] h-4">Critical</Badge>;
      case 'high':
        return <Badge className="text-[10px] h-4 bg-orange-500">High</Badge>;
      case 'medium':
        return <Badge variant="secondary" className="text-[10px] h-4">Medium</Badge>;
      case 'low':
        return <Badge variant="outline" className="text-[10px] h-4">Low</Badge>;
      default:
        return null;
    }
  };

  const getStatusIcon = (status: CritiqueItem['status']) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'dismissed':
        return <XCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const pendingCount = items.filter(i => i.status === 'pending').length;
  const approvedCount = items.filter(i => i.status === 'approved').length;

  if (loading) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        Loading critique...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-center text-sm text-muted-foreground">
        <FileWarning className="w-8 h-8 mx-auto mb-2 opacity-50" />
        {error}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full" data-testid="critique-panel">
      <div className="p-3 border-b border-border bg-muted/30">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5" />
            Expert Critique
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              {approvedCount}/{items.length} approved
            </span>
            {pendingCount > 0 && (
              <Badge variant="secondary" className="text-[10px] h-4">
                {pendingCount} pending
              </Badge>
            )}
          </div>
        </div>
      </div>
      
      <ScrollArea className="flex-1">
        <div className="p-2 space-y-1">
          {items.map(item => (
            <div 
              key={item.id} 
              className={`rounded-lg border ${
                item.status === 'approved' ? 'border-green-500/30 bg-green-500/5' :
                item.status === 'dismissed' ? 'border-border/50 bg-muted/30 opacity-60' :
                'border-border'
              }`}
              data-testid={`critique-item-${item.id}`}
            >
              <button
                onClick={() => toggleExpand(item.id)}
                className="w-full p-2 flex items-start gap-2 text-left hover:bg-muted/50 rounded-t-lg transition-colors"
              >
                {expandedItems.has(item.id) ? (
                  <ChevronDown className="w-4 h-4 mt-0.5 shrink-0" />
                ) : (
                  <ChevronRight className="w-4 h-4 mt-0.5 shrink-0" />
                )}
                {getStatusIcon(item.status)}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-medium truncate">{item.title}</span>
                    {getPriorityBadge(item.priority)}
                  </div>
                  {item.lineRefs.length > 0 && (
                    <div className="text-[10px] text-muted-foreground mt-0.5">
                      {item.lineRefs.length} line reference{item.lineRefs.length > 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              </button>
              
              {expandedItems.has(item.id) && (
                <div className="px-3 pb-3 pt-2 border-t border-border/50">
                  <div className="text-xs text-muted-foreground leading-relaxed mb-3 max-h-80 overflow-y-auto break-words" style={{ wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    {renderContentWithLinks(item.content.slice(0, 2500))}
                    {item.content.length > 2500 && (
                      <span className="text-muted-foreground/50">... (truncated)</span>
                    )}
                  </div>
                  
                  {item.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs flex-1"
                        onClick={() => updateStatus(item.id, 'approved')}
                        data-testid={`approve-${item.id}`}
                      >
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 text-xs"
                        onClick={() => updateStatus(item.id, 'dismissed')}
                        data-testid={`dismiss-${item.id}`}
                      >
                        <XCircle className="w-3 h-3 mr-1" />
                        Dismiss
                      </Button>
                    </div>
                  )}
                  
                  {item.status !== 'pending' && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 text-xs w-full"
                      onClick={() => updateStatus(item.id, 'pending')}
                    >
                      Reset to Pending
                    </Button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </div>
  );
}

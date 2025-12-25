import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Sparkles, Edit3, TrendingUp, Brain, User, Loader2, CheckCircle2, XCircle, ChevronDown, AlertTriangle, Info, Clock } from "lucide-react";

interface Perspective {
  id: string;
  name: string;
  icon: string;
  color: string;
}

interface Finding {
  id: number;
  critiqueId: number;
  perspective: string;
  category: string;
  title: string;
  description: string;
  suggestion: string | null;
  priority: string;
  sectionReference: string | null;
  status: string;
  createdAt: string;
}

interface Critique {
  id: number;
  chapterId: string;
  perspectives: string[];
  status: string;
  createdAt: string;
}

interface AICritiquePanelProps {
  chapterId: string;
  onHighlightSection?: (sectionId: string) => void;
}

const ICON_MAP: { [key: string]: React.ElementType } = {
  Edit3,
  TrendingUp,
  Brain,
  User
};

const PRIORITY_COLORS: { [key: string]: string } = {
  high: "bg-red-500/10 text-red-600 border-red-500/30",
  medium: "bg-amber-500/10 text-amber-600 border-amber-500/30",
  low: "bg-blue-500/10 text-blue-600 border-blue-500/30"
};

const PERSPECTIVE_COLORS: { [key: string]: string } = {
  executive_editor: "bg-blue-500/10 text-blue-600 border-blue-500/30",
  marketing_strategist: "bg-green-500/10 text-green-600 border-green-500/30",
  subject_matter_expert: "bg-purple-500/10 text-purple-600 border-purple-500/30",
  reader_advocate: "bg-orange-500/10 text-orange-600 border-orange-500/30"
};

export function AICritiquePanel({ chapterId, onHighlightSection }: AICritiquePanelProps) {
  const [perspectives, setPerspectives] = useState<Perspective[]>([]);
  const [selectedPerspectives, setSelectedPerspectives] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationProgress, setGenerationProgress] = useState<{ current: number; total: number; currentName: string }>({ current: 0, total: 0, currentName: "" });
  const [critique, setCritique] = useState<Critique | null>(null);
  const [findings, setFindings] = useState<Finding[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [errors, setErrors] = useState<{ perspective: string; error: string }[]>([]);

  useEffect(() => {
    fetchPerspectives();
    fetchExistingCritique();
  }, [chapterId]);

  const fetchPerspectives = async () => {
    try {
      const res = await fetch("/api/critique/perspectives");
      const data = await res.json();
      setPerspectives(data.perspectives);
      setSelectedPerspectives(data.perspectives.map((p: Perspective) => p.id));
    } catch (error) {
      console.error("Failed to fetch perspectives:", error);
    }
  };

  const fetchExistingCritique = async () => {
    try {
      const res = await fetch(`/api/critique/chapter/${chapterId}`);
      const data = await res.json();
      if (data.critique) {
        setCritique(data.critique);
        setFindings(data.findings);
      }
    } catch (error) {
      console.error("Failed to fetch existing critique:", error);
    }
  };

  const togglePerspective = (perspectiveId: string) => {
    setSelectedPerspectives(prev =>
      prev.includes(perspectiveId)
        ? prev.filter(p => p !== perspectiveId)
        : [...prev, perspectiveId]
    );
  };

  const generateCritique = async () => {
    if (selectedPerspectives.length === 0) return;

    setIsGenerating(true);
    setGenerationProgress({ current: 0, total: selectedPerspectives.length, currentName: "" });
    setDialogOpen(false);
    setErrors([]);

    try {
      const response = await fetch("/api/critique/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chapterId, perspectives: selectedPerspectives })
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      const newErrors: { perspective: string; error: string }[] = [];

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value);
          const lines = chunk.split("\n");

          for (const line of lines) {
            if (line.startsWith("data: ")) {
              try {
                const event = JSON.parse(line.slice(6));
                
                if (event.type === "perspective_started") {
                  setGenerationProgress({
                    current: event.index,
                    total: event.total,
                    currentName: event.name
                  });
                } else if (event.type === "perspective_error") {
                  const perspectiveName = perspectives.find(p => p.id === event.perspective)?.name || event.perspective;
                  newErrors.push({ perspective: perspectiveName, error: event.error });
                } else if (event.type === "complete") {
                  await fetchExistingCritique();
                  if (newErrors.length > 0) {
                    setErrors(newErrors);
                  }
                }
              } catch {
                // Ignore parse errors
              }
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to generate critique:", error);
      setErrors([{ perspective: "System", error: "Failed to connect to AI service" }]);
    } finally {
      setIsGenerating(false);
    }
  };

  const updateFindingStatus = async (findingId: number, status: string) => {
    try {
      await fetch(`/api/critique/finding/${findingId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });

      setFindings(prev =>
        prev.map(f => f.id === findingId ? { ...f, status } : f)
      );
    } catch (error) {
      console.error("Failed to update finding:", error);
    }
  };

  const getFilteredFindings = () => {
    if (activeTab === "all") return findings;
    return findings.filter(f => f.perspective === activeTab);
  };

  const getPerspectiveIcon = (iconName: string) => {
    const Icon = ICON_MAP[iconName] || Brain;
    return Icon;
  };

  const groupFindingsByPriority = (findingsToGroup: Finding[]) => {
    return {
      high: findingsToGroup.filter(f => f.priority === "high"),
      medium: findingsToGroup.filter(f => f.priority === "medium"),
      low: findingsToGroup.filter(f => f.priority === "low")
    };
  };

  const filteredFindings = getFilteredFindings();
  const groupedFindings = groupFindingsByPriority(filteredFindings);

  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h3 className="font-heading font-semibold">AI Critique</h3>
          {critique && (
            <Badge variant="outline" className="text-xs">
              {findings.length} findings
            </Badge>
          )}
        </div>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button
              size="sm"
              variant={critique ? "outline" : "default"}
              disabled={isGenerating}
              className="cursor-pointer"
              data-testid="button-generate-critique"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Analyzing ({generationProgress.current}/{generationProgress.total})
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  {critique ? "Re-generate" : "Generate Critique"}
                </>
              )}
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Generate AI Critique</DialogTitle>
              <DialogDescription>
                Select which expert perspectives to include in your critique analysis.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <p className="text-sm text-muted-foreground">
                Claude will analyze this chapter from multiple expert perspectives:
              </p>
              <div className="space-y-3">
                {perspectives.map(perspective => {
                  const Icon = getPerspectiveIcon(perspective.icon);
                  return (
                    <div
                      key={perspective.id}
                      className="flex items-start gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => togglePerspective(perspective.id)}
                      data-testid={`checkbox-perspective-${perspective.id}`}
                    >
                      <Checkbox
                        checked={selectedPerspectives.includes(perspective.id)}
                        onCheckedChange={() => togglePerspective(perspective.id)}
                        className="mt-0.5"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-muted-foreground" />
                          <span className="font-medium">{perspective.name}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={generateCritique}
                disabled={selectedPerspectives.length === 0}
                className="cursor-pointer"
                data-testid="button-start-critique"
              >
                <Sparkles className="w-4 h-4 mr-2" />
                Analyze with {selectedPerspectives.length} Perspective{selectedPerspectives.length !== 1 ? "s" : ""}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {isGenerating && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-6">
            <div className="flex items-center gap-4">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
              <div>
                <p className="font-medium">Analyzing chapter...</p>
                <p className="text-sm text-muted-foreground">
                  {generationProgress.currentName} ({generationProgress.current}/{generationProgress.total})
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {errors.length > 0 && (
        <Card className="border-red-500/20 bg-red-500/5">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-medium text-red-600 dark:text-red-400">Some perspectives encountered errors</p>
                {errors.map((err, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    <span className="font-medium">{err.perspective}:</span> {err.error}
                  </p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {!isGenerating && critique && findings.length > 0 && (
        <div className="flex-1 min-h-0 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
            <TabsList className="w-full justify-start flex-wrap h-auto gap-1 bg-transparent p-0 shrink-0">
              <TabsTrigger
                value="all"
                className="data-[state=active]:bg-muted"
                data-testid="tab-all-findings"
              >
                All ({findings.length})
              </TabsTrigger>
              {perspectives.filter(p => findings.some(f => f.perspective === p.id)).map(perspective => {
                const Icon = getPerspectiveIcon(perspective.icon);
                const count = findings.filter(f => f.perspective === perspective.id).length;
                return (
                  <TabsTrigger
                    key={perspective.id}
                    value={perspective.id}
                    className="data-[state=active]:bg-muted"
                    data-testid={`tab-${perspective.id}`}
                  >
                    <Icon className="w-3 h-3 mr-1" />
                    {perspective.name} ({count})
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <TabsContent value={activeTab} className="mt-4 flex-1 min-h-0 flex flex-col">
              <ScrollArea className="flex-1 min-h-0 pr-4 [&>div]:h-full [&_[data-radix-scroll-area-viewport]]:h-full">
                <div className="space-y-6">
                  {groupedFindings.high.length > 0 && (
                    <FindingGroup
                      title="High Priority"
                      icon={<AlertTriangle className="w-4 h-4 text-red-500" />}
                      findings={groupedFindings.high}
                      perspectives={perspectives}
                      getPerspectiveIcon={getPerspectiveIcon}
                      onUpdateStatus={updateFindingStatus}
                      onHighlightSection={onHighlightSection}
                    />
                  )}
                  {groupedFindings.medium.length > 0 && (
                    <FindingGroup
                      title="Medium Priority"
                      icon={<Clock className="w-4 h-4 text-amber-500" />}
                      findings={groupedFindings.medium}
                      perspectives={perspectives}
                      getPerspectiveIcon={getPerspectiveIcon}
                      onUpdateStatus={updateFindingStatus}
                      onHighlightSection={onHighlightSection}
                    />
                  )}
                  {groupedFindings.low.length > 0 && (
                    <FindingGroup
                      title="Low Priority"
                      icon={<Info className="w-4 h-4 text-blue-500" />}
                      findings={groupedFindings.low}
                      perspectives={perspectives}
                      getPerspectiveIcon={getPerspectiveIcon}
                      onUpdateStatus={updateFindingStatus}
                      onHighlightSection={onHighlightSection}
                    />
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {!isGenerating && (!critique || findings.length === 0) && (
        <Card className="border-dashed">
          <CardContent className="py-8 text-center">
            <Sparkles className="w-10 h-10 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              No AI critique yet. Click "Generate Critique" to analyze this chapter from multiple expert perspectives.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

interface FindingGroupProps {
  title: string;
  icon: React.ReactNode;
  findings: Finding[];
  perspectives: Perspective[];
  getPerspectiveIcon: (name: string) => React.ElementType;
  onUpdateStatus: (id: number, status: string) => void;
  onHighlightSection?: (sectionId: string) => void;
}

function FindingGroup({ title, icon, findings, perspectives, getPerspectiveIcon, onUpdateStatus, onHighlightSection }: FindingGroupProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="flex items-center gap-2 w-full p-2 rounded-lg hover:bg-muted/50 transition-colors">
        {icon}
        <span className="font-medium">{title}</span>
        <Badge variant="secondary" className="ml-auto mr-2">{findings.length}</Badge>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </CollapsibleTrigger>
      <CollapsibleContent className="mt-2 space-y-3">
        {findings.map(finding => {
          const perspective = perspectives.find(p => p.id === finding.perspective);
          const Icon = perspective ? getPerspectiveIcon(perspective.icon) : Brain;

          return (
            <Card
              key={finding.id}
              className={`transition-all ${finding.status === "addressed" ? "opacity-50" : ""}`}
              data-testid={`finding-${finding.id}`}
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <Badge className={`${PERSPECTIVE_COLORS[finding.perspective] || "bg-muted"} shrink-0`}>
                        <Icon className="w-3 h-3 mr-1" />
                        <span className="truncate max-w-[100px]">{perspective?.name || finding.perspective}</span>
                      </Badge>
                      <Badge variant="outline" className="text-xs shrink-0">{finding.category}</Badge>
                    </div>
                    <CardTitle className="text-base break-words">{finding.title}</CardTitle>
                  </div>
                  <Badge className={`${PRIORITY_COLORS[finding.priority]} shrink-0`}>
                    {finding.priority}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-0 overflow-hidden">
                <p className="text-sm text-muted-foreground mb-3 break-words">{finding.description}</p>
                
                {finding.suggestion && (
                  <div className="p-3 rounded-lg bg-muted/50 border border-border mb-3 overflow-hidden">
                    <p className="text-sm break-words">
                      <span className="font-medium text-primary">Suggestion:</span> {finding.suggestion}
                    </p>
                  </div>
                )}

                {finding.sectionReference && (
                  <button
                    onClick={() => onHighlightSection?.(finding.sectionReference!.toLowerCase().replace(/\s+/g, '-'))}
                    className="text-xs text-primary hover:underline cursor-pointer"
                    data-testid={`link-section-${finding.id}`}
                  >
                    → {finding.sectionReference}
                  </button>
                )}

                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border">
                  {finding.status === "pending" && (
                    <>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onUpdateStatus(finding.id, "addressed")}
                        className="cursor-pointer"
                        data-testid={`button-address-${finding.id}`}
                      >
                        <CheckCircle2 className="w-3 h-3 mr-1" /> Mark Addressed
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUpdateStatus(finding.id, "rejected")}
                        className="cursor-pointer text-muted-foreground"
                        data-testid={`button-reject-${finding.id}`}
                      >
                        <XCircle className="w-3 h-3 mr-1" /> Dismiss
                      </Button>
                    </>
                  )}
                  {finding.status === "addressed" && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Addressed
                    </Badge>
                  )}
                  {finding.status === "rejected" && (
                    <Badge variant="outline" className="bg-muted text-muted-foreground">
                      <XCircle className="w-3 h-3 mr-1" /> Dismissed
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </CollapsibleContent>
    </Collapsible>
  );
}

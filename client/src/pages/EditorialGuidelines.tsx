import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Save, Loader2, BookOpen, Pencil, MessageSquare, Layout, Users, FileText } from "lucide-react";

interface EditorialGuidelinesData {
  id?: number;
  critiqueRules: string | null;
  rewritingInstructions: string | null;
  toneVoice: string | null;
  formattingRequirements: string | null;
  targetAudience: string | null;
  contentStructure: string | null;
}

export default function EditorialGuidelines() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<EditorialGuidelinesData>({
    critiqueRules: "",
    rewritingInstructions: "",
    toneVoice: "",
    formattingRequirements: "",
    targetAudience: "",
    contentStructure: "",
  });

  const { data: guidelines, isLoading } = useQuery({
    queryKey: ["editorial-guidelines"],
    queryFn: async () => {
      const res = await fetch("/api/editorial-guidelines");
      if (!res.ok) throw new Error("Failed to fetch guidelines");
      return res.json();
    },
  });

  useEffect(() => {
    if (guidelines) {
      setFormData({
        critiqueRules: guidelines.critiqueRules || "",
        rewritingInstructions: guidelines.rewritingInstructions || "",
        toneVoice: guidelines.toneVoice || "",
        formattingRequirements: guidelines.formattingRequirements || "",
        targetAudience: guidelines.targetAudience || "",
        contentStructure: guidelines.contentStructure || "",
      });
    }
  }, [guidelines]);

  const saveMutation = useMutation({
    mutationFn: async (data: EditorialGuidelinesData) => {
      const res = await fetch("/api/editorial-guidelines", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error("Failed to save guidelines");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["editorial-guidelines"] });
      toast({
        title: "Guidelines Saved",
        description: "Your editorial guidelines have been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSave = () => {
    saveMutation.mutate(formData);
  };

  const handleChange = (field: keyof EditorialGuidelinesData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center" data-testid="loading-spinner">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setLocation("/")}
              data-testid="button-back"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Book
            </Button>
            <div className="h-6 w-px bg-border" />
            <h1 className="text-xl font-semibold">Editorial Guidelines</h1>
          </div>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            data-testid="button-save-guidelines"
          >
            {saveMutation.isPending ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Guidelines
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="mb-6">
          <p className="text-muted-foreground">
            Configure the rules and instructions that guide AI critique generation and content rewriting.
            These guidelines help maintain consistency across all chapters.
          </p>
        </div>

        <div className="space-y-6">
          <Card data-testid="card-critique-rules">
            <CardHeader>
              <div className="flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-blue-500" />
                <CardTitle>Critique Rules</CardTitle>
              </div>
              <CardDescription>
                Define what the AI should focus on when evaluating chapter content
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="critiqueRules"
                value={formData.critiqueRules || ""}
                onChange={(e) => handleChange("critiqueRules", e.target.value)}
                placeholder="Example: Focus on actionable advice for busy executives. Flag any technical jargon that isn't explained. Ensure each section has clear takeaways..."
                className="min-h-[120px]"
                data-testid="input-critique-rules"
              />
            </CardContent>
          </Card>

          <Card data-testid="card-rewriting-instructions">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Pencil className="h-5 w-5 text-green-500" />
                <CardTitle>Rewriting Instructions</CardTitle>
              </div>
              <CardDescription>
                Guide how the AI should rewrite content when addressing findings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="rewritingInstructions"
                value={formData.rewritingInstructions || ""}
                onChange={(e) => handleChange("rewritingInstructions", e.target.value)}
                placeholder="Example: Maintain the author's voice. Keep sentences concise (under 25 words). Use active voice. Include transition sentences between sections..."
                className="min-h-[120px]"
                data-testid="input-rewriting-instructions"
              />
            </CardContent>
          </Card>

          <Card data-testid="card-tone-voice">
            <CardHeader>
              <div className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-purple-500" />
                <CardTitle>Tone & Voice</CardTitle>
              </div>
              <CardDescription>
                Describe the desired writing style and voice for the book
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="toneVoice"
                value={formData.toneVoice || ""}
                onChange={(e) => handleChange("toneVoice", e.target.value)}
                placeholder="Example: Professional but approachable. Authoritative without being academic. Conversational tone that respects the reader's time..."
                className="min-h-[120px]"
                data-testid="input-tone-voice"
              />
            </CardContent>
          </Card>

          <Card data-testid="card-formatting">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-orange-500" />
                <CardTitle>Formatting Requirements</CardTitle>
              </div>
              <CardDescription>
                Specify formatting rules for headings, lists, and structure
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="formattingRequirements"
                value={formData.formattingRequirements || ""}
                onChange={(e) => handleChange("formattingRequirements", e.target.value)}
                placeholder="Example: Use H2 for main sections, H3 for subsections. Bullet points for lists of 3+ items. Bold key terms on first use..."
                className="min-h-[120px]"
                data-testid="input-formatting-requirements"
              />
            </CardContent>
          </Card>

          <Card data-testid="card-target-audience">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Users className="h-5 w-5 text-cyan-500" />
                <CardTitle>Target Audience</CardTitle>
              </div>
              <CardDescription>
                Describe who this book is written for
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="targetAudience"
                value={formData.targetAudience || ""}
                onChange={(e) => handleChange("targetAudience", e.target.value)}
                placeholder="Example: Senior executives and business leaders (VP+) who are non-technical but need to understand AI. Busy professionals who want practical, actionable guidance..."
                className="min-h-[120px]"
                data-testid="input-target-audience"
              />
            </CardContent>
          </Card>

          <Card data-testid="card-content-structure">
            <CardHeader>
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-rose-500" />
                <CardTitle>Content Structure</CardTitle>
              </div>
              <CardDescription>
                Define the expected structure for each chapter
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                id="contentStructure"
                value={formData.contentStructure || ""}
                onChange={(e) => handleChange("contentStructure", e.target.value)}
                placeholder="Example: Each chapter should have: 1) Opening hook/story, 2) Core concepts, 3) Practical examples, 4) Action items, 5) Key takeaways summary..."
                className="min-h-[120px]"
                data-testid="input-content-structure"
              />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

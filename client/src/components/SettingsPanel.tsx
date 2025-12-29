import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ChevronDown, ChevronRight, Save, RotateCcw, Settings, Check, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CritiquePerspective {
  name: string;
  icon: string;
  color: string;
  prompt: string;
}

interface PromptsConfig {
  critiquePerspectives: Record<string, CritiquePerspective>;
  critiqueSystemSuffix: string;
  fixGenerationPrompt: string;
  chatSystemPrompt: string;
}

interface PromptEditorProps {
  label: string;
  promptKey: string;
  value: string;
  onChange: (key: string, value: string) => void;
  onSave: (key: string) => void;
  saving: boolean;
  saved: boolean;
}

function PromptEditor({ label, promptKey, value, onChange, onSave, saving, saved }: PromptEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="border rounded-lg">
      <CollapsibleTrigger className="flex items-center justify-between w-full p-3 hover:bg-muted/50 transition-colors">
        <span className="font-medium text-sm">{label}</span>
        <div className="flex items-center gap-2">
          {saved && <Check className="w-4 h-4 text-green-500" />}
          {isOpen ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
        </div>
      </CollapsibleTrigger>
      <CollapsibleContent className="px-3 pb-3">
        <Textarea
          value={value}
          onChange={(e) => onChange(promptKey, e.target.value)}
          className="min-h-[200px] font-mono text-xs"
          data-testid={`textarea-${promptKey}`}
        />
        <div className="flex justify-end mt-2">
          <Button
            size="sm"
            onClick={() => onSave(promptKey)}
            disabled={saving}
            data-testid={`button-save-${promptKey}`}
          >
            {saving ? (
              <Loader2 className="w-4 h-4 mr-1 animate-spin" />
            ) : (
              <Save className="w-4 h-4 mr-1" />
            )}
            Save
          </Button>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export function SettingsPanel() {
  const [prompts, setPrompts] = useState<PromptsConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [saved, setSaved] = useState<Record<string, boolean>>({});
  const [resetting, setResetting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrompts();
  }, []);

  const fetchPrompts = async () => {
    try {
      const response = await fetch("/api/prompts");
      const data = await response.json();
      setPrompts(data);
    } catch (error) {
      console.error("Failed to fetch prompts:", error);
      toast({
        title: "Error",
        description: "Failed to load prompts configuration",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (key: string, value: string) => {
    if (!prompts) return;
    
    setSaved(prev => ({ ...prev, [key]: false }));
    
    if (key.startsWith("perspective_")) {
      const perspectiveKey = key.replace("perspective_", "");
      setPrompts({
        ...prompts,
        critiquePerspectives: {
          ...prompts.critiquePerspectives,
          [perspectiveKey]: {
            ...prompts.critiquePerspectives[perspectiveKey],
            prompt: value
          }
        }
      });
    } else {
      setPrompts({
        ...prompts,
        [key]: value
      });
    }
  };

  const handleSave = async (key: string) => {
    if (!prompts) return;
    
    setSaving(prev => ({ ...prev, [key]: true }));
    
    try {
      let value: string;
      if (key.startsWith("perspective_")) {
        const perspectiveKey = key.replace("perspective_", "");
        value = prompts.critiquePerspectives[perspectiveKey].prompt;
      } else {
        value = prompts[key as keyof PromptsConfig] as string;
      }
      
      const response = await fetch("/api/prompts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value })
      });
      
      if (response.ok) {
        setSaved(prev => ({ ...prev, [key]: true }));
        window.dispatchEvent(new CustomEvent('prompts-updated'));
        toast({
          title: "Saved",
          description: "Prompt updated successfully"
        });
      } else {
        throw new Error("Failed to save");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save prompt",
        variant: "destructive"
      });
    } finally {
      setSaving(prev => ({ ...prev, [key]: false }));
    }
  };

  const handleReset = async () => {
    setResetting(true);
    try {
      const response = await fetch("/api/prompts/reset", { method: "POST" });
      if (response.ok) {
        await fetchPrompts();
        setSaved({});
        window.dispatchEvent(new CustomEvent('prompts-updated'));
        toast({
          title: "Reset Complete",
          description: "All prompts restored to defaults"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reset prompts",
        variant: "destructive"
      });
    } finally {
      setResetting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!prompts) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        Failed to load prompts
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col" data-testid="settings-panel">
      <div className="p-3 border-b border-border bg-muted/30 shrink-0">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
            <Settings className="w-3.5 h-3.5" />
            AI Prompts Configuration
          </h3>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={resetting}
            className="h-7 text-xs"
            data-testid="button-reset-prompts"
          >
            {resetting ? (
              <Loader2 className="w-3 h-3 mr-1 animate-spin" />
            ) : (
              <RotateCcw className="w-3 h-3 mr-1" />
            )}
            Reset All
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-4">
        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            Critique Perspectives
          </Label>
          <div className="space-y-2">
            {Object.entries(prompts.critiquePerspectives).map(([key, perspective]) => (
              <PromptEditor
                key={key}
                label={perspective.name}
                promptKey={`perspective_${key}`}
                value={perspective.prompt}
                onChange={handleChange}
                onSave={handleSave}
                saving={saving[`perspective_${key}`] || false}
                saved={saved[`perspective_${key}`] || false}
              />
            ))}
          </div>
        </div>

        <div>
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2 block">
            System Prompts
          </Label>
          <div className="space-y-2">
            <PromptEditor
              label="Critique Response Format"
              promptKey="critiqueSystemSuffix"
              value={prompts.critiqueSystemSuffix}
              onChange={handleChange}
              onSave={handleSave}
              saving={saving["critiqueSystemSuffix"] || false}
              saved={saved["critiqueSystemSuffix"] || false}
            />
            <PromptEditor
              label="Fix Generation Instructions"
              promptKey="fixGenerationPrompt"
              value={prompts.fixGenerationPrompt}
              onChange={handleChange}
              onSave={handleSave}
              saving={saving["fixGenerationPrompt"] || false}
              saved={saved["fixGenerationPrompt"] || false}
            />
            <PromptEditor
              label="Chat Assistant"
              promptKey="chatSystemPrompt"
              value={prompts.chatSystemPrompt}
              onChange={handleChange}
              onSave={handleSave}
              saving={saving["chatSystemPrompt"] || false}
              saved={saved["chatSystemPrompt"] || false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

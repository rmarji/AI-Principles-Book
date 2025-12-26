import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "default",
  themeVariables: {
    primaryColor: "#e0e7ff",
    primaryTextColor: "#1e1b4b",
    primaryBorderColor: "#6366f1",
    lineColor: "#4338ca",
    secondaryColor: "#c7d2fe",
    tertiaryColor: "#ddd6fe",
    background: "#ffffff",
    mainBkg: "#e0e7ff",
    nodeBorder: "#6366f1",
    clusterBkg: "#f5f3ff",
    clusterBorder: "#6366f1",
    titleColor: "#1e1b4b",
    edgeLabelBackground: "#ffffff",
    fontFamily: "Arial, sans-serif",
    nodeTextColor: "#1e1b4b",
    textColor: "#1e1b4b"
  },
  flowchart: {
    htmlLabels: false,
    curve: "basis",
    nodeSpacing: 50,
    rankSpacing: 50
  }
});

interface MermaidDiagramProps {
  id: string;
  title: string;
  definition: string;
  caption?: string;
}

export function MermaidDiagram({ id, title, definition, caption }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const renderDiagram = async () => {
      if (!containerRef.current) return;
      
      try {
        setLoading(true);
        setError(null);
        
        const { svg } = await mermaid.render(`mermaid-${id}`, definition);
        setSvg(svg);
      } catch (err) {
        console.error("Mermaid render error:", err);
        setError("Failed to render diagram");
      } finally {
        setLoading(false);
      }
    };

    renderDiagram();
  }, [id, definition]);

  return (
    <Card className="my-8 overflow-hidden" data-testid={`diagram-${id}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium text-primary">{title}</CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <div
          ref={containerRef}
          className="flex justify-center items-center min-h-[200px] bg-white rounded-lg p-4"
        >
          {loading && (
            <div className="flex items-center gap-2 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin" />
              <span>Loading diagram...</span>
            </div>
          )}
          {error && (
            <div className="text-destructive text-sm">{error}</div>
          )}
          {!loading && !error && (
            <div
              className="mermaid-svg w-full overflow-x-auto"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
          )}
        </div>
        {caption && (
          <p className="mt-3 text-sm text-muted-foreground text-center italic">
            {caption}
          </p>
        )}
      </CardContent>
    </Card>
  );
}

export async function renderMermaidToSvg(id: string, definition: string): Promise<string> {
  try {
    const { svg } = await mermaid.render(`export-${id}`, definition);
    return svg;
  } catch (err) {
    console.error("Mermaid export render error:", err);
    return "";
  }
}

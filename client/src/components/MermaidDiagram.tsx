import { useEffect, useRef, useState } from "react";
import mermaid from "mermaid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

mermaid.initialize({
  startOnLoad: false,
  theme: "base",
  themeVariables: {
    primaryColor: "#6366f1",
    primaryTextColor: "#1f2937",
    primaryBorderColor: "#4f46e5",
    lineColor: "#6b7280",
    secondaryColor: "#f3f4f6",
    tertiaryColor: "#e0e7ff",
    background: "#ffffff",
    mainBkg: "#ffffff",
    nodeBorder: "#4f46e5",
    clusterBkg: "#f8fafc",
    clusterBorder: "#e2e8f0",
    titleColor: "#1f2937",
    edgeLabelBackground: "#ffffff",
    fontFamily: "Inter, sans-serif"
  },
  flowchart: {
    htmlLabels: true,
    curve: "basis"
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

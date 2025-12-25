import mermaid from "mermaid";

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

export async function renderMermaidToSvg(id: string, definition: string): Promise<string> {
  try {
    const { svg } = await mermaid.render(`export-${id}-${Date.now()}`, definition);
    return svg;
  } catch (err) {
    console.error("Mermaid export render error:", err);
    return "";
  }
}

export async function svgToPng(svgString: string, width: number = 600, height: number = 400): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    try {
      const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);
      
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        
        const svgWidth = img.width || width;
        const svgHeight = img.height || height;
        const scale = Math.min(width / svgWidth, height / svgHeight, 2);
        
        canvas.width = svgWidth * scale;
        canvas.height = svgHeight * scale;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          URL.revokeObjectURL(url);
          resolve(null);
          return;
        }
        
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        canvas.toBlob((blob) => {
          URL.revokeObjectURL(url);
          if (blob) {
            blob.arrayBuffer().then(buffer => {
              resolve(new Uint8Array(buffer));
            }).catch(() => resolve(null));
          } else {
            resolve(null);
          }
        }, 'image/png');
      };
      
      img.onerror = () => {
        URL.revokeObjectURL(url);
        resolve(null);
      };
      
      img.src = url;
    } catch (err) {
      console.error("SVG to PNG conversion error:", err);
      resolve(null);
    }
  });
}

export interface DiagramImage {
  id: string;
  title: string;
  caption?: string;
  imageData: Uint8Array;
  width: number;
  height: number;
}

export async function renderDiagramsToImages(
  diagrams: Array<{ id: string; title: string; definition: string; caption?: string }>
): Promise<DiagramImage[]> {
  const results: DiagramImage[] = [];
  
  for (const diagram of diagrams) {
    const svg = await renderMermaidToSvg(diagram.id, diagram.definition);
    if (svg) {
      const imageData = await svgToPng(svg, 500, 350);
      if (imageData) {
        results.push({
          id: diagram.id,
          title: diagram.title,
          caption: diagram.caption,
          imageData,
          width: 500,
          height: 350
        });
      }
    }
  }
  
  return results;
}

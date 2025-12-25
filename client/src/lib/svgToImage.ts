import mermaid from "mermaid";

let exportMermaidInitialized = false;

function initExportMermaid() {
  if (exportMermaidInitialized) return;
  
  mermaid.initialize({
    startOnLoad: false,
    theme: "default",
    themeVariables: {
      primaryColor: "#6366f1",
      primaryTextColor: "#000000",
      primaryBorderColor: "#4338ca",
      lineColor: "#1f2937",
      secondaryColor: "#a5b4fc",
      tertiaryColor: "#c7d2fe",
      background: "#ffffff",
      mainBkg: "#6366f1",
      nodeBorder: "#312e81",
      clusterBkg: "#e0e7ff",
      clusterBorder: "#6366f1",
      titleColor: "#000000",
      edgeLabelBackground: "#ffffff",
      fontFamily: "Arial, sans-serif",
      nodeTextColor: "#ffffff",
      textColor: "#000000"
    },
    flowchart: {
      htmlLabels: false,
      curve: "basis",
      nodeSpacing: 50,
      rankSpacing: 50
    }
  });
  
  exportMermaidInitialized = true;
}

export async function renderMermaidToSvg(id: string, definition: string): Promise<string> {
  try {
    initExportMermaid();
    const { svg } = await mermaid.render(`export-${id}-${Date.now()}`, definition);
    return svg;
  } catch (err) {
    console.error("Mermaid export render error:", err);
    return "";
  }
}

function cleanSvgForExport(svgString: string): string {
  let cleaned = svgString
    .replace(/<foreignObject[^>]*>[\s\S]*?<\/foreignObject>/gi, '')
    .replace(/<br\s*\/?>/gi, ' ');
  
  if (!cleaned.includes('xmlns=')) {
    cleaned = cleaned.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  
  if (!cleaned.includes('xmlns:xlink')) {
    cleaned = cleaned.replace('xmlns="http://www.w3.org/2000/svg"', 
      'xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"');
  }
  
  return cleaned;
}

export async function svgToPng(svgString: string, width: number = 600, height: number = 400): Promise<Uint8Array | null> {
  return new Promise((resolve) => {
    const timeout = setTimeout(() => {
      console.warn("SVG to PNG conversion timed out");
      resolve(null);
    }, 10000);
    
    try {
      if (!svgString || svgString.trim() === '') {
        clearTimeout(timeout);
        resolve(null);
        return;
      }
      
      const cleanedSvg = cleanSvgForExport(svgString);
      
      const parser = new DOMParser();
      const doc = parser.parseFromString(cleanedSvg, 'image/svg+xml');
      const svgElement = doc.documentElement;
      
      const parserError = doc.querySelector('parsererror');
      if (parserError) {
        console.error("SVG parsing error:", parserError.textContent);
        clearTimeout(timeout);
        resolve(null);
        return;
      }
      
      let svgWidth = width;
      let svgHeight = height;
      
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/);
        if (parts.length === 4) {
          svgWidth = parseFloat(parts[2]) || width;
          svgHeight = parseFloat(parts[3]) || height;
        }
      }
      
      const widthAttr = svgElement.getAttribute('width');
      const heightAttr = svgElement.getAttribute('height');
      if (widthAttr) {
        const w = parseFloat(widthAttr.replace('px', ''));
        if (!isNaN(w) && w > 0) svgWidth = w;
      }
      if (heightAttr) {
        const h = parseFloat(heightAttr.replace('px', ''));
        if (!isNaN(h) && h > 0) svgHeight = h;
      }
      
      svgElement.setAttribute('width', String(svgWidth));
      svgElement.setAttribute('height', String(svgHeight));
      if (!svgElement.getAttribute('viewBox')) {
        svgElement.setAttribute('viewBox', `0 0 ${svgWidth} ${svgHeight}`);
      }
      
      const serializer = new XMLSerializer();
      const svgData = serializer.serializeToString(svgElement);
      const base64 = btoa(unescape(encodeURIComponent(svgData)));
      const dataUrl = `data:image/svg+xml;base64,${base64}`;
      
      const img = new Image();
      img.onload = () => {
        clearTimeout(timeout);
        try {
          const canvas = document.createElement('canvas');
          const targetWidth = Math.min(svgWidth, 500);
          const scale = targetWidth / svgWidth;
          
          canvas.width = Math.max(1, svgWidth * scale);
          canvas.height = Math.max(1, svgHeight * scale);
          
          const ctx = canvas.getContext('2d');
          if (!ctx) {
            resolve(null);
            return;
          }
          
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          
          canvas.toBlob((blob) => {
            if (blob) {
              blob.arrayBuffer().then(buffer => {
                resolve(new Uint8Array(buffer));
              }).catch(() => resolve(null));
            } else {
              resolve(null);
            }
          }, 'image/png', 0.95);
        } catch (err) {
          console.error("Canvas drawing error:", err);
          resolve(null);
        }
      };
      
      img.onerror = (e) => {
        clearTimeout(timeout);
        console.error("Failed to load SVG as image:", e);
        resolve(null);
      };
      
      img.src = dataUrl;
    } catch (err) {
      clearTimeout(timeout);
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

import mermaid from "mermaid";

let exportMermaidInitialized = false;

function initExportMermaid() {
  if (exportMermaidInitialized) return;
  
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

function extractTextFromForeignObject(foElement: Element): { text: string; x: number; y: number; width: number; height: number } {
  const x = parseFloat(foElement.getAttribute('x') || '0');
  const y = parseFloat(foElement.getAttribute('y') || '0');
  const width = parseFloat(foElement.getAttribute('width') || '100');
  const height = parseFloat(foElement.getAttribute('height') || '50');
  
  const textContent = foElement.textContent?.trim() || '';
  return { text: textContent, x, y, width, height };
}

function createSvgTextElement(doc: Document, text: string, x: number, y: number, width: number, height: number): Element {
  const textEl = doc.createElementNS('http://www.w3.org/2000/svg', 'text');
  
  const centerX = x + width / 2;
  const centerY = y + height / 2;
  
  textEl.setAttribute('x', String(centerX));
  textEl.setAttribute('y', String(centerY));
  textEl.setAttribute('text-anchor', 'middle');
  textEl.setAttribute('dominant-baseline', 'central');
  textEl.setAttribute('fill', '#1e1b4b');
  textEl.setAttribute('font-family', 'Arial, sans-serif');
  textEl.setAttribute('font-size', '14');
  
  const lines = text.split('\n').filter(line => line.trim());
  
  if (lines.length === 1) {
    textEl.textContent = lines[0];
  } else {
    const lineHeight = 18;
    const startY = centerY - ((lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
      const tspan = doc.createElementNS('http://www.w3.org/2000/svg', 'tspan');
      tspan.setAttribute('x', String(centerX));
      tspan.setAttribute('y', String(startY + index * lineHeight));
      tspan.textContent = line.trim();
      textEl.appendChild(tspan);
    });
  }
  
  return textEl;
}

function cleanSvgForExport(svgString: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(svgString, 'image/svg+xml');
  const svgElement = doc.documentElement;
  
  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    let cleaned = svgString
      .replace(/<foreignObject[^>]*>[\s\S]*?<\/foreignObject>/gi, '')
      .replace(/<br\s*\/?>/gi, ' ');
    
    if (!cleaned.includes('xmlns=')) {
      cleaned = cleaned.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    return cleaned;
  }
  
  const foreignObjects = svgElement.querySelectorAll('foreignObject');
  foreignObjects.forEach(fo => {
    const { text, x, y, width, height } = extractTextFromForeignObject(fo);
    
    if (text) {
      const textEl = createSvgTextElement(doc, text, x, y, width, height);
      const parent = fo.parentNode;
      if (parent) {
        parent.insertBefore(textEl, fo);
      }
    }
    
    fo.remove();
  });
  
  if (!svgElement.getAttribute('xmlns')) {
    svgElement.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  }
  if (!svgElement.getAttribute('xmlns:xlink')) {
    svgElement.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
  }
  
  const serializer = new XMLSerializer();
  return serializer.serializeToString(svgElement);
}

export interface PngResult {
  imageData: Uint8Array;
  width: number;
  height: number;
}

function parsePixelValue(value: string | null): number | null {
  if (!value) return null;
  if (value.includes('%')) return null;
  const num = parseFloat(value.replace('px', ''));
  return (!isNaN(num) && num > 0) ? num : null;
}

export async function svgToPng(svgString: string, defaultWidth: number = 600, defaultHeight: number = 400): Promise<PngResult | null> {
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
      
      let svgWidth = defaultWidth;
      let svgHeight = defaultHeight;
      
      const viewBox = svgElement.getAttribute('viewBox');
      if (viewBox) {
        const parts = viewBox.split(/[\s,]+/);
        if (parts.length === 4) {
          const vbWidth = parseFloat(parts[2]);
          const vbHeight = parseFloat(parts[3]);
          if (!isNaN(vbWidth) && vbWidth > 0) svgWidth = vbWidth;
          if (!isNaN(vbHeight) && vbHeight > 0) svgHeight = vbHeight;
        }
      }
      
      const widthAttr = svgElement.getAttribute('width');
      const heightAttr = svgElement.getAttribute('height');
      const parsedWidth = parsePixelValue(widthAttr);
      const parsedHeight = parsePixelValue(heightAttr);
      
      if (parsedWidth !== null && parsedHeight !== null) {
        svgWidth = parsedWidth;
        svgHeight = parsedHeight;
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
          const maxWidth = 500;
          const scale = svgWidth > maxWidth ? maxWidth / svgWidth : 1;
          
          const canvasWidth = Math.max(1, Math.round(svgWidth * scale));
          const canvasHeight = Math.max(1, Math.round(svgHeight * scale));
          
          canvas.width = canvasWidth;
          canvas.height = canvasHeight;
          
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
                resolve({
                  imageData: new Uint8Array(buffer),
                  width: canvasWidth,
                  height: canvasHeight
                });
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
      const pngResult = await svgToPng(svg, 500, 350);
      if (pngResult) {
        results.push({
          id: diagram.id,
          title: diagram.title,
          caption: diagram.caption,
          imageData: pngResult.imageData,
          width: pngResult.width,
          height: pngResult.height
        });
      }
    }
  }
  
  return results;
}

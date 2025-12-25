import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableRow, TableCell, WidthType, BorderStyle, ImageRun } from 'docx';
import { saveAs } from 'file-saver';
import JSZip from 'jszip';
import { bookContent } from './bookContent';
import { getDiagramsForChapter, type ChapterDiagram } from './chapterDiagrams';
import { renderDiagramsToImages, type DiagramImage } from './svgToImage';

export const BOOK_TITLE = "The Leader's Guide to AI Teams";
export const BOOK_SUBTITLE = "Leveraging Artificial Intelligence and AI Agents for Peak Performance";
export const AUTHORS = [
  { name: "Rayo Marji", title: "CTO, Arootah" },
  { name: "Rich Bello", title: "Co-Founder, Arootah" }
];

function stripHtml(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

interface ParsedSection {
  type: string;
  text: string;
  level?: number;
  rows?: string[][];
}

function parseMarkdownToSections(markdown: string): ParsedSection[] {
  const sections: ParsedSection[] = [];
  const lines = markdown.split('\n');
  let currentParagraph: string[] = [];
  let inList = false;
  let inTable = false;
  let tableRows: string[][] = [];

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        sections.push({ type: 'paragraph', text });
      }
      currentParagraph = [];
    }
  }

  function flushTable() {
    if (tableRows.length > 0) {
      sections.push({ type: 'table', text: '', rows: tableRows });
      tableRows = [];
      inTable = false;
    }
  }

  function isTableRow(line: string): boolean {
    return line.trim().startsWith('|') && line.trim().endsWith('|');
  }

  function isTableSeparator(line: string): boolean {
    return /^\|[\s\-:|]+\|$/.test(line.trim());
  }

  function parseTableRow(line: string): string[] {
    return line.split('|')
      .filter((_, i, arr) => i > 0 && i < arr.length - 1)
      .map(cell => cell.trim()
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/_(.+?)_/g, '$1'));
  }

  for (const line of lines) {
    const trimmedLine = line.trim();

    // Check for table rows
    if (isTableRow(trimmedLine)) {
      flushParagraph();
      if (!isTableSeparator(trimmedLine)) {
        inTable = true;
        tableRows.push(parseTableRow(trimmedLine));
      }
      continue;
    } else if (inTable) {
      flushTable();
    }

    if (trimmedLine.startsWith('# ')) {
      flushParagraph();
      sections.push({ type: 'heading', text: trimmedLine.slice(2).trim(), level: 1 });
    } else if (trimmedLine.startsWith('## ')) {
      flushParagraph();
      sections.push({ type: 'heading', text: trimmedLine.slice(3).trim(), level: 2 });
    } else if (trimmedLine.startsWith('### ')) {
      flushParagraph();
      sections.push({ type: 'heading', text: trimmedLine.slice(4).trim(), level: 3 });
    } else if (trimmedLine.startsWith('#### ')) {
      flushParagraph();
      sections.push({ type: 'heading', text: trimmedLine.slice(5).trim(), level: 4 });
    } else if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
      flushParagraph();
      inList = true;
      const text = trimmedLine.slice(2).trim()
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/_(.+?)_/g, '$1');
      sections.push({ type: 'listItem', text });
    } else if (/^\d+\.\s/.test(trimmedLine)) {
      flushParagraph();
      inList = true;
      const text = trimmedLine.replace(/^\d+\.\s/, '').trim()
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/_(.+?)_/g, '$1');
      sections.push({ type: 'listItem', text });
    } else if (trimmedLine === '---' || trimmedLine === '***') {
      flushParagraph();
      sections.push({ type: 'separator', text: '' });
    } else if (trimmedLine.startsWith('> ')) {
      flushParagraph();
      const text = trimmedLine.slice(2).trim()
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1');
      sections.push({ type: 'blockquote', text });
    } else if (trimmedLine === '') {
      if (inList) {
        inList = false;
      }
      flushParagraph();
    } else {
      const cleanText = trimmedLine
        .replace(/\*\*(.+?)\*\*/g, '$1')
        .replace(/\*(.+?)\*/g, '$1')
        .replace(/_(.+?)_/g, '$1')
        .replace(/`(.+?)`/g, '$1');
      currentParagraph.push(cleanText);
    }
  }

  flushTable();
  flushParagraph();
  return sections;
}

async function fetchChapterContent(chapterId: string): Promise<string> {
  try {
    const response = await fetch(`/api/chapters/${chapterId}`);
    if (!response.ok) {
      throw new Error('Chapter not found');
    }
    const data = await response.json();
    return data.content || '';
  } catch (error) {
    console.error(`Error fetching chapter ${chapterId}:`, error);
    return '';
  }
}

export async function exportToPDF() {
  const pdf = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  let yPosition = 20;
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  const margin = 20;
  const maxWidth = pageWidth - 2 * margin;

  pdf.setFontSize(24);
  pdf.setFont('helvetica', 'bold');
  pdf.text(BOOK_TITLE, pageWidth / 2, 60, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Leveraging Artificial Intelligence and AI Agents', pageWidth / 2, 75, { align: 'center' });
  pdf.text('for Peak Performance', pageWidth / 2, 85, { align: 'center' });
  
  pdf.setFontSize(12);
  const authorNames = AUTHORS.map(a => a.name).join(' & ');
  const authorTitles = AUTHORS.map(a => a.title).join(' | ');
  pdf.setFont('helvetica', 'bold');
  pdf.text(authorNames, pageWidth / 2, 110, { align: 'center' });
  pdf.setFont('helvetica', 'normal');
  pdf.text(authorTitles, pageWidth / 2, 120, { align: 'center' });

  // Table of Contents
  pdf.addPage();
  yPosition = 30;
  pdf.setFontSize(20);
  pdf.setFont('helvetica', 'bold');
  pdf.text('Table of Contents', pageWidth / 2, yPosition, { align: 'center' });
  yPosition += 20;

  pdf.setFontSize(11);
  pdf.setFont('helvetica', 'normal');
  for (const chapter of bookContent) {
    if (chapter.id === 'overview') continue;
    const title = chapter.subtitle ? `${chapter.title}: ${chapter.subtitle}` : chapter.title;
    if (yPosition > pageHeight - 30) {
      pdf.addPage();
      yPosition = 30;
    }
    pdf.text(title, margin, yPosition);
    yPosition += 8;
  }

  for (const chapter of bookContent) {
    pdf.addPage();
    yPosition = 20;

    const title = chapter.subtitle ? `${chapter.title}: ${chapter.subtitle}` : chapter.title;
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(title, margin, yPosition);
    yPosition += 15;

    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'italic');
    const descLines = pdf.splitTextToSize(chapter.description, maxWidth);
    pdf.text(descLines, margin, yPosition);
    yPosition += descLines.length * 7 + 10;

    let content = await fetchChapterContent(chapter.id);
    if (!content) {
      content = chapter.content;
    }

    // Parse markdown into sections for proper formatting
    const parsedSections = parseMarkdownToSections(content);
    
    for (const section of parsedSections) {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }

      if (section.type === 'heading') {
        // Add extra spacing above headings based on level
        const spacingAbove = section.level === 1 ? 12 : section.level === 2 ? 10 : 8;
        yPosition += spacingAbove;
        
        if (yPosition > pageHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        const headingSize = section.level === 1 ? 16 : section.level === 2 ? 14 : section.level === 3 ? 12 : 11;
        pdf.setFont('helvetica', 'bold');
        pdf.setFontSize(headingSize);
        const headingLines = pdf.splitTextToSize(section.text, maxWidth);
        headingLines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, margin, yPosition);
          yPosition += headingSize * 0.5 + 2;
        });
        yPosition += 6;
      } else if (section.type === 'listItem') {
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const bulletText = `• ${section.text}`;
        const listLines = pdf.splitTextToSize(bulletText, maxWidth - 5);
        listLines.forEach((line: string, idx: number) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(idx === 0 ? line : `  ${line}`, margin, yPosition);
          yPosition += 5;
        });
      } else if (section.type === 'blockquote') {
        pdf.setFont('helvetica', 'italic');
        pdf.setFontSize(10);
        const quoteLines = pdf.splitTextToSize(section.text, maxWidth - 10);
        quoteLines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, margin + 5, yPosition);
          yPosition += 5;
        });
        yPosition += 3;
      } else if (section.type === 'separator') {
        yPosition += 5;
        pdf.setDrawColor(200, 200, 200);
        pdf.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
      } else if (section.type === 'table' && section.rows) {
        // Render table as formatted text
        yPosition += 6;
        pdf.setFontSize(9);
        
        const rows = section.rows;
        const colCount = rows[0]?.length || 0;
        const colWidth = maxWidth / colCount;
        
        rows.forEach((row, rowIdx) => {
          // Header row in bold
          if (rowIdx === 0) {
            pdf.setFont('helvetica', 'bold');
          } else {
            pdf.setFont('helvetica', 'normal');
          }
          
          // Calculate max lines needed for this row
          const cellLines: string[][] = row.map(cell => 
            pdf.splitTextToSize(cell, colWidth - 4)
          );
          const maxLines = Math.max(...cellLines.map(lines => lines.length));
          
          // Render each line of the row
          for (let lineIdx = 0; lineIdx < maxLines; lineIdx++) {
            if (yPosition > pageHeight - 30) {
              pdf.addPage();
              yPosition = 20;
            }
            
            row.forEach((_, colIdx) => {
              const cellX = margin + (colIdx * colWidth);
              const lineText = cellLines[colIdx][lineIdx] || '';
              pdf.text(lineText, cellX, yPosition);
            });
            
            yPosition += 5;
          }
          
          // Draw line under header
          if (rowIdx === 0) {
            pdf.setDrawColor(150, 150, 150);
            pdf.line(margin, yPosition, pageWidth - margin, yPosition);
            yPosition += 3;
          }
        });
        
        yPosition += 6;
      } else {
        // Regular paragraph
        pdf.setFont('helvetica', 'normal');
        pdf.setFontSize(10);
        const paraLines = pdf.splitTextToSize(section.text, maxWidth);
        paraLines.forEach((line: string) => {
          if (yPosition > pageHeight - 30) {
            pdf.addPage();
            yPosition = 20;
          }
          pdf.text(line, margin, yPosition);
          yPosition += 5;
        });
        yPosition += 3;
      }
    }
    
    // Add diagrams for this chapter as images
    const diagrams = getDiagramsForChapter(chapter.id);
    if (diagrams.length > 0) {
      const diagramImages = await renderDiagramsToImages(diagrams);
      
      for (const diagramImg of diagramImages) {
        // Check if we need a new page for the diagram
        const imgHeight = 80; // Approximate height in PDF units
        if (yPosition > pageHeight - imgHeight - 30) {
          pdf.addPage();
          yPosition = 20;
        }
        
        // Diagram title
        pdf.setFontSize(11);
        pdf.setFont('helvetica', 'bold');
        pdf.setTextColor(99, 102, 241);
        pdf.text(diagramImg.title, margin, yPosition);
        yPosition += 8;
        
        // Add the diagram image
        try {
          const base64 = btoa(Array.from(diagramImg.imageData).map(b => String.fromCharCode(b)).join(''));
          const imgWidth = maxWidth * 0.9;
          const imgHeightScaled = (imgWidth / diagramImg.width) * diagramImg.height;
          
          pdf.addImage(
            `data:image/png;base64,${base64}`,
            'PNG',
            margin + (maxWidth - imgWidth) / 2,
            yPosition,
            imgWidth,
            imgHeightScaled
          );
          yPosition += imgHeightScaled + 5;
        } catch (err) {
          console.error('Failed to add diagram image to PDF:', err);
        }
        
        // Diagram caption
        if (diagramImg.caption) {
          pdf.setFontSize(9);
          pdf.setFont('helvetica', 'italic');
          pdf.setTextColor(100, 116, 139);
          const captionLines = pdf.splitTextToSize(diagramImg.caption, maxWidth - 20);
          pdf.text(captionLines, margin + 10, yPosition);
          yPosition += captionLines.length * 4 + 5;
        }
        
        pdf.setTextColor(0, 0, 0);
        yPosition += 10;
      }
    }
  }

  pdf.save('AI-Leadership-Guide.pdf');
}

async function createDiagramParagraphsWithImages(diagrams: ChapterDiagram[]): Promise<any[]> {
  const paragraphs: any[] = [];
  
  if (diagrams.length === 0) return paragraphs;
  
  const diagramImages = await renderDiagramsToImages(diagrams);
  
  for (const diagramImg of diagramImages) {
    // Diagram title
    paragraphs.push(
      new Paragraph({
        children: [
          new TextRun({
            text: diagramImg.title,
            bold: true,
            color: '6366f1',
            size: 22,
          }),
        ],
        spacing: { before: 200, after: 100 },
      })
    );
    
    // Image
    paragraphs.push(
      new Paragraph({
        children: [
          new ImageRun({
            data: diagramImg.imageData,
            transformation: {
              width: 500,
              height: 350,
            },
            type: 'png',
          }),
        ],
        alignment: AlignmentType.CENTER,
        spacing: { before: 100, after: 100 },
      })
    );
    
    // Caption
    if (diagramImg.caption) {
      paragraphs.push(
        new Paragraph({
          children: [
            new TextRun({
              text: diagramImg.caption,
              italics: true,
              size: 20,
              color: '64748b',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 200 },
        })
      );
    }
  }
  
  return paragraphs;
}

export async function exportToWord() {
  const sections: any[] = [];

  // Title page
  sections.push(
    new Paragraph({
      text: BOOK_TITLE,
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: BOOK_SUBTITLE,
          size: 28,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    })
  );

  // Authors on same line
  const authorNames = AUTHORS.map(a => a.name).join(' & ');
  const authorTitles = AUTHORS.map(a => a.title).join(' | ');
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: authorNames,
          size: 24,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 50 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: authorTitles,
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      text: '',
      pageBreakBefore: true,
    })
  );

  // Table of Contents
  sections.push(
    new Paragraph({
      text: 'Table of Contents',
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: { before: 200, after: 400 },
    })
  );

  for (const chapter of bookContent) {
    if (chapter.id === 'overview') continue;
    const title = chapter.subtitle ? `${chapter.title}: ${chapter.subtitle}` : chapter.title;
    sections.push(
      new Paragraph({
        text: title,
        spacing: { after: 100 },
      })
    );
  }

  sections.push(
    new Paragraph({
      text: '',
      pageBreakBefore: true,
    })
  );

  for (const chapter of bookContent) {
    const title = chapter.subtitle ? `${chapter.title}: ${chapter.subtitle}` : chapter.title;
    sections.push(
      new Paragraph({
        text: title,
        heading: HeadingLevel.HEADING_1,
        spacing: { before: 400, after: 200 },
      })
    );

    sections.push(
      new Paragraph({
        children: [
          new TextRun({
            text: chapter.description,
            italics: true,
          }),
        ],
        spacing: { after: 300 },
      })
    );

    let content = await fetchChapterContent(chapter.id);
    if (!content) {
      content = chapter.content;
    }

    const contentSections = parseMarkdownToSections(content);
    contentSections.forEach((section) => {
      if (section.type === 'heading') {
        const headingLevel = section.level === 1 ? HeadingLevel.HEADING_1 :
                            section.level === 2 ? HeadingLevel.HEADING_2 : 
                            section.level === 3 ? HeadingLevel.HEADING_3 : 
                            HeadingLevel.HEADING_4;
        // Increased spacing before headings for better visual separation
        const spacingBefore = section.level === 1 ? 600 : section.level === 2 ? 480 : 360;
        sections.push(
          new Paragraph({
            text: section.text,
            heading: headingLevel,
            spacing: { before: spacingBefore, after: 200 },
          })
        );
      } else if (section.type === 'paragraph') {
        sections.push(
          new Paragraph({
            text: section.text,
            spacing: { after: 200 },
          })
        );
      } else if (section.type === 'listItem') {
        sections.push(
          new Paragraph({
            text: section.text,
            bullet: { level: 0 },
            spacing: { after: 80 },
          })
        );
      } else if (section.type === 'blockquote') {
        sections.push(
          new Paragraph({
            children: [
              new TextRun({
                text: section.text,
                italics: true,
              }),
            ],
            indent: { left: 720 },
            spacing: { before: 200, after: 200 },
          })
        );
      } else if (section.type === 'separator') {
        sections.push(
          new Paragraph({
            text: '_______________________________________________',
            alignment: AlignmentType.CENTER,
            spacing: { before: 300, after: 300 },
          })
        );
      } else if (section.type === 'table' && section.rows && section.rows.length > 0) {
        // Create Word table
        const tableRows = section.rows.map((row, rowIdx) => {
          return new TableRow({
            children: row.map(cell => new TableCell({
              children: [new Paragraph({
                children: [new TextRun({
                  text: cell,
                  bold: rowIdx === 0,
                })],
              })],
              width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
            })),
          });
        });
        
        sections.push(
          new Table({
            rows: tableRows,
            width: { size: 100, type: WidthType.PERCENTAGE },
          })
        );
        sections.push(
          new Paragraph({ text: '', spacing: { after: 200 } })
        );
      } else if (section.type === 'text' && section.text) {
        sections.push(
          new Paragraph({
            text: section.text,
            spacing: { after: 100 },
          })
        );
      }
    });
    
    // Add diagrams for this chapter
    const diagrams = getDiagramsForChapter(chapter.id);
    sections.push(...await createDiagramParagraphsWithImages(diagrams));

    sections.push(
      new Paragraph({
        text: '',
        pageBreakBefore: true,
      })
    );
  }

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, 'AI-Leadership-Guide.docx');
}

// Export a single chapter to Word
export async function exportChapterToWord(chapterId: string) {
  const chapter = bookContent.find(c => c.id === chapterId);
  if (!chapter) {
    throw new Error(`Chapter ${chapterId} not found`);
  }

  const sections: any[] = [];

  // Title
  const title = chapter.subtitle ? `${chapter.title}: ${chapter.subtitle}` : chapter.title;
  sections.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  // Description
  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: chapter.description,
          italics: true,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  // Content
  let content = await fetchChapterContent(chapter.id);
  if (!content) {
    content = chapter.content;
  }

  const contentSections = parseMarkdownToSections(content);
  contentSections.forEach((section) => {
    if (section.type === 'heading') {
      const headingLevel = section.level === 1 ? HeadingLevel.HEADING_1 :
                          section.level === 2 ? HeadingLevel.HEADING_2 : 
                          section.level === 3 ? HeadingLevel.HEADING_3 : 
                          HeadingLevel.HEADING_4;
      const spacingBefore = section.level === 1 ? 600 : section.level === 2 ? 480 : 360;
      sections.push(
        new Paragraph({
          text: section.text,
          heading: headingLevel,
          spacing: { before: spacingBefore, after: 200 },
        })
      );
    } else if (section.type === 'paragraph') {
      sections.push(
        new Paragraph({
          text: section.text,
          spacing: { after: 200 },
        })
      );
    } else if (section.type === 'listItem') {
      sections.push(
        new Paragraph({
          text: section.text,
          bullet: { level: 0 },
          spacing: { after: 80 },
        })
      );
    } else if (section.type === 'blockquote') {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.text,
              italics: true,
            }),
          ],
          indent: { left: 720 },
          spacing: { before: 200, after: 200 },
        })
      );
    } else if (section.type === 'separator') {
      sections.push(
        new Paragraph({
          text: '_______________________________________________',
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 300 },
        })
      );
    } else if (section.type === 'table' && section.rows && section.rows.length > 0) {
      const tableRows = section.rows.map((row, rowIdx) => {
        return new TableRow({
          children: row.map(cell => new TableCell({
            children: [new Paragraph({
              children: [new TextRun({
                text: cell,
                bold: rowIdx === 0,
              })],
            })],
            width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
          })),
        });
      });
      sections.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
      sections.push(
        new Paragraph({ text: '', spacing: { after: 200 } })
      );
    } else if (section.type === 'text' && section.text) {
      sections.push(
        new Paragraph({
          text: section.text,
          spacing: { after: 100 },
        })
      );
    }
  });
  
  // Add diagrams for this chapter
  const diagrams = getDiagramsForChapter(chapterId);
  sections.push(...await createDiagramParagraphsWithImages(diagrams));

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${chapter.title.replace(/\s+/g, '-')}.docx`;
  saveAs(blob, filename);
}

// Create a blob for a single chapter (used internally for zip)
async function createChapterBlob(chapterId: string): Promise<{ filename: string; blob: Blob }> {
  const chapter = bookContent.find(c => c.id === chapterId);
  if (!chapter) {
    throw new Error(`Chapter ${chapterId} not found`);
  }

  const sections: any[] = [];
  const title = chapter.subtitle ? `${chapter.title}: ${chapter.subtitle}` : chapter.title;
  
  sections.push(
    new Paragraph({
      text: title,
      heading: HeadingLevel.HEADING_1,
      spacing: { before: 400, after: 200 },
    })
  );

  sections.push(
    new Paragraph({
      children: [
        new TextRun({
          text: chapter.description,
          italics: true,
        }),
      ],
      spacing: { after: 300 },
    })
  );

  let content = await fetchChapterContent(chapter.id);
  if (!content) {
    content = chapter.content;
  }

  const contentSections = parseMarkdownToSections(content);
  contentSections.forEach((section) => {
    if (section.type === 'heading') {
      const headingLevel = section.level === 1 ? HeadingLevel.HEADING_1 :
                          section.level === 2 ? HeadingLevel.HEADING_2 : 
                          section.level === 3 ? HeadingLevel.HEADING_3 : 
                          HeadingLevel.HEADING_4;
      const spacingBefore = section.level === 1 ? 600 : section.level === 2 ? 480 : 360;
      sections.push(
        new Paragraph({
          text: section.text,
          heading: headingLevel,
          spacing: { before: spacingBefore, after: 200 },
        })
      );
    } else if (section.type === 'paragraph') {
      sections.push(
        new Paragraph({
          text: section.text,
          spacing: { after: 200 },
        })
      );
    } else if (section.type === 'listItem') {
      sections.push(
        new Paragraph({
          text: section.text,
          bullet: { level: 0 },
          spacing: { after: 80 },
        })
      );
    } else if (section.type === 'blockquote') {
      sections.push(
        new Paragraph({
          children: [
            new TextRun({
              text: section.text,
              italics: true,
            }),
          ],
          indent: { left: 720 },
          spacing: { before: 200, after: 200 },
        })
      );
    } else if (section.type === 'separator') {
      sections.push(
        new Paragraph({
          text: '_______________________________________________',
          alignment: AlignmentType.CENTER,
          spacing: { before: 300, after: 300 },
        })
      );
    } else if (section.type === 'table' && section.rows && section.rows.length > 0) {
      const tableRows = section.rows.map((row, rowIdx) => {
        return new TableRow({
          children: row.map(cell => new TableCell({
            children: [new Paragraph({
              children: [new TextRun({
                text: cell,
                bold: rowIdx === 0,
              })],
            })],
            width: { size: 100 / row.length, type: WidthType.PERCENTAGE },
          })),
        });
      });
      sections.push(
        new Table({
          rows: tableRows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        })
      );
      sections.push(
        new Paragraph({ text: '', spacing: { after: 200 } })
      );
    }
  });
  
  // Add diagrams for this chapter
  const diagrams = getDiagramsForChapter(chapterId);
  sections.push(...await createDiagramParagraphsWithImages(diagrams));

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: sections,
      },
    ],
  });

  const blob = await Packer.toBlob(doc);
  const filename = `${chapter.title.replace(/\s+/g, '-')}.docx`;
  return { filename, blob };
}

// Export all chapters as a zip of Word documents
export async function exportAllChaptersAsZip() {
  const zip = new JSZip();

  const chaptersToExport = bookContent.filter(c => c.id !== 'overview');
  
  for (const chapter of chaptersToExport) {
    const { filename, blob } = await createChapterBlob(chapter.id);
    zip.file(filename, blob);
  }

  const zipBlob = await zip.generateAsync({ type: 'blob' });
  saveAs(zipBlob, 'AI-Leadership-Guide-Chapters.zip');
}

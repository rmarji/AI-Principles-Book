import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { bookContent } from './bookContent';

function stripHtml(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

function parseMarkdownToSections(markdown: string): { type: string; text: string; level?: number }[] {
  const sections: { type: string; text: string; level?: number }[] = [];
  const lines = markdown.split('\n');
  let currentParagraph: string[] = [];
  let inList = false;

  function flushParagraph() {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        sections.push({ type: 'paragraph', text });
      }
      currentParagraph = [];
    }
  }

  for (const line of lines) {
    const trimmedLine = line.trim();

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
  pdf.text("The Leader's Guide to AI Teams", pageWidth / 2, 60, { align: 'center' });
  
  pdf.setFontSize(14);
  pdf.setFont('helvetica', 'normal');
  pdf.text('Leveraging Artificial Intelligence and AI Agents', pageWidth / 2, 75, { align: 'center' });
  pdf.text('for Peak Performance', pageWidth / 2, 85, { align: 'center' });
  
  pdf.setFontSize(12);
  pdf.text('By Rayo Marji', pageWidth / 2, 110, { align: 'center' });
  pdf.text('CTO, Arootah', pageWidth / 2, 120, { align: 'center' });

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

    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const contentText = stripHtml(content);
    const lines = pdf.splitTextToSize(contentText, maxWidth);

    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });
  }

  pdf.save('AI-Leadership-Guide.pdf');
}

export async function exportToWord() {
  const sections: any[] = [];

  sections.push(
    new Paragraph({
      text: "The Leader's Guide to AI Teams",
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 400 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'Leveraging Artificial Intelligence and AI Agents for Peak Performance',
          size: 28,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 200 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'By Rayo Marji',
          size: 24,
          bold: true,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 100 },
    }),
    new Paragraph({
      children: [
        new TextRun({
          text: 'CTO, Arootah',
          size: 20,
        }),
      ],
      alignment: AlignmentType.CENTER,
      spacing: { after: 800 },
    }),
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
        sections.push(
          new Paragraph({
            text: section.text,
            heading: headingLevel,
            spacing: { before: 300, after: 150 },
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
      } else if (section.type === 'text' && section.text) {
        sections.push(
          new Paragraph({
            text: section.text,
            spacing: { after: 100 },
          })
        );
      }
    });

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

import { jsPDF } from 'jspdf';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';
import { saveAs } from 'file-saver';
import { bookContent } from './bookContent';

// Helper to strip HTML tags for plain text export
function stripHtml(html: string): string {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  return temp.textContent || temp.innerText || '';
}

// Helper to convert HTML to structured text with formatting info
function parseHtmlToSections(html: string): { type: string; text: string; level?: number }[] {
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const sections: { type: string; text: string; level?: number }[] = [];

  function traverse(node: Node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const text = node.textContent?.trim();
      if (text) {
        sections.push({ type: 'text', text });
      }
    } else if (node.nodeType === Node.ELEMENT_NODE) {
      const element = node as HTMLElement;
      const tagName = element.tagName.toLowerCase();

      if (tagName === 'h2') {
        sections.push({ type: 'heading', text: element.textContent || '', level: 2 });
      } else if (tagName === 'h3') {
        sections.push({ type: 'heading', text: element.textContent || '', level: 3 });
      } else if (tagName === 'h4') {
        sections.push({ type: 'heading', text: element.textContent || '', level: 4 });
      } else if (tagName === 'p') {
        sections.push({ type: 'paragraph', text: element.textContent || '' });
      } else if (tagName === 'li') {
        sections.push({ type: 'listItem', text: element.textContent || '' });
      } else if (tagName === 'strong' || tagName === 'em') {
        sections.push({ type: 'text', text: element.textContent || '' });
      } else {
        // Traverse children for other elements
        Array.from(element.childNodes).forEach(traverse);
      }
    }
  }

  Array.from(temp.childNodes).forEach(traverse);
  return sections;
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

  // Title Page
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

  // Add chapters
  bookContent.forEach((chapter, index) => {
    pdf.addPage();
    yPosition = 20;

    // Chapter title
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    const title = chapter.subtitle ? `${chapter.title}: ${chapter.subtitle}` : chapter.title;
    pdf.text(title, margin, yPosition);
    yPosition += 15;

    // Chapter description
    pdf.setFontSize(11);
    pdf.setFont('helvetica', 'italic');
    const descLines = pdf.splitTextToSize(chapter.description, maxWidth);
    pdf.text(descLines, margin, yPosition);
    yPosition += descLines.length * 7 + 10;

    // Chapter content (simplified)
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(10);
    const contentText = stripHtml(chapter.content);
    const lines = pdf.splitTextToSize(contentText, maxWidth);

    lines.forEach((line: string) => {
      if (yPosition > pageHeight - 30) {
        pdf.addPage();
        yPosition = 20;
      }
      pdf.text(line, margin, yPosition);
      yPosition += 6;
    });
  });

  pdf.save('AI-Leadership-Guide.pdf');
}

export async function exportToWord() {
  const sections: any[] = [];

  // Title Page
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

  // Add each chapter
  bookContent.forEach((chapter) => {
    // Chapter title
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
    const contentSections = parseHtmlToSections(chapter.content);
    contentSections.forEach((section) => {
      if (section.type === 'heading') {
        const headingLevel = section.level === 2 ? HeadingLevel.HEADING_2 : 
                            section.level === 3 ? HeadingLevel.HEADING_3 : 
                            HeadingLevel.HEADING_4;
        sections.push(
          new Paragraph({
            text: section.text,
            heading: headingLevel,
            spacing: { before: 200, after: 100 },
          })
        );
      } else if (section.type === 'paragraph') {
        sections.push(
          new Paragraph({
            text: section.text,
            spacing: { after: 150 },
          })
        );
      } else if (section.type === 'listItem') {
        sections.push(
          new Paragraph({
            text: section.text,
            bullet: { level: 0 },
            spacing: { after: 100 },
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

    // Page break after each chapter
    sections.push(
      new Paragraph({
        text: '',
        pageBreakBefore: true,
      })
    );
  });

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

import PDFDocument from 'pdfkit';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType } from 'docx';

// Convert HTML to plain text sections for PDF/DOCX generation
function htmlToSections(html: string): Array<{ type: 'h2' | 'h3' | 'p' | 'li'; text: string }> {
  const sections: Array<{ type: 'h2' | 'h3' | 'p' | 'li'; text: string }> = [];

  // Parse HTML tags
  const tagPattern = /<(h2|h3|p|li|ul)[^>]*>([\s\S]*?)<\/\1>/gi;
  let match;

  while ((match = tagPattern.exec(html)) !== null) {
    const rawTag = match[1].toLowerCase();
    const type: 'h2' | 'h3' | 'p' | 'li' =
      rawTag === 'ul' ? 'p' : (rawTag as 'h2' | 'h3' | 'p' | 'li');
    const text = match[2]
      .replace(/<[^>]+>/g, '') // strip inner tags
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&nbsp;/g, ' ')
      .trim();

    if (text) {
      sections.push({ type, text });
    }
  }

  // Fallback: if no tags found, split by newlines
  if (sections.length === 0) {
    const plainText = html.replace(/<[^>]+>/g, '').trim();
    plainText.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed) sections.push({ type: 'p', text: trimmed });
    });
  }

  return sections;
}

export async function exportToPDF(cvHtml: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    const chunks: Buffer[] = [];

    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    const sections = htmlToSections(cvHtml);

    sections.forEach((section, index) => {
      if (index > 0) {
        const prevType = sections[index - 1].type;
        if (section.type === 'h2') doc.moveDown(1.5);
        else if (section.type === 'h3') doc.moveDown(0.8);
        else if (prevType === 'h2' || prevType === 'h3') doc.moveDown(0.3);
        else doc.moveDown(0.3);
      }

      switch (section.type) {
        case 'h2':
          doc.fontSize(16).font('Helvetica-Bold').fillColor('#1a202c').text(section.text);
          doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#4a5568').stroke();
          doc.moveDown(0.3);
          break;
        case 'h3':
          doc.fontSize(13).font('Helvetica-Bold').fillColor('#2d3748').text(section.text);
          break;
        case 'li':
          doc
            .fontSize(11)
            .font('Helvetica')
            .fillColor('#4a5568')
            .text(`• ${section.text}`, { indent: 20 });
          break;
        default:
          doc.fontSize(11).font('Helvetica').fillColor('#4a5568').text(section.text);
      }
    });

    doc.end();
  });
}

export async function exportToDOCX(cvHtml: string): Promise<Buffer> {
  const sections = htmlToSections(cvHtml);

  const children: Paragraph[] = sections.map((section) => {
    switch (section.type) {
      case 'h2':
        return new Paragraph({
          text: section.text,
          heading: HeadingLevel.HEADING_1,
          spacing: { before: 400, after: 200 },
        });
      case 'h3':
        return new Paragraph({
          text: section.text,
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 200, after: 100 },
        });
      case 'li':
        return new Paragraph({
          children: [new TextRun({ text: `• ${section.text}`, size: 22 })],
          indent: { left: 360 },
          spacing: { after: 80 },
        });
      default:
        return new Paragraph({
          children: [new TextRun({ text: section.text, size: 22 })],
          alignment: AlignmentType.LEFT,
          spacing: { after: 100 },
        });
    }
  });

  const doc = new Document({
    sections: [{ properties: {}, children }],
  });

  return Packer.toBuffer(doc);
}

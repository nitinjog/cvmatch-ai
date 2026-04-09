import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import path from 'path';

export async function parseFile(buffer: Buffer, filename: string): Promise<string> {
  const ext = path.extname(filename).toLowerCase();

  switch (ext) {
    case '.pdf':
      return parsePDF(buffer);
    case '.doc':
    case '.docx':
      return parseDOCX(buffer);
    case '.txt':
      return buffer.toString('utf-8');
    default:
      throw new Error(`Unsupported file type: ${ext}. Allowed: PDF, DOC, DOCX, TXT`);
  }
}

async function parsePDF(buffer: Buffer): Promise<string> {
  try {
    const data = await pdfParse(buffer);
    const text = data.text.trim();
    if (!text) throw new Error('PDF appears to be empty or contains only images');
    return text;
  } catch (err) {
    throw new Error(`PDF parsing failed: ${(err as Error).message}`);
  }
}

async function parseDOCX(buffer: Buffer): Promise<string> {
  try {
    const result = await mammoth.extractRawText({ buffer });
    const text = result.value.trim();
    if (!text) throw new Error('Document appears to be empty');
    return text;
  } catch (err) {
    throw new Error(`DOCX parsing failed: ${(err as Error).message}`);
  }
}

export function sanitizeText(text: string): string {
  // Remove null bytes and control characters except newlines/tabs
  return text
    .replace(/\0/g, '')
    .replace(/[\x01-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '')
    .trim();
}

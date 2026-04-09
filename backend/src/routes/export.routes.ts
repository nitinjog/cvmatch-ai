import { Router, Request, Response } from 'express';
import { exportToPDF, exportToDOCX } from '../services/export.service';
import { validateSessionId } from '../utils/validation';
import xss from 'xss';

const router = Router();

// POST /api/export — export CV as PDF or DOCX
router.post('/', async (req: Request, res: Response) => {
  try {
    validateSessionId(req.body.session_id || 'placeholder');

    const format = String(req.body.format || 'pdf').toLowerCase();
    const rawHtml = req.body.cv_html;

    if (!rawHtml || typeof rawHtml !== 'string') {
      return res.status(400).json({ error: 'cv_html is required' });
    }

    // Allow safe HTML tags for CV content
    const cvHtml = xss(rawHtml, {
      whiteList: {
        h1: [], h2: [], h3: [], h4: [], p: [], br: [],
        ul: [], ol: [], li: [], strong: [], em: [], span: [],
        div: [], section: [], a: ['href'],
      },
    });

    if (format === 'pdf') {
      const pdfBuffer = await exportToPDF(cvHtml);
      res.set({
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="optimized-cv.pdf"',
        'Content-Length': pdfBuffer.length,
      });
      return res.send(pdfBuffer);
    }

    if (format === 'docx') {
      const docxBuffer = await exportToDOCX(cvHtml);
      res.set({
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="optimized-cv.docx"',
        'Content-Length': docxBuffer.length,
      });
      return res.send(docxBuffer);
    }

    res.status(400).json({ error: 'Invalid format. Use "pdf" or "docx"' });
  } catch (err) {
    const message = (err as Error).message;
    res.status(500).json({ error: message });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { parseFile, sanitizeText } from '../services/parser.service';
import { saveCV, ensureSession, uploadFileToStorage } from '../services/supabase.service';
import { validateSessionId, validateText } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/cv — submit CV (file or text)
router.post('/', uploadMiddleware.single('file'), async (req: Request, res: Response) => {
  try {
    const sessionId = req.body.session_id || uuidv4();
    validateSessionId(sessionId);
    await ensureSession(sessionId);

    let cvText = '';
    let fileUrl: string | undefined;
    let fileName: string | undefined;

    if (req.file) {
      cvText = await parseFile(req.file.buffer, req.file.originalname);
      cvText = sanitizeText(cvText);
      fileName = req.file.originalname;

      const filePath = `${sessionId}/${Date.now()}_${req.file.originalname}`;
      fileUrl = await uploadFileToStorage('cv_uploads', filePath, req.file.buffer, req.file.mimetype);
    } else if (req.body.text) {
      cvText = validateText(req.body.text, 'CV');
    } else {
      return res.status(400).json({ error: 'Provide either a file upload or text for the CV' });
    }

    const cv = await saveCV(sessionId, cvText, fileUrl, fileName);

    res.json({
      session_id: sessionId,
      cv_id: cv.id,
      text_preview: cvText.slice(0, 200),
      message: 'CV saved successfully',
    });
  } catch (err) {
    const message = (err as Error).message;
    res.status(400).json({ error: message });
  }
});

export default router;

import { Router, Request, Response } from 'express';
import { uploadMiddleware } from '../middleware/upload.middleware';
import { parseFile, sanitizeText } from '../services/parser.service';
import { saveJobDescription, ensureSession, uploadFileToStorage } from '../services/supabase.service';
import { validateSessionId, validateText } from '../utils/validation';
import { v4 as uuidv4 } from 'uuid';

const router = Router();

// POST /api/jd — submit job description (text or file)
router.post('/', uploadMiddleware.single('file'), async (req: Request, res: Response) => {
  try {
    const sessionId = req.body.session_id || uuidv4();
    validateSessionId(sessionId);
    await ensureSession(sessionId);

    let jdText = '';
    let fileUrl: string | undefined;

    if (req.file) {
      jdText = await parseFile(req.file.buffer, req.file.originalname);
      jdText = sanitizeText(jdText);

      const filePath = `${sessionId}/${Date.now()}_${req.file.originalname}`;
      fileUrl = await uploadFileToStorage('jd_uploads', filePath, req.file.buffer, req.file.mimetype);
    } else if (req.body.text) {
      jdText = validateText(req.body.text, 'Job Description');
    } else {
      return res.status(400).json({ error: 'Provide either a file upload or text for the job description' });
    }

    const jd = await saveJobDescription(sessionId, jdText, fileUrl);

    res.json({
      session_id: sessionId,
      jd_id: jd.id,
      text_preview: jdText.slice(0, 200),
      message: 'Job description saved successfully',
    });
  } catch (err) {
    const message = (err as Error).message;
    res.status(400).json({ error: message });
  }
});

export default router;

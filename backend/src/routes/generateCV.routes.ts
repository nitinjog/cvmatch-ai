import { Router, Request, Response } from 'express';
import { getSessionData, saveGeneratedCV } from '../services/supabase.service';
import { generateEnhancedCV } from '../services/llm.service';
import { validateSessionId } from '../utils/validation';

const router = Router();

// POST /api/generate-cv — generate optimized CV using JD, original CV, and answers
router.post('/', async (req: Request, res: Response) => {
  try {
    const sessionId = validateSessionId(req.body.session_id);
    const session = await getSessionData(sessionId);

    if (!session.jd?.text) {
      return res.status(400).json({ error: 'Job description not found. Complete previous steps first.' });
    }
    if (!session.cv?.text) {
      return res.status(400).json({ error: 'CV not found. Complete previous steps first.' });
    }

    const answers = (session.answers || []).map((a: Record<string, string>) => ({
      question: a.question || '',
      answer: a.answer || 'Not applicable',
    }));

    const enhancedCV = await generateEnhancedCV(session.jd.text, session.cv.text, answers);
    await saveGeneratedCV(sessionId, enhancedCV);

    res.json({ session_id: sessionId, generated_cv: enhancedCV });
  } catch (err) {
    const message = (err as Error).message;
    res.status(500).json({ error: message });
  }
});

export default router;

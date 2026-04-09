import { Router, Request, Response } from 'express';
import { getSessionData } from '../services/supabase.service';
import { generateQuestions } from '../services/llm.service';
import { validateSessionId } from '../utils/validation';

const router = Router();

// POST /api/questions — generate improvement questions based on analysis gaps
router.post('/', async (req: Request, res: Response) => {
  try {
    const sessionId = validateSessionId(req.body.session_id);
    const session = await getSessionData(sessionId);

    if (!session.analysis?.result) {
      return res.status(400).json({ error: 'No analysis found. Run /api/analyze first.' });
    }
    if (!session.jd?.text) {
      return res.status(400).json({ error: 'Job description not found for this session.' });
    }

    const { gaps, missing_keywords } = session.analysis.result as {
      gaps: string[];
      missing_keywords: string[];
    };

    const questions = await generateQuestions(gaps || [], missing_keywords || [], session.jd.text);

    res.json({ session_id: sessionId, questions });
  } catch (err) {
    const message = (err as Error).message;
    res.status(500).json({ error: message });
  }
});

export default router;

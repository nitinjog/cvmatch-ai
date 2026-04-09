import { Router, Request, Response } from 'express';
import { getSessionData, saveAnalysis } from '../services/supabase.service';
import { analyzeMatch } from '../services/llm.service';
import { validateSessionId } from '../utils/validation';

const router = Router();

// POST /api/analyze — run CV vs JD analysis
router.post('/', async (req: Request, res: Response) => {
  try {
    const sessionId = validateSessionId(req.body.session_id);
    const session = await getSessionData(sessionId);

    if (!session.jd?.text) {
      return res.status(400).json({ error: 'Job description not found for this session. Upload JD first.' });
    }
    if (!session.cv?.text) {
      return res.status(400).json({ error: 'CV not found for this session. Upload CV first.' });
    }

    const analysis = await analyzeMatch(session.jd.text, session.cv.text);
    await saveAnalysis(sessionId, analysis);

    res.json({ session_id: sessionId, analysis });
  } catch (err) {
    const message = (err as Error).message;
    res.status(500).json({ error: message });
  }
});

export default router;

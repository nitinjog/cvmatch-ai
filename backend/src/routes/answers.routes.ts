import { Router, Request, Response } from 'express';
import { saveAnswers } from '../services/supabase.service';
import { validateSessionId } from '../utils/validation';
import xss from 'xss';

const router = Router();

interface AnswerPayload {
  question_id: string;
  question: string;
  answer: string;
}

// POST /api/answers — save candidate answers to questions
router.post('/', async (req: Request, res: Response) => {
  try {
    const sessionId = validateSessionId(req.body.session_id);

    const raw: unknown = req.body.answers;
    if (!Array.isArray(raw) || raw.length === 0) {
      return res.status(400).json({ error: 'answers must be a non-empty array' });
    }

    const answers: AnswerPayload[] = raw.map((a: unknown) => {
      const item = a as Record<string, unknown>;
      if (!item.question_id || !item.question) {
        throw new Error('Each answer must have question_id and question');
      }
      return {
        question_id: String(item.question_id).slice(0, 50),
        question: xss(String(item.question)).slice(0, 500),
        answer: xss(String(item.answer || 'Not applicable')).slice(0, 2000),
      };
    });

    await saveAnswers(sessionId, answers);

    res.json({ session_id: sessionId, saved: answers.length, message: 'Answers saved successfully' });
  } catch (err) {
    const message = (err as Error).message;
    res.status(400).json({ error: message });
  }
});

export default router;

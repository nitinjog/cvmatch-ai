import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

import { runMigration } from './utils/migrate';
import jdRoutes from './routes/jd.routes';
import cvRoutes from './routes/cv.routes';
import analyzeRoutes from './routes/analyze.routes';
import questionsRoutes from './routes/questions.routes';
import answersRoutes from './routes/answers.routes';
import generateCVRoutes from './routes/generateCV.routes';
import exportRoutes from './routes/export.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
});
app.use('/api/', limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Routes
app.use('/api/jd', jdRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/analyze', analyzeRoutes);
app.use('/api/questions', questionsRoutes);
app.use('/api/answers', answersRoutes);
app.use('/api/generate-cv', generateCVRoutes);
app.use('/api/export', exportRoutes);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`CVMatch AI backend running on port ${PORT}`);
  // Run DB migration on startup (non-blocking, non-fatal)
  runMigration().catch(() => {/* already logged inside */});
});

export default app;

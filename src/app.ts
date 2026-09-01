import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';
import { authRouter } from './routes/auth.routes.js';
import { projectRouter } from './routes/project.routes.js';
import { skillRouter } from './routes/skill.routes.js';

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ success: true, data: { status: 'ok' } });
});
app.use('/api/auth', authRouter);
app.use('/api/projects', projectRouter);
app.use('/api/skills', skillRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

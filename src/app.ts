import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorMiddleware, notFoundMiddleware } from './middleware/error.middleware.js';
import { projectRouter } from './routes/project.routes.js';

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(express.json());

app.get('/health', (_request, response) => {
  response.json({ success: true, data: { status: 'ok' } });
});
app.use('/api/projects', projectRouter);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

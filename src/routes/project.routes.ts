import { Router } from 'express';
import { createProject, deleteProject, getProject, listProjects, updateProject } from '../controllers/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const projectRouter = Router();

projectRouter.get('/', listProjects);
projectRouter.get('/:id', getProject);
projectRouter.post('/', authMiddleware, createProject);
projectRouter.put('/:id', authMiddleware, updateProject);
projectRouter.delete('/:id', authMiddleware, deleteProject);

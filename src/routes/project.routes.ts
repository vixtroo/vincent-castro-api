import { Router } from 'express';
import { createProject, deleteProject, getProject, listProjects, updateProject } from '../controllers/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { projectImageUpload } from '../middleware/upload.middleware.js';

export const projectRouter = Router();

projectRouter.get('/', listProjects);
projectRouter.get('/:id', getProject);

projectRouter.post('/add-project', authMiddleware, projectImageUpload.single('project_image'), createProject);
projectRouter.put('/update-project/:id', authMiddleware, projectImageUpload.single('project_image'), updateProject);
projectRouter.delete('/delete-project/:id', authMiddleware, deleteProject);

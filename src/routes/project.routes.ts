import { Router } from 'express';
import { createProject, deleteProject, getCurrentlyBuildingProject, getProject, listProjects, updateCurrentlyBuildingProject, updateProject } from '../controllers/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { projectImageUpload } from '../middleware/upload.middleware.js';

export const projectRouter = Router();

projectRouter.get('/currently-building', getCurrentlyBuildingProject);
projectRouter.get('/', listProjects);
projectRouter.get('/:id', getProject);

projectRouter.post('/', authMiddleware, projectImageUpload.single('project_image'), createProject);
projectRouter.put('/:id', authMiddleware, projectImageUpload.single('project_image'), updateProject);
projectRouter.patch('/:id/currently-building', authMiddleware, updateCurrentlyBuildingProject);
projectRouter.delete('/:id', authMiddleware, deleteProject);

import { Router } from 'express';
import { createProject, deleteProject, getCurrentlyBuildingProject, getProject, listProjects, updateCurrentlyBuildingProject, updateProject } from '../controllers/project.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';
import { projectImageUpload } from '../middleware/upload.middleware.js';

export const projectRouter = Router();

projectRouter.get('/currently-building', getCurrentlyBuildingProject);
projectRouter.get('/get-all-projects', listProjects);
projectRouter.get('/:id/get-project', getProject);

projectRouter.post('/create-project', authMiddleware, projectImageUpload.single('project_image'), createProject);
projectRouter.put('/:id/update-project', authMiddleware, projectImageUpload.single('project_image'), updateProject);
projectRouter.patch('/:id/update-currently-building', authMiddleware, updateCurrentlyBuildingProject);
projectRouter.delete('/:id/delete-project', authMiddleware, deleteProject);

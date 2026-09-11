import { Router } from 'express';
import { createSkill, deleteSkill, getSkill, listSkills, updateSkill } from '../controllers/skill.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const skillRouter = Router();

skillRouter.get('/get-all-skills', listSkills);
skillRouter.get('/:id/get-skill', getSkill);
skillRouter.post('/create-skill', authMiddleware, createSkill);
skillRouter.put('/:id/update-skill', authMiddleware, updateSkill);
skillRouter.delete('/:id/delete-skill', authMiddleware, deleteSkill);

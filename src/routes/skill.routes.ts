import { Router } from 'express';
import { createSkill, deleteSkill, getSkill, listSkills, updateSkill } from '../controllers/skill.controller.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

export const skillRouter = Router();

skillRouter.get('/', listSkills);
skillRouter.get('/:id', getSkill);
skillRouter.post('/', authMiddleware, createSkill);
skillRouter.put('/:id', authMiddleware, updateSkill);
skillRouter.delete('/:id', authMiddleware, deleteSkill);

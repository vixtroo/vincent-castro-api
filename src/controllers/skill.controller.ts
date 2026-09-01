import type { Request, RequestHandler } from 'express';
import { AppError } from '../middleware/error.middleware.js';
import { SkillService } from '../services/skill.service.js';
import { SKILL_CATEGORIES, type CreateSkillInput, type UpdateSkillInput } from '../types/skill.types.js';

const skillService = new SkillService();
const allowedCreateFields = ['name', 'category', 'user_id'] as const;
const allowedUpdateFields = ['name', 'category'] as const;

const getSkillId = (request: Request): number => {
  const { id } = request.params;
  const numericId = Number(id);

  if (!Number.isInteger(numericId) || numericId <= 0) {
    throw new AppError(400, 'Invalid skill ID');
  }

  return numericId;
};

const getUserId = (request: Request): string => {
  if (!request.user?.id) throw new AppError(401, 'Unauthorized');
  return request.user.id;
};

const getAccessToken = (request: Request): string => {
  if (!request.accessToken) throw new AppError(401, 'Unauthorized');
  return request.accessToken;
};

const isValidUuid = (value: unknown): value is string => {
  return typeof value === 'string' && /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[1-5][0-9a-fA-F]{3}-[89abAB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/.test(value);
};

const validateSkillInput = (body: unknown, partial = false): CreateSkillInput | UpdateSkillInput => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(400, 'Request body must be an object');
  }

  const input = body as Record<string, unknown>;
  const allowedFields = partial ? allowedUpdateFields : allowedCreateFields;
  const hasUnknownField = Object.keys(input).some((field) => !(allowedFields as readonly string[]).includes(field));

  if (hasUnknownField) throw new AppError(400, 'Invalid skill payload');

  if (!partial && !('name' in input)) throw new AppError(400, 'Skill name is required');
  if (!partial && !('category' in input)) throw new AppError(400, 'Skill category is required');

  if ('name' in input) {
    if (typeof input.name !== 'string' || !input.name.trim()) {
      throw new AppError(400, 'Skill name must be a non-empty string');
    }
  }

  if ('category' in input) {
    if (typeof input.category !== 'string' || !SKILL_CATEGORIES.includes(input.category as (typeof SKILL_CATEGORIES)[number])) {
      throw new AppError(400, 'Invalid skill category');
    }
  }

  if ('user_id' in input && input.user_id !== undefined && !isValidUuid(input.user_id)) {
    throw new AppError(400, 'Invalid user_id');
  }

  if (partial && Object.keys(input).length === 0) {
    throw new AppError(400, 'At least one field is required');
  }

  return input as CreateSkillInput | UpdateSkillInput;
};

export const listSkills: RequestHandler = async (_request, response, next) => {
  try {
    response.json({ success: true, data: await skillService.getSkills() });
  } catch (error) {
    next(error);
  }
};

export const getSkill: RequestHandler = async (request, response, next) => {
  try {
    response.json({ success: true, data: await skillService.getSkillById(getSkillId(request)) });
  } catch (error) {
    next(error);
  }
};

export const createSkill: RequestHandler = async (request, response, next) => {
  try {
    const data = validateSkillInput(request.body) as CreateSkillInput;
    const userId = getUserId(request);
    const payload: CreateSkillInput = {
      name: data.name.trim(),
      category: data.category,
    };

    response.status(201).json({
      success: true,
      data: await skillService.createSkill(payload, userId, getAccessToken(request)),
    });
  } catch (error) {
    next(error);
  }
};

export const updateSkill: RequestHandler = async (request, response, next) => {
  try {
    const data = validateSkillInput(request.body, true) as UpdateSkillInput;
    const payload: UpdateSkillInput = {};

    if (typeof data.name === 'string') payload.name = data.name.trim();
    if (data.category !== undefined) payload.category = data.category;

    response.json({
      success: true,
      data: await skillService.updateSkill(getSkillId(request), payload, getUserId(request), getAccessToken(request)),
    });
  } catch (error) {
    next(error);
  }
};

export const deleteSkill: RequestHandler = async (request, response, next) => {
  try {
    await skillService.deleteSkill(getSkillId(request), getUserId(request), getAccessToken(request));
    response.json({ success: true, message: 'Skill deleted successfully' });
  } catch (error) {
    next(error);
  }
};

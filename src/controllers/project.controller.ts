import type { Request, RequestHandler } from 'express';
import { AppError } from '../middleware/error.middleware.js';
import { ProjectService } from '../services/project.service.js';
import type { CreateProjectInput, UpdateProjectInput } from '../types/project.types.js';

const projectService = new ProjectService();
const projectFields = ['project_name', 'description', 'tech_stack', 'features', 'is_currently_building'] as const;
const requiredProjectFields = ['project_name', 'description', 'tech_stack'] as const;

const getProjectId = (request: Request): string => {
  const { id } = request.params;
  if (typeof id !== 'string' || !id) throw new AppError(400, 'Project ID is required');
  return id;
};

const getUserId = (request: Request): string => {
  if (!request.user?.id) throw new AppError(401, 'Unauthorized');
  return request.user.id;
};

const getAccessToken = (request: Request): string => {
  if (!request.accessToken) throw new AppError(401, 'Unauthorized');
  return request.accessToken;
};

const parsePositiveInteger = (value: unknown, name: string, defaultValue: number): number => {
  if (value === undefined) return defaultValue;
  if (typeof value !== 'string' || !/^\d+$/.test(value)) throw new AppError(400, `${name} must be a positive integer`);
  const parsed = Number(value);
  if (!Number.isSafeInteger(parsed) || parsed <= 0) throw new AppError(400, `${name} must be a positive integer`);
  return parsed;
};

const parseStringArray = (value: unknown, field: string): string[] => {
  if (typeof value !== 'string') throw new AppError(400, `${field} must be a JSON array`);
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { throw new AppError(400, `${field} must be a JSON array`); }
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
    throw new AppError(400, `${field} must be a JSON array`);
  }
  return parsed;
};

const parseBoolean = (value: unknown, field: string): boolean => {
  if (value === true || value === 'true') return true;
  if (value === false || value === 'false') return false;
  throw new AppError(400, `${field} must be a boolean`);
};

const validateProjectInput = (body: unknown, partial = false, hasImage = false): CreateProjectInput | UpdateProjectInput => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AppError(400, 'Request body must be an object');
  const input = body as Record<string, unknown>;
  const hasUnknownField = Object.keys(input).some((field) => !projectFields.includes(field as typeof projectFields[number]) && field !== 'user_id');
  const missingField = !partial && requiredProjectFields.some((field) => !(field in input));
  const hasInvalidText = ['project_name', 'description'].some((field) => field in input && typeof input[field] !== 'string');
  const hasEmptyUpdate = partial && !hasImage && Object.keys(input).filter((field) => field !== 'user_id').length === 0;

  if (hasUnknownField || missingField || hasInvalidText || hasEmptyUpdate) throw new AppError(400, 'Invalid project payload');
  if ('tech_stack' in input) input.tech_stack = parseStringArray(input.tech_stack, 'tech_stack');
  if ('features' in input) input.features = parseStringArray(input.features, 'features');
  if ('is_currently_building' in input) input.is_currently_building = parseBoolean(input.is_currently_building, 'is_currently_building');
  delete input.user_id;
  return input as unknown as CreateProjectInput | UpdateProjectInput;
};

export const listProjects: RequestHandler = async (request, response, next) => {
  try {
    const page = parsePositiveInteger(request.query.page, 'page', 1);
    const limit = parsePositiveInteger(request.query.limit, 'limit', 10);
    response.json({ success: true, data: await projectService.getProjects(page, limit) });
  } catch (error) { next(error); }
};

export const getProject: RequestHandler = async (request, response, next) => {
  try {
    response.json({ success: true, data: await projectService.getProjectById(getProjectId(request)) });
  } catch (error) { next(error); }
};

export const getCurrentlyBuildingProject: RequestHandler = async (_request, response, next) => {
  try {
    response.json({ success: true, data: await projectService.getCurrentlyBuildingProject() });
  } catch (error) { next(error); }
};

export const createProject: RequestHandler = async (request, response, next) => {
  try {
    if (!request.file) throw new AppError(400, 'project_image is required');
    const data = validateProjectInput(request.body);
    response.status(201).json({ success: true, data: await projectService.createProject(data as CreateProjectInput, request.file, getUserId(request), getAccessToken(request)) });
  } catch (error) { next(error); }
};

export const updateProject: RequestHandler = async (request, response, next) => {
  try {
    const data = validateProjectInput(request.body, true, Boolean(request.file));
    response.json({ success: true, data: await projectService.updateProject(getProjectId(request), data as UpdateProjectInput, request.file, getUserId(request), getAccessToken(request)) });
  } catch (error) { next(error); }
};

export const deleteProject: RequestHandler = async (request, response, next) => {
  try {
    await projectService.deleteProject(getProjectId(request), getUserId(request), getAccessToken(request));
    response.json({ success: true, data: null });
  } catch (error) { next(error); }
};
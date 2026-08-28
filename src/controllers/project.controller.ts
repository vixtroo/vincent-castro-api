import type { Request, RequestHandler } from 'express';
import { AppError } from '../middleware/error.middleware.js';
import { ProjectService } from '../services/project.service.js';
import type { CreateProjectInput, UpdateProjectInput } from '../types/project.types.js';

const projectService = new ProjectService();
const projectFields = ['project_name', 'description', 'tech_stack'] as const;

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

const parseTechStack = (value: unknown): string[] => {
  if (typeof value !== 'string') throw new AppError(400, 'tech_stack must be a JSON array');
  let parsed: unknown;
  try { parsed = JSON.parse(value); } catch { throw new AppError(400, 'tech_stack must be a JSON array'); }
  if (!Array.isArray(parsed) || parsed.some((item) => typeof item !== 'string')) {
    throw new AppError(400, 'tech_stack must be a JSON array');
  }
  return parsed;
};

const validateProjectInput = (body: unknown, partial = false, hasImage = false): CreateProjectInput | UpdateProjectInput => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) throw new AppError(400, 'Request body must be an object');
  const input = body as Record<string, unknown>;
  const hasUnknownField = Object.keys(input).some((field) => !projectFields.includes(field as typeof projectFields[number]) && field !== 'user_id');
  const missingField = !partial && projectFields.some((field) => !(field in input));
  const hasInvalidText = ['project_name', 'description'].some((field) => field in input && typeof input[field] !== 'string');
  const hasEmptyUpdate = partial && !hasImage && Object.keys(input).filter((field) => field !== 'user_id').length === 0;

  if (hasUnknownField || missingField || hasInvalidText || hasEmptyUpdate) throw new AppError(400, 'Invalid project payload');
  if ('tech_stack' in input) input.tech_stack = parseTechStack(input.tech_stack);
  delete input.user_id;
  return input as unknown as CreateProjectInput | UpdateProjectInput;
};

export const listProjects: RequestHandler = async (request, response, next) => {
  try { response.json({ success: true, data: await projectService.getProjects() }); } catch (error) { next(error); }
};

export const getProject: RequestHandler = async (request, response, next) => {
  try {
    response.json({ success: true, data: await projectService.getProjectById(getProjectId(request)) });
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
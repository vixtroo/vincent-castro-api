import type { Request, RequestHandler } from 'express';
import { AppError } from '../middleware/error.middleware.js';
import { ProjectService } from '../services/project.service.js';
import type { CreateProjectInput, UpdateProjectInput } from '../types/project.types.js';

const projectService = new ProjectService();

const getProjectId = (request: Request): string => {
  const { id } = request.params;
  if (typeof id !== 'string' || !id) throw new AppError(400, 'Project ID is required');
  return id;
};

const validateProjectInput = (body: unknown, partial = false): CreateProjectInput | UpdateProjectInput => {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new AppError(400, 'Request body must be an object');
  }

  const input = body as Record<string, unknown>;
  const fields = ['image_url', 'project_name', 'description', 'tech_stack'] as const;
  const hasInvalidField = fields.some((field) => field in input && typeof input[field] !== (field === 'tech_stack' ? 'object' : 'string'));
  const missingField = !partial && fields.some((field) => !(field in input));
  const invalidTechStack = 'tech_stack' in input && (!Array.isArray(input.tech_stack) || input.tech_stack.some((item) => typeof item !== 'string'));

  if (missingField || hasInvalidField || invalidTechStack) {
    throw new AppError(400, 'Invalid project payload');
  }

  return input as unknown as CreateProjectInput | UpdateProjectInput;
};

export const listProjects: RequestHandler = async (_request, response, next) => {
  try {
    response.json({ success: true, data: await projectService.listProjects() });
  } catch (error) { next(error); }
};

export const getProject: RequestHandler = async (request, response, next) => {
  try {
    response.json({ success: true, data: await projectService.getProject(getProjectId(request)) });
  } catch (error) { next(error); }
};

export const createProject: RequestHandler = async (request, response, next) => {
  try {
    response.status(201).json({ success: true, data: await projectService.createProject(validateProjectInput(request.body) as CreateProjectInput) });
  } catch (error) { next(error); }
};

export const updateProject: RequestHandler = async (request, response, next) => {
  try {
    response.json({ success: true, data: await projectService.updateProject(getProjectId(request), validateProjectInput(request.body, true) as UpdateProjectInput) });
  } catch (error) { next(error); }
};

export const deleteProject: RequestHandler = async (request, response, next) => {
  try {
    await projectService.deleteProject(getProjectId(request));
    response.status(204).send();
  } catch (error) { next(error); }
};

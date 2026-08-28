import { createAuthenticatedSupabaseClient, publicSupabase } from '../config/supabase.js';
import { AppError } from '../middleware/error.middleware.js';
import { deleteProjectImage, uploadProjectImage } from './storage.service.js';
import type { CreateProjectInput, Project, UpdateProjectInput } from '../types/project.types.js';

type ProjectImage = Express.Multer.File;

const isNotFoundError = (error: { code?: string }): boolean => error.code === 'PGRST116';

const throwDatabaseError = (operation: string, error: unknown): never => {
  console.error(`Supabase ${operation} failed`, error);
  throw new AppError(502, `Unable to ${operation} project data`);
};

const getDatabaseClient = (accessToken: string) => createAuthenticatedSupabaseClient(accessToken);

export class ProjectService {
  async getProjects(): Promise<Project[]> {
    const { data, error } = await publicSupabase.from('projects').select('*');
    if (error) throwDatabaseError('load', error);
    return data as Project[];
  }

  async getProjectById(id: string): Promise<Project> {
    const { data, error } = await publicSupabase.from('projects').select('*').eq('id', id).single();
    if (error) {
      if (isNotFoundError(error)) throw new AppError(404, 'Project not found');
      throwDatabaseError('load', error);
    }
    return data as Project;
  }

  async createProject(input: CreateProjectInput, projectImage: ProjectImage, userId: string, accessToken: string): Promise<Project> {
    const uploadedImage = await uploadProjectImage(projectImage, userId);
    const { data, error } = await getDatabaseClient(accessToken).from('projects').insert({ ...input, user_id: userId, project_image: uploadedImage.publicUrl }).select().single();
    if (error) {
      await this.cleanupImage(uploadedImage.path);
      throwDatabaseError('create', error);
    }
    return data as Project;
  }

  async updateProject(id: string, input: UpdateProjectInput, projectImage: ProjectImage | undefined, userId: string, accessToken: string): Promise<Project> {
    const existing = await this.getOwnedProject(id, userId, accessToken);
    const uploadedImage = projectImage ? await uploadProjectImage(projectImage, userId) : undefined;
    const { data, error } = await getDatabaseClient(accessToken).from('projects').update({
      ...input,
      ...(uploadedImage ? { project_image: uploadedImage.publicUrl } : {}),
    }).eq('id', id).eq('user_id', userId).select().single();

    if (error) {
      if (uploadedImage) await this.cleanupImage(uploadedImage.path);
      if (isNotFoundError(error)) throw new AppError(404, 'Project not found');
      throwDatabaseError('update', error);
    }
    if (uploadedImage && existing.project_image) await this.cleanupImage(existing.project_image);
    return data as Project;
  }

  async deleteProject(id: string, userId: string, accessToken: string): Promise<void> {
    const existing = await this.getOwnedProject(id, userId, accessToken);
    if (existing.project_image) await deleteProjectImage(existing.project_image);
    const { error } = await getDatabaseClient(accessToken).from('projects').delete().eq('id', id).eq('user_id', userId);
    if (error) throwDatabaseError('delete', error);
  }

  private async cleanupImage(imagePathOrUrl: string): Promise<void> {
    try {
      await deleteProjectImage(imagePathOrUrl);
    } catch (error) {
      console.error('Supabase image cleanup failed', error);
    }
  }

  private async getOwnedProject(id: string, userId: string, accessToken: string): Promise<Project> {
    const { data, error } = await getDatabaseClient(accessToken).from('projects').select('*').eq('id', id).eq('user_id', userId).single();
    if (error) {
      if (isNotFoundError(error)) throw new AppError(404, 'Project not found');
      throwDatabaseError('load', error);
    }
    return data as Project;
  }
}
import { randomUUID } from 'node:crypto';
import { createAuthenticatedSupabaseClient, publicSupabase, supabase } from '../config/supabase.js';
import { AppError } from '../middleware/error.middleware.js';
import type { CreateProjectInput, Project, UpdateProjectInput } from '../types/project.types.js';

type ProjectImage = Express.Multer.File;
const bucket = 'project_image';

const isNotFoundError = (error: { code?: string }): boolean => error.code === 'PGRST116';

const throwDatabaseError = (operation: string, error: unknown): never => {
  console.error(`Supabase ${operation} failed`, error);
  throw new AppError(502, `Unable to ${operation} project data`);
};

const getImageExtension = (mimeType: string): string => mimeType === 'image/jpeg' ? 'jpg' : mimeType.slice(6);
const getDatabaseClient = (accessToken: string) => createAuthenticatedSupabaseClient(accessToken);

export class ProjectService {
  private async uploadImage(file: ProjectImage, userId: string): Promise<string> {
    const path = `${userId}/${randomUUID()}.${getImageExtension(file.mimetype)}`;
    const { error } = await supabase.storage.from(bucket).upload(path, file.buffer, {
      contentType: file.mimetype,
      upsert: false,
    });
    if (error) throwDatabaseError('upload', error);
    return path;
  }

  private async removeImage(path: string): Promise<void> {
    const { error } = await supabase.storage.from(bucket).remove([path]);
    if (error) console.error('Supabase image cleanup failed', error);
  }

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
    const imagePath = await this.uploadImage(projectImage, userId);
    const { data, error } = await getDatabaseClient(accessToken).from('projects').insert({ ...input, user_id: userId, project_image: imagePath }).select().single();
    if (error) {
      await this.removeImage(imagePath);
      throwDatabaseError('create', error);
    }
    return data as Project;
  }

  async updateProject(id: string, input: UpdateProjectInput, projectImage: ProjectImage | undefined, userId: string, accessToken: string): Promise<Project> {
    const existing = await this.getOwnedProject(id, userId, accessToken);
    const newImagePath = projectImage ? await this.uploadImage(projectImage, userId) : undefined;
    const { data, error } = await getDatabaseClient(accessToken).from('projects').update({
      ...input,
      ...(newImagePath ? { project_image: newImagePath } : {}),
    }).eq('id', id).eq('user_id', userId).select().single();

    if (error) {
      if (newImagePath) await this.removeImage(newImagePath);
      if (isNotFoundError(error)) throw new AppError(404, 'Project not found');
      throwDatabaseError('update', error);
    }
    if (newImagePath && existing.project_image) await this.removeImage(existing.project_image);
    return data as Project;
  }

  async deleteProject(id: string, userId: string, accessToken: string): Promise<void> {
    const existing = await this.getOwnedProject(id, userId, accessToken);
    const { error } = await getDatabaseClient(accessToken).from('projects').delete().eq('id', id).eq('user_id', userId);
    if (error) throwDatabaseError('delete', error);
    if (existing.project_image) await this.removeImage(existing.project_image);
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
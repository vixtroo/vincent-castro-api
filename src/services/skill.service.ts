import { createAuthenticatedSupabaseClient, publicSupabase } from '../config/supabase.js';
import { AppError } from '../middleware/error.middleware.js';
import type { CreateSkillInput, Skill, UpdateSkillInput } from '../types/skill.types.js';

const isNotFoundError = (error: { code?: string }): boolean => error.code === 'PGRST116';

const throwDatabaseError = (operation: string, error: unknown): never => {
  console.error(`Supabase ${operation} failed`, error);
  throw new AppError(502, `Unable to ${operation} skill data`);
};

const getDatabaseClient = (accessToken: string) => createAuthenticatedSupabaseClient(accessToken);

export class SkillService {
  async getSkills(): Promise<Skill[]> {
    const { data, error } = await publicSupabase
      .from('skills')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throwDatabaseError('load', error);
    return data as Skill[];
  }

  async getSkillById(id: number): Promise<Skill> {
    const { data, error } = await publicSupabase
      .from('skills')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (isNotFoundError(error)) throw new AppError(404, 'Skill not found');
      throwDatabaseError('load', error);
    }

    return data as Skill;
  }

  async createSkill(input: CreateSkillInput, userId: string, accessToken: string): Promise<Skill> {
    const { data, error } = await getDatabaseClient(accessToken)
      .from('skills')
      .insert({
        name: input.name.trim(),
        category: input.category,
        user_id: userId,
      })
      .select()
      .single();

    if (error) throwDatabaseError('create', error);
    return data as Skill;
  }

  async updateSkill(id: number, input: UpdateSkillInput, userId: string, accessToken: string): Promise<Skill> {
    const sanitizedInput: Record<string, string> = {};

    if (input.name !== undefined) sanitizedInput.name = input.name.trim();
    if (input.category !== undefined) sanitizedInput.category = input.category;

    const { data, error } = await getDatabaseClient(accessToken)
      .from('skills')
      .update(sanitizedInput)
      .eq('id', id)
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      if (isNotFoundError(error)) throw new AppError(404, 'Skill not found');
      throwDatabaseError('update', error);
    }

    return data as Skill;
  }

  async deleteSkill(id: number, userId: string, accessToken: string): Promise<void> {
    await this.getOwnedSkill(id, userId, accessToken);

    const { error } = await getDatabaseClient(accessToken)
      .from('skills')
      .delete()
      .eq('id', id)
      .eq('user_id', userId);

    if (error) throwDatabaseError('delete', error);
  }

  private async getOwnedSkill(id: number, userId: string, accessToken: string): Promise<Skill> {
    const { data, error } = await getDatabaseClient(accessToken)
      .from('skills')
      .select('*')
      .eq('id', id)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (isNotFoundError(error)) throw new AppError(404, 'Skill not found');
      throwDatabaseError('load', error);
    }

    return data as Skill;
  }
}

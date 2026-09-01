export const SKILL_CATEGORIES = ['FRONTEND', 'BACKEND', 'DATABASE', 'TOOLS'] as const;

export type SkillCategory = (typeof SKILL_CATEGORIES)[number];

export interface Skill {
  id: number;
  created_at: string;
  name: string;
  category: SkillCategory;
  user_id: string;
}

export interface CreateSkillInput {
  name: string;
  category: SkillCategory;
  user_id?: string;
}

export interface UpdateSkillInput {
  name?: string;
  category?: SkillCategory;
}

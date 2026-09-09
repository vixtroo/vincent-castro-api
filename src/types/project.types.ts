export interface Project {
  id: string;
  user_id: string;
  project_image: string | null;
  project_name: string;
  description: string | null;
  tech_stack: string[];
  is_currently_building: boolean;
  features: string[] | null;
  created_at: string;
  updated_at: string;
}

export interface UpdateCurrentlyBuildingProjectInput {
  is_currently_building: boolean;
  features?: string[] | null;
}

export type CreateProjectInput = Omit<Project, 'id' | 'user_id' | 'project_image' | 'created_at' | 'updated_at'>;
export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}

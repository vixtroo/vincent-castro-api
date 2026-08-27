export interface Project {
  id: string;
  image_url: string;
  project_name: string;
  description: string;
  tech_stack: string[];
}

export type CreateProjectInput = Omit<Project, 'id'>;
export type UpdateProjectInput = Partial<CreateProjectInput>;

export interface ApiSuccess<T> {
  success: true;
  data: T;
}

export interface ApiError {
  success: false;
  message: string;
}

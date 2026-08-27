import { randomUUID } from 'node:crypto';
import { AppError } from '../middleware/error.middleware.js';
import type { CreateProjectInput, Project, UpdateProjectInput } from '../types/project.types.js';

interface ProjectStore {
  list(): Promise<Project[]>;
  findById(id: string): Promise<Project | undefined>;
  create(input: CreateProjectInput): Promise<Project>;
  update(id: string, input: UpdateProjectInput): Promise<Project | undefined>;
  delete(id: string): Promise<boolean>;
}

class InMemoryProjectStore implements ProjectStore {
  private readonly projects = new Map<string, Project>();

  async list(): Promise<Project[]> {
    return [...this.projects.values()];
  }

  async findById(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async create(input: CreateProjectInput): Promise<Project> {
    const project: Project = { id: randomUUID(), ...input };
    this.projects.set(project.id, project);
    return project;
  }

  async update(id: string, input: UpdateProjectInput): Promise<Project | undefined> {
    const existing = this.projects.get(id);
    if (!existing) return undefined;

    const updated = { ...existing, ...input };
    this.projects.set(id, updated);
    return updated;
  }

  async delete(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }
}

export class ProjectService {
  constructor(private readonly store: ProjectStore = new InMemoryProjectStore()) {}

  listProjects(): Promise<Project[]> {
    return this.store.list();
  }

  async getProject(id: string): Promise<Project> {
    const project = await this.store.findById(id);
    if (!project) throw new AppError(404, 'Project not found');
    return project;
  }

  createProject(input: CreateProjectInput): Promise<Project> {
    return this.store.create(input);
  }

  async updateProject(id: string, input: UpdateProjectInput): Promise<Project> {
    const project = await this.store.update(id, input);
    if (!project) throw new AppError(404, 'Project not found');
    return project;
  }

  async deleteProject(id: string): Promise<void> {
    if (!(await this.store.delete(id))) throw new AppError(404, 'Project not found');
  }
}

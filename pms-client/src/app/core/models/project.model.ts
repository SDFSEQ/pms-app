export type ProjectStatus = 'Active' | 'Completed' | 'OnHold';

export interface ProjectDisciplineRequirement {
  id: number;
  disciplineId: number;
  disciplineName: string;
  requiredCount: number;
  filledCount: number;
  openCount: number;
}

export interface Project {
  id: number;
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: ProjectStatus;
  totalRequired: number;
  totalFilled: number;
  totalOpen: number;
  disciplineRequirements: ProjectDisciplineRequirement[];
}

export interface CreateProject {
  name: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  disciplineRequirements: { disciplineId: number; requiredCount: number }[];
}

export interface UpdateProject extends CreateProject {
  status: ProjectStatus;
}

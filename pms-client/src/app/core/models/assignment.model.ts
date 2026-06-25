export interface Assignment {
  id: number;
  employeeId: number;
  employeeName: string;
  projectId: number;
  projectName: string;
  disciplineId: number;
  disciplineName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
  createdAt: string;
}

export interface EligibleEmployee {
  employeeId: number;
  firstName: string;
  lastName: string;
  email: string;
  disciplineName: string;
}

export interface EligibleProject {
  projectId: number;
  projectName: string;
  projectDisciplineId: number;
  disciplineId: number;
  disciplineName: string;
  openCount: number;
}

export interface CreateAssignment {
  employeeId: number;
  projectDisciplineId: number;
  startDate: string;
  endDate: string;
}

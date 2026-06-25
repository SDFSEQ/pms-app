import { Discipline } from './discipline.model';

export type EmployeeStatus = 'Available' | 'Unavailable';

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  status: EmployeeStatus;
  disciplines: Discipline[];
  assignments?: EmployeeAssignment[];
}

export interface EmployeeAssignment {
  id: number;
  projectId: number;
  projectName: string;
  disciplineName: string;
  startDate: string;
  endDate: string;
  durationDays: number;
}

export interface CreateEmployee {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  disciplineIds: number[];
}

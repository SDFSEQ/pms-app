export interface DisciplineCount {
  disciplineId: number;
  disciplineName: string;
  count: number;
}

export interface DashboardSummary {
  totalProjectsWithOpenPositions: number;
  totalOpenPositions: number;
  totalAvailableEmployees: number;
  openPositionsByDiscipline: DisciplineCount[];
  availableEmployeesByDiscipline: DisciplineCount[];
}

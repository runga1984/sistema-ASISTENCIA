
export interface Employee {
  id: string;
  cedula: string;
  firstName: string;
  lastName: string;
  department: string;
  role: 'Administrativo' | 'Obrero';
  shift?: 'Mañana' | 'Tarde' | 'Completo';
  status: 'Activo' | 'Vacaciones' | 'Permiso' | 'Reposo';
  hireDate: string;
  email: string;
  phone?: string; // Nuevo campo
  availableVacationDays: number;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  status: 'A tiempo' | 'Retardo' | 'Falta' | 'Salida Anticipada' | 'Vacaciones';
}

export interface Department {
  id: string;
  name: string;
  category: 'Académico' | 'Administrativo' | 'Técnico';
  managerId?: string;
  location?: string;
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
}

export interface Leave {
  id: number;
  employee: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: string;
  requestDate: string;
}

export interface GlobalConfig {
  institutionName: string;
  logo: string | null;
  entryTimeLimit: string;
  adminPin: string;
  theme: 'light' | 'dark';
  isSidebarCollapsed: boolean;
  holidays: Holiday[];
}

export interface Stats {
  totalEmployees: number;
  presentToday: number;
  lateToday: number;
  onLeave: number;
}

import { Department, Employee, AttendanceRecord } from './types';

export const DEPARTMENTS: Department[] = [
  // 1. Atención al ciudadano
  { id: 'dep-1', name: 'Atención al Ciudadano', category: 'Administrativo' },
  // 2. Seguro social
  { id: 'dep-2', name: 'Seguro Social', category: 'Administrativo' },
  // 3. Supervisión educativa
  { id: 'dep-3', name: 'Supervisión Educativa', category: 'Académico' },
  // 4. Consultoría jurídica
  { id: 'dep-4', name: 'Consultoría Jurídica', category: 'Administrativo' },
  // 5. Bienes nacionales
  { id: 'dep-5', name: 'Bienes Nacionales', category: 'Administrativo' },
  // 6. Planificación y presupuesto
  { id: 'dep-6', name: 'Planificación y Presupuesto', category: 'Administrativo' },
  // 7. CNAE
  { id: 'dep-7', name: 'Consejo Nacional de Atención Educativa (CNAE)', category: 'Técnico' },
  // 8. CRCA
  { id: 'dep-8', name: 'Centro de Recursos para el Aprendizaje (CRCA)', category: 'Técnico' },
  // 9. Comunidades educativas
  { id: 'dep-9', name: 'Comunidades Educativas', category: 'Académico' },
  // 10. Indígenas
  { id: 'dep-10', name: 'Educación Indígena', category: 'Académico' },
  // 11. Formación e investigación docente
  { id: 'dep-11', name: 'Formación e Investigación Docente', category: 'Académico' },
  // 12. Despacho
  { id: 'dep-12', name: 'Despacho Directivo', category: 'Administrativo' },
  // 13. Gobernación
  { id: 'dep-13', name: 'Gobernación Educativa', category: 'Administrativo' },
  // 14. Sala situacional
  { id: 'dep-14', name: 'Sala Situacional', category: 'Técnico' },
  // 15. SIGE
  { id: 'dep-15', name: 'Sistema de Gestión Educativa (SIGE)', category: 'Técnico' },
  // 16. Gestión humana
  { id: 'dep-16', name: 'Gestión Humana', category: 'Administrativo' },
  // 17. Div. Media General y Media Técnica
  { id: 'dep-17', name: 'División de Media General y Media Técnica', category: 'Académico' },
  // 18. Div. Inicial, Primaria y Educación Especial
  { id: 'dep-18', name: 'División de Inicial, Primaria y Educación Especial', category: 'Académico' },
  // 19. Informática
  { id: 'dep-19', name: 'Informática y Sistemas', category: 'Técnico' },
  // 20. Prensa
  { id: 'dep-20', name: 'Prensa y Comunicaciones', category: 'Técnico' },
  // 21. FUNDABIT
  { id: 'dep-21', name: 'Fundación Bolivariana de Informática y Telemática (FUNDABIT)', category: 'Académico' },
  // 22. UNEM
  { id: 'dep-22', name: 'Unidad Educativa de Media (UNEM)', category: 'Académico' },
  // 23. Auditoría
  { id: 'dep-23', name: 'Auditoría Interna', category: 'Administrativo' },
  // 24. Barbería y Peluquería
  { id: 'dep-24', name: 'Barbería y Peluquería', category: 'Técnico' }
];

export const MOCK_EMPLOYEES: Employee[] = [
  {
    id: 'emp-1',
    cedula: '15432100',
    firstName: 'María',
    lastName: 'Rodríguez',
    department: 'Gestión Humana',
    role: 'Administrativo',
    shift: 'Completo',
    status: 'Activo',
    hireDate: '2015-03-12',
    email: 'maria.r@me.gob.ve',
    availableVacationDays: 0
  },
  {
    id: 'emp-2',
    cedula: '18999888',
    firstName: 'José',
    lastName: 'Pérez',
    department: 'Informática y Sistemas',
    role: 'Administrativo',
    shift: 'Completo',
    status: 'Activo',
    hireDate: '2018-06-01',
    email: 'jose.p@me.gob.ve',
    availableVacationDays: 15
  },
  {
    id: 'emp-3',
    cedula: '12345678',
    firstName: 'Ana',
    lastName: 'Gómez',
    department: 'Supervisión Educativa',
    role: 'Administrativo',
    shift: 'Completo',
    status: 'Vacaciones',
    hireDate: '2010-01-15',
    email: 'ana.g@me.gob.ve',
    availableVacationDays: 35
  },
  {
    id: 'emp-4',
    cedula: '20555444',
    firstName: 'Carlos',
    lastName: 'Martínez',
    department: 'Bienes Nacionales',
    role: 'Obrero',
    shift: 'Mañana',
    status: 'Activo',
    hireDate: '2019-11-20',
    email: 'carlos.m@me.gob.ve',
    availableVacationDays: 0
  },
  {
    id: 'emp-5',
    cedula: '22111222',
    firstName: 'Pedro',
    lastName: 'Ramírez',
    department: 'Barbería y Peluquería',
    role: 'Obrero',
    shift: 'Tarde',
    status: 'Activo',
    hireDate: '2021-02-10',
    email: 'pedro.r@me.gob.ve',
    availableVacationDays: 5
  }
];

export const MOCK_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', employeeId: 'emp-1', date: new Date().toISOString().split('T')[0], checkIn: '07:55', status: 'A tiempo' },
  { id: 'att-2', employeeId: 'emp-2', date: new Date().toISOString().split('T')[0], checkIn: '08:15', status: 'Retardo' },
  { id: 'att-3', employeeId: 'emp-3', date: new Date().toISOString().split('T')[0], checkIn: undefined, status: 'Vacaciones' },
];

export const DEFAULT_LOGO = "https://via.placeholder.com/150/003366/FFFFFF?text=Zona+Educativa";

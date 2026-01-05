import React, { createContext, useContext, useState, useEffect } from 'react';
import { Employee, AttendanceRecord, Department, Leave } from '../types';
import { MOCK_EMPLOYEES, MOCK_ATTENDANCE, DEPARTMENTS } from '../constants';

interface DatabaseData {
  employees: Employee[];
  attendance: AttendanceRecord[];
  departments: Department[];
  leaves: Leave[];
}

interface DataContextType extends DatabaseData {
  setEmployees: React.Dispatch<React.SetStateAction<Employee[]>>;
  setAttendance: React.Dispatch<React.SetStateAction<AttendanceRecord[]>>;
  setDepartments: React.Dispatch<React.SetStateAction<Department[]>>;
  setLeaves: React.Dispatch<React.SetStateAction<Leave[]>>;
  addAttendanceRecord: (record: AttendanceRecord) => void;
  updateAttendanceRecord: (id: string, updates: Partial<AttendanceRecord>) => void;
  addDepartment: (name: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const load = (key: string, defaultValue: any) => {
    try {
      const saved = localStorage.getItem(key);
      return saved ? JSON.parse(saved) : defaultValue;
    } catch (e) {
      console.error(`Error loading ${key}`, e);
      return defaultValue;
    }
  };

  const [employees, setEmployees] = useState<Employee[]>(() => load('ze_db_employees', MOCK_EMPLOYEES));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => load('ze_db_attendance', MOCK_ATTENDANCE));
  const [departments, setDepartments] = useState<Department[]>(() => load('ze_db_departments', DEPARTMENTS));
  const [leaves, setLeaves] = useState<Leave[]>(() => load('ze_db_leaves', []));

  useEffect(() => { localStorage.setItem('ze_db_employees', JSON.stringify(employees)); }, [employees]);
  useEffect(() => { localStorage.setItem('ze_db_attendance', JSON.stringify(attendance)); }, [attendance]);
  useEffect(() => { localStorage.setItem('ze_db_departments', JSON.stringify(departments)); }, [departments]);
  useEffect(() => { localStorage.setItem('ze_db_leaves', JSON.stringify(leaves)); }, [leaves]);

  const addAttendanceRecord = (record: AttendanceRecord) => setAttendance(prev => [...prev, record]);

  const updateAttendanceRecord = (id: string, updates: Partial<AttendanceRecord>) => {
    setAttendance(prev => prev.map(record => record.id === id ? { ...record, ...updates } : record));
  };

  const addDepartment = (name: string) => {
    if (!departments.some(d => d.name.toLowerCase() === name.toLowerCase())) {
      setDepartments(prev => [...prev, { id: `dep-${Date.now()}`, name, category: 'Administrativo' }]);
    }
  };

  return (
    <DataContext.Provider value={{
      employees, setEmployees, attendance, setAttendance, 
      departments, setDepartments, leaves, setLeaves,
      addAttendanceRecord, updateAttendanceRecord, addDepartment
    }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used within DataProvider');
  return context;
};
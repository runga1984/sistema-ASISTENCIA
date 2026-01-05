
import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, Outlet } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import AttendanceKiosk from './pages/AttendanceKiosk';
import Employees from './pages/Employees';
import AttendanceAdmin from './pages/AttendanceAdmin';
import Leaves from './pages/Leaves';
import Departments from './pages/Departments';
import Reports from './pages/Reports';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { ToastProvider } from './context/ToastContext';
import { DataProvider } from './context/DataContext';

const AdminLayout = () => {
  const { config, toggleSidebar } = useConfig();
  
  // Close sidebar on small screens when route changes (optional but good UX)
  // Or handle backdrop for mobile
  
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 transition-colors duration-300 font-sans">
      <Sidebar />
      
      {/* Backdrop for mobile */}
      {!config.isSidebarCollapsed && (
        <div 
          onClick={toggleSidebar}
          className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
        ></div>
      )}

      <div 
        className={`flex-1 transition-all duration-500 flex flex-col w-full ${
          config.isSidebarCollapsed ? 'md:ml-24' : 'md:ml-72'
        }`}
      >
        <Header />
        <main className="flex-1 pt-20 relative overflow-x-hidden">
          <div className="max-w-[1600px] mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

const App = () => {
  return (
    <ConfigProvider>
      <DataProvider>
        <ToastProvider>
          <HashRouter>
            <Routes>
              <Route path="/kiosk" element={<AttendanceKiosk />} />
              <Route path="/" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="settings" element={<Settings />} />
                <Route path="employees" element={<Employees />} />
                <Route path="attendance-admin" element={<AttendanceAdmin />} />
                <Route path="leaves" element={<Leaves />} />
                <Route path="departments" element={<Departments />} />
                <Route path="reports" element={<Reports />} />
              </Route>
            </Routes>
          </HashRouter>
        </ToastProvider>
      </DataProvider>
    </ConfigProvider>
  );
};

export default App;

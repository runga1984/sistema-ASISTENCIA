import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useConfig } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { 
  LayoutDashboard, 
  Users, 
  Clock, 
  FileText, 
  Settings, 
  LogOut,
  Building2,
  CalendarCheck
} from 'lucide-react';

const Sidebar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { config, toggleSidebar } = useConfig();
  const { isSidebarCollapsed, logo } = config;
  const { notify } = useToast();

  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: Clock, label: 'Control Asistencia', path: '/attendance-admin' },
    { icon: Users, label: 'Empleados', path: '/employees' },
    { icon: CalendarCheck, label: 'Permisos y Vacaciones', path: '/leaves' },
    { icon: Building2, label: 'Departamentos', path: '/departments' },
    { icon: FileText, label: 'Reportes', path: '/reports' },
    { icon: Settings, label: 'Configuración', path: '/settings' },
  ];

  const isActive = (path: string) => location.pathname === path;

  const handleNavigation = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    e.preventDefault();
    navigate(path);
  };

  const handleLogout = () => {
    notify("Cerrando sesión... Redirigiendo a Kiosco.", "info");
    // Redirigir al modo kiosco en lugar de recargar para evitar pantalla blanca
    setTimeout(() => {
        navigate('/kiosk');
    }, 1000);
  };

  return (
    <aside 
      className={`flex flex-col h-screen fixed left-0 top-0 overflow-y-auto transition-all duration-500 z-50 
        bg-white dark:bg-slate-900 border-r border-gray-200 dark:border-slate-800 shadow-xl
        ${isSidebarCollapsed ? 'w-0 md:w-24 -left-full md:left-0' : 'w-72 left-0'}
      `}
    >
      {/* Header del Sidebar con Logo Aumentado */}
      <div className={`h-24 flex items-center border-b border-gray-100 dark:border-slate-800 relative transition-all ${isSidebarCollapsed ? 'justify-center' : 'px-6 gap-4'}`}>
        {logo ? (
          <img 
            src={logo} 
            alt="Logo" 
            className={`transition-all duration-500 object-contain ${isSidebarCollapsed ? 'h-12 w-12' : 'h-20 w-auto'}`} 
          />
        ) : (
          <div className="h-12 w-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30">
            ZE
          </div>
        )}
        
        {!isSidebarCollapsed && (
            <div className="animate-in fade-in slide-in-from-left-4 duration-500 overflow-hidden">
                <h2 className="text-xl font-black tracking-tighter text-blue-700 dark:text-blue-500 leading-none">SIGE-ZEA</h2>
                <p className="text-[10px] text-gray-500 dark:text-gray-400 uppercase font-black tracking-[0.2em] mt-1">SISTEMA RH</p>
            </div>
        )}
      </div>

      {/* Navegación con Espaciado Mejorado */}
      <nav className="flex-1 py-8 px-4 space-y-2">
        {menuItems.map((item) => (
          <a
            key={item.path}
            href={`#${item.path}`}
            onClick={(e) => handleNavigation(e, item.path)}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'px-5 space-x-4'} py-3.5 rounded-2xl transition-all duration-300 group relative
              ${isActive(item.path) 
                ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/30 font-bold scale-[1.02]' 
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
          >
            <item.icon size={22} className={`shrink-0 transition-all ${isActive(item.path) ? 'text-white' : 'text-slate-400 group-hover:text-blue-600 group-hover:scale-110'}`} />
            
            {!isSidebarCollapsed && (
                <span className="font-bold text-sm whitespace-nowrap animate-in fade-in duration-300">
                    {item.label}
                </span>
            )}
            
            {isSidebarCollapsed && (
                <div className="absolute left-full top-1/2 -translate-y-1/2 ml-4 px-3 py-1.5 bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none transition-all z-50 whitespace-nowrap shadow-xl">
                    {item.label}
                </div>
            )}
          </a>
        ))}
      </nav>

      {/* Footer con Accesos Especiales */}
      <div className="p-4 border-t border-gray-100 dark:border-slate-800 space-y-2">
        <a href="#/kiosk" 
            onClick={(e) => handleNavigation(e, '/kiosk')}
            className={`flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'px-5 space-x-4'} py-4 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white transition-all group relative active:scale-95`}>
          <Clock size={20} className="shrink-0 transition-transform group-hover:rotate-12" />
          {!isSidebarCollapsed && (
              <div className="flex flex-col overflow-hidden animate-in fade-in duration-300">
                <span className="font-black text-[11px] uppercase tracking-wider">Modo Kiosco</span>
                <span className="text-[9px] opacity-70 font-bold uppercase tracking-tighter">Terminal Público</span>
              </div>
          )}
        </a>

        <button 
          onClick={handleLogout}
          className={`w-full flex items-center ${isSidebarCollapsed ? 'justify-center px-2' : 'px-5 space-x-4'} py-3.5 rounded-2xl text-slate-400 hover:bg-rose-500/10 hover:text-rose-500 transition-all group relative active:scale-95`}
        >
          <LogOut size={20} className="shrink-0 group-hover:-translate-x-1 transition-transform" />
          {!isSidebarCollapsed && (
              <span className="font-bold text-sm whitespace-nowrap">
                  Cerrar Sesión
              </span>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
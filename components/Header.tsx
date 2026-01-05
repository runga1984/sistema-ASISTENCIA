import React from 'react';
import { useConfig } from '../context/ConfigContext';
import { Bell, UserCircle, Menu, Moon, Sun, X } from 'lucide-react';

const Header = () => {
  const { config, toggleTheme, toggleSidebar } = useConfig();
  const { isSidebarCollapsed, theme } = config;

  return (
    <header 
      className={`h-20 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-6 fixed top-0 right-0 z-40 transition-all duration-500 ${
        isSidebarCollapsed ? 'left-0 md:left-24' : 'left-0 md:left-72'
      }`}
    >
      <div className="flex items-center space-x-4">
        <button 
          onClick={toggleSidebar}
          className="p-3 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 transition-all active:scale-90"
          title={isSidebarCollapsed ? "Expandir menú" : "Contraer menú"}
        >
          <Menu size={24} />
        </button>

        <div className="flex items-center gap-4 pl-2">
          {config.logo && (
            <img 
              src={config.logo} 
              alt="Logo" 
              className="h-10 md:h-12 w-auto object-contain drop-shadow-sm"
            />
          )}
          <div className="border-l border-gray-200 dark:border-slate-700 pl-4 hidden sm:block">
            <h1 className="text-sm font-black text-slate-900 dark:text-white leading-tight uppercase tracking-tight">
              {config.institutionName}
            </h1>
            <div className="flex items-center gap-1.5 mt-0.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">Servidor Activo</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center space-x-2 md:space-x-4">
        <button 
          onClick={toggleTheme}
          className="p-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all"
        >
          {theme === 'dark' ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} />}
        </button>

        <button className="relative p-3 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-all group">
          <Bell size={20} className="group-hover:rotate-12 transition-transform" />
          <span className="absolute top-3 right-3 w-2 h-2 bg-rose-500 rounded-full border-2 border-white dark:border-slate-900"></span>
        </button>

        <div className="h-10 w-px bg-slate-100 dark:bg-slate-800 mx-2 hidden md:block"></div>

        <div className="flex items-center space-x-3 pl-2">
          <div className="text-right hidden lg:block">
            <p className="text-xs font-black text-slate-900 dark:text-gray-200 uppercase tracking-widest leading-none">Admin General</p>
            <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-tighter mt-1">Nivel 1 • Conectado</p>
          </div>
          <div className="h-11 w-11 bg-blue-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 active:scale-95 cursor-pointer overflow-hidden border-2 border-white dark:border-slate-800">
             <UserCircle size={28} />
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
import React, { createContext, useContext, useState, useEffect } from 'react';
import { GlobalConfig } from '../types';
import { DEFAULT_LOGO } from '../constants';

interface ConfigContextType {
  config: GlobalConfig;
  updateConfig: (newConfig: Partial<GlobalConfig>) => void;
  resetConfig: () => void;
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

const DEFAULT_STATE: GlobalConfig = {
  institutionName: 'Zona Educativa Anzoátegui',
  logo: DEFAULT_LOGO,
  entryTimeLimit: '08:00',
  adminPin: '1234',
  theme: 'light',
  isSidebarCollapsed: false,
  holidays: []
};

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [config, setConfig] = useState<GlobalConfig>(() => {
    try {
      const saved = localStorage.getItem('zea_config_final');
      if (saved) {
        const parsed = JSON.parse(saved);
        // Asegurar que el logo persista si existe
        return { ...DEFAULT_STATE, ...parsed };
      }
      return DEFAULT_STATE;
    } catch (e) {
      return DEFAULT_STATE;
    }
  });

  useEffect(() => {
    localStorage.setItem('zea_config_final', JSON.stringify(config));
    const root = document.documentElement;
    if (config.theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [config]);

  const updateConfig = (newConfig: Partial<GlobalConfig>) => {
    setConfig(prev => ({ ...prev, ...newConfig }));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_STATE);
    localStorage.removeItem('zea_config_final');
  };

  const toggleTheme = () => {
    setConfig(prev => ({ ...prev, theme: prev.theme === 'light' ? 'dark' : 'light' }));
  };

  const toggleSidebar = () => {
    setConfig(prev => ({ ...prev, isSidebarCollapsed: !prev.isSidebarCollapsed }));
  };

  return (
    <ConfigContext.Provider value={{ config, updateConfig, resetConfig, toggleTheme, toggleSidebar }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used within ConfigProvider');
  return context;
};

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle, XCircle } from 'lucide-react';

type ToastType = 'success' | 'error' | 'info' | 'warning';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  notify: (message: string, type?: ToastType) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, message, type }]);

    // Auto remove after 3 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ notify }}>
      {children}
      <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg border animate-in slide-in-from-right duration-300 ${
              toast.type === 'success' ? 'bg-white dark:bg-slate-800 border-l-4 border-l-emerald-500 text-gray-800 dark:text-white' :
              toast.type === 'error' ? 'bg-white dark:bg-slate-800 border-l-4 border-l-red-500 text-gray-800 dark:text-white' :
              toast.type === 'warning' ? 'bg-white dark:bg-slate-800 border-l-4 border-l-orange-500 text-gray-800 dark:text-white' :
              'bg-white dark:bg-slate-800 border-l-4 border-l-blue-500 text-gray-800 dark:text-white'
            }`}
          >
            <div className="shrink-0">
               {toast.type === 'success' && <CheckCircle size={20} className="text-emerald-500" />}
               {toast.type === 'error' && <XCircle size={20} className="text-red-500" />}
               {toast.type === 'warning' && <AlertTriangle size={20} className="text-orange-500" />}
               {toast.type === 'info' && <Info size={20} className="text-blue-500" />}
            </div>
            <p className="text-sm font-medium pr-4">{toast.message}</p>
            <button 
              onClick={() => removeToast(toast.id)} 
              className="ml-auto text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};

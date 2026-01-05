import React, { useRef } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { 
  Upload, RotateCcw, Palette, Globe, ShieldCheck, 
  RefreshCcw, Camera, Building, Clock
} from 'lucide-react';
import { DEFAULT_LOGO } from '../constants';

const Settings = () => {
  const { config, updateConfig, resetConfig } = useConfig();
  const { notify } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validación de tamaño (2MB máximo para asegurar persistencia localStorage)
      if (file.size > 1024 * 1024 * 2) { 
        notify("La imagen es muy pesada. Use una menor a 2MB", "error");
        // Limpiar input incluso si falla para permitir intentar con otro archivo
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        updateConfig({ logo: reader.result as string });
        notify("Identidad institucional actualizada correctamente", "success");
      };
      reader.readAsDataURL(file);
    }
    
    // Resetear el input para permitir subir la misma imagen si se borra y se quiere poner de nuevo
    // O permitir seleccionar una imagen distinta inmediatamente sin recargar
    if (fileInputRef.current) {
        fileInputRef.current.value = '';
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header Tricolor */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 flex">
            <div className="h-full w-1/3 bg-yellow-400"></div>
            <div className="h-full w-1/3 bg-blue-600"></div>
            <div className="h-full w-1/3 bg-red-600"></div>
        </div>
        <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <h2 className="text-4xl font-black text-slate-950 dark:text-white tracking-tight">Configuración</h2>
              <p className="text-slate-600 dark:text-slate-300 font-bold mt-2 text-sm">Personaliza la identidad y los parámetros globales del sistema.</p>
            </div>
            <button 
              onClick={() => { resetConfig(); notify("Ajustes de fábrica aplicados", "info"); }}
              className="flex items-center gap-2 text-xs font-black text-rose-600 uppercase tracking-widest hover:bg-rose-50 dark:hover:bg-rose-900/20 px-5 py-3 rounded-xl transition-all border border-transparent hover:border-rose-100"
            >
              <RefreshCcw size={16} /> Restablecer Fábrica
            </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="space-y-8">
          <section className="bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm text-center space-y-6 h-full">
            <h3 className="text-lg font-black flex items-center justify-center gap-2 text-slate-950 dark:text-white">
              <Palette className="text-blue-700" size={24} /> Identidad Visual
            </h3>
            
            <div className="relative group mx-auto w-48 h-48 cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              <div className="w-full h-full bg-slate-50 dark:bg-slate-800 rounded-3xl border-2 border-dashed border-slate-300 dark:border-slate-700 flex items-center justify-center overflow-hidden transition-all group-hover:border-blue-500 group-hover:bg-blue-50/50 dark:group-hover:bg-blue-900/10 relative z-0">
                {config.logo ? (
                  <img src={config.logo} className="w-full h-full object-contain p-4" alt="Logo preview" />
                ) : (
                  <Building size={48} className="text-slate-300" />
                )}
              </div>
              <div 
                className="absolute inset-0 bg-blue-900/80 opacity-0 group-hover:opacity-100 transition-all rounded-3xl flex flex-col items-center justify-center text-white font-black gap-2 text-xs uppercase tracking-widest backdrop-blur-sm z-10"
              >
                <Camera size={28} />
                <span>Cambiar Logo</span>
              </div>
            </div>
            
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleLogoUpload} 
              accept="image/*" 
              className="hidden" 
            />

            <div className="space-y-3 pt-2">
              <button 
                onClick={() => fileInputRef.current?.click()}
                className="w-full bg-blue-700 hover:bg-blue-600 text-white py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-blue-600/20 transition-all active:scale-95"
              >
                <Upload className="inline mr-2" size={16}/> Subir Nueva Imagen
              </button>
              <button 
                onClick={() => updateConfig({ logo: DEFAULT_LOGO })}
                className="w-full flex items-center justify-center gap-2 py-3 text-slate-600 dark:text-slate-400 text-xs font-bold uppercase hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
              >
                <RotateCcw size={14} /> Restaurar Original
              </button>
            </div>
          </section>
        </div>

        <div className="lg:col-span-2 space-y-8">
          <section className="bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm space-y-8 h-full relative overflow-hidden">
             {/* Decor */}
             <div className="absolute top-0 right-0 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl -mr-32 -mt-32"></div>

            <h3 className="text-xl font-black flex items-center gap-3 text-slate-950 dark:text-white relative z-10">
              <Globe className="text-blue-700" size={24} /> Parámetros Administrativos
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-1">Nombre de la Institución</label>
                <input 
                  type="text"
                  value={config.institutionName}
                  onChange={e => updateConfig({ institutionName: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500 rounded-2xl font-bold text-slate-800 dark:text-white outline-none transition-all placeholder:text-slate-300"
                />
              </div>

              <div className="space-y-3">
                <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                   <Clock size={14} /> Límite Entrada (Retardo)
                </label>
                <input 
                  type="time"
                  value={config.entryTimeLimit}
                  onChange={e => updateConfig({ entryTimeLimit: e.target.value })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-yellow-400 rounded-2xl font-bold text-slate-800 dark:text-white outline-none transition-all"
                />
              </div>

              <div className="space-y-3">
                 <label className="text-[11px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest px-1 flex items-center gap-2">
                   <ShieldCheck size={14} /> PIN Administrativo
                </label>
                <input 
                  type="password"
                  value={config.adminPin}
                  maxLength={4}
                  onChange={e => updateConfig({ adminPin: e.target.value.replace(/\D/g, '') })}
                  className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-red-500 rounded-2xl font-bold text-slate-800 dark:text-white outline-none transition-all tracking-[0.5em] text-center"
                />
                <p className="text-[10px] text-slate-400 px-2">PIN de 4 dígitos para salir del modo kiosco.</p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Settings;
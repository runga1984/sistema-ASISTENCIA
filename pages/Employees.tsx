import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Plus, Search, Edit2, Trash2, X, Save, Filter, Hash, Mail, Building, Phone, Calendar, Clock, Gift, Award } from 'lucide-react';
import { Employee } from '../types';
import { useToast } from '../context/ToastContext';

const Employees = () => {
  const { employees, setEmployees, departments } = useData();
  const { notify } = useToast();
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState<Partial<Employee>>({});

  const handleOpenModal = (emp?: Employee) => {
    if (emp) {
      setEditingId(emp.id);
      setFormData(emp);
    } else {
      setEditingId(null);
      setFormData({
        role: 'Administrativo', status: 'Activo',
        department: departments.length > 0 ? departments[0].name : '',
        hireDate: new Date().toISOString().split('T')[0],
        email: '',
        phone: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.cedula || !formData.firstName) {
      notify("Cédula y Nombres son requeridos", "error");
      return;
    }

    if (editingId) {
      setEmployees(prev => prev.map(e => e.id === editingId ? { ...e, ...formData } as Employee : e));
      notify("Registro actualizado", "success");
    } else {
      setEmployees(prev => [...prev, { ...formData as Employee, id: `emp-${Date.now()}` }]);
      notify("Empleado registrado", "success");
    }
    setIsModalOpen(false);
  };

  // Helper: Calcular años de servicio
  const getYearsOfService = (dateString?: string) => {
      if (!dateString) return 0;
      const start = new Date(dateString);
      const now = new Date();
      let years = now.getFullYear() - start.getFullYear();
      const m = now.getMonth() - start.getMonth();
      if (m < 0 || (m === 0 && now.getDate() < start.getDate())) {
          years--;
      }
      return years;
  };

  // Helper: Detectar si es aniversario (mismo día y mes)
  const isAnniversary = (dateString?: string) => {
      if (!dateString) return false;
      // Usar split para evitar problemas de zona horaria al crear la fecha
      const [year, month, day] = dateString.split('-').map(Number);
      const now = new Date();
      return now.getMonth() + 1 === month && now.getDate() === day;
  };

  const filtered = employees.filter(e => 
    (e.firstName + ' ' + e.lastName).toLowerCase().includes(searchTerm.toLowerCase()) || 
    e.cedula.includes(searchTerm)
  );

  return (
    <div className="p-4 md:p-8 space-y-8 animate-in slide-in-from-bottom-4 duration-500">
      
      {/* Header Tricolor */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 flex">
            <div className="h-full w-1/3 bg-yellow-400"></div>
            <div className="h-full w-1/3 bg-blue-600"></div>
            <div className="h-full w-1/3 bg-red-600"></div>
        </div>
        <div className="p-8 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white tracking-tight">Gestión de Personal</h2>
              <p className="text-slate-600 dark:text-slate-300 font-bold mt-2 text-sm">Administración y registro de colaboradores activos.</p>
            </div>
            <button 
                onClick={() => handleOpenModal()} 
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-2xl font-black flex items-center gap-2 shadow-xl shadow-blue-600/20 transition-all active:scale-95"
            >
              <Plus size={20} /> Nuevo Ingreso
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center gap-4 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" placeholder="Buscar por cédula o nombre..." value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none transition-all placeholder:text-slate-400 shadow-sm"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto text-xs font-black text-slate-500 uppercase tracking-widest bg-white dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 shadow-sm">
            <Filter size={16} /> {filtered.length} Registros
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="text-[11px] font-black uppercase text-slate-500 tracking-[0.1em] bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                <th className="px-8 py-6">Colaborador</th>
                <th className="px-8 py-6">Identificación</th>
                <th className="px-8 py-6">Departamento</th>
                <th className="px-8 py-6">Antigüedad</th>
                <th className="px-8 py-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map(emp => {
                const years = getYearsOfService(emp.hireDate);
                const isAnniversaryToday = isAnniversary(emp.hireDate);
                
                return (
                <tr key={emp.id} className={`group transition-colors ${isAnniversaryToday ? 'bg-yellow-50/50 dark:bg-yellow-900/10' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black shadow-sm group-hover:scale-110 transition-transform relative ${isAnniversaryToday ? 'bg-yellow-100 text-yellow-600' : 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400'}`}>
                        {isAnniversaryToday && (
                             <div className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md animate-bounce">
                                <Gift size={12} />
                             </div>
                        )}
                        {emp.firstName[0]}{emp.lastName[0]}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 dark:text-white leading-tight text-base flex items-center gap-2">
                            {emp.firstName} {emp.lastName}
                        </p>
                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">{emp.role}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-5 text-sm font-mono font-bold text-slate-600 dark:text-slate-300">{emp.cedula}</td>
                  <td className="px-8 py-5">
                    <span className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg text-xs font-bold uppercase tracking-wider border border-slate-200 dark:border-slate-700">
                      {emp.department}
                    </span>
                  </td>
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-2">
                        <div className={`px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider border flex items-center gap-2 ${isAnniversaryToday ? 'bg-yellow-400 text-yellow-900 border-yellow-500 shadow-lg shadow-yellow-400/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'}`}>
                            {isAnniversaryToday ? <Gift size={14} /> : <Award size={14} className="text-slate-400" />}
                            {years} {years === 1 ? 'Año' : 'Años'}
                        </div>
                        {isAnniversaryToday && <span className="text-[10px] font-black text-yellow-600 dark:text-yellow-400 uppercase tracking-widest animate-pulse">¡Aniversario!</span>}
                    </div>
                  </td>
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                        <button 
                            onClick={() => handleOpenModal(emp)} 
                            className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-sm active:scale-95"
                            title="Editar Empleado"
                        >
                        <Edit2 size={18} />
                        </button>
                        <button 
                            onClick={() => setEmployees(prev => prev.filter(e => e.id !== emp.id))} 
                            className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white transition-all shadow-sm active:scale-95"
                            title="Eliminar Empleado"
                        >
                        <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              )})}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-2xl border border-white/20 dark:border-slate-700 overflow-hidden ring-1 ring-black/5">
            <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{editingId ? 'Editar Perfil' : 'Nuevo Registro'}</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 grid grid-cols-1 md:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto bg-white dark:bg-slate-900">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Cédula de Identidad</label>
                <div className="relative group">
                  <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                  <input required value={formData.cedula || ''} onChange={e => setFormData({...formData, cedula: e.target.value})} className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Nombres</label>
                <input required value={formData.firstName || ''} onChange={e => setFormData({...formData, firstName: e.target.value})} className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Apellidos</label>
                <input required value={formData.lastName || ''} onChange={e => setFormData({...formData, lastName: e.target.value})} className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" />
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Departamento</label>
                <div className="relative">
                    <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                    <select value={formData.department || ''} onChange={e => setFormData({...formData, department: e.target.value})} className="w-full pl-12 pr-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm appearance-none">
                    {departments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
                    </select>
                </div>
              </div>

              {/* Nuevos Campos: Email y Teléfono */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Correo Electrónico</label>
                <div className="relative group">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="nombre@correo.com" className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Teléfono</label>
                <div className="relative group">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input type="tel" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} placeholder="04XX-XXXXXXX" className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm" />
                </div>
              </div>

              {/* Nuevo Campo: Fecha de Ingreso */}
              <div className="space-y-2 col-span-1 md:col-span-2">
                <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Fecha de Ingreso</label>
                <div className="relative group">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={16} />
                    <input 
                        type="date" 
                        required 
                        value={formData.hireDate || ''} 
                        onChange={e => setFormData({...formData, hireDate: e.target.value})} 
                        className="w-full pl-12 pr-4 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]" 
                    />
                </div>
              </div>

              <div className="md:col-span-2 pt-6 flex justify-end gap-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-8 py-4 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-50 dark:hover:bg-slate-800 rounded-2xl transition-all">Cancelar</button>
                <button type="submit" className="bg-blue-600 text-white px-10 py-4 rounded-2xl font-black shadow-xl shadow-blue-600/20 flex items-center gap-2 hover:bg-blue-700 transition-all active:scale-95">
                  <Save size={20} /> Guardar Registro
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Employees;
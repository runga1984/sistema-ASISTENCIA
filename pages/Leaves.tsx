import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, CheckCircle2, XCircle, Clock, Plus, Save, X, FileText, AlertCircle, Info, Filter, User } from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';

const Leaves = () => {
  const { config } = useConfig();
  const { notify } = useToast();
  const { leaves, setLeaves, employees, departments } = useData();
  const [activeTab, setActiveTab] = useState<'pending' | 'history'>('pending');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedDeptFilter, setSelectedDeptFilter] = useState(''); // Estado para filtrar por departamento en el modal
  
  const [formData, setFormData] = useState({
    employee: '',
    type: 'Vacaciones',
    startDate: '',
    endDate: '',
    days: 0
  });

  // Calculate Business Days excluding weekends and holidays
  const calculateBusinessDays = useCallback((startStr: string, endStr: string) => {
    if (!startStr || !endStr) return 0;
    
    const start = new Date(startStr);
    const end = new Date(endStr);
    
    if (end < start) return 0;

    let count = 0;
    const curDate = new Date(start);

    // Normalize holidays to comparable strings
    const holidayStrings = (config.holidays || []).map(h => h.date);

    while (curDate <= end) {
      const dayOfWeek = curDate.getUTCDay(); // 0 = Sunday, 6 = Saturday
      const dateString = curDate.toISOString().split('T')[0];

      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = holidayStrings.includes(dateString);

      if (!isWeekend && !isHoliday) {
        count++;
      }
      
      curDate.setDate(curDate.getDate() + 1);
    }
    return count;
  }, [config.holidays]);

  // Auto-calculate days when dates change
  useEffect(() => {
    if (formData.startDate && formData.endDate) {
       const businessDays = calculateBusinessDays(formData.startDate, formData.endDate);
       setFormData(prev => ({ ...prev, days: businessDays }));
    }
  }, [formData.startDate, formData.endDate, calculateBusinessDays]);

  // Filter Logic based on Tab
  const filteredLeaves = leaves.filter(leave => {
      if (activeTab === 'pending') return leave.status === 'Pendiente';
      return leave.status !== 'Pendiente'; // History shows Approved/Rejected
  });

  // Filter employees based on selected department in modal
  const filteredEmployees = selectedDeptFilter 
    ? employees.filter(e => e.department === selectedDeptFilter)
    : employees;

  // Handlers
  const handleOpenModal = () => {
      setFormData({ employee: '', type: 'Vacaciones', startDate: '', endDate: '', days: 0 });
      setSelectedDeptFilter('');
      setIsModalOpen(true);
  };

  const handleStatusChange = (id: number, newStatus: string) => {
      setLeaves(prev => prev.map(leave => 
          String(leave.id) === String(id) ? { ...leave, status: newStatus } : leave
      ));
      notify(`Solicitud marcada como ${newStatus}`, 'success');
  };

  const handleSave = (e: React.FormEvent) => {
      e.preventDefault();
      if (!formData.employee || !formData.startDate || !formData.endDate) {
          notify("Complete todos los campos requeridos", "error");
          return;
      }

      if (formData.days <= 0) {
          notify("El rango de fechas no contiene días hábiles", "error");
          return;
      }

      const newLeave = {
          id: Date.now(),
          ...formData,
          status: 'Aprobado', // Por defecto aprobado al ser creado por admin
          requestDate: new Date().toISOString().split('T')[0]
      };

      setLeaves(prev => [newLeave, ...prev]);
      setIsModalOpen(false);
      setActiveTab('history'); // Cambiar a historial para ver el registro aprobado
      notify("Solicitud registrada y aprobada correctamente", "success");
  };

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-64px)] overflow-y-auto">
      
      {/* Header Tricolor */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-2 flex">
            <div className="h-full w-1/3 bg-yellow-400"></div>
            <div className="h-full w-1/3 bg-blue-600"></div>
            <div className="h-full w-1/3 bg-red-600"></div>
        </div>
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">Gestión de Ausencias</h2>
              <p className="text-slate-600 dark:text-slate-300 font-bold mt-2 text-sm">Control de vacaciones, reposos y permisos especiales.</p>
            </div>
            <button 
                onClick={handleOpenModal}
                className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-600/20 text-sm font-black uppercase tracking-wider transition-all active:scale-95"
            >
                <Plus size={18} /> Nueva Solicitud
            </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex space-x-2 bg-white dark:bg-slate-900 p-2 rounded-2xl w-fit mb-8 border border-slate-200 dark:border-slate-800 shadow-sm">
          <button 
            onClick={() => setActiveTab('pending')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'pending' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
          >
            Pendientes
            <span className={`ml-2 px-1.5 py-0.5 text-[10px] rounded-full ${activeTab === 'pending' ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'}`}>
                {leaves.filter(l => l.status === 'Pendiente').length}
            </span>
          </button>
          <button 
            onClick={() => setActiveTab('history')}
            className={`px-6 py-3 rounded-xl text-xs font-black uppercase tracking-wider transition-all ${activeTab === 'history' ? 'bg-blue-600 text-white shadow-md' : 'text-slate-500 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800'}`}
          >
            Historial Procesado
          </button>
      </div>

      <div className="grid gap-4">
        {filteredLeaves.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl mb-4 shadow-sm border border-slate-100 dark:border-slate-700">
                    <FileText className="h-10 w-10 text-slate-300" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Sin registros</h3>
                <p className="text-slate-500 dark:text-slate-400 text-sm font-medium text-center max-w-sm">
                    {activeTab === 'pending' 
                        ? 'No hay solicitudes pendientes por aprobar.' 
                        : 'Aún no hay historial de solicitudes procesadas.'}
                </p>
            </div>
        ) : (
            filteredLeaves.map((leave) => (
            <div key={leave.id} className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-blue-300 dark:hover:border-blue-700 transition-colors animate-in fade-in slide-in-from-bottom-2 duration-300 group">
                <div className="flex items-start gap-5">
                    <div className={`p-4 rounded-2xl shrink-0 shadow-inner ${
                        leave.type === 'Vacaciones' ? 'bg-purple-50 text-purple-600 dark:bg-purple-900/20 dark:text-purple-400' : 
                        leave.type === 'Reposo Médico' ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400' :
                        'bg-blue-50 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400'
                    }`}>
                        <Calendar size={28} />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 dark:text-white text-xl tracking-tight">{leave.employee}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600 dark:text-slate-400 mt-1">
                            <span className="font-bold">{leave.type}</span>
                            <span className="hidden sm:inline w-1 h-1 bg-slate-300 rounded-full"></span>
                            <span className="bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">{leave.days} días hábiles</span>
                        </div>
                        <div className="mt-3 text-xs font-bold text-slate-400 flex items-center gap-1.5">
                            <Clock size={14} /> Solicitado el {leave.requestDate}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col md:items-end gap-4 min-w-[200px]">
                    <div className="text-sm font-bold text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800 px-4 py-2 rounded-xl border border-slate-100 dark:border-slate-700 flex items-center gap-3 justify-center md:justify-end w-full md:w-auto">
                        <span className="text-xs text-slate-400 uppercase tracking-wider">Período:</span>
                        <span>{leave.startDate}</span>
                        <span className="text-slate-300 dark:text-slate-600">→</span>
                        <span>{leave.endDate}</span>
                    </div>
                    
                    {leave.status === 'Pendiente' ? (
                        <div className="flex gap-3 w-full md:w-auto">
                            <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(leave.id, 'Aprobado');
                                }}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white border border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800 dark:hover:bg-emerald-600 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all"
                                title="Aprobar Solicitud"
                            >
                                <CheckCircle2 size={16} /> <span className="md:hidden lg:inline">Aprobar</span>
                            </button>
                            <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleStatusChange(leave.id, 'Rechazado');
                                }}
                                className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2.5 bg-rose-50 text-rose-600 hover:bg-rose-600 hover:text-white border border-rose-100 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800 dark:hover:bg-rose-600 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm active:scale-95 transition-all"
                                title="Rechazar Solicitud"
                            >
                                <XCircle size={16} /> <span className="md:hidden lg:inline">Rechazar</span>
                            </button>
                        </div>
                    ) : (
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider border ${
                            leave.status === 'Aprobado' 
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/30' 
                                : 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-900/30'
                        }`}>
                            {leave.status === 'Aprobado' ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                            {leave.status}
                        </div>
                    )}
                </div>
            </div>
            ))
        )}
      </div>

      {/* Modal Nueva Solicitud */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-lg border border-white/20 dark:border-slate-700 overflow-hidden ring-1 ring-black/5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white">Registrar Solicitud</h3>
              <button 
                onClick={() => setIsModalOpen(false)} 
                className="p-2 rounded-full text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6 bg-white dark:bg-slate-900">
               
               {/* Sección de Selección de Empleado Mejorada */}
               <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <Filter size={12} /> Filtrar Departamento
                     </label>
                     <select 
                       value={selectedDeptFilter}
                       onChange={e => {
                         setSelectedDeptFilter(e.target.value);
                         setFormData(prev => ({ ...prev, employee: '' })); // Resetear empleado al cambiar departamento
                       }}
                       className="w-full px-5 py-3 bg-white dark:bg-slate-800 rounded-xl outline-none font-bold text-slate-900 dark:text-white border-2 border-slate-100 dark:border-slate-700 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all text-sm appearance-none shadow-sm"
                     >
                        <option value="">-- Todos los departamentos --</option>
                        {departments.map(d => (
                           <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                     </select>
                  </div>

                  <div className="space-y-2">
                     <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest flex items-center gap-2 ml-1">
                        <User size={12} /> Empleado
                     </label>
                     <select 
                       required
                       value={formData.employee}
                       onChange={e => setFormData({...formData, employee: e.target.value})}
                       className="w-full px-5 py-4 bg-white dark:bg-slate-800 rounded-xl outline-none font-bold text-slate-900 dark:text-white border-2 border-transparent focus:border-blue-500/20 transition-all shadow-sm ring-2 ring-blue-500/10 dark:ring-0"
                     >
                        <option value="">-- Seleccionar Empleado --</option>
                        {filteredEmployees.map(emp => (
                           <option key={emp.id} value={`${emp.firstName} ${emp.lastName}`}>
                              {emp.firstName} {emp.lastName} ({emp.cedula})
                           </option>
                        ))}
                     </select>
                  </div>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Tipo de Permiso</label>
                  <select 
                    value={formData.type}
                    onChange={e => setFormData({...formData, type: e.target.value})}
                    className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm appearance-none"
                  >
                     <option value="Vacaciones">Vacaciones</option>
                     <option value="Permiso Personal">Permiso Personal</option>
                     <option value="Reposo Médico">Reposo Médico</option>
                     <option value="Permiso Remunerado">Permiso Remunerado</option>
                  </select>
               </div>

               <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Desde</label>
                      <input 
                        type="date" 
                        required
                        value={formData.startDate}
                        onChange={e => setFormData({...formData, startDate: e.target.value})}
                        className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Hasta</label>
                      <input 
                        type="date" 
                        required
                        value={formData.endDate}
                        onChange={e => setFormData({...formData, endDate: e.target.value})}
                        className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm [color-scheme:light] dark:[color-scheme:dark]"
                      />
                   </div>
               </div>

               <div className="bg-slate-50 dark:bg-slate-800 p-6 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <div className="flex justify-between items-center mb-2">
                      <label className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest">Días Hábiles Calculados</label>
                      <Info size={14} className="text-slate-400" />
                  </div>
                  <div className="text-3xl font-black text-blue-600 dark:text-blue-400">
                      {formData.days}
                  </div>
                  <p className="text-xs font-bold text-slate-400 mt-1">
                      Excluyendo fines de semana y feriados.
                  </p>
               </div>

               <div className="pt-6 flex justify-end gap-4 border-t border-slate-100 dark:border-slate-800 mt-2">
                   <button 
                     type="button" 
                     onClick={() => setIsModalOpen(false)}
                     className="px-6 py-3 text-slate-600 dark:text-slate-400 font-bold hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-colors"
                   >
                       Cancelar
                   </button>
                   <button 
                     type="submit" 
                     className="flex items-center gap-2 px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black shadow-xl shadow-blue-600/20 text-xs uppercase tracking-wider transition-all active:scale-95"
                   >
                       <Save size={18} /> Guardar
                   </button>
               </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Leaves;
import React, { useState } from 'react';
import { useData } from '../context/DataContext';
import { Building2, Users, Plus, X, Save, Trash2, Edit2, MapPin, UserCircle, Search, AlertTriangle } from 'lucide-react';
import { Department } from '../types';
import { useToast } from '../context/ToastContext';

const Departments = () => {
  const { departments, setDepartments, employees, setEmployees } = useData();
  const { notify } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Estado para el modal de confirmación de eliminación
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string | null; name: string }>({
    isOpen: false,
    id: null,
    name: ''
  });
  
  const [formData, setFormData] = useState({
    name: '',
    category: 'Administrativo' as Department['category'], 
    location: '',
    managerId: ''
  });

  const filteredDepartments = departments.filter(dept => 
    dept.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAddModal = () => {
    setFormData({ name: '', category: 'Administrativo', location: '', managerId: '' });
    setEditingId(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (dept: Department) => {
    setFormData({ 
        name: dept.name, 
        category: dept.category,
        location: dept.location || '',
        managerId: dept.managerId || ''
    });
    setEditingId(dept.id);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
        notify('El nombre del departamento es obligatorio', 'error');
        return;
    }

    if (editingId) {
        const oldDept = departments.find(d => d.id === editingId);
        
        setDepartments(prev => prev.map(d => 
            d.id === editingId 
            ? { ...d, ...formData } 
            : d
        ));

        if (oldDept && oldDept.name !== formData.name) {
            setEmployees(prev => prev.map(emp => 
                emp.department === oldDept.name 
                ? { ...emp, department: formData.name } 
                : emp
            ));
            notify(`Departamento actualizado. Empleados migrados a "${formData.name}".`, 'success');
        } else {
            notify('Departamento actualizado exitosamente', 'success');
        }

    } else {
        const newDept: Department = {
            id: `dep-${Date.now()}`,
            ...formData
        };
        setDepartments(prev => [...prev, newDept]);
        notify('Departamento agregado exitosamente', 'success');
    }
    
    setIsModalOpen(false);
  };

  // Paso 1: Intentar eliminar - Abre modal de confirmación
  const requestDelete = (id: string, name: string) => {
      const hasEmployees = employees.some(e => e.department === name);
      if (hasEmployees) {
          notify(`No se puede eliminar "${name}" porque tiene empleados asignados.`, 'error');
          return;
      }
      setDeleteModal({ isOpen: true, id, name });
  };

  // Paso 2: Confirmar eliminación
  const confirmDelete = () => {
      if (deleteModal.id) {
          setDepartments(prev => prev.filter(d => d.id !== deleteModal.id));
          notify(`Departamento "${deleteModal.name}" eliminado`, 'info');
      }
      setDeleteModal({ isOpen: false, id: null, name: '' });
  };

  const getEmployeeCount = (deptName: string) => {
      return employees.filter(e => e.department === deptName).length;
  };

  const getManagerName = (managerId?: string) => {
      if (!managerId) return null;
      const emp = employees.find(e => e.id === managerId);
      return emp ? `${emp.firstName} ${emp.lastName}` : 'No encontrado';
  };

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-64px)] overflow-y-auto">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-2 flex">
            <div className="h-full w-1/3 bg-yellow-400"></div>
            <div className="h-full w-1/3 bg-blue-600"></div>
            <div className="h-full w-1/3 bg-red-600"></div>
        </div>
        <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">Departamentos</h2>
              <p className="text-slate-600 dark:text-slate-300 font-bold mt-2 text-sm">Estructura organizativa y jefaturas de área.</p>
            </div>
            
            <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
                <div className="relative group w-full md:w-64">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                    <input 
                        type="text" 
                        placeholder="Buscar área..." 
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 bg-white dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>

                <button 
                    onClick={handleOpenAddModal}
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 shadow-xl shadow-blue-600/20 text-sm font-black uppercase tracking-wider transition-all whitespace-nowrap active:scale-95"
                >
                    <Plus size={18} /> <span className="hidden sm:inline">Nuevo Dept.</span>
                </button>
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredDepartments.map((dept) => (
            // CAMBIO VISUAL: Fondo blanco limpio con sombra suave para light mode
            <div key={dept.id} className="bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm hover:shadow-xl border border-slate-200 dark:border-slate-700 transition-all group relative animate-in zoom-in duration-300 flex flex-col h-full hover:-translate-y-1">
                
                {/* Botones de acción mejorados visualmente (Light Mode Friendly) */}
                <div className="absolute top-6 right-6 flex gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity z-10">
                    <button 
                        onClick={() => handleOpenEditModal(dept)}
                        className="p-2.5 rounded-xl bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white dark:bg-slate-800 dark:text-blue-400 dark:hover:bg-blue-600 dark:hover:text-white transition-all shadow-sm active:scale-95"
                        title="Editar"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button 
                        onClick={() => requestDelete(dept.id, dept.name)}
                        className="p-2.5 rounded-xl bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white dark:bg-slate-800 dark:text-rose-400 dark:hover:bg-rose-500 dark:hover:text-white transition-all shadow-sm active:scale-95"
                        title="Eliminar"
                    >
                        <Trash2 size={16} />
                    </button>
                </div>
                
                <div className="flex items-start justify-between mb-6">
                     <div className="w-16 h-16 rounded-3xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-sm border border-slate-100 dark:border-slate-700">
                        <Building2 size={32} />
                    </div>
                </div>
                
                <div className="mb-6 flex-1">
                    <h3 className="font-black text-slate-900 dark:text-white text-xl leading-tight mb-3 tracking-tight">
                        {dept.name}
                    </h3>
                    <div className="space-y-3">
                        {dept.location && (
                            <div className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-100 dark:border-slate-700 w-fit">
                                <MapPin size={14} className="mr-2 shrink-0 text-slate-400" />
                                <span className="truncate">{dept.location}</span>
                            </div>
                        )}
                        {dept.managerId ? (
                            <div className="flex items-center text-xs font-bold text-slate-600 dark:text-slate-400 pl-1">
                                <UserCircle size={14} className="mr-2 shrink-0 text-purple-500" />
                                <span className="truncate text-purple-700 dark:text-purple-400">{getManagerName(dept.managerId)}</span>
                            </div>
                        ) : (
                            <div className="flex items-center text-xs font-bold text-slate-400 italic pl-1">
                                <UserCircle size={14} className="mr-2 shrink-0" />
                                <span>Sin Supervisor</span>
                            </div>
                        )}
                    </div>
                </div>
                
                <div className="flex items-center justify-between mt-auto pt-5 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest font-mono">
                        {dept.id.split('-')[1]}
                    </span>
                    
                    <div className="flex items-center text-slate-700 dark:text-slate-200 text-xs font-black bg-slate-50 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-100 dark:border-slate-700 shadow-sm">
                        <Users size={14} className="mr-2 text-blue-500" />
                        <span>{getEmployeeCount(dept.name)}</span>
                    </div>
                </div>
            </div>
        ))}

        {filteredDepartments.length === 0 && (
            <div className="col-span-full py-20 text-center text-slate-400 dark:text-slate-500 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-3xl bg-slate-50/50 dark:bg-slate-900/50">
                <p className="font-bold">No se encontraron departamentos.</p>
            </div>
        )}
      </div>

      {/* Modal Agregar/Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white dark:bg-slate-900 rounded-[3rem] shadow-2xl w-full max-w-lg border border-white/20 dark:border-slate-700 overflow-hidden ring-1 ring-black/5" onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between p-8 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                  {editingId ? 'Editar Departamento' : 'Nuevo Departamento'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors p-2 rounded-full"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 space-y-6 bg-white dark:bg-slate-900">
               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Nombre del Departamento</label>
                  <input 
                    type="text" 
                    required
                    value={formData.name}
                    onChange={e => setFormData({...formData, name: e.target.value})}
                    placeholder="Ej: Recursos Humanos"
                    className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                    autoFocus
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Ubicación Física</label>
                  <input 
                    type="text" 
                    value={formData.location}
                    onChange={e => setFormData({...formData, location: e.target.value})}
                    placeholder="Ej: Piso 1, Ala Este"
                    className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-600 dark:text-slate-400 uppercase tracking-widest ml-1">Jefe / Supervisor</label>
                  <div className="relative">
                      <select 
                        value={formData.managerId}
                        onChange={e => setFormData({...formData, managerId: e.target.value})}
                        className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-100 dark:border-slate-700 rounded-2xl outline-none font-bold text-slate-900 dark:text-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm appearance-none"
                      >
                         <option value="">-- Seleccionar Encargado --</option>
                         {employees.map(emp => (
                             <option key={emp.id} value={emp.id}>
                                 {emp.firstName} {emp.lastName} ({emp.cedula})
                             </option>
                         ))}
                      </select>
                      <UserCircle className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={18} />
                  </div>
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
                       <Save size={18} /> {editingId ? 'Guardar Cambios' : 'Guardar'}
                   </button>
               </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
             <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-sm border border-white/20 dark:border-slate-700 p-8 text-center animate-in zoom-in-95 duration-200 ring-1 ring-black/5">
                <div className="w-16 h-16 bg-rose-50 dark:bg-rose-900/30 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm border border-rose-100 dark:border-rose-900/50">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">¿Eliminar Departamento?</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-8">
                    Estás a punto de eliminar <strong>"{deleteModal.name}"</strong>. Esta acción no se puede deshacer.
                </p>
                <div className="grid grid-cols-2 gap-4">
                    <button 
                        onClick={() => setDeleteModal({ isOpen: false, id: null, name: '' })}
                        className="px-4 py-3 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-xl font-bold text-sm hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={confirmDelete}
                        className="px-4 py-3 bg-rose-600 text-white rounded-xl font-bold text-sm hover:bg-rose-700 shadow-lg shadow-rose-600/20 transition-colors"
                    >
                        Sí, Eliminar
                    </button>
                </div>
             </div>
        </div>
      )}
    </div>
  );
};

export default Departments;
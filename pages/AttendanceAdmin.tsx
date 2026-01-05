import React, { useState, useEffect } from 'react';
import { Calendar, Filter, Clock, CheckCircle2, XCircle, AlertTriangle, Search, RefreshCw, Umbrella, LogOut } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { useConfig } from '../context/ConfigContext';
import { useData } from '../context/DataContext';

const AttendanceAdmin = () => {
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const { notify } = useToast();
  const { config } = useConfig();
  const { attendance, employees } = useData();

  // Live Clock Effect
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // --- LÓGICA ACTUALIZADA PARA MOSTRAR ASISTENCIA COMPLETA ---
  const records = employees.map(employee => {
    // Buscar TODOS los registros de hoy para este empleado (por si hay doble turno)
    const dailyRecords = attendance.filter(r => r.employeeId === employee.id && r.date === dateFilter);
    
    // Tomar el primer registro para Entrada y el último registro que tenga salida para Salida
    // O simplificar mostrando el último estatus relevante.
    // Estrategia: Mostrar la PRIMERA entrada y la ÚLTIMA salida del día para resumen general.
    
    const firstRecord = dailyRecords.length > 0 ? dailyRecords[0] : null;
    const lastRecordWithExit = dailyRecords.filter(r => r.checkOut).pop(); // Último registro cerrado
    const activeRecord = dailyRecords.find(r => !r.checkOut); // Registro actualmente abierto

    let status = 'Falta'; 
    let checkIn = undefined;
    let checkOut = undefined;
    let id = `auto-${employee.id}`;

    if (dailyRecords.length > 0) {
        id = firstRecord?.id || id;
        
        // La entrada siempre es la del primer registro
        checkIn = firstRecord?.checkIn;
        
        // La salida mostrada será la del último registro cerrado, o vacía si está abierto
        checkOut = lastRecordWithExit ? lastRecordWithExit.checkOut : undefined;

        // Estado principal
        status = firstRecord?.status || 'A tiempo';
        
        // Si hay un registro activo (sin salida), visualmente sigue "En planta"
        // Pero para efectos de reporte de estado inicial, mantenemos el status de llegada (A tiempo/Retardo)
        
    } else {
        if (employee.status === 'Vacaciones') status = 'Vacaciones';
        if (employee.status === 'Permiso') status = 'Permiso';
        if (employee.status === 'Reposo') status = 'Reposo';
    }

    return { 
        id, 
        employee, 
        date: dateFilter, 
        checkIn, 
        checkOut, 
        status,
        recordsCount: dailyRecords.length // Para saber si hizo doble turno
    };
  }).filter(r => {
      // Aplicar filtros de interfaz
      const matchesDate = r.date === dateFilter;
      const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
      const matchesSearch = r.employee.firstName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            r.employee.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            r.employee.cedula.includes(searchTerm);
      return matchesDate && matchesStatus && matchesSearch;
  });

  // Estadísticas del día
  const stats = {
      present: records.filter(r => r.status === 'A tiempo').length,
      late: records.filter(r => r.status === 'Retardo').length,
      absent: records.filter(r => r.status === 'Falta').length,
      total: records.length
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'A tiempo': return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/20 dark:text-emerald-300 dark:border-emerald-500/30';
      case 'Retardo': return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/20 dark:text-amber-300 dark:border-amber-500/30';
      case 'Falta': return 'bg-red-100 text-red-800 border-red-200 dark:bg-red-500/20 dark:text-red-300 dark:border-red-500/30';
      case 'Salida Anticipada': return 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-500/20 dark:text-yellow-300 dark:border-yellow-500/30';
      case 'Vacaciones': return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30';
      case 'Permiso': return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30';
      case 'Reposo': return 'bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30';
      default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="p-4 md:p-8 min-h-full space-y-8">
      
      {/* Top Banner */}
      <div className="relative rounded-[2.5rem] overflow-hidden shadow-xl bg-slate-900 text-white animate-in fade-in slide-in-from-top-4 duration-500 border border-slate-800">
        <div className="absolute top-0 left-0 w-full h-1.5 flex z-20">
            <div className="h-full w-1/3 bg-yellow-400"></div>
            <div className="h-full w-1/3 bg-blue-600"></div>
            <div className="h-full w-1/3 bg-red-600"></div>
        </div>

        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/3"></div>
        
        <div className="relative z-10 p-8 md:p-10 flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="space-y-3 text-center md:text-left">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-emerald-400 text-[10px] font-black uppercase tracking-[0.2em] mb-2 shadow-lg">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                    Monitoreo en Vivo
                </div>
                <h1 className="text-3xl md:text-4xl font-black tracking-tight">Control de Asistencia</h1>
                <p className="text-slate-400 font-medium max-w-md leading-relaxed text-sm">
                    Supervisión en tiempo real de entradas y salidas del personal.
                    <span className="block mt-1 text-slate-500 text-xs font-bold uppercase tracking-wider">Hora límite entrada: <span className="text-white">{config.entryTimeLimit}</span></span>
                </p>
            </div>

            <div className="flex items-center gap-8 bg-white/5 border border-white/10 p-6 md:p-8 rounded-3xl backdrop-blur-md shadow-2xl">
                <div className="text-center border-r border-white/10 pr-8">
                    <div className="text-5xl font-mono font-bold tracking-tight tabular-nums">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-[10px] text-slate-500 font-black uppercase mt-2 tracking-[0.3em]">Hora Actual</div>
                </div>
                <div className="space-y-2">
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                        <Calendar size={16} className="text-blue-500" />
                        {currentTime.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </div>
                    <div className="flex items-center gap-3 text-sm font-bold text-slate-300">
                        <RefreshCw size={16} className="text-emerald-500" />
                        Sincronizado
                    </div>
                </div>
            </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 border-t border-white/5 bg-black/20 divide-x divide-white/5">
            <div className="p-6 text-center">
                <div className="text-3xl font-black text-white">{stats.total}</div>
                <div className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mt-1">Nómina Total</div>
            </div>
            <div className="p-6 text-center">
                <div className="text-3xl font-black text-emerald-500">{stats.present}</div>
                <div className="text-[10px] font-bold text-emerald-500/60 uppercase tracking-widest mt-1">A Tiempo</div>
            </div>
            <div className="p-6 text-center">
                <div className="text-3xl font-black text-amber-500">{stats.late}</div>
                <div className="text-[10px] font-bold text-amber-500/60 uppercase tracking-widest mt-1">Retardos</div>
            </div>
            <div className="p-6 text-center">
                <div className="text-3xl font-black text-red-500">{stats.absent}</div>
                <div className="text-[10px] font-bold text-red-500/60 uppercase tracking-widest mt-1">Faltas</div>
            </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col lg:flex-row gap-5 items-center justify-between animate-in fade-in slide-in-from-bottom-2 duration-500 delay-100">
         <div className="flex items-center gap-3 w-full lg:w-auto">
             <div className="relative group w-full lg:w-72">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors" size={18} />
                <input 
                    type="text" 
                    placeholder="Buscar empleado..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 rounded-2xl text-sm font-bold outline-none transition-all text-slate-700 dark:text-white"
                />
             </div>
             <div className="relative">
                <input 
                    type="date" 
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-4 py-3 bg-slate-50 dark:bg-slate-800 border-2 border-transparent focus:border-blue-500/20 rounded-2xl text-sm font-bold text-slate-700 dark:text-white outline-none cursor-pointer"
                />
             </div>
         </div>

         <div className="flex items-center gap-3 w-full lg:w-auto justify-end overflow-x-auto pb-2 lg:pb-0">
             <div className="flex items-center gap-2">
                 {['all', 'A tiempo', 'Retardo', 'Falta'].map(filter => (
                    <button 
                        key={filter}
                        onClick={() => setStatusFilter(filter)}
                        className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all ${statusFilter === filter 
                            ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' 
                            : 'text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'}`}
                    >
                        {filter === 'all' ? 'Todos' : filter}
                    </button>
                 ))}
             </div>
         </div>
      </div>

      {/* Main Table */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 delay-200">
        <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
            <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-[11px] font-black uppercase tracking-[0.1em]">
                    <th className="px-8 py-6">Empleado</th>
                    <th className="px-8 py-6">Departamento</th>
                    <th className="px-8 py-6 text-center">Entrada</th>
                    <th className="px-8 py-6 text-center">Salida</th>
                    <th className="px-8 py-6">Estado</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {records.map((record) => (
                <tr key={record.id} className="group hover:bg-blue-50/30 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-8 py-5">
                        <div className="flex items-center gap-4">
                            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 font-black text-sm border border-slate-200 dark:border-slate-700">
                                {record.employee.firstName[0]}{record.employee.lastName[0]}
                            </div>
                            <div>
                                <div className="font-bold text-slate-900 dark:text-white text-sm">{record.employee.firstName} {record.employee.lastName}</div>
                                <div className="text-[10px] text-slate-500 dark:text-slate-400 font-mono font-bold">{record.employee.cedula}</div>
                            </div>
                        </div>
                    </td>
                    <td className="px-8 py-5 text-sm font-bold text-slate-600 dark:text-slate-300">
                        {record.employee.department}
                    </td>
                    <td className="px-8 py-5 text-center">
                        {record.checkIn ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20 font-mono text-sm font-bold text-emerald-700 dark:text-emerald-400">
                                <Clock size={14} />
                                {record.checkIn}
                            </div>
                        ) : (
                            <span className="text-slate-300 dark:text-slate-600 font-mono">--:--</span>
                        )}
                    </td>
                    <td className="px-8 py-5 text-center">
                         {record.checkOut ? (
                            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-orange-50 dark:bg-orange-500/10 border border-orange-100 dark:border-orange-500/20 font-mono text-sm font-bold text-orange-700 dark:text-orange-400">
                                <LogOut size={14} />
                                {record.checkOut}
                            </div>
                         ) : (
                            <span className="text-slate-300 dark:text-slate-600 font-mono">--:--</span>
                         )}
                    </td>
                    <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${getStatusStyle(record.status)}`}>
                                {record.status === 'A tiempo' && <CheckCircle2 size={12} className="mr-1.5" />}
                                {record.status === 'Retardo' && <AlertTriangle size={12} className="mr-1.5" />}
                                {record.status === 'Falta' && <XCircle size={12} className="mr-1.5" />}
                                {(record.status === 'Vacaciones' || record.status === 'Permiso' || record.status === 'Reposo') && <Umbrella size={12} className="mr-1.5" />}
                                {record.status}
                            </span>
                            {record.recordsCount > 1 && (
                                <span className="text-[9px] font-black bg-slate-200 dark:bg-slate-700 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300" title="Múltiples registros hoy (Doble Turno)">
                                    DT
                                </span>
                            )}
                        </div>
                    </td>
                </tr>
                ))}
            </tbody>
            </table>
        </div>
        
        {records.length === 0 && (
            <div className="py-20 text-center">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                <h3 className="text-slate-900 dark:text-white font-bold">No hay registros</h3>
            </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceAdmin;
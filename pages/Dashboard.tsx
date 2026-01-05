import React, { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useConfig } from '../context/ConfigContext';
import { 
  Users, UserCheck, Clock, CalendarOff, 
  TrendingUp, Activity, ArrowUpRight,
  ShieldCheck, FileSpreadsheet, UserPlus,
  BarChart3, Settings2
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell 
} from 'recharts';

const Dashboard = () => {
  const { employees, attendance, leaves } = useData();
  const { config } = useConfig();

  // --- LÓGICA DE CÁLCULO DE MÉTRICAS EN TIEMPO REAL ---
  
  const todayStr = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD local format

  // 1. Nómina Activa
  const totalEmployees = employees.length;

  // 2. Asistencia Hoy (Personas únicas presentes)
  const attendanceTodayRecords = attendance.filter(r => r.date === todayStr);
  
  // Usamos Set para contar IDs únicos de empleados que han marcado hoy (evita contar doble turno como 2 personas)
  const uniquePresentEmployees = new Set(attendanceTodayRecords.map(r => r.employeeId));
  const presentCount = uniquePresentEmployees.size;
  
  const attendancePercentage = totalEmployees > 0 
    ? Math.round((presentCount / totalEmployees) * 100) 
    : 0;

  // 3. Retardos Hoy (Personas únicas que llegaron tarde en su primer registro)
  // Filtramos el primer registro de cada empleado hoy para ver si fue retardo
  const lateCount = employees.filter(emp => {
      const firstRecord = attendanceTodayRecords.find(r => r.employeeId === emp.id);
      return firstRecord && firstRecord.status === 'Retardo';
  }).length;

  // 4. En Reposo / Vacaciones (Activos Hoy)
  const activeLeavesCount = leaves.filter(leave => {
    if (leave.status !== 'Aprobado') return false;
    return todayStr >= leave.startDate && todayStr <= leave.endDate;
  }).length;

  // 5. Datos para el Gráfico (Últimos 5 días)
  const chartData = useMemo(() => {
    const uniqueDates = Array.from(new Set(attendance.map(r => r.date))).sort();
    const last5Days = uniqueDates.slice(-5);
    
    if (last5Days.length === 0) {
        return [
            { name: 'Lun', value: 0 },
            { name: 'Mar', value: 0 },
            { name: 'Mié', value: 0 },
            { name: 'Jue', value: 0 },
            { name: 'Vie', value: 0 },
        ];
    }

    return last5Days.map(dateStr => {
        const dateObj = new Date(dateStr + 'T00:00:00'); 
        const dayName = dateObj.toLocaleDateString('es-VE', { weekday: 'short' });
        
        // Contar asistencias únicas de ese día
        const recordsThatDay = attendance.filter(r => r.date === dateStr);
        const uniquePeople = new Set(recordsThatDay.map(r => r.employeeId)).size;
        
        return {
            name: dayName.charAt(0).toUpperCase() + dayName.slice(1), 
            value: uniquePeople,
            fullDate: dateStr
        };
    });
  }, [attendance]);


  const handleNavigate = (path: string) => {
    window.location.hash = path;
  };

  const StatCard = ({ title, value, icon: Icon, colorClass, iconBgClass, trend }: any) => (
    <div className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[2rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
      {/* Background Decor */}
      <div className={`absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700 ${colorClass.split(' ')[0].replace('text-', 'bg-')}`}></div>
      
      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-black text-slate-600 dark:text-slate-400 uppercase tracking-[0.1em]">{title}</p>
          <h3 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white mt-2 tracking-tighter">
            {value}
          </h3>
          {trend && (
            <div className={`flex items-center gap-1 mt-3 font-black text-[11px] uppercase tracking-widest ${colorClass}`}>
                <TrendingUp size={14} /> {trend}
            </div>
          )}
        </div>
        <div className={`p-4 rounded-2xl shadow-inner ${iconBgClass} ${colorClass}`}>
          <Icon size={32} strokeWidth={2.5} />
        </div>
      </div>
    </div>
  );

  return (
    <div className="p-4 md:p-10 space-y-8 md:space-y-12 animate-in fade-in duration-700">
      {/* Welcome Header Tricolor */}
      <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        {/* Tricolor Bar Accent */}
        <div className="absolute top-0 left-0 w-full h-2 flex">
            <div className="h-full w-1/3 bg-yellow-400"></div>
            <div className="h-full w-1/3 bg-blue-600"></div>
            <div className="h-full w-1/3 bg-red-600"></div>
        </div>

        <div className="p-6 md:p-10 flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
            {config.logo && (
                <div className="p-4 bg-white dark:bg-slate-800 rounded-[2rem] border border-slate-200 dark:border-slate-700 shadow-sm group">
                <img 
                    src={config.logo} 
                    className="h-20 md:h-24 w-auto object-contain transition-transform group-hover:scale-105 duration-500" 
                    alt="Logo Institucional" 
                />
                </div>
            )}
            <div className="text-center md:text-left">
                <h2 className="text-4xl md:text-5xl font-black text-slate-950 dark:text-white tracking-tight leading-none">
                    Bienvenido al <span className="text-blue-700">SIGE-ZEA</span>
                </h2>
                <p className="text-slate-600 dark:text-slate-300 font-bold uppercase tracking-[0.2em] mt-3 text-sm">
                    {config.institutionName}
                </p>
            </div>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-100 dark:bg-slate-800 px-6 py-3 rounded-2xl text-slate-700 dark:text-white font-black text-[11px] uppercase tracking-[0.1em] border border-slate-200 dark:border-slate-700 mx-auto md:mx-0">
            <Activity size={18} className="text-emerald-600 dark:text-emerald-400 animate-pulse" /> 
            Sistema Operativo
            </div>
        </div>
      </div>

      {/* Grid de Estadísticas - Paleta Tricolor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8">
        {/* Azul - Institucionalidad */}
        <StatCard 
            title="Nómina Activa" 
            value={totalEmployees} 
            icon={Users} 
            colorClass="text-blue-700 dark:text-blue-400" 
            iconBgClass="bg-blue-50 dark:bg-blue-900/20"
            trend={`${employees.length} Registros`} 
        />
        
        {/* Amarillo (Ámbar) - Actividad/Atención */}
        <StatCard 
            title="Asistencia Hoy" 
            value={`${attendancePercentage}%`} 
            icon={UserCheck} 
            colorClass="text-amber-600 dark:text-yellow-400" 
            iconBgClass="bg-amber-50 dark:bg-yellow-900/20"
            trend={attendancePercentage > 90 ? "Alta Eficiencia" : "Monitorizar"} 
        />
        
        {/* Rojo - Alertas/Retardos */}
        <StatCard 
            title="Retardos" 
            value={lateCount.toString().padStart(2, '0')} 
            icon={Clock} 
            colorClass="text-red-600 dark:text-red-400" 
            iconBgClass="bg-red-50 dark:bg-red-900/20"
        />
        
        {/* Gris/Neutro - Reposos (o Azul Oscuro) */}
        <StatCard 
            title="En Reposo / Permiso" 
            value={activeLeavesCount.toString().padStart(2, '0')} 
            icon={CalendarOff} 
            colorClass="text-slate-700 dark:text-slate-300" 
            iconBgClass="bg-slate-100 dark:bg-slate-800"
            trend="Ausencias Activas"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-10">
        {/* Gráfico Semanal */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-8 md:p-10 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col min-h-[500px]">
          <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4">
             <div>
                <h3 className="text-2xl font-black flex items-center gap-3 tracking-tight text-slate-950 dark:text-white">
                  <BarChart3 className="text-blue-700" size={28} /> Rendimiento Semanal
                </h3>
                <p className="text-slate-600 dark:text-slate-400 text-xs font-bold uppercase tracking-widest mt-1">Comparativa de asistencia diaria</p>
             </div>
             <div className="text-[11px] font-black text-amber-700 dark:text-yellow-400 uppercase tracking-widest bg-amber-50 dark:bg-yellow-900/20 px-5 py-2.5 rounded-full border border-amber-100 dark:border-yellow-800/30">
               Últimos 5 días
             </div>
          </div>
          <div className="w-full h-[350px] min-w-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 13, fontWeight: 800}} // Slate-600
                />
                <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fill: '#475569', fontSize: 13, fontWeight: 800}} 
                />
                <Tooltip 
                   cursor={{fill: '#f1f5f9', opacity: 0.8}}
                   contentStyle={{
                       borderRadius: '1.5rem', 
                       border: 'none', 
                       boxShadow: '0 10px 30px -5px rgba(0,0,0,0.1)', 
                       fontWeight: 800, 
                       padding: '16px',
                       color: '#0f172a'
                    }}
                />
                <Bar dataKey="value" radius={[12, 12, 12, 12]} barSize={50}>
                  {chartData.map((entry, index) => {
                      // Usar azul primario, resaltar el día con más asistencia
                      return <Cell key={index} fill={'#2563eb'} className="hover:fill-blue-400 transition-all" />;
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Acciones Rápidas - Estilo Oscuro Institucional */}
        <div className="bg-slate-900 dark:bg-slate-950 rounded-[2.5rem] p-8 md:p-10 text-white relative overflow-hidden shadow-2xl flex flex-col min-h-[500px] group border-t-4 border-yellow-400">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-900/40 blur-[80px] -mr-40 -mt-40"></div>
          
          <div className="relative z-10 flex flex-col h-full">
            <div className="mb-10">
              <h3 className="text-3xl font-black tracking-tight">Gestión <span className="text-yellow-400">Rápida</span></h3>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-[0.2em] mt-2">Accesos directos del sistema</p>
            </div>

            <div className="space-y-3 flex-1">
              {[
                { label: 'Auditar Asistencia', path: '/attendance-admin', icon: Clock, color: 'bg-blue-600 text-white' },
                { label: 'Reportes y Nómina', path: '/reports', icon: FileSpreadsheet, color: 'bg-red-600 text-white' },
                { label: 'Nuevo Ingreso', path: '/employees', icon: UserPlus, color: 'bg-amber-500 text-white' },
                { label: 'Ajustes Generales', path: '/settings', icon: Settings2, color: 'bg-slate-700 text-slate-300' },
              ].map((action, i) => (
                <button 
                  key={i}
                  onClick={() => handleNavigate(action.path)}
                  className="w-full flex items-center justify-between p-5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 transition-all group active:scale-[0.98]"
                >
                  <div className="flex items-center gap-4">
                    <div className={`p-2.5 ${action.color} rounded-xl shadow-lg shadow-black/30`}>
                      <action.icon size={20} strokeWidth={2.5} />
                    </div>
                    <span className="font-bold text-sm uppercase tracking-wider text-slate-200 group-hover:text-white transition-colors">{action.label}</span>
                  </div>
                  <ArrowUpRight size={18} className="text-slate-500 group-hover:text-yellow-400 transition-colors" />
                </button>
              ))}
            </div>

            <div className="relative z-10 mt-8">
              <div className="p-5 bg-gradient-to-r from-blue-900/50 to-slate-900/50 border border-blue-800/30 rounded-3xl flex items-center gap-4">
                <div className="p-3 bg-blue-700 rounded-2xl text-white shrink-0 shadow-lg">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <p className="text-[10px] uppercase font-black tracking-widest text-blue-400 mb-1">Seguridad Activada</p>
                  <p className="text-[11px] font-bold text-slate-400 leading-tight">
                    Terminal validado con credenciales de administrador.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
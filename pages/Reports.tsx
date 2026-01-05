import React, { useState } from 'react';
import { 
  FileText, Download, Calendar, BarChart3, Users, Clock, 
  FileSpreadsheet, FileType, Sparkles, BrainCircuit, 
  Loader2, X, Send, ChevronRight, Wand2, Info
} from 'lucide-react';
import { useConfig } from '../context/ConfigContext';
import { useToast } from '../context/ToastContext';
import { useData } from '../context/DataContext';
import { GoogleGenAI } from "@google/genai";
import { Employee, AttendanceRecord } from '../types';

interface ReportCardProps {
  title: string;
  description: string;
  icon: any;
  loading: string | null;
  onDownload?: (format: 'pdf' | 'xls' | 'docx') => void;
  onClick?: () => void;
  isAI?: boolean;
}

const ReportCard = ({ title, description, icon: Icon, loading, onDownload, onClick, isAI }: ReportCardProps) => (
  <div className={`bg-white dark:bg-slate-900 p-8 rounded-[2rem] shadow-sm border ${isAI ? 'border-blue-200 dark:border-blue-900/50 bg-gradient-to-br from-white to-blue-50/50 dark:from-slate-900 dark:to-blue-900/10' : 'border-slate-200 dark:border-slate-800'} flex flex-col justify-between h-full group hover:shadow-xl transition-all duration-300 relative overflow-hidden`}>
    {isAI && (
        <div className="absolute -right-4 -top-4 text-blue-100 dark:text-blue-900/20 rotate-12 group-hover:scale-110 transition-transform">
            <Sparkles size={120} />
        </div>
    )}
    
    <div className="relative z-10">
        <div className="flex items-center justify-between mb-6">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isAI ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30' : 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'}`}>
                <Icon size={28} />
            </div>
            {loading && <Loader2 className="w-6 h-6 text-blue-600 animate-spin" />}
        </div>
        <h3 className={`font-black text-xl mb-3 transition-colors ${isAI ? 'text-blue-700 dark:text-blue-400' : 'text-slate-950 dark:text-white group-hover:text-blue-600'}`}>
            {title}
            {isAI && <span className="ml-3 text-[9px] bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-300 px-2 py-1 rounded-lg uppercase tracking-wider align-middle">IA Power</span>}
        </h3>
        <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8 leading-relaxed">{description}</p>
    </div>
    
    <div className="relative z-10 border-t border-slate-100 dark:border-slate-800 pt-6 mt-auto">
        {isAI ? (
            <button 
                onClick={onClick}
                disabled={!!loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl flex items-center justify-center gap-2 font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50"
            >
                <BrainCircuit size={18} /> Generar Análisis IA
            </button>
        ) : (
            <>
                <p className="text-[10px] text-slate-400 mb-4 font-black uppercase tracking-widest">Formatos Disponibles:</p>
                <div className="grid grid-cols-3 gap-3">
                    <button 
                        onClick={() => onDownload?.('pdf')}
                        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-50 hover:bg-rose-50 dark:bg-slate-800 dark:hover:bg-rose-900/20 text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 transition-colors border border-slate-100 dark:border-slate-700 hover:border-rose-200"
                    >
                        <FileText size={20} />
                        <span className="text-[10px] font-black">TXT</span>
                    </button>
                    <button 
                        onClick={() => onDownload?.('xls')}
                        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50 dark:bg-slate-800 dark:hover:bg-emerald-900/20 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors border border-slate-100 dark:border-slate-700 hover:border-emerald-200"
                    >
                        <FileSpreadsheet size={20} />
                        <span className="text-[10px] font-black">Excel</span>
                    </button>
                    <button 
                        onClick={() => onDownload?.('docx')}
                        className="flex flex-col items-center justify-center gap-1.5 p-3 rounded-xl bg-slate-50 hover:bg-blue-50 dark:bg-slate-800 dark:hover:bg-blue-900/20 text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors border border-slate-100 dark:border-slate-700 hover:border-blue-200"
                    >
                        <FileType size={20} />
                        <span className="text-[10px] font-black">CSV</span>
                    </button>
                </div>
            </>
        )}
    </div>
  </div>
);

const Reports = () => {
  const [loading, setLoading] = useState<string | null>(null);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [isAiModalOpen, setIsAiModalOpen] = useState(false);
  const { config } = useConfig();
  const { notify } = useToast();
  const { employees, attendance, leaves, departments } = useData();

  // --- Utility: Convert to CSV with BOM for Excel ---
  const convertToCSV = (headers: string[], rows: (string | number)[][]) => {
    const processRow = (row: (string | number)[]) => 
      row.map(val => {
        const strVal = String(val ?? '');
        // Escapar comillas dobles y envolver en comillas si contiene comas o saltos de línea
        if (strVal.search(/("|,|\n)/g) >= 0) {
            return `"${strVal.replace(/"/g, '""')}"`;
        }
        return strVal;
      }).join(',');

    const csvContent = [
      headers.join(','), 
      ...rows.map(processRow)
    ].join('\n');

    // Agregar BOM para que Excel reconozca UTF-8 (tildes, eñes)
    return '\uFEFF' + csvContent;
  };

  // --- Utility: Get Data based on Report Type ---
  const getReportData = (reportId: string) => {
    const dateStr = new Date().toISOString().split('T')[0];
    let filename = `reporte_${reportId}_${dateStr}`;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];
    let textContent = '';

    if (reportId === 'staff') {
        filename = `nomina_personal_${dateStr}`;
        headers = ['ID', 'Cédula', 'Nombres', 'Apellidos', 'Departamento', 'Cargo', 'Estatus', 'Fecha Ingreso', 'Email'];
        rows = employees.map(e => [
            e.id, `'${e.cedula}`, e.firstName, e.lastName, e.department, e.role, e.status, e.hireDate, e.email
        ]);
        textContent = `NÓMINA DE PERSONAL\nFECHA: ${dateStr}\n\n` + 
            employees.map(e => `• ${e.firstName} ${e.lastName} (${e.cedula}) - ${e.department} [${e.status}]`).join('\n');
    } 
    else if (reportId === 'daily') {
        filename = `asistencia_diaria_${dateStr}`;
        headers = ['ID Empleado', 'Cédula', 'Nombres', 'Apellidos', 'Departamento', 'Fecha', 'Entrada', 'Salida', 'Estatus'];
        rows = attendance.map(a => {
            const emp = employees.find(e => e.id === a.employeeId);
            return [
                a.employeeId,
                emp ? `'${emp.cedula}` : 'N/A',
                emp ? emp.firstName : 'Desconocido',
                emp ? emp.lastName : '',
                emp ? emp.department : '',
                a.date,
                a.checkIn || '--',
                a.checkOut || '--',
                a.status
            ];
        });
        textContent = `REPORTE DE ASISTENCIA\nFECHA EMISIÓN: ${dateStr}\n\n` +
            rows.map(r => `${r[5]} | ${r[2]} ${r[3]} (${r[4]}): ${r[6]} - ${r[7]} [${r[8]}]`).join('\n');
    }
    else if (reportId === 'vacations') {
        filename = `proyeccion_vacaciones_${dateStr}`;
        headers = ['Cédula', 'Nombres', 'Apellidos', 'Fecha Ingreso', 'Años Servicio', 'Días Disponibles', 'Estatus'];
        rows = employees.map(e => {
            const years = new Date().getFullYear() - new Date(e.hireDate).getFullYear();
            return [
                `'${e.cedula}`, e.firstName, e.lastName, e.hireDate, years, e.availableVacationDays, e.status
            ];
        });
        textContent = `PROYECCIÓN DE VACACIONES\nFECHA: ${dateStr}\n\n` + 
            rows.map(r => `${r[1]} ${r[2]} (Ingreso: ${r[3]}): ${r[4]} años servicio - Días Disp: ${r[5]}`).join('\n');
    }
    else if (reportId === 'audit') {
        filename = `auditoria_sistema_${dateStr}`;
        headers = ['Fecha', 'Usuario', 'Acción', 'Detalle'];
        rows = [['2024-05-20', 'Admin', 'Login', 'Inicio de sesión exitoso']]; // Mock data
        textContent = `AUDITORÍA DE SISTEMA\nFECHA: ${dateStr}\n\n... (Datos de auditoría)`;
    }

    return { filename, headers, rows, textContent };
  };

  const generateAndDownloadFile = (reportId: string, format: 'pdf' | 'xls' | 'docx') => {
    setLoading(reportId);
    
    // Usar setTimeout para permitir que la UI se actualice al estado "Cargando"
    setTimeout(() => {
        try {
            const { filename, headers, rows, textContent } = getReportData(reportId);
            let content: string | Blob = '';
            let mimeType = '';
            let extension = '';

            if (format === 'xls') {
                // Generar CSV con BOM para Excel
                content = convertToCSV(headers, rows);
                mimeType = 'text/csv;charset=utf-8;';
                extension = 'csv'; // Usamos CSV para máxima compatibilidad, Excel lo abre por defecto
            } else if (format === 'docx') {
                // Simulación de CSV para "Formato Datos" si se pide docx/csv
                content = convertToCSV(headers, rows);
                mimeType = 'text/csv;charset=utf-8;';
                extension = 'csv';
            } else {
                // Formato Texto simple (simulando PDF/TXT)
                content = textContent;
                mimeType = 'text/plain;charset=utf-8';
                extension = 'txt';
            }

            const blob = new Blob([content], { type: mimeType });
            const url = window.URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${filename}.${extension}`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);

            notify(`Reporte generado exitosamente`, 'success');
        } catch (err) {
            console.error(err);
            notify("Error al generar el reporte", "error");
        } finally {
            setLoading(null);
        }
    }, 500);
  };

  const generateAIReport = async () => {
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
        notify('Error: API Key de IA no configurada', 'error');
        return;
    }

    setLoading('ai');
    setIsAiModalOpen(true);
    setAiReport(null);

    try {
      // 1. Pre-cálculo de métricas para darle "hechos" a la IA y evitar alucinaciones
      const totalEmployees = employees.length;
      const today = new Date().toISOString().split('T')[0];
      const todayAttendance = attendance.filter(a => a.date === today);
      const lateArrivals = todayAttendance.filter(a => a.status === 'Retardo');
      
      const absenteeismRate = totalEmployees > 0 
        ? ((totalEmployees - todayAttendance.length) / totalEmployees * 100).toFixed(1) 
        : "0";

      // Agrupar retardos por departamento
      const deptStats: Record<string, { total: number, late: number }> = {};
      employees.forEach(e => {
          if (!deptStats[e.department]) deptStats[e.department] = { total: 0, late: 0 };
          deptStats[e.department].total++;
      });
      lateArrivals.forEach(a => {
          const emp = employees.find(e => e.id === a.employeeId);
          if (emp && deptStats[emp.department]) deptStats[emp.department].late++;
      });

      // Empleados con muchos años (posibles jubilaciones o premios)
      const veterans = employees
        .filter(e => (new Date().getFullYear() - new Date(e.hireDate).getFullYear()) > 15)
        .map(e => e.firstName + " " + e.lastName);

      const statsContext = {
        institucion: config.institutionName,
        metricas_clave: {
            total_empleados: totalEmployees,
            asistentes_hoy: todayAttendance.length,
            tasa_ausentismo_hoy: `${absenteeismRate}%`,
            total_retardos_hoy: lateArrivals.length
        },
        analisis_departamental: deptStats,
        veteranos_mas_15_anos: veterans.length,
        nombres_veteranos_ejemplo: veterans.slice(0, 3) // Solo enviar algunos nombres por privacidad/tamaño
      };

      const ai = new GoogleGenAI({ apiKey });
      
      const prompt = `
      Actúa como un Consultor Senior de Recursos Humanos. Analiza los siguientes datos crudos de "${config.institutionName}" y genera un INFORME EJECUTIVO ESTRATÉGICO.
      
      DATOS DEL SISTEMA:
      ${JSON.stringify(statsContext)}

      ESTRUCTURA DEL INFORME (Usa Markdown):
      1. **Resumen Ejecutivo**: Diagnóstico rápido de la operatividad hoy.
      2. **Análisis de Asistencia**: Interpreta la tasa de ausentismo (${statsContext.metricas_clave.tasa_ausentismo_hoy}) y los retardos. ¿Es preocupante?
      3. **Focos de Atención**: Basado en los datos departamentales, ¿dónde hay más problemas de puntualidad?
      4. **Gestión de Talento**: Menciona la situación de los empleados veteranos y sugiere acciones de reconocimiento o planificación de relevo.
      5. **Recomendaciones Tácticas**: 3 acciones concretas para mejorar la puntualidad mañana.

      TONO: Profesional, objetivo y orientado a la acción. No inventes datos que no estén en el JSON.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });

      setAiReport(response.text || 'No se pudo generar el análisis.');
    } catch (error) {
      console.error(error);
      notify('Error al conectar con IA. Verifique conexión a internet.', 'error');
      setIsAiModalOpen(false);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="p-4 md:p-8 h-[calc(100vh-64px)] overflow-y-auto">
      
      {/* Header Tricolor */}
      <div className="flex flex-col lg:flex-row justify-between items-start gap-8 mb-8 bg-white dark:bg-slate-900 p-8 rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 flex">
            <div className="h-full w-1/3 bg-yellow-400"></div>
            <div className="h-full w-1/3 bg-blue-600"></div>
            <div className="h-full w-1/3 bg-red-600"></div>
        </div>
        
        <div className="relative z-10">
            <h2 className="text-3xl font-black text-slate-950 dark:text-white tracking-tight">Centro de Reportes</h2>
            <p className="text-slate-600 dark:text-slate-300 font-bold mt-2 text-sm">Inteligencia de datos y gestión documental.</p>
        </div>

        <div className="bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 flex items-center gap-4 max-w-md w-full relative z-10">
             <div className="h-12 w-12 flex-shrink-0 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                <Sparkles className="text-white" size={24} />
             </div>
             <div>
                 <p className="text-[10px] text-blue-600 dark:text-blue-400 uppercase tracking-widest font-black mb-0.5">Motor IA Activo</p>
                 <h4 className="text-sm font-black text-slate-800 dark:text-white leading-tight">Gemini Flash Optimizado</h4>
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* IA REPORT CARD - Highlighted */}
        <div className="md:col-span-2 xl:col-span-2">
            <ReportCard 
                isAI
                title="Informe de Gestión Estratégica" 
                description="Análisis narrativo profundo realizado por IA que interpreta tendencias de asistencia, proyecciones de vacaciones y ofrece consultoría estratégica sobre el capital humano."
                icon={BrainCircuit}
                loading={loading === 'ai' ? 'true' : null}
                onClick={generateAIReport}
            />
        </div>

        <ReportCard 
            title="Asistencia Diaria" 
            description="Detalle de entradas, salidas y retardos del día actual organizado por departamento."
            icon={Clock}
            loading={loading === 'daily' ? 'true' : null}
            onDownload={(fmt) => generateAndDownloadFile('daily', fmt)}
        />
        <ReportCard 
            title="Nómina de Personal" 
            description="Listado completo de empleados activos, cargos y departamentos asignados."
            icon={Users}
            loading={loading === 'staff' ? 'true' : null}
            onDownload={(fmt) => generateAndDownloadFile('staff', fmt)}
        />
        <ReportCard 
            title="Proyección de Vacaciones" 
            description="Reporte de días disponibles y alertas de aniversarios laborales para planificación."
            icon={Calendar}
            loading={loading === 'vacations' ? 'true' : null}
            onDownload={(fmt) => generateAndDownloadFile('vacations', fmt)}
        />
        <ReportCard 
            title="Auditoría de Sistema" 
            description="Log de actividades administrativas y cambios realizados en la base de datos."
            icon={FileText}
            loading={loading === 'audit' ? 'true' : null}
            onDownload={(fmt) => generateAndDownloadFile('audit', fmt)}
        />
      </div>

      {/* AI REPORT MODAL */}
      {isAiModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="bg-white dark:bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col border border-slate-200 dark:border-slate-700 animate-in zoom-in duration-300 overflow-hidden">
            
            {/* Modal Header */}
            <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-gradient-to-r from-blue-700 to-blue-600 text-white">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                    <Sparkles size={28} />
                </div>
                <div>
                    <h3 className="text-2xl font-black">Análisis Estratégico IA</h3>
                    <p className="text-xs font-bold text-blue-100 opacity-80 uppercase tracking-widest">Generado por Gemini • Zona Educativa</p>
                </div>
              </div>
              <button 
                onClick={() => setIsAiModalOpen(false)}
                className="p-3 hover:bg-white/10 rounded-xl transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 md:p-10 bg-slate-50 dark:bg-slate-900/50">
                {!aiReport ? (
                    <div className="h-full flex flex-col items-center justify-center py-20">
                        <div className="relative mb-10">
                            <div className="w-24 h-24 bg-blue-100 dark:bg-blue-900/30 rounded-full animate-ping absolute"></div>
                            <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center relative z-10 shadow-2xl shadow-blue-600/30">
                                <BrainCircuit size={48} className="text-white" />
                            </div>
                        </div>
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white mb-3">Procesando Inteligencia...</h4>
                        <div className="max-w-xs text-center space-y-2">
                            <p className="text-sm font-bold text-slate-500 animate-pulse italic">"Analizando tendencias de asistencia..."</p>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="prose prose-lg prose-slate dark:prose-invert max-w-none 
                            prose-headings:font-black prose-headings:text-slate-900 dark:prose-headings:text-white
                            prose-p:text-slate-700 dark:prose-p:text-slate-300 prose-p:font-medium prose-p:leading-relaxed
                            prose-strong:text-blue-700 dark:prose-strong:text-blue-400 prose-strong:font-black
                        ">
                            {/* Render Markdown-like text */}
                            {aiReport.split('\n').map((line, i) => {
                                if (line.startsWith('# ')) return <h1 key={i} className="text-3xl mb-6">{line.replace('# ', '')}</h1>;
                                if (line.startsWith('## ')) return <h2 key={i} className="text-2xl mt-8 mb-4">{line.replace('## ', '')}</h2>;
                                if (line.startsWith('### ')) return <h3 key={i} className="text-xl mt-6 mb-3">{line.replace('### ', '')}</h3>;
                                if (line.trim() === '') return <br key={i} />;
                                
                                const parts = line.split(/(\*\*.*?\*\*)/);
                                return (
                                    <p key={i} className="mb-4">
                                        {parts.map((part, pi) => 
                                            part.startsWith('**') ? 
                                            <strong key={pi}>{part.replace(/\*\*/g, '')}</strong> : 
                                            part
                                        )}
                                    </p>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Footer */}
            {aiReport && (
                <div className="p-8 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                        <Info size={16} />
                        Este informe es una sugerencia basada en datos.
                    </div>
                    <div className="flex items-center gap-4 w-full sm:w-auto">
                        <button 
                            onClick={() => window.print()}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 border-2 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl font-bold hover:bg-slate-50 dark:hover:bg-slate-800 transition-all uppercase text-xs tracking-wider"
                        >
                            <FileType size={18} /> Imprimir
                        </button>
                        <button 
                            onClick={() => setIsAiModalOpen(false)}
                            className="flex-1 sm:flex-none px-8 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl shadow-blue-600/20 transition-all uppercase text-xs tracking-wider"
                        >
                            Finalizar
                        </button>
                    </div>
                </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Reports;
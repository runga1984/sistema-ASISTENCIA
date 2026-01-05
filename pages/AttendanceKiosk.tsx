import React, { useState, useEffect, useRef } from 'react';
import { useConfig } from '../context/ConfigContext';
import { useData } from '../context/DataContext';
import { useToast } from '../context/ToastContext';
import { 
  XCircle, Wifi, Shield, Lock, Fingerprint, 
  ScanLine, KeyRound, Info, AlertTriangle, 
  Clock, LogIn, LogOut, CheckCircle2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AttendanceKiosk = () => {
  const { config } = useConfig();
  const { employees, addAttendanceRecord, updateAttendanceRecord, attendance } = useData();
  const { notify } = useToast();
  const navigate = useNavigate();
  
  const [time, setTime] = useState(new Date());
  const [cedula, setCedula] = useState('');
  const [status, setStatus] = useState<'idle' | 'scanning' | 'success_in' | 'success_out' | 'late' | 'duplicate' | 'error'>('idle');
  const [user, setUser] = useState<any>(null);
  const [message, setMessage] = useState('');
  const [showPinPrompt, setShowPinPrompt] = useState(false);
  const [adminPin, setAdminPin] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    if (status === 'idle' && !showPinPrompt) {
      inputRef.current?.focus();
    }
    return () => clearInterval(timer);
  }, [status, showPinPrompt]);

  const processTransaction = (type: 'entry' | 'exit') => {
    if (!cedula) {
        notify("Ingrese su número de cédula", "warning");
        return;
    }

    setStatus('scanning');

    // Simulación de procesamiento biométrico
    setTimeout(() => {
      const found = employees.find(e => e.cedula === cedula);
      
      if (found) {
        setUser(found);
        const todayStr = new Date().toLocaleDateString('en-CA'); 
        const currentTimeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });

        // Buscar registro abierto hoy
        const openRecord = attendance.find(r => r.employeeId === found.id && r.date === todayStr && !r.checkOut);
        
        // Contar turnos completados hoy
        const completedTurns = attendance.filter(r => r.employeeId === found.id && r.date === todayStr && r.checkOut).length;

        if (type === 'entry') {
            if (openRecord) {
                setStatus('duplicate');
                setMessage('Ya posee una entrada activa.');
                resetTerminal();
                return;
            }

            // Lógica de Doble Turno para Obreros
            const isObrero = found.role === 'Obrero';
            if (!isObrero && completedTurns >= 1) {
                setStatus('duplicate');
                setMessage('Jornada diaria completada.');
                resetTerminal();
                return;
            }

            if (isObrero && completedTurns >= 2) {
                setStatus('duplicate');
                setMessage('Límite de doble turno alcanzado.');
                resetTerminal();
                return;
            }

            // Validar Retardo (solo primer registro)
            let currentStatus: any = 'A tiempo';
            if (completedTurns === 0) {
                 const isLate = currentTimeStr > config.entryTimeLimit;
                 currentStatus = isLate ? 'Retardo' : 'A tiempo';
            }

            addAttendanceRecord({
                id: `att-${Date.now()}`,
                employeeId: found.id,
                date: todayStr,
                checkIn: currentTimeStr,
                status: currentStatus
            });
            
            setStatus(currentStatus === 'Retardo' ? 'late' : 'success_in');
            setMessage(`Bienvenido, ${found.firstName}`);
            resetTerminal();

        } else if (type === 'exit') {
            if (!openRecord) {
                setStatus('error');
                setMessage('No se encontró una entrada activa.');
                resetTerminal();
                return;
            }

            updateAttendanceRecord(openRecord.id, {
                checkOut: currentTimeStr
            });

            setStatus('success_out');
            setMessage(`Hasta luego, ${found.firstName}`);
            resetTerminal();
        }

      } else {
        setStatus('error');
        setMessage('Cédula no registrada');
        resetTerminal();
      }
    }, 1500);
  };

  const resetTerminal = () => {
      setTimeout(() => { 
          setStatus('idle'); 
          setCedula(''); 
          setUser(null); 
          setMessage('');
          inputRef.current?.focus();
        }, 3500);
  };

  const handleAdminExit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adminPin === config.adminPin) {
      notify("Acceso concedido", "success");
      navigate('/');
    } else {
      notify("PIN Incorrecto", "error");
      setAdminPin('');
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 flex flex-col items-center justify-center p-4 font-sans overflow-hidden">
      
      {/* Título Fijo Superior con Acento Tricolor */}
      <div className="mb-8 text-center animate-in fade-in slide-in-from-top-6 duration-1000">
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tighter uppercase italic">
          CONTROL DE <span className="text-blue-700">ASISTENCIA</span>
        </h1>
        <div className="h-1.5 w-40 bg-blue-600 mx-auto mt-3 rounded-full shadow-[0_0_20px_rgba(37,99,235,0.4)]"></div>
        <p className="mt-3 text-[10px] font-black text-slate-400 uppercase tracking-[0.4em]">Gestión Institucional de Personal</p>
      </div>

      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* PANEL DE INSTRUCCIONES LATERAL */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-4 animate-in slide-in-from-left-8 duration-700">
           <div className="bg-white dark:bg-slate-900 p-6 rounded-[2.5rem] shadow-xl border border-slate-200 dark:border-slate-800 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-600"></div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white mb-5 flex items-center gap-2">
                <Info size={20} className="text-blue-600" /> Instrucciones
              </h2>
              
              <div className="space-y-4">
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-900/30 text-blue-600 flex items-center justify-center font-black shrink-0 border border-blue-100">1</div>
                   <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-tight">Ingrese su número de cédula en el panel de la terminal.</p>
                </div>
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 flex items-center justify-center font-black shrink-0 border border-emerald-100">2</div>
                   <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-tight">Presione el botón <span className="text-emerald-600">ENTRADA</span> o <span className="text-rose-600">SALIDA</span> según corresponda.</p>
                </div>
                <div className="flex gap-3">
                   <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-900/30 text-amber-600 flex items-center justify-center font-black shrink-0 border border-amber-100">3</div>
                   <p className="text-[11px] font-bold text-slate-600 dark:text-slate-400 leading-tight">Espere la confirmación en la pantalla LCD antes de retirarse.</p>
                </div>
              </div>
           </div>

           <button 
             onClick={() => setShowPinPrompt(true)}
             className="w-full bg-slate-200 dark:bg-slate-800/80 hover:bg-slate-900 hover:text-white p-5 rounded-3xl flex items-center justify-center gap-3 text-slate-500 transition-all active:scale-95 group"
           >
             <Shield size={18} />
             <span className="text-[10px] font-black uppercase tracking-[0.2em]">Administración</span>
           </button>
        </div>

        {/* ÁREA DE DISPOSITIVO BIOMÉTRICO (Centro) */}
        <div className="col-span-1 lg:col-span-9 flex justify-center">
            {/* Cuerpo del Dispositivo */}
            <div className="relative bg-[#1e293b] dark:bg-[#0f172a] w-full max-w-2xl rounded-[3.5rem] p-4 md:p-8 shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] border-t-[3px] border-l-[3px] border-slate-500/30 ring-[10px] ring-[#020617]">
                
                {/* PANTALLA LCD */}
                <div className="bg-gradient-to-br from-[#020617] to-[#1e3a8a] rounded-[2.5rem] border-[10px] border-slate-950 p-6 md:p-10 min-h-[420px] relative overflow-hidden flex flex-col justify-between shadow-inner">
                    
                    {/* Efecto Cristal */}
                    <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-transparent via-white/5 to-transparent pointer-events-none z-20"></div>
                    
                    {/* Header LCD */}
                    <div className="flex justify-between items-start relative z-10 border-b border-white/5 pb-4">
                        <div className="flex flex-col">
                            <div className="text-5xl font-mono text-white font-black tracking-tighter drop-shadow-[0_0_15px_rgba(59,130,246,0.6)]">
                                {time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                <span className="text-xl ml-1 text-blue-400 animate-pulse">{time.getSeconds() % 2 === 0 ? ':' : ''}</span>
                            </div>
                            <div className="text-[10px] text-blue-300 font-black uppercase tracking-[0.3em] mt-1">
                                {time.toLocaleDateString('es-VE', { weekday: 'long', day: 'numeric', month: 'short' })}
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                             <Wifi size={20} className="text-emerald-500 animate-pulse" />
                             <div className="w-3.5 h-3.5 bg-emerald-500 rounded-full shadow-[0_0_12px_#10b981]"></div>
                        </div>
                    </div>

                    {/* Centro Dinámico LCD */}
                    <div className="flex-1 flex items-center justify-center relative z-10 py-8">
                        {status === 'idle' && (
                             <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
                                {config.logo ? (
                                    <div className="relative inline-block">
                                        <div className="absolute inset-0 bg-blue-500 blur-2xl opacity-10 animate-pulse"></div>
                                        <img 
                                            src={config.logo} 
                                            alt="Logo" 
                                            className="h-24 md:h-28 w-auto object-contain mx-auto relative z-10 drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]" 
                                        />
                                    </div>
                                ) : (
                                    <Shield size={80} className="text-blue-500/20 mx-auto" />
                                )}
                                <div className="space-y-1">
                                    <p className="text-blue-400 font-mono text-[11px] uppercase tracking-[0.4em] animate-pulse">IDENTIFICACIÓN BIOMÉTRICA</p>
                                    <p className="text-white/20 font-mono text-[9px] uppercase tracking-widest italic">ESPERANDO ACCIÓN...</p>
                                </div>
                             </div>
                        )}

                        {status === 'scanning' && (
                            <div className="flex flex-col items-center justify-center text-emerald-400">
                                <div className="relative">
                                    <ScanLine size={140} className="absolute -inset-8 text-emerald-500/30 animate-pulse" />
                                    <div className="relative animate-bounce">
                                        <Fingerprint size={100} className="text-emerald-500 shadow-[0_0_25px_rgba(16,185,129,0.4)]" />
                                    </div>
                                </div>
                                <p className="mt-8 font-mono text-xs uppercase font-black tracking-[0.4em] text-emerald-400 animate-pulse">PROCESANDO HUELLA...</p>
                            </div>
                        )}

                        {status === 'success_in' && (
                             <div className="text-center animate-in zoom-in duration-300">
                                 <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-500 shadow-[0_0_40px_rgba(16,185,129,0.4)] text-emerald-400">
                                     <LogIn size={48} className="ml-1" />
                                 </div>
                                 <h3 className="text-white font-black text-2xl mb-1 uppercase tracking-tight">{user?.firstName}</h3>
                                 <p className="text-emerald-400 font-mono text-xs uppercase font-black tracking-[0.3em]">ENTRADA REGISTRADA</p>
                             </div>
                        )}

                        {status === 'success_out' && (
                             <div className="text-center animate-in zoom-in duration-300">
                                 <div className="w-24 h-24 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-rose-500 shadow-[0_0_40px_rgba(244,63,94,0.4)] text-rose-400">
                                     <LogOut size={48} className="mr-1" />
                                 </div>
                                 <h3 className="text-white font-black text-2xl mb-1 uppercase tracking-tight">{user?.firstName}</h3>
                                 <p className="text-rose-400 font-mono text-xs uppercase font-black tracking-[0.3em]">SALIDA REGISTRADA</p>
                             </div>
                        )}

                        {status === 'late' && (
                             <div className="text-center animate-in zoom-in duration-300">
                                 <div className="w-24 h-24 bg-amber-500/20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-amber-500 shadow-[0_0_40px_rgba(245,158,11,0.4)] text-amber-400">
                                     <Clock size={48} />
                                 </div>
                                 <h3 className="text-white font-black text-2xl mb-1 uppercase tracking-tight">{user?.firstName}</h3>
                                 <p className="text-amber-400 font-mono text-xs uppercase font-black tracking-[0.3em]">ENTRADA CON RETARDO</p>
                             </div>
                        )}

                        {(status === 'error' || status === 'duplicate') && (
                             <div className="text-center animate-in shake duration-300 px-6">
                                 <div className="w-20 h-20 bg-rose-950/50 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-rose-600 shadow-[0_0_30px_rgba(225,29,72,0.4)] text-rose-500">
                                     <AlertTriangle size={40} />
                                 </div>
                                 <p className="text-white font-black text-lg mb-1 uppercase tracking-tight">{message}</p>
                             </div>
                        )}
                    </div>

                    {/* Footer LCD */}
                    <div className="border-t border-white/5 pt-4 flex justify-between items-center text-[9px] font-mono text-slate-500 font-black relative z-10">
                        <span className="flex items-center gap-2">
                            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></span>
                            BD SEGURA CONECTADA
                        </span>
                        <span className="uppercase tracking-widest">{config.institutionName}</span>
                    </div>
                </div>

                {/* CONTROLES FÍSICOS */}
                <div className="mt-8 space-y-6 px-2">
                    
                    {/* Ranura Cédula */}
                    <div className="bg-[#020617] rounded-2xl p-6 shadow-inner border border-slate-800 relative group">
                        <label className="absolute -top-3 left-6 px-3 bg-[#1e293b] text-[10px] text-blue-400 font-black uppercase tracking-[0.2em] border border-slate-700 rounded-lg">
                           PANEL NUMÉRICO
                        </label>
                        <div className="relative">
                            <input 
                                ref={inputRef}
                                type="text"
                                value={cedula}
                                onChange={(e) => setCedula(e.target.value.replace(/[^0-9]/g, ''))}
                                placeholder="CÉDULA DE IDENTIDAD"
                                className="w-full bg-black/40 border-2 border-slate-800 rounded-xl py-5 text-4xl font-mono text-emerald-400 tracking-[0.4em] outline-none focus:border-blue-700 transition-all text-center shadow-2xl placeholder:text-emerald-900/20"
                                autoFocus
                            />
                             <KeyRound className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-800 group-focus-within:text-blue-700 transition-colors" size={24} />
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="grid grid-cols-2 gap-6 pb-2">
                        <button
                            disabled={status !== 'idle'}
                            onClick={() => processTransaction('entry')}
                            className="h-24 bg-emerald-800 hover:bg-emerald-700 active:bg-emerald-900 disabled:opacity-50 text-white rounded-[1.5rem] shadow-[0_12px_0_rgb(6,78,59)] active:shadow-[0_4px_0_rgb(6,78,59)] active:translate-y-2 transition-all flex flex-col items-center justify-center gap-2 group border-t-2 border-emerald-500 ring-4 ring-emerald-950/80"
                        >
                            <LogIn size={36} className="group-hover:scale-110 transition-transform" />
                            <span className="font-black text-[11px] uppercase tracking-[0.2em]">Entrada</span>
                        </button>

                        <button
                            disabled={status !== 'idle'}
                            onClick={() => processTransaction('exit')}
                            className="h-24 bg-rose-800 hover:bg-rose-700 active:bg-rose-900 disabled:opacity-50 text-white rounded-[1.5rem] shadow-[0_12px_0_rgb(159,18,57)] active:shadow-[0_4px_0_rgb(159,18,57)] active:translate-y-2 transition-all flex flex-col items-center justify-center gap-2 group border-t-2 border-rose-500 ring-4 ring-rose-950/80"
                        >
                            <LogOut size={36} className="group-hover:scale-110 transition-transform" />
                            <span className="font-black text-[11px] uppercase tracking-[0.2em]">Salida</span>
                        </button>
                    </div>

                </div>
            </div>
        </div>

      </div>

      {/* MODAL PIN */}
      {showPinPrompt && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-slate-950/95 backdrop-blur-xl animate-in fade-in duration-500">
          <div className="bg-slate-900 border border-slate-800 rounded-[3rem] p-10 w-full max-w-sm shadow-2xl relative">
            <button 
                onClick={() => { setShowPinPrompt(false); setAdminPin(''); }}
                className="absolute top-8 right-8 text-slate-600 hover:text-white transition-colors"
            >
                <XCircle size={30} />
            </button>
            
            <div className="text-center space-y-3 mb-8">
              <div className="w-16 h-16 bg-blue-600/20 text-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-2xl border border-blue-600/20">
                <Lock size={32} />
              </div>
              <h3 className="text-2xl font-black text-white tracking-tight">Autorización</h3>
              <p className="text-[10px] text-slate-500 uppercase font-black tracking-[0.2em]">Ingrese PIN Institucional</p>
            </div>

            <form onSubmit={handleAdminExit} className="space-y-8">
              <input 
                type="password"
                maxLength={4}
                autoFocus
                placeholder="••••"
                value={adminPin}
                onChange={(e) => setAdminPin(e.target.value.replace(/\D/g, ''))}
                className="w-full bg-black/60 border-2 border-slate-800 rounded-2xl py-6 text-center text-5xl font-mono tracking-[0.5em] font-black text-white focus:border-blue-700 outline-none transition-all shadow-inner"
              />

              <button 
                  type="submit"
                  className="w-full bg-blue-700 hover:bg-blue-600 text-white py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all active:scale-95"
                >
                  Verificar y Salir
                </button>
            </form>
          </div>
        </div>
      )}

      {/* Estilos para animación de escaneo láser */}
      <style>{`
        @keyframes scan {
          0% { top: 0; }
          50% { top: 100%; }
          100% { top: 0; }
        }
      `}</style>
    </div>
  );
};

export default AttendanceKiosk;
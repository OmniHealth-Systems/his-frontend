import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Clock,
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Loader2,
  RefreshCw,
  Building,
  UserCheck
} from 'lucide-react';
import { turnosService } from '@/infrastructure/Services/turnos.service';

export default function TurnoPage() {
  const today = new Date();
  const [selectedDate, setSelectedDate] = useState(today);
  const [month, setMonth] = useState(today.getMonth());
  const [year, setYear] = useState(today.getFullYear());
  const [turnos, setTurnos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    fecha: formatDate(today),
    horaInicio: '08:00',
    horaFin: '13:00',
    lugar: 'Consultorio 101 - Sede Principal',
    doctorId: 1,
    doctorNombre: 'Dr. Alejandro Morales',
    estado: 'DISPONIBLE'
  });

  function formatDate(date) {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  const loadTurnos = async () => {
    try {
      setLoading(true);
      const data = await turnosService.obtenerTurnosPorMes(month + 1, year);
      setTurnos(data || []);
    } catch (err) {
      console.error('Error cargando turnos:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTurnos();
  }, [month, year]);

  const getDaysInMonth = (m, y) => {
    const date = new Date(y, m, 1);
    const days = [];
    while (date.getMonth() === m) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  };

  const getMonthName = (m) => {
    const months = [
      'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
      'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ];
    return months[m];
  };

  const handleMonthChange = (direction) => {
    if (direction === 'prev') {
      if (month === 0) {
        setMonth(11);
        setYear(year - 1);
      } else {
        setMonth(month - 1);
      }
    } else {
      if (month === 11) {
        setMonth(0);
        setYear(year + 1);
      } else {
        setMonth(month + 1);
      }
    }
  };

  const getTurnosForDate = (date) => {
    if (!date) return [];
    const dateStr = formatDate(date);
    return turnos.filter(t => t.fecha === dateStr || (t.fecha && t.fecha.startsWith(dateStr)));
  };

  const handleCreateTurno = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await turnosService.crearTurno({
        ...formData,
        doctorId: Number(formData.doctorId),
      });

      toast.success('Turno Médico Registrado', {
        description: `Turno para ${formData.fecha} guardado exitosamente.`,
      });

      setShowModal(false);
      loadTurnos();
    } catch (err) {
      // Handled by Sonner in apiClient
    } finally {
      setLoading(false);
    }
  };

  const handleCambiarEstado = async (turnoId, nuevoEstado) => {
    try {
      await turnosService.actualizarEstadoTurno(turnoId, nuevoEstado);
      toast.success(`Estado actualizado a: ${nuevoEstado}`);
      setTurnos(prev => prev.map(t => t.id === turnoId ? { ...t, estado: nuevoEstado } : t));
    } catch (err) {
      toast.error('No se pudo actualizar el estado del turno.');
    }
  };

  const daysInMonth = getDaysInMonth(month, year);
  const startDayIndex = new Date(year, month, 1).getDay(); // 0 is Sunday

  const turnosDelDia = getTurnosForDate(selectedDate);

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 mb-2 border border-sky-200">
            <Clock className="w-3.5 h-3.5 text-sky-600" /> Core Turnos & Guardias Médicas
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestión de Turnos Hospitalarios
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Programación de turnos médicos, guardias clínicas y cobertura por consultorio.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-all shadow-sm shadow-sky-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nuevo Turno</span>
          </button>
          <button
            onClick={loadTurnos}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Refrescar turnos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Grid: Calendario + Turnos del Día */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Calendario de Turnos */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          {/* Navegación de Mes */}
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-sky-600" />
              <h2 className="text-lg font-bold text-slate-900">
                {getMonthName(month)} {year}
              </h2>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => handleMonthChange('prev')}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleMonthChange('next')}
                className="p-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Días de la semana */}
          <div className="grid grid-cols-7 gap-1 text-center mb-2">
            {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(d => (
              <div key={d} className="py-1.5 text-xs font-bold uppercase tracking-wider text-slate-400">
                {d}
              </div>
            ))}
          </div>

          {/* Cuadrícula de días */}
          <div className="grid grid-cols-7 gap-1.5">
            {/* Espacios vacíos al inicio */}
            {Array.from({ length: startDayIndex }).map((_, i) => (
              <div key={`empty-${i}`} className="h-20 rounded-xl bg-slate-50/40" />
            ))}

            {/* Días del mes */}
            {daysInMonth.map(day => {
              const turnosDia = getTurnosForDate(day);
              const isSelected = formatDate(day) === formatDate(selectedDate);
              const isToday = formatDate(day) === formatDate(today);

              return (
                <button
                  key={day.toISOString()}
                  onClick={() => setSelectedDate(day)}
                  className={`h-20 p-2 rounded-xl text-left flex flex-col justify-between border transition-all ${
                    isSelected
                      ? 'border-sky-500 bg-sky-50/50 ring-2 ring-sky-500/20 shadow-xs'
                      : 'border-slate-100 hover:border-slate-300 bg-white hover:bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className={`text-xs font-bold ${isToday ? 'bg-sky-600 text-white px-1.5 py-0.5 rounded-full' : 'text-slate-700'}`}>
                      {day.getDate()}
                    </span>
                    {turnosDia.length > 0 && (
                      <span className="text-[10px] font-bold px-1 rounded bg-slate-100 text-slate-600">
                        {turnosDia.length}
                      </span>
                    )}
                  </div>

                  <div className="w-full space-y-0.5 overflow-hidden">
                    {turnosDia.slice(0, 2).map((t, idx) => (
                      <div
                        key={idx}
                        className={`text-[9px] font-semibold px-1 py-0.5 rounded truncate ${
                          t.estado === 'DISPONIBLE' ? 'bg-emerald-100 text-emerald-800' :
                          t.estado === 'OCUPADO' ? 'bg-amber-100 text-amber-800' :
                          'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {t.horaInicio ? `${t.horaInicio} ` : ''}{t.lugar || 'Consultorio'}
                      </div>
                    ))}
                    {turnosDia.length > 2 && (
                      <div className="text-[9px] text-slate-400 font-bold">
                        +{turnosDia.length - 2} más
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Detalle de Turnos del Día Seleccionado */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">
              Turnos para el {selectedDate.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short', year: 'numeric' })}
            </h2>
            <span className="text-xs text-slate-500">
              {turnosDelDia.length} turno(s) programado(s)
            </span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[500px]">
            {turnosDelDia.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <Clock className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p>No hay turnos programados para esta fecha.</p>
                <button
                  onClick={() => {
                    setFormData(prev => ({ ...prev, fecha: formatDate(selectedDate) }));
                    setShowModal(true);
                  }}
                  className="mt-3 text-sky-600 hover:text-sky-800 font-semibold text-xs"
                >
                  + Agregar Turno Aquí
                </button>
              </div>
            ) : (
              turnosDelDia.map(t => (
                <div
                  key={t.id}
                  className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                      <Building className="w-3.5 h-3.5 text-sky-600" />
                      <span>{t.lugar || 'Consultorio General'}</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      t.estado === 'DISPONIBLE' ? 'bg-emerald-100 text-emerald-800' :
                      t.estado === 'OCUPADO' ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {t.estado}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center justify-between">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {t.horaInicio || '08:00'} - {t.horaFin || '13:00'}
                    </span>
                    <span className="font-semibold text-slate-700">
                      {t.doctorNombre || `Médico #${t.doctorId || 1}`}
                    </span>
                  </div>

                  {/* Selector rápido de estado */}
                  <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] text-slate-500 font-medium">Cambiar Estado:</span>
                    <select
                      value={t.estado}
                      onChange={(e) => handleCambiarEstado(t.id, e.target.value)}
                      className="text-xs font-semibold p-1 rounded-lg border border-slate-200 bg-white"
                    >
                      <option value="DISPONIBLE">DISPONIBLE</option>
                      <option value="OCUPADO">OCUPADO</option>
                      <option value="CANCELADO">CANCELADO</option>
                      <option value="EN_CURSO">EN_CURSO</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Crear Nuevo Turno */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Programar Turno Clínico</h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTurno} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fecha del Turno</label>
                <input
                  type="date"
                  required
                  value={formData.fecha}
                  onChange={(e) => setFormData({ ...formData, fecha: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Inicio</label>
                  <input
                    type="time"
                    required
                    value={formData.horaInicio}
                    onChange={(e) => setFormData({ ...formData, horaInicio: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Hora Fin</label>
                  <input
                    type="time"
                    required
                    value={formData.horaFin}
                    onChange={(e) => setFormData({ ...formData, horaFin: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Lugar / Consultorio</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Consultorio 204 - Cardiología"
                  value={formData.lugar}
                  onChange={(e) => setFormData({ ...formData, lugar: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Médico Asignado</label>
                <input
                  type="text"
                  placeholder="Nombre del médico"
                  value={formData.doctorNombre}
                  onChange={(e) => setFormData({ ...formData, doctorNombre: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm shadow-sky-500/20 inline-flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Turno</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
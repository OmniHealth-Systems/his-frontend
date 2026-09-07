import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  User,
  Stethoscope,
  Calendar,
  Send,
  Download,
  CheckCircle2,
  Clock,
  Loader2,
  FileCheck
} from 'lucide-react';
import { reportesService } from '@/infrastructure/Services/reportes.service';

export default function InformesPage() {
  const [busqueda, setBusqueda] = useState({
    dniPaciente: '',
    fecha: '',
  });

  const [citas, setCitas] = useState([]);
  const [citaSeleccionada, setCitaSeleccionada] = useState(null);
  const [paciente, setPaciente] = useState(null);
  const [doctor, setDoctor] = useState(null);
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);

  const [formData, setFormData] = useState({
    citaId: '',
    diagnostico: '',
    tratamiento: '',
    observaciones: '',
    recomendaciones: '',
  });

  const handleBuscarCitas = async () => {
    try {
      setSearching(true);
      const citasEncontradas = await reportesService.buscarCitas(busqueda);
      setCitas(citasEncontradas);
      if (citasEncontradas.length === 0) {
        toast.info('No se encontraron citas con los filtros especificados.');
      } else {
        toast.success(`${citasEncontradas.length} cita(s) encontrada(s).`);
      }
    } catch (err) {
      toast.error('Error al buscar citas.');
    } finally {
      setSearching(false);
    }
  };

  useEffect(() => {
    handleBuscarCitas();
  }, []);

  const handleSeleccionarCita = async (cita) => {
    try {
      setLoading(true);
      setCitaSeleccionada(cita);
      setFormData(prev => ({ ...prev, citaId: cita.id }));

      // Cargar datos del paciente e historial
      const pacienteData = await reportesService.obtenerHistorialPaciente(cita.pacienteId);
      setPaciente(pacienteData.paciente);
      setHistorial(pacienteData.historial || []);

      // Cargar datos del doctor
      const doctorData = await reportesService.obtenerDatosDoctor(cita.doctorId);
      setDoctor(doctorData);

      toast.info(`Cita #${cita.id} seleccionada.`);
    } catch (err) {
      toast.error('Error al cargar detalles de la cita.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.citaId) {
      toast.warning('Seleccione una cita antes de generar el informe médico.');
      return;
    }

    try {
      setLoading(true);
      await reportesService.crearInforme({
        ...formData,
        pacienteId: citaSeleccionada?.pacienteId,
        doctorId: citaSeleccionada?.doctorId,
      });

      toast.success('Informe Médico Generado y Firmado', {
        description: `Informe registrado para el paciente ${paciente?.nombre || 'OK'}.`,
      });

      // Reset
      setFormData({
        citaId: '',
        diagnostico: '',
        tratamiento: '',
        observaciones: '',
        recomendaciones: '',
      });
      setCitaSeleccionada(null);
      setPaciente(null);
      setDoctor(null);
      setHistorial([]);
    } catch (err) {
      // Handled by Sonner in apiClient
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 mb-2 border border-sky-200">
          <FileText className="w-3.5 h-3.5 text-sky-600" /> Informes & Documentación Clínica
        </div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
          Generación de Informes Médicos
        </h1>
        <p className="text-sm text-slate-500 mt-0.5">
          Emisión formal de diagnósticos, plan terapéutico y prescripciones vinculadas a consultas previas.
        </p>
      </div>

      {/* Grid: Selección de Cita + Formulario de Informe */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Columna Izquierda: Buscador y Lista de Citas */}
        <div className="lg:col-span-5 space-y-6">
          {/* Tarjeta de Búsqueda */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h2 className="text-base font-bold text-slate-900">1. Seleccionar Cita Médica</h2>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Fecha de la Cita</label>
                <input
                  type="date"
                  value={busqueda.fecha}
                  onChange={(e) => setBusqueda({ ...busqueda, fecha: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <button
                type="button"
                onClick={handleBuscarCitas}
                disabled={searching}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors inline-flex items-center justify-center gap-2"
              >
                {searching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                <span>Buscar Citas Disponibles</span>
              </button>
            </div>

            {/* Listado de Citas */}
            <div className="pt-2 border-t border-slate-100 space-y-2 max-h-[360px] overflow-y-auto pr-1">
              {citas.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No se encontraron citas para los criterios ingresados.
                </p>
              ) : (
                citas.map((cita) => {
                  const isSelected = citaSeleccionada?.id === cita.id;
                  return (
                    <button
                      key={cita.id}
                      onClick={() => handleSeleccionarCita(cita)}
                      className={`w-full p-3 rounded-xl border text-left transition-all ${
                        isSelected
                          ? 'border-sky-500 bg-sky-50/60 ring-2 ring-sky-500/20 shadow-xs'
                          : 'border-slate-100 bg-slate-50/50 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-bold text-slate-900 mb-1">
                        <span>Cita #{cita.id}</span>
                        <span className="text-[10px] font-semibold text-sky-700 bg-sky-100 px-2 py-0.5 rounded-md">
                          {cita.estado}
                        </span>
                      </div>
                      <div className="text-xs text-slate-600 flex items-center gap-1 mb-1">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <span>{new Date(cita.fecha).toLocaleDateString()}</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">
                        {cita.motivo || 'Consulta Médica General'}
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Resumen del Paciente y Doctor */}
          {citaSeleccionada && (
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 pb-3 border-b border-slate-100 text-slate-900 font-bold text-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Detalles de Atención</span>
              </div>

              {paciente && (
                <div className="space-y-1 text-xs">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <User className="w-3.5 h-3.5 text-sky-600" />
                    <span>{paciente.nombre} {paciente.apellidos || ''}</span>
                  </div>
                  <p className="text-slate-500">DNI: {paciente.dni || 'Sin documento'}</p>
                </div>
              )}

              {doctor && (
                <div className="space-y-1 text-xs pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
                    <span>{doctor.nombreCompleto}</span>
                  </div>
                  <p className="text-slate-500">{doctor.especialidad} • CMP: {doctor.cmp}</p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Columna Derecha: Formulario del Informe Médico */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <FileCheck className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">
              2. Redacción del Informe Clínico
            </h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Diagnóstico Principal (CIE-10 / Juicio Clínico) *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Describa el diagnóstico clínico definitivo o presuntivo..."
                value={formData.diagnostico}
                onChange={(e) => setFormData({ ...formData, diagnostico: e.target.value })}
                disabled={!citaSeleccionada || loading}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Tratamiento e Indicaciones Farmacológicas *
              </label>
              <textarea
                required
                rows={3}
                placeholder="Prescripción de medicamentos, dosis, posología y duración..."
                value={formData.tratamiento}
                onChange={(e) => setFormData({ ...formData, tratamiento: e.target.value })}
                disabled={!citaSeleccionada || loading}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Observaciones y Evolución
              </label>
              <textarea
                rows={2}
                placeholder="Notas sobre el estado general del paciente..."
                value={formData.observaciones}
                onChange={(e) => setFormData({ ...formData, observaciones: e.target.value })}
                disabled={!citaSeleccionada || loading}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Recomendaciones y Control
              </label>
              <textarea
                rows={2}
                placeholder="Signos de alarma, dieta, descanso, próxima cita de control..."
                value={formData.recomendaciones}
                onChange={(e) => setFormData({ ...formData, recomendaciones: e.target.value })}
                disabled={!citaSeleccionada || loading}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm disabled:bg-slate-50 disabled:text-slate-400"
              />
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="submit"
                disabled={!citaSeleccionada || loading}
                className="py-3 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs transition-all shadow-md shadow-sky-500/20 inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                <span>Emitir Informe Médico</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
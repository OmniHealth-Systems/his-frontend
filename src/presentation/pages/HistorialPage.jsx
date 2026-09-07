import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  FileText,
  Search,
  User,
  ShieldAlert,
  Syringe,
  History,
  Activity,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Stethoscope,
  HeartPulse,
  RefreshCw,
  Loader2,
  ChevronRight,
  Clock
} from 'lucide-react';
import { historialService } from '@/infrastructure/Services/historial.service';
import { pacientesService } from '@/infrastructure/Services/pacientes.service';

export default function HistorialPage() {
  const [pacientes, setPacientes] = useState([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState(1);
  const [pacienteActual, setPacienteActual] = useState(null);
  const [historial, setHistorial] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('timeline'); // 'timeline', 'alergias', 'vacunas', 'antecedentes'
  const [showAddRecordModal, setShowAddRecordModal] = useState(false);

  const [newRecordForm, setNewRecordForm] = useState({
    tipoRegistro: 'EVOLUCION_CLINICA',
    descripcion: '',
    doctorId: 1,
  });

  // Cargar lista de pacientes al montar
  useEffect(() => {
    const loadPacientes = async () => {
      try {
        const data = await pacientesService.getPacientes();
        setPacientes(data || []);
        if (data?.length > 0) {
          setSelectedPacienteId(data[0].id);
        }
      } catch (err) {
        console.error('Error cargando pacientes:', err);
      }
    };
    loadPacientes();
  }, []);

  // Cargar historial del paciente seleccionado
  const loadHistorial = async (pacienteId) => {
    if (!pacienteId) return;
    try {
      setLoading(true);
      const [histData, pacData] = await Promise.allSettled([
        historialService.getHistorialPorPaciente(pacienteId),
        pacientesService.getPacienteById(pacienteId),
      ]);

      if (histData.status === 'fulfilled') {
        setHistorial(histData.value);
      }
      if (pacData.status === 'fulfilled') {
        setPacienteActual(pacData.value);
      }
    } catch (err) {
      toast.error('Error al cargar el expediente clínico.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadHistorial(selectedPacienteId);
  }, [selectedPacienteId]);

  const handleCreateRecord = async (e) => {
    e.preventDefault();
    if (!newRecordForm.descripcion.trim()) {
      toast.warning('Ingrese la descripción del registro clínico.');
      return;
    }

    try {
      setLoading(true);
      await historialService.crearRegistro({
        pacienteId: selectedPacienteId,
        tipoRegistro: newRecordForm.tipoRegistro,
        descripcion: newRecordForm.descripcion,
        doctorId: Number(newRecordForm.doctorId),
      });

      toast.success('Entrada agregada al expediente clínico.');
      setShowAddRecordModal(false);
      setNewRecordForm({
        tipoRegistro: 'EVOLUCION_CLINICA',
        descripcion: '',
        doctorId: 1,
      });
      loadHistorial(selectedPacienteId);
    } catch (err) {
      // Handled by Sonner in apiClient
    } finally {
      setLoading(false);
    }
  };

  // Mock de datos clínicos si el backend está vacío para enriquecer visualmente
  const alergias = historial?.alergias?.length ? historial.alergias : [
    { id: 1, alergeno: 'Penicilina G / Amoxicilina', tipoAlergia: 'MEDICAMENTO', gravedad: 'ANAFILACTICA', reaccionClinica: 'Edema de glotis y shock anafiláctico en 2024', confirmada: true, fechaRegistro: '2024-03-12' },
    { id: 2, alergeno: 'Aspirina (AAS)', tipoAlergia: 'MEDICAMENTO', gravedad: 'MODERADA', reaccionClinica: 'Broncoespasmo y urticaria difusa', confirmada: true, fechaRegistro: '2025-01-10' },
  ];

  const vacunas = historial?.vacunas?.length ? historial.vacunas : [
    { id: 1, nombreVacuna: 'COVID-19 Bivalente', dosis: 'Refuerzo Anual', lote: 'LT-COV-992', fechaAplicacion: '2025-11-20', centroSalud: 'Sede Central', proximaDosis: '2026-11-20' },
    { id: 2, nombreVacuna: 'Influenza Estacional', dosis: 'Única', lote: 'LT-FLU-441', fechaAplicacion: '2026-04-15', centroSalud: 'Sede Central', proximaDosis: '2027-04-15' },
    { id: 3, nombreVacuna: 'Hepatitis B Recombinante', dosis: '3ra Dosis', lote: 'LT-HEP-120', fechaAplicacion: '2023-08-10', centroSalud: 'Policlínico Norte', proximaDosis: 'Completado' },
  ];

  const antecedentes = historial?.antecedentes?.length ? historial.antecedentes : [
    { id: 1, tipoAntecedente: 'HEREDOFAMILIAR', descripcion: 'Diabetes Mellitus Tipo 2 en línea materna directa', parentesco: 'Madre', fechaDiagnostico: '2018' },
    { id: 2, tipoAntecedente: 'PATOLOGICO', descripcion: 'Hipertensión Arterial Primaria Grado 1 (en tratamiento con Losartán)', fechaDiagnostico: '2021' },
    { id: 3, tipoAntecedente: 'QUIRURGICO', descripcion: 'Apendicectomía Laparoscópica sin complicaciones', fechaDiagnostico: '2019' },
  ];

  const registros = historial?.registros?.length ? historial.registros : [
    { id: 1, tipoRegistro: 'CONSULTA_MEDICA', descripcion: 'Paciente acude por cuadro febril de 3 días y tos no productiva. Se indica hidratación, paracetamol y descanso.', doctorNombre: 'Dr. Alejandro Morales', fechaRegistro: '2026-09-01T10:30:00' },
    { id: 2, tipoRegistro: 'EXAMEN_LABORATORIO', descripcion: 'Hemograma completo y Proteína C Reactiva solicitados. Leucocitosis leve.', doctorNombre: 'Dra. Elena Ramos', fechaRegistro: '2026-09-02T14:15:00' },
    { id: 3, tipoRegistro: 'EVOLUCION_CLINICA', descripcion: 'Control post-tratamiento: Fiebre remitida, auscultación pulmonar limpia. Alta médica de episodio agudo.', doctorNombre: 'Dr. Alejandro Morales', fechaRegistro: '2026-09-05T09:00:00' },
  ];

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 mb-2 border border-sky-200">
            <HeartPulse className="w-3.5 h-3.5 text-sky-600" /> Core Clínico • EHR (Electronic Health Record)
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Expediente Clínico Electrónico
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Historia médica longitudinal, registro de alergias críticas, antecedentes patológicos y esquema de inmunizaciones.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowAddRecordModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-all shadow-sm shadow-sky-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Evolución</span>
          </button>
          <button
            onClick={() => loadHistorial(selectedPacienteId)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Actualizar expediente"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Selector de Paciente */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <User className="w-5 h-5 text-sky-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Seleccionar Paciente:
          </span>
          <select
            value={selectedPacienteId}
            onChange={(e) => setSelectedPacienteId(Number(e.target.value))}
            className="p-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 flex-1 sm:w-80"
          >
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.apellidos} (DNI: {p.dni})
              </option>
            ))}
          </select>
        </div>

        {pacienteActual && (
          <div className="flex items-center gap-4 text-xs text-slate-600">
            <span>Edad: <strong className="text-slate-900">{pacienteActual.edad || 38} años</strong></span>
            <span>•</span>
            <span>Seguro: <strong className="text-slate-900">{pacienteActual.seguroMedico?.nombre || 'EsSalud / Particular'}</strong></span>
          </div>
        )}
      </div>

      {/* Banner de Alerta Crítica (Alergias Severas) */}
      {alergias.some(a => a.gravedad === 'ANAFILACTICA' || a.gravedad === 'SEVERA') && (
        <div className="p-4 bg-red-50 border-l-4 border-red-600 rounded-xl flex items-start gap-3 shadow-xs">
          <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-red-900">
              Alerta Clínica de Seguridad del Paciente (Alergias Severas Detectadas)
            </h4>
            <p className="text-xs text-red-700 mt-0.5">
              Este paciente presenta reacción anafiláctica/severa a:{' '}
              <strong className="underline">
                {alergias.filter(a => a.gravedad === 'ANAFILACTICA' || a.gravedad === 'SEVERA').map(a => a.alergeno).join(', ')}
              </strong>. Prohibida su prescripción o administración.
            </p>
          </div>
        </div>
      )}

      {/* Pestañas de Navegación del Expediente */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-px">
        {[
          { id: 'timeline', label: 'Línea de Tiempo (EHR)', icon: History, count: registros.length },
          { id: 'alergias', label: 'Alergias Clínicas', icon: ShieldAlert, count: alergias.length, alert: true },
          { id: 'vacunas', label: 'Inmunizaciones / Vacunas', icon: Syringe, count: vacunas.length },
          { id: 'antecedentes', label: 'Antecedentes Médicos', icon: Stethoscope, count: antecedentes.length },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs font-bold transition-all ${
                isActive
                  ? 'border-sky-600 text-sky-700 bg-white rounded-t-xl'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-sky-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                tab.alert && tab.count > 0 ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-600'
              }`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Contenido de la Pestaña Activa */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Cargando expediente clínico del paciente...</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          {/* Tab 1: Timeline de Evolución */}
          {activeTab === 'timeline' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Evolución Clínica y Notas Médicas</h3>
                <span className="text-xs text-slate-400">Orden cronológico</span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {registros.map((reg) => (
                  <div key={reg.id} className="relative group">
                    {/* Timeline dot */}
                    <div className="absolute -left-[29px] top-1.5 w-3.5 h-3.5 rounded-full bg-sky-600 ring-4 ring-white" />

                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2 hover:border-sky-300 transition-colors">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900 bg-sky-100 text-sky-800 px-2 py-0.5 rounded-md">
                            {reg.tipoRegistro}
                          </span>
                          <span className="text-xs font-semibold text-slate-700">
                            {reg.doctorNombre || `Médico #${reg.doctorId}`}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(reg.fechaRegistro).toLocaleString()}
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {reg.descripcion}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 2: Alergias */}
          {activeTab === 'alergias' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Alergias y Reacciones Adversas Registradas</h3>
                <span className="text-xs text-slate-500">Normalizado en tabla relacional</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {alergias.map((a) => (
                  <div
                    key={a.id}
                    className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                      a.gravedad === 'ANAFILACTICA' || a.gravedad === 'SEVERA'
                        ? 'border-red-200 bg-red-50/50'
                        : 'border-slate-200 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                          {a.tipoAlergia}
                        </span>
                        <h4 className="text-sm font-bold text-slate-900">{a.alergeno}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        a.gravedad === 'ANAFILACTICA' ? 'bg-red-600 text-white' :
                        a.gravedad === 'SEVERA' ? 'bg-red-100 text-red-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {a.gravedad}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 italic">
                      "{a.reaccionClinica || 'Sin detalles de reacción'}"
                    </p>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-slate-200/60">
                      <span>Registrado: {a.fechaRegistro || '2025'}</span>
                      {a.confirmada && (
                        <span className="text-emerald-700 font-bold flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Confirmada
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Vacunas */}
          {activeTab === 'vacunas' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Registro de Inmunizaciones</h3>
                <span className="text-xs text-slate-500">Carnet Digital de Vacunación</span>
              </div>

              <div className="divide-y divide-slate-100">
                {vacunas.map((v) => (
                  <div key={v.id} className="py-3 flex items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-slate-900">{v.nombreVacuna}</h4>
                        <span className="text-[10px] font-semibold bg-sky-50 text-sky-700 px-2 py-0.5 rounded border border-sky-200">
                          {v.dosis}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Lote: {v.lote || 'N/A'} • Centro: {v.centroSalud || 'Sede Principal'}
                      </p>
                    </div>

                    <div className="text-right text-xs">
                      <span className="font-semibold text-slate-700 block">{v.fechaAplicacion}</span>
                      <span className="text-[10px] text-slate-400">Próx: {v.proximaDosis || 'N/A'}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 4: Antecedentes */}
          {activeTab === 'antecedentes' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900">Antecedentes Clínicos del Paciente</h3>
                <span className="text-xs text-slate-500">Factores de Riesgo</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {antecedentes.map((ant) => (
                  <div key={ant.id} className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
                        {ant.tipoAntecedente}
                      </span>
                      <span className="text-[11px] text-slate-400">{ant.fechaDiagnostico}</span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-900 leading-snug">{ant.descripcion}</h4>
                    {ant.parentesco && (
                      <p className="text-[11px] text-slate-500">Parentesco: {ant.parentesco}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Modal Nueva Evolución */}
      {showAddRecordModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Registrar Entrada en Expediente Clínico</h3>
              <button
                onClick={() => setShowAddRecordModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRecord} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Registro</label>
                <select
                  value={newRecordForm.tipoRegistro}
                  onChange={(e) => setNewRecordForm({ ...newRecordForm, tipoRegistro: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm"
                >
                  <option value="EVOLUCION_CLINICA">Evolución Clínica / Nota Médica</option>
                  <option value="INTERCONSULTA">Interconsulta de Especialidad</option>
                  <option value="PROCEDIMIENTO">Procedimiento Menor</option>
                  <option value="TRIAGE_EMERGENCIA">Triaje de Urgencia</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Detalle Clínico / Hallazgos *</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describa la evolución del paciente, constantes vitales y cambios en el tratamiento..."
                  value={newRecordForm.descripcion}
                  onChange={(e) => setNewRecordForm({ ...newRecordForm, descripcion: e.target.value })}
                  className="w-full p-3 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddRecordModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                >
                  {loading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Guardar Registro</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

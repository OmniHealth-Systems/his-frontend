import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  CalendarClock,
  Search,
  User,
  UserCheck,
  Stethoscope,
  Clock,
  CreditCard,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Loader2
} from 'lucide-react';
import { citasService } from '@/infrastructure/Services/citas.service';

export default function CitasPage() {
  const [formData, setFormData] = useState({
    medicoId: '',
    medicoNombre: '',
    dniPaciente: '',
    paciente: null,
    pacienteId: '',
    descripcion: '',
    servicioId: '',
    sobreTurno: false,
    observaciones: '',
    montoTotal: 50,
    pago: false,
    fecha: '',
    hora: '',
  });

  const [medicos, setMedicos] = useState([]);
  const [servicios, setServicios] = useState([]);
  const [horariosDisponibles, setHorariosDisponibles] = useState([]);
  const [citasList, setCitasList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchingDoc, setSearchingDoc] = useState(false);
  const [searchingPat, setSearchingPat] = useState(false);
  const [loadingHorarios, setLoadingHorarios] = useState(false);

  // Cargar catálogo de servicios y citas existentes
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const [servData, citData] = await Promise.allSettled([
        citasService.obtenerServicios(),
        citasService.getCitas(),
      ]);

      if (servData.status === 'fulfilled') {
        setServicios(servData.value || []);
        if (servData.value?.length > 0) {
          setFormData(prev => ({
            ...prev,
            servicioId: servData.value[0].id,
            montoTotal: servData.value[0].precio,
          }));
        }
      }

      if (citData.status === 'fulfilled') {
        setCitasList(citData.value || []);
      }
    } catch (err) {
      console.error('Error cargando datos iniciales:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  // Buscar médico por nombre
  const handleBuscarMedico = async () => {
    if (!formData.medicoNombre.trim()) {
      toast.warning('Ingrese el nombre o apellido del médico para buscar.');
      return;
    }

    try {
      setSearchingDoc(true);
      const data = await citasService.buscarMedicoPorNombre(formData.medicoNombre);
      setMedicos(data);
      if (data.length === 0) {
        toast.info('No se encontraron médicos con ese criterio.');
      } else {
        toast.success(`${data.length} médico(s) encontrado(s).`);
      }
    } catch (err) {
      toast.error('Error al buscar médicos.');
    } finally {
      setSearchingDoc(false);
    }
  };

  // Buscar paciente por DNI
  const handleBuscarPaciente = async () => {
    if (!formData.dniPaciente.trim()) {
      toast.warning('Ingrese el número de DNI del paciente.');
      return;
    }

    try {
      setSearchingPat(true);
      const paciente = await citasService.buscarPacientePorDNI(formData.dniPaciente);
      if (paciente) {
        setFormData(prev => ({
          ...prev,
          paciente,
          pacienteId: paciente.id,
        }));
        toast.success(`Paciente verificado: ${paciente.nombre} ${paciente.apellidos || ''}`);
      }
    } catch (err) {
      toast.error('Paciente no encontrado en el padrón hospitalario.');
    } finally {
      setSearchingPat(false);
    }
  };

  // Consultar disponibilidad del médico
  const handleVerDisponibilidad = async (doctorId, fecha) => {
    const docId = doctorId || formData.medicoId;
    const date = fecha || formData.fecha;

    if (!docId || !date) return;

    try {
      setLoadingHorarios(true);
      const horarios = await citasService.obtenerDisponibilidadMedico(docId, date);
      setHorariosDisponibles(horarios);
      if (horarios.length > 0) {
        setFormData(prev => ({ ...prev, hora: horarios[0] }));
      }
    } catch (err) {
      console.error('Error obteniendo horarios:', err);
    } finally {
      setLoadingHorarios(false);
    }
  };

  // Cambio de servicio -> Actualizar monto
  const handleServicioChange = async (e) => {
    const servId = e.target.value;
    const serv = servicios.find(s => String(s.id) === String(servId));
    setFormData(prev => ({
      ...prev,
      servicioId: servId,
      montoTotal: serv ? serv.precio : 50.00,
    }));
  };

  // Envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.medicoId) {
      toast.warning('Debe seleccionar un médico tratante.');
      return;
    }
    if (!formData.pacienteId) {
      toast.warning('Debe buscar y seleccionar un paciente válido.');
      return;
    }
    if (!formData.fecha || !formData.hora) {
      toast.warning('Seleccione la fecha y franja horaria de atención.');
      return;
    }

    try {
      setLoading(true);
      const nuevaCita = await citasService.createCita({
        pacienteId: Number(formData.pacienteId),
        doctorId: Number(formData.medicoId),
        fecha: `${formData.fecha}T${formData.hora}:00`,
        hora: formData.hora,
        descripcion: formData.descripcion || 'Consulta Médica Programada',
        servicioId: formData.servicioId,
        sobreTurno: formData.sobreTurno,
        observaciones: formData.observaciones,
        monto: formData.montoTotal,
        pagado: formData.pago,
      });

      toast.success('Cita Médica Agendada con Éxito', {
        description: `Cita #${nuevaCita?.id || 'OK'} registrada para el ${formData.fecha} a las ${formData.hora}.`,
      });

      // Resetear formulario
      setFormData(prev => ({
        medicoId: '',
        medicoNombre: '',
        dniPaciente: '',
        paciente: null,
        pacienteId: '',
        descripcion: '',
        servicioId: servicios[0]?.id || '',
        sobreTurno: false,
        observaciones: '',
        montoTotal: servicios[0]?.precio || 50,
        pago: false,
        fecha: '',
        hora: '',
      }));
      setMedicos([]);
      setHorariosDisponibles([]);
      loadInitialData();
    } catch (err) {
      // Manejado automáticamente por interceptor de apiClient con Sonner
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 mb-2 border border-sky-200">
            <CalendarClock className="w-3.5 h-3.5 text-sky-600" /> Core Clínico • Agenda & Citas
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestión de Citas Médicas
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Agendamiento de consultas, verificación de disponibilidad médica en tiempo real y asignación de turnos.
          </p>
        </div>

        <button
          onClick={loadInitialData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Lista</span>
        </button>
      </div>

      {/* Grid Principal: Formulario + Listado */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Formulario de Registro de Cita */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center gap-2.5 pb-4 mb-5 border-b border-slate-100">
            <PlusCircle className="w-5 h-5 text-sky-600" />
            <h2 className="text-base font-bold text-slate-900">Programar Nueva Cita Médica</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Sección 1: Búsqueda de Paciente */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                1. Paciente (DNI / Documento) *
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Ingrese DNI del paciente..."
                    value={formData.dniPaciente}
                    onChange={(e) => setFormData({ ...formData, dniPaciente: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
                  />
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <button
                  type="button"
                  onClick={handleBuscarPaciente}
                  disabled={searchingPat}
                  className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shrink-0"
                >
                  {searchingPat ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Verificar</span>
                </button>
              </div>

              {formData.paciente && (
                <div className="mt-2.5 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>{formData.paciente.nombre} {formData.paciente.apellidos} (DNI: {formData.paciente.dni})</span>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md">
                    Habilitado
                  </span>
                </div>
              )}
            </div>

            {/* Sección 2: Selección de Médico */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                2. Médico Tratante *
              </label>
              <div className="flex gap-2 mb-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    placeholder="Buscar médico por nombre o especialidad..."
                    value={formData.medicoNombre}
                    onChange={(e) => setFormData({ ...formData, medicoNombre: e.target.value })}
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
                  />
                  <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
                <button
                  type="button"
                  onClick={handleBuscarMedico}
                  disabled={searchingDoc}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-colors inline-flex items-center gap-1.5 shrink-0"
                >
                  {searchingDoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                  <span>Buscar</span>
                </button>
              </div>

              {medicos.length > 0 && (
                <select
                  value={formData.medicoId}
                  onChange={(e) => {
                    const id = e.target.value;
                    setFormData({ ...formData, medicoId: id });
                    handleVerDisponibilidad(id, formData.fecha);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm font-medium"
                >
                  <option value="">-- Seleccione un médico de la lista --</option>
                  {medicos.map(med => (
                    <option key={med.id} value={med.id}>
                      {med.nombreCompleto} • {med.especialidad} (CMP: {med.cmp})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Sección 3: Fecha y Horario */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  3. Fecha de Atención *
                </label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={formData.fecha}
                  onChange={(e) => {
                    const date = e.target.value;
                    setFormData({ ...formData, fecha: date });
                    handleVerDisponibilidad(formData.medicoId, date);
                  }}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Franja Horaria *
                </label>
                {loadingHorarios ? (
                  <div className="flex items-center gap-2 p-2.5 rounded-xl border border-slate-200 text-xs text-slate-500 bg-slate-50">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-600" />
                    <span>Consultando slots...</span>
                  </div>
                ) : (
                  <select
                    value={formData.hora}
                    onChange={(e) => setFormData({ ...formData, hora: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
                    required
                  >
                    <option value="">Seleccione horario</option>
                    {horariosDisponibles.map(h => (
                      <option key={h} value={h}>{h} hrs</option>
                    ))}
                  </select>
                )}
              </div>
            </div>

            {/* Sección 4: Servicio y Motivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Tipo de Servicio
                </label>
                <select
                  value={formData.servicioId}
                  onChange={handleServicioChange}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
                >
                  {servicios.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} - S/. {Number(s.precio).toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                  Monto a Cobrar
                </label>
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-sm font-bold text-slate-900 flex items-center justify-between">
                  <span>Total Estimado:</span>
                  <span className="text-sky-600">S/. {Number(formData.montoTotal).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Motivo de Consulta */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5 uppercase tracking-wide">
                Motivo / Sintomatología
              </label>
              <textarea
                rows={2}
                placeholder="Breve descripción del motivo de la cita médica..."
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
              />
            </div>

            {/* Toggles: Sobre Turno y Pago en Caja */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-slate-50 rounded-xl border border-slate-200">
              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.sobreTurno}
                  onChange={(e) => setFormData({ ...formData, sobreTurno: e.target.checked })}
                  className="w-4 h-4 rounded text-sky-600 focus:ring-sky-500 border-slate-300"
                />
                <span>⚡ Sobre Turno / Urgencia</span>
              </label>

              <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.pago}
                  onChange={(e) => setFormData({ ...formData, pago: e.target.checked })}
                  className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
                />
                <span>💵 Pago Realizado en Caja</span>
              </label>
            </div>

            {/* Submit button */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm transition-all shadow-md shadow-sky-500/20 inline-flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CalendarClock className="w-4 h-4" />}
                <span>Confirmar y Agendar Cita</span>
              </button>
            </div>
          </form>
        </div>

        {/* Listado de Citas Recientes */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col">
          <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900">Agenda Activa ({citasList.length})</h2>
            <span className="text-xs font-semibold text-slate-400">Hoy</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 max-h-[600px] pr-1">
            {citasList.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-xs">
                <CalendarClock className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No hay citas agendadas actualmente.</p>
              </div>
            ) : (
              citasList.map((cita) => (
                <div
                  key={cita.id}
                  className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/60 hover:bg-slate-50 transition-colors space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-900">
                      Cita #{cita.id}
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-100 text-sky-800">
                      {cita.estado || 'CONFIRMADA'}
                    </span>
                  </div>

                  <div className="text-xs text-slate-600 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{new Date(cita.fecha).toLocaleString()}</span>
                  </div>

                  <div className="text-xs text-slate-700">
                    <span className="font-semibold">Paciente #{cita.pacienteId}</span> • Dr. #{cita.doctorId}
                  </div>

                  {cita.descripcion && (
                    <p className="text-[11px] text-slate-500 italic truncate">
                      "{cita.descripcion}"
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
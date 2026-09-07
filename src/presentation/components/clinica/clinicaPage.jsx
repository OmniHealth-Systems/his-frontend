import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Building2,
  Building,
  PlusCircle,
  Search,
  Edit2,
  Trash2,
  Info,
  MapPin,
  Phone,
  CheckCircle2,
  RefreshCw,
  Loader2,
  AlertTriangle
} from 'lucide-react';
import { sedesService } from '@/infrastructure/Services/sedes.service';

export default function ClinicasPage() {
  const [sedes, setSedes] = useState([]);
  const [clinicas, setClinicas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [currentSedeId, setCurrentSedeId] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    especialidades: 'Medicina General, Pediatría, Cardiología',
    clinicaId: '',
    estado: 'ACTIVA',
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [sedesData, clinicasData] = await Promise.allSettled([
        sedesService.obtenerSedes(),
        sedesService.obtenerClinicas(),
      ]);

      if (sedesData.status === 'fulfilled') {
        setSedes(sedesData.value || []);
      }
      if (clinicasData.status === 'fulfilled') {
        setClinicas(clinicasData.value || []);
        if (clinicasData.value?.length > 0 && !formData.clinicaId) {
          setFormData(prev => ({ ...prev, clinicaId: clinicasData.value[0].id }));
        }
      }
    } catch (err) {
      console.error('Error cargando sedes y clínicas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredSedes = sedes.filter((s) => {
    const term = searchTerm.toLowerCase();
    return (
      (s.nombre && s.nombre.toLowerCase().includes(term)) ||
      (s.direccion && s.direccion.toLowerCase().includes(term)) ||
      (s.especialidades && s.especialidades.toLowerCase().includes(term))
    );
  });

  const handleOpenCreateModal = () => {
    setIsEditing(false);
    setCurrentSedeId(null);
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      especialidades: 'Medicina General, Pediatría, Cardiología',
      clinicaId: clinicas[0]?.id || '',
      estado: 'ACTIVA',
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (sede) => {
    setIsEditing(true);
    setCurrentSedeId(sede.id);
    setFormData({
      nombre: sede.nombre || '',
      direccion: sede.direccion || '',
      telefono: sede.telefono || '',
      especialidades: sede.especialidades || '',
      clinicaId: sede.clinicaId || (clinicas[0]?.id || ''),
      estado: sede.estado || 'ACTIVA',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      if (isEditing) {
        await sedesService.actualizarSede(currentSedeId, formData);
        toast.success('Sede hospitalaria actualizada con éxito.');
      } else {
        await sedesService.crearSede(formData);
        toast.success('Nueva sede registrada en la red hospitalaria.');
      }
      setShowModal(false);
      loadData();
    } catch (err) {
      // Handled by Sonner in apiClient
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteSede = async (sedeId) => {
    try {
      setLoading(true);
      await sedesService.eliminarSede(sedeId);
      toast.success('Sede hospitalaria eliminada.');
      setDeleteConfirmId(null);
      loadData();
    } catch (err) {
      toast.error('Error al eliminar la sede.');
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
            <Building2 className="w-3.5 h-3.5 text-sky-600" /> Administración • Red Hospitalaria
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Sedes y Complejos Hospitalarios
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Gestión de sucursales, disponibilidad física, especialidades autorizadas y teléfonos de contacto.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-all shadow-sm shadow-sky-500/20"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Sede</span>
          </button>
          <button
            onClick={loadData}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Refrescar lista"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Buscador */}
      <div className="relative">
        <input
          type="text"
          placeholder="Buscar sede por nombre, dirección o especialidad..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-3 bg-white rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm shadow-xs"
        />
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
      </div>

      {/* Grid de Sedes */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSedes.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-2xl border border-slate-200 text-center text-slate-400 text-sm">
            <Building className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p>No se encontraron sedes hospitalarias registradas.</p>
          </div>
        ) : (
          filteredSedes.map((sede) => (
            <div
              key={sede.id}
              className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                      <Building className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 leading-tight">
                        {sede.nombre}
                      </h3>
                      <span className="text-[11px] text-slate-400">
                        {sede.clinica?.nombre || 'Red OmniHIS'}
                      </span>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    sede.estado === 'ACTIVA' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                    'bg-slate-100 text-slate-600'
                  }`}>
                    {sede.estado || 'ACTIVA'}
                  </span>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{sede.direccion}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{sede.telefono || 'Sin teléfono'}</span>
                  </div>
                </div>

                {sede.especialidades && (
                  <div className="pt-2 border-t border-slate-100">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Especialidades
                    </span>
                    <p className="text-xs text-slate-700 line-clamp-2">
                      {sede.especialidades}
                    </p>
                  </div>
                )}
              </div>

              {/* Botones de acción */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEditModal(sede)}
                  className="p-2 rounded-lg text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-colors"
                  title="Editar sede"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setDeleteConfirmId(sede.id)}
                  className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                  title="Eliminar sede"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Crear/Editar Sede */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Editar Sede Hospitalaria' : 'Registrar Nueva Sede'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Nombre de la Sede *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Sede Norte - Complejo Los Olivos"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Dirección *</label>
                <input
                  type="text"
                  required
                  placeholder="Av. Principal 456"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Teléfono</label>
                  <input
                    type="text"
                    placeholder="+51 1 555-0100"
                    value={formData.telefono}
                    onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Estado</label>
                  <select
                    value={formData.estado}
                    onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm"
                  >
                    <option value="ACTIVA">ACTIVA</option>
                    <option value="INACTIVA">INACTIVA</option>
                    <option value="MANTENIMIENTO">MANTENIMIENTO</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Especialidades Disponibles</label>
                <input
                  type="text"
                  placeholder="Cardiología, Pediatría, Medicina Interna..."
                  value={formData.especialidades}
                  onChange={(e) => setFormData({ ...formData, especialidades: e.target.value })}
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
                  <span>{isEditing ? 'Guardar Cambios' : 'Registrar Sede'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmación de Eliminación */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-6 space-y-4 text-center">
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">¿Eliminar Sede Hospitalaria?</h3>
            <p className="text-xs text-slate-500">
              Esta acción no se puede deshacer. Se desvincularán los turnos asociados.
            </p>
            <div className="flex items-center justify-center gap-2 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDeleteSede(deleteConfirmId)}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-sm"
              >
                Sí, Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
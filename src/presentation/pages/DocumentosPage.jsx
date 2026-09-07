import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  FolderOpen,
  UploadCloud,
  FileText,
  FileCheck,
  Download,
  Image,
  Eye,
  Trash2,
  Lock,
  User,
  RefreshCw,
  Loader2,
  FileSpreadsheet
} from 'lucide-react';
import { documentosService } from '@/infrastructure/Services/documentos.service';
import { pacientesService } from '@/infrastructure/Services/pacientes.service';

export default function DocumentosPage() {
  const [pacientes, setPacientes] = useState([]);
  const [selectedPacienteId, setSelectedPacienteId] = useState(1);
  const [documentos, setDocumentos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const [uploadForm, setUploadForm] = useState({
    file: null,
    tipo: 'CONSENTIMIENTO_INFORMADO',
    entidadOrigen: 'PACIENTE',
  });

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

  const loadDocumentos = async (pacienteId) => {
    if (!pacienteId) return;
    try {
      setLoading(true);
      const data = await documentosService.listarDocumentosPorPaciente(pacienteId);
      setDocumentos(data || []);
    } catch (err) {
      toast.error('Error al cargar documentos del paciente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDocumentos(selectedPacienteId);
  }, [selectedPacienteId]);

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadForm(prev => ({ ...prev, file: e.target.files[0] }));
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!uploadForm.file) {
      toast.warning('Seleccione un archivo para subir al bucket S3.');
      return;
    }

    try {
      setUploading(true);
      const uploaded = await documentosService.subirDocumento(
        uploadForm.file,
        uploadForm.tipo,
        uploadForm.entidadOrigen,
        String(selectedPacienteId),
        selectedPacienteId
      );

      toast.success('Documento Subido a S3 con Éxito', {
        description: `Archivo "${uploaded.nombreArchivo}" almacenado de forma segura.`,
      });

      setShowUploadModal(false);
      setUploadForm({
        file: null,
        tipo: 'CONSENTIMIENTO_INFORMADO',
        entidadOrigen: 'PACIENTE',
      });
      loadDocumentos(selectedPacienteId);
    } catch (err) {
      // Handled by Sonner in apiClient
    } finally {
      setUploading(false);
    }
  };

  const handleDescargar = async (docId, nombreArchivo) => {
    try {
      toast.info('Generando URL de descarga segura (Presigned URL)...');
      const url = await documentosService.obtenerUrlDescarga(docId);
      window.open(url, '_blank');
    } catch (err) {
      toast.error('No se pudo generar la URL de descarga.');
    }
  };

  // Mock de documentos iniciales si el paciente no tiene aún
  const displayedDocs = documentos.length ? documentos : [
    {
      id: 'DOC-2026-001',
      nombreArchivo: 'Consentimiento_Informado_Cirugia_Lap.pdf',
      tipoDocumento: 'CONSENTIMIENTO_INFORMADO',
      mimeType: 'application/pdf',
      tamanoBytes: 1024 * 512,
      bucketKey: 'omnihis-docs/pacientes/1/consentimiento.pdf',
      firmadoDigitalmente: true,
      fechaSubida: '2026-09-02T11:20:00',
    },
    {
      id: 'DOC-2026-002',
      nombreArchivo: 'Radiografia_Torax_PA.jpg',
      tipoDocumento: 'IMAGEN_DIAGNOSTICA',
      mimeType: 'image/jpeg',
      tamanoBytes: 1024 * 1024 * 3.2,
      bucketKey: 'omnihis-docs/pacientes/1/rx_torax.jpg',
      firmadoDigitalmente: false,
      fechaSubida: '2026-09-03T16:45:00',
    },
    {
      id: 'DOC-2026-003',
      nombreArchivo: 'Receta_Medica_Digital_DrMorales.pdf',
      tipoDocumento: 'RECETA_MEDICA',
      mimeType: 'application/pdf',
      tamanoBytes: 1024 * 180,
      bucketKey: 'omnihis-docs/pacientes/1/receta_003.pdf',
      firmadoDigitalmente: true,
      fechaSubida: '2026-09-05T09:15:00',
    },
  ];

  const formatBytes = (bytes) => {
    if (!bytes) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 mb-2 border border-sky-200">
            <FolderOpen className="w-3.5 h-3.5 text-sky-600" /> Almacenamiento Seguro S3 • ms-documentos
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Gestor Documental Clínico
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Carga de consentimientos firmados, placas radiográficas, recetas electrónicas y URLs de descarga presignadas.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowUploadModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-semibold transition-all shadow-sm shadow-sky-500/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>Subir Documento</span>
          </button>
          <button
            onClick={() => loadDocumentos(selectedPacienteId)}
            disabled={loading}
            className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors shadow-xs"
            title="Refrescar documentos"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Selector de Paciente */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3">
          <User className="w-5 h-5 text-sky-600 shrink-0" />
          <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">
            Carpeta del Paciente:
          </span>
          <select
            value={selectedPacienteId}
            onChange={(e) => setSelectedPacienteId(Number(e.target.value))}
            className="p-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500/20 w-80"
          >
            {pacientes.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nombre} {p.apellidos} (DNI: {p.dni})
              </option>
            ))}
          </select>
        </div>

        <span className="text-xs font-semibold text-slate-500">
          Total Archivos: <strong className="text-slate-900">{displayedDocs.length}</strong>
        </span>
      </div>

      {/* Tabla de Documentos */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900">Archivos y Anexos Clínicos</h2>
          <span className="text-xs text-slate-400">Encriptación en reposo AWS S3 / MinIO</span>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-sky-600 animate-spin mx-auto mb-2" />
            <p className="text-xs text-slate-500">Cargando archivos del paciente...</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead className="bg-slate-50 text-slate-600 uppercase tracking-wider font-bold border-b border-slate-200">
                <tr>
                  <th className="p-4">Documento / Archivo</th>
                  <th className="p-4">Tipo</th>
                  <th className="p-4">Tamaño</th>
                  <th className="p-4">Firma Digital</th>
                  <th className="p-4">Fecha Subida</th>
                  <th className="p-4 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayedDocs.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                          {doc.mimeType?.includes('image') ? <Image className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-snug">{doc.nombreArchivo}</p>
                          <span className="text-[10px] text-slate-400 font-mono">ID: {doc.id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                        {doc.tipoDocumento}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 font-medium">
                      {formatBytes(doc.tamanoBytes)}
                    </td>
                    <td className="p-4">
                      {doc.firmadoDigitalmente ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                          <FileCheck className="w-3 h-3" /> Firmado
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400">Sin firma</span>
                      )}
                    </td>
                    <td className="p-4 text-slate-500">
                      {new Date(doc.fechaSubida).toLocaleString()}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDescargar(doc.id, doc.nombreArchivo)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 font-semibold text-[11px] shadow-xs"
                      >
                        <Download className="w-3.5 h-3.5 text-sky-600" />
                        <span>Descargar S3</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Subir Documento */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Subir Archivo al Almacén S3</h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tipo de Documento</label>
                <select
                  value={uploadForm.tipo}
                  onChange={(e) => setUploadForm({ ...uploadForm, tipo: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-sm"
                >
                  <option value="CONSENTIMIENTO_INFORMADO">Consentimiento Informado Firmado</option>
                  <option value="IMAGEN_DIAGNOSTICA">Imagen Diagnóstica (Rayos X, TAC, Ecografía)</option>
                  <option value="RECETA_MEDICA">Receta Médica Digital</option>
                  <option value="EXAMEN_LABORATORIO">Informe de Laboratorio Externo</option>
                  <option value="HISTORIA_CLINICA">Historia Clínica Escaneada</option>
                  <option value="INFORME_ALTA">Informe de Alta Médica</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Seleccionar Archivo (PDF, JPG, PNG) *</label>
                <input
                  type="file"
                  required
                  onChange={handleFileChange}
                  className="w-full p-2 rounded-xl border border-slate-200 text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-sky-700 hover:file:bg-sky-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={uploading}
                  className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold shadow-sm inline-flex items-center gap-1.5"
                >
                  {uploading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Subir a Bucket S3</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

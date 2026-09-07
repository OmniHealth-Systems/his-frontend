// src/infrastructure/Services/documentos.service.ts
import apiClient from '../Config/apiClient';

export type TipoDocumento =
  | 'HISTORIA_CLINICA'
  | 'RECETA_MEDICA'
  | 'EXAMEN_LABORATORIO'
  | 'CONSENTIMIENTO_INFORMADO'
  | 'IMAGEN_DIAGNOSTICA'
  | 'INFORME_ALTA'
  | 'OTRO';

export interface DocumentoClinico {
  id: string;
  nombreArchivo: string;
  tipoDocumento: TipoDocumento;
  entidadOrigen: string;
  entidadId: string;
  pacienteId?: number;
  mimeType: string;
  tamanoBytes: number;
  bucketKey: string;
  urlDescarga?: string;
  firmadoDigitalmente?: boolean;
  hashIntegridad?: string;
  fechaSubida: string;
}

// Subir documento a S3 / MinIO
export const subirDocumento = async (
  file: File,
  tipo: TipoDocumento,
  entidadOrigen: string,
  entidadId: string,
  pacienteId?: number
): Promise<DocumentoClinico> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('tipo', tipo);
  formData.append('entidadOrigen', entidadOrigen);
  formData.append('entidadId', entidadId);
  if (pacienteId) {
    formData.append('pacienteId', String(pacienteId));
  }

  const response = await apiClient.post<DocumentoClinico>('/api/v1/documentos/subir', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
};

// Obtener documento por ID
export const obtenerDocumentoPorId = async (id: string): Promise<DocumentoClinico> => {
  const response = await apiClient.get<DocumentoClinico>(`/api/v1/documentos/${id}`);
  return response.data;
};

// Obtener URL presignada de descarga
export const obtenerUrlDescarga = async (id: string): Promise<string> => {
  const response = await apiClient.get<{ url: string }>(`/api/v1/documentos/${id}/url-descarga`);
  return response.data.url;
};

// Listar documentos por paciente
export const listarDocumentosPorPaciente = async (pacienteId: number): Promise<DocumentoClinico[]> => {
  try {
    const response = await apiClient.get<DocumentoClinico[]>(`/api/v1/documentos/paciente/${pacienteId}`);
    return response.data || [];
  } catch (error) {
    console.warn(`No se pudieron cargar documentos del paciente #${pacienteId}:`, error);
    return [];
  }
};

export const documentosService = {
  subirDocumento,
  obtenerDocumentoPorId,
  obtenerUrlDescarga,
  listarDocumentosPorPaciente,
};

export default documentosService;

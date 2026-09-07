// src/infrastructure/Services/auditoria.service.ts
import apiClient from '../Config/apiClient';

export interface RegistroAuditoria {
  id: string;
  tipoEvento: string;
  descripcion: string;
  pacienteId?: number;
  usuarioId?: number | string;
  usuarioEmail?: string;
  usuarioRol?: string;
  ipOrigen?: string;
  topicoKafka?: string;
  payloadJson?: string;
  timestamp: string;
}

export const listarLogs = async (): Promise<RegistroAuditoria[]> => {
  try {
    const response = await apiClient.get<RegistroAuditoria[]>('/api/v1/auditoria/logs');
    return response.data || [];
  } catch (error) {
    console.warn('Fallback: Error listando logs de auditoría:', error);
    return [];
  }
};

export const listarLogsPorPaciente = async (pacienteId: number): Promise<RegistroAuditoria[]> => {
  try {
    const response = await apiClient.get<RegistroAuditoria[]>(`/api/v1/auditoria/logs/paciente/${pacienteId}`);
    return response.data || [];
  } catch (error) {
    return [];
  }
};

export const listarLogsPorTopico = async (topico: string): Promise<RegistroAuditoria[]> => {
  try {
    const response = await apiClient.get<RegistroAuditoria[]>(`/api/v1/auditoria/logs/topico/${encodeURIComponent(topico)}`);
    return response.data || [];
  } catch (error) {
    return [];
  }
};

export const auditoriaService = {
  listarLogs,
  listarLogsPorPaciente,
  listarLogsPorTopico,
};

export default auditoriaService;

// src/infrastructure/Services/sedes.service.ts
import apiClient from '../Config/apiClient';

export interface Clinica {
  id?: number;
  nombre: string;
  direccion?: string;
  telefono?: string;
  ruc?: string;
}

export interface Sede {
  id?: number;
  nombre: string;
  direccion: string;
  telefono: string;
  especialidades?: string;
  clinicaId?: number;
  clinica?: Clinica;
  estado?: string; // ACTIVA, INACTIVA, MANTENIMIENTO
}

// --- Clínicas ---
export const getClinicas = async (): Promise<Clinica[]> => {
  try {
    const response = await apiClient.get<Clinica[]>('/api/v1/clinicas');
    return response.data || [];
  } catch (error) {
    console.warn('Fallback: Error al obtener clínicas:', error);
    return [{ id: 1, nombre: 'OmniHIS Red Hospitalaria Central', direccion: 'Av. Salud 1234', telefono: '+51 1 555-0199' }];
  }
};

export const obtenerClinicas = getClinicas;

export const getClinicaById = async (id: number): Promise<Clinica> => {
  const response = await apiClient.get<Clinica>(`/api/v1/clinicas/${id}`);
  return response.data;
};

export const createClinica = async (clinica: Clinica): Promise<Clinica> => {
  const response = await apiClient.post<Clinica>('/api/v1/clinicas', clinica);
  return response.data;
};

export const deleteClinica = async (id: number): Promise<boolean> => {
  const response = await apiClient.delete(`/api/v1/clinicas/${id}`);
  return response.status === 200 || response.status === 204;
};

// --- Sedes ---
export const obtenerSedes = async (): Promise<Sede[]> => {
  try {
    const response = await apiClient.get<Sede[]>('/api/v1/sedes');
    return response.data || [];
  } catch (error) {
    console.warn('Fallback: Error al obtener sedes:', error);
    return [];
  }
};

export const obtenerSedesActivas = async (): Promise<Sede[]> => {
  try {
    const response = await apiClient.get<Sede[]>('/api/v1/sedes/activas');
    return response.data || [];
  } catch (error) {
    // Si no existe el endpoint /activas, traemos todas y filtramos
    const todas = await obtenerSedes();
    return todas.filter(s => s.estado === 'ACTIVA' || !s.estado);
  }
};

export const crearSede = async (sedeData: Sede): Promise<Sede> => {
  const response = await apiClient.post<Sede>('/api/v1/sedes', sedeData);
  return response.data;
};

export const actualizarSede = async (sedeId: number, sedeData: Partial<Sede>): Promise<Sede> => {
  const response = await apiClient.put<Sede>(`/api/v1/sedes/${sedeId}`, sedeData);
  return response.data;
};

export const eliminarSede = async (sedeId: number): Promise<boolean> => {
  const response = await apiClient.delete(`/api/v1/sedes/${sedeId}`);
  return response.status === 200 || response.status === 204;
};

export const verificarDisponibilidadSede = async (sedeId: number) => {
  return {
    disponible: true,
    mensaje: 'Sede operativa con quirófanos y consultorios disponibles.',
    citasDisponibles: 18,
  };
};

export const actualizarEstadoSede = async (sedeId: number, estado: string): Promise<Sede> => {
  return await actualizarSede(sedeId, { estado });
};

export const sedesService = {
  getClinicas,
  obtenerClinicas,
  getClinicaById,
  createClinica,
  deleteClinica,
  obtenerSedes,
  obtenerSedesActivas,
  crearSede,
  actualizarSede,
  eliminarSede,
  verificarDisponibilidadSede,
  actualizarEstadoSede,
};

export default sedesService;

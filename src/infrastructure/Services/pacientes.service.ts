// src/infrastructure/Services/pacientes.service.ts
import apiClient from '../Config/apiClient';

export interface Paciente {
  id?: number;
  nombre: string;
  apellidos: string;
  edad?: number;
  email?: string;
  fechaNacimiento?: string;
  sexo?: string;
  estadoCivil?: string;
  telefono?: string;
  nacionalidad?: string;
  direccion?: {
    departamento?: string;
    provincia?: string;
    ciudad?: string;
  };
  tipoDocumento?: string;
  dni: string;
  contactoEmergencia?: string;
  seguroMedico?: {
    id?: number;
    nombre?: string;
    tipoSeguro?: string;
    descripcion?: string;
    cobertura?: string;
  };
}

export const getPacientes = async (): Promise<Paciente[]> => {
  try {
    const response = await apiClient.get<Paciente[]>('/api/v1/pacientes');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching pacientes:', error);
    throw new Error('No se pudo conectar con el servidor de pacientes.');
  }
};

export const getPacienteById = async (id: number): Promise<Paciente> => {
  try {
    const response = await apiClient.get<Paciente>(`/api/v1/pacientes/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching paciente ${id}:`, error);
    throw error;
  }
};

export const getPacienteByDni = async (dni: string): Promise<Paciente> => {
  try {
    const response = await apiClient.get<Paciente>(`/api/v1/pacientes/dni/${dni}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error fetching paciente por DNI ${dni}:`, error);
    throw error;
  }
};

export const createPaciente = async (paciente: Omit<Paciente, 'id'>): Promise<Paciente> => {
  try {
    const response = await apiClient.post<Paciente>('/api/v1/pacientes', paciente);
    return response.data;
  } catch (error: any) {
    console.error('Error creating paciente:', error);
    throw error;
  }
};

export const updatePaciente = async (id: number, paciente: Partial<Paciente>): Promise<Paciente> => {
  try {
    const response = await apiClient.put<Paciente>(`/api/v1/pacientes/${id}`, paciente);
    return response.data;
  } catch (error: any) {
    console.error('Error updating paciente:', error);
    throw error;
  }
};

export const deletePaciente = async (id: number): Promise<boolean> => {
  try {
    const response = await apiClient.delete(`/api/v1/pacientes/${id}`);
    return response.status === 200 || response.status === 204;
  } catch (error: any) {
    console.error('Error deleting paciente:', error);
    throw error;
  }
};

export const pacientesService = {
  getPacientes,
  getPacienteById,
  getPacienteByDni,
  createPaciente,
  updatePaciente,
  deletePaciente
};

export default pacientesService;

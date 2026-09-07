// src/infrastructure/Services/usuarios.service.ts
import apiClient from '../Config/apiClient';

// --- Medicos / Doctores ---
export const getMedicos = async () => {
  try {
    const response = await apiClient.get('/api/v1/doctores');
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener doctores/médicos:', error);
    throw new Error('Error al obtener médicos: ' + (error.response?.data?.message || error.message));
  }
};

export const getDoctores = getMedicos;

export const getMedicoById = async (id: number) => {
  try {
    const response = await apiClient.get(`/api/v1/doctores/${id}`);
    return response.data;
  } catch (error: any) {
    console.error(`Error al obtener doctor ${id}:`, error);
    throw error;
  }
};

export const createMedico = async (medico: any) => {
  try {
    const response = await apiClient.post('/api/v1/doctores', medico);
    return response.data;
  } catch (error: any) {
    console.error('Error al crear médico:', error);
    throw new Error('Error al crear médico: ' + (error.response?.data?.message || error.message));
  }
};

// --- Especialidades ---
export const getEspecialidades = async () => {
  try {
    const response = await apiClient.get('/api/v1/especialidades');
    return response.data;
  } catch (error: any) {
    console.error('Error al obtener especialidades:', error);
    throw new Error('Error al obtener especialidades: ' + (error.response?.data?.message || error.message));
  }
};

export const createEspecialidad = async (especialidad: any) => {
  try {
    const response = await apiClient.post('/api/v1/especialidades', especialidad);
    return response.data;
  } catch (error: any) {
    console.error('Error al crear especialidad:', error);
    throw new Error('Error al crear especialidad: ' + (error.response?.data?.message || error.message));
  }
};

export const deleteEspecialidad = async (id: number) => {
  try {
    const response = await apiClient.delete(`/api/v1/especialidades/${id}`);
    return response.data;
  } catch (error: any) {
    console.error('Error al eliminar especialidad:', error);
    throw new Error('Error al eliminar especialidad: ' + (error.response?.data?.message || error.message));
  }
};

export const usuariosService = {
  getMedicos,
  getDoctores,
  getMedicoById,
  createMedico,
  getEspecialidades,
  createEspecialidad,
  deleteEspecialidad
};

export default usuariosService;

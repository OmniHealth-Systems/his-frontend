// src/infrastructure/Services/turnos.service.ts
import apiClient from '../Config/apiClient';

export interface TurnoDTO {
  id?: number;
  doctorId?: number;
  doctorNombre?: string;
  fecha: string;
  horaInicio?: string;
  horaFin?: string;
  lugar?: string;
  estado: string; // DISPONIBLE, OCUPADO, CANCELADO, EN_CURSO
}

// Crear un nuevo turno
export const crearTurno = async (turnoData: TurnoDTO): Promise<TurnoDTO> => {
  const response = await apiClient.post<TurnoDTO>('/api/v1/turnos', turnoData);
  return response.data;
};

// Actualizar estado de un turno
export const actualizarEstadoTurno = async (turnoId: number, estado: string): Promise<boolean> => {
  const response = await apiClient.put(`/api/v1/turnos/${turnoId}/estado?estado=${encodeURIComponent(estado)}`);
  return response.status === 200 || response.status === 204;
};

// Obtener todos los turnos
export const obtenerTurnos = async (): Promise<TurnoDTO[]> => {
  try {
    const response = await apiClient.get<TurnoDTO[]>('/api/v1/turnos');
    return response.data || [];
  } catch (error) {
    console.warn('Fallback: Error al obtener turnos generales:', error);
    return [];
  }
};

// Obtener turnos filtrados por mes y año
export const obtenerTurnosPorMes = async (mes: number, anio: number): Promise<TurnoDTO[]> => {
  try {
    const response = await apiClient.get<TurnoDTO[]>(`/api/v1/turnos?mes=${mes}&anio=${anio}`);
    if (response.data && Array.isArray(response.data)) {
      return response.data;
    }
  } catch (error) {
    // Si no soporta filtro por query param, traemos todos y filtramos localmente
  }

  const allTurnos = await obtenerTurnos();
  const mesStr = String(mes).padStart(2, '0');
  const targetPrefix = `${anio}-${mesStr}`;
  return allTurnos.filter(t => t.fecha && t.fecha.startsWith(targetPrefix));
};

export const turnosService = {
  crearTurno,
  actualizarEstadoTurno,
  obtenerTurnos,
  obtenerTurnosPorMes,
};

export default turnosService;

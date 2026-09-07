// src/infrastructure/Services/soporte.service.ts
import apiClient from '../Config/apiClient';

export type PrioridadTicket = 'BAJA' | 'MEDIA' | 'ALTA' | 'CRITICA';
export type CategoriaTicket =
  | 'HARDWARE_MEDICO'
  | 'SOFTWARE_HIS'
  | 'RED_CONECTIVIDAD'
  | 'CUENTAS_ACCESOS'
  | 'IMPRESORAS_RECETAS'
  | 'OTRO';
export type EstadoTicket = 'ABIERTO' | 'EN_PROGRESO' | 'EN_ESPERA' | 'RESUELTO' | 'CERRADO';

export interface ComentarioTicket {
  id?: string;
  ticketId?: string;
  autorId?: number;
  autorNombre: string;
  autorRol?: string;
  mensaje: string;
  esInternoIT?: boolean;
  fechaCreacion?: string;
}

export interface TicketSoporte {
  id?: string;
  titulo: string;
  descripcion: string;
  prioridad: PrioridadTicket;
  categoria: CategoriaTicket;
  estado?: EstadoTicket;
  solicitanteId?: number;
  solicitanteNombre?: string;
  solicitanteRol?: string;
  tecnicoAsignadoId?: number;
  fechaCreacion?: string;
  fechaResolucion?: string;
  comentarios?: ComentarioTicket[];
}

export interface FAQ {
  id: string;
  pregunta: string;
  respuesta: string;
  categoria: string;
  orden?: number;
}

export const listarTickets = async (): Promise<TicketSoporte[]> => {
  try {
    const response = await apiClient.get<TicketSoporte[]>('/api/v1/soporte/tickets');
    return response.data || [];
  } catch (error) {
    console.warn('Fallback: Error listando tickets de soporte:', error);
    return [];
  }
};

export const listarTicketsPorSolicitante = async (solicitanteId: number): Promise<TicketSoporte[]> => {
  try {
    const response = await apiClient.get<TicketSoporte[]>(`/api/v1/soporte/tickets/solicitante/${solicitanteId}`);
    return response.data || [];
  } catch (error) {
    return [];
  }
};

export const obtenerTicket = async (id: string): Promise<TicketSoporte> => {
  const response = await apiClient.get<TicketSoporte>(`/api/v1/soporte/tickets/${id}`);
  return response.data;
};

export const crearTicket = async (ticket: TicketSoporte): Promise<TicketSoporte> => {
  const response = await apiClient.post<TicketSoporte>('/api/v1/soporte/tickets', ticket);
  return response.data;
};

export const cambiarEstadoTicket = async (id: string, nuevoEstado: EstadoTicket): Promise<TicketSoporte> => {
  const response = await apiClient.patch<TicketSoporte>(
    `/api/v1/soporte/tickets/${id}/estado`,
    null,
    {
      params: { nuevoEstado },
    }
  );
  return response.data;
};

export const agregarComentario = async (
  id: string,
  comentario: ComentarioTicket
): Promise<ComentarioTicket> => {
  const response = await apiClient.post<ComentarioTicket>(
    `/api/v1/soporte/tickets/${id}/comentarios`,
    comentario
  );
  return response.data;
};

export const listarFaqs = async (): Promise<FAQ[]> => {
  try {
    const response = await apiClient.get<FAQ[]>('/api/v1/soporte/faq');
    return response.data || [];
  } catch (error) {
    return [
      { id: '1', categoria: 'Acceso y Claves', pregunta: '¿Cómo restablecer mi contraseña en Auth0?', respuesta: 'Solicite el restablecimiento desde la pantalla de login o contacte a TI.' },
      { id: '2', categoria: 'Recetas y Farmacia', pregunta: '¿Cómo emitir una receta con deducción de stock?', respuesta: 'Desde el módulo de Consultas, agregue los medicamentos; Kafka notificará automáticamente a farmacia.' },
      { id: '3', categoria: 'Impresoras', pregunta: '¿No imprime el ticket de triaje?', respuesta: 'Verifique que el servicio de impresión térmica esté activo y conectado a la red local.' },
    ];
  }
};

export const soporteService = {
  listarTickets,
  listarTicketsPorSolicitante,
  obtenerTicket,
  crearTicket,
  cambiarEstadoTicket,
  agregarComentario,
  listarFaqs,
};

export default soporteService;

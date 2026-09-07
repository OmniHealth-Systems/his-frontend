// src/infrastructure/Services/citas.service.ts
import apiClient from '../Config/apiClient';

export interface CitaRequestDTO {
  pacienteId: number;
  doctorId: number;
  sedeId?: number;
  fecha: string;
  hora?: string;
  motivo?: string;
  descripcion?: string;
  servicioId?: number | string;
  sobreTurno?: boolean;
  observaciones?: string;
  monto?: number;
  pagado?: boolean;
}

export interface CitaResponseDTO {
  id: number;
  pacienteId: number;
  doctorId: number;
  sedeId?: number;
  fecha: string;
  hora?: string;
  estado: string;
  motivo?: string;
  descripcion?: string;
  monto?: number;
  pagado?: boolean;
}

export interface ServicioClinico {
  id: number;
  nombre: string;
  descripcion?: string;
  precio: number;
  duracionMinutos?: number;
}

// Catálogo base de servicios clínicos hospitalarios
const CATALOGO_SERVICIOS_DEFAULT: ServicioClinico[] = [
  { id: 1, nombre: 'Consulta Médica General', precio: 50.00, duracionMinutos: 30 },
  { id: 2, nombre: 'Consulta Especializada (Cardiología / Neurología)', precio: 90.00, duracionMinutos: 45 },
  { id: 3, nombre: 'Consulta Pediátrica', precio: 65.00, duracionMinutos: 30 },
  { id: 4, nombre: 'Evaluación Pre-Quirúrgica', precio: 120.00, duracionMinutos: 60 },
  { id: 5, nombre: 'Control y Seguimiento Post-Tratamiento', precio: 40.00, duracionMinutos: 20 },
];

// Obtener catálogo de servicios
export const obtenerServicios = async (): Promise<ServicioClinico[]> => {
  try {
    const response = await apiClient.get<ServicioClinico[]>('/api/v1/servicios');
    return response.data?.length ? response.data : CATALOGO_SERVICIOS_DEFAULT;
  } catch (error) {
    // Si el microservicio de catálogo no está activo, proveer fallback consistente
    return CATALOGO_SERVICIOS_DEFAULT;
  }
};

// Calcular monto por servicio
export const calcularMonto = async (servicioId: number | string): Promise<number> => {
  const servicios = await obtenerServicios();
  const servicio = servicios.find(s => String(s.id) === String(servicioId));
  return servicio ? servicio.precio : 50.00;
};

// Buscar médicos por nombre o especialidad
export const buscarMedicoPorNombre = async (termino: string) => {
  try {
    const response = await apiClient.get<any[]>('/api/v1/doctores');
    const doctores = response.data || [];
    const term = termino.toLowerCase();
    return doctores
      .filter((doc: any) =>
        (doc.nombreCompleto && doc.nombreCompleto.toLowerCase().includes(term)) ||
        (doc.nombre && doc.nombre.toLowerCase().includes(term)) ||
        (doc.apellido && doc.apellido.toLowerCase().includes(term)) ||
        (doc.especialidad && doc.especialidad.toLowerCase().includes(term))
      )
      .map((doc: any) => ({
        id: doc.id,
        nombreCompleto: doc.nombreCompleto || `${doc.nombre || ''} ${doc.apellido || ''}`.trim(),
        especialidad: doc.especialidad || 'Medicina General',
        cmp: doc.cmp || 'CMP-GEN',
      }));
  } catch (error) {
    console.error('Error buscando médicos:', error);
    return [];
  }
};

// Buscar paciente por DNI
export const buscarPacientePorDNI = async (dni: string) => {
  const response = await apiClient.get(`/api/v1/pacientes/dni/${dni}`);
  return response.data;
};

// Obtener disponibilidad de un médico en una fecha
export const obtenerDisponibilidadMedico = async (doctorId: number | string, fecha: string): Promise<string[]> => {
  try {
    const response = await apiClient.get<string[]>(
      `/api/v1/citas/disponibilidad/doctor/${doctorId}/fecha/${fecha}`
    );
    return response.data || [];
  } catch (error) {
    // Generar franjas horarias estándar si el endpoint de cálculo no responde
    return ['08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '15:00', '15:30', '16:00', '16:30'];
  }
};

// Crear una nueva cita médica
export const createCita = async (citaData: CitaRequestDTO): Promise<CitaResponseDTO> => {
  const response = await apiClient.post<CitaResponseDTO>('/api/v1/citas', citaData);
  return response.data;
};

// Obtener listado de todas las citas
export const getCitas = async (): Promise<CitaResponseDTO[]> => {
  const response = await apiClient.get<CitaResponseDTO[]>('/api/v1/citas');
  return response.data || [];
};

// Obtener cita por ID
export const getCitaById = async (id: number): Promise<CitaResponseDTO> => {
  const response = await apiClient.get<CitaResponseDTO>(`/api/v1/citas/${id}`);
  return response.data;
};

// Obtener citas por paciente
export const getCitasPorPaciente = async (pacienteId: number): Promise<CitaResponseDTO[]> => {
  const response = await apiClient.get<CitaResponseDTO[]>(`/api/v1/citas/paciente/${pacienteId}`);
  return response.data || [];
};

// Cancelar cita
export const cancelarCita = async (id: number): Promise<boolean> => {
  const response = await apiClient.put(`/api/v1/citas/${id}/cancelar`);
  return response.status === 200 || response.status === 204;
};

export const citasService = {
  obtenerServicios,
  calcularMonto,
  buscarMedicoPorNombre,
  buscarPacientePorDNI,
  obtenerDisponibilidadMedico,
  createCita,
  getCitas,
  getCitaById,
  getCitasPorPaciente,
  cancelarCita,
};

export default citasService;

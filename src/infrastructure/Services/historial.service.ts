// src/infrastructure/Services/historial.service.ts
import apiClient from '../Config/apiClient';

export interface Alergia {
  id?: number;
  pacienteId: number;
  alergeno: string;
  tipoAlergia: 'MEDICAMENTO' | 'ALIMENTO' | 'AMBIENTAL' | 'CONTACTO' | 'LATEX' | 'OTRO';
  gravedad: 'LEVE' | 'MODERADA' | 'SEVERA' | 'ANAFILACTICA';
  reaccionClinica?: string;
  confirmada?: boolean;
  doctorConfirmadorId?: number;
  fechaRegistro?: string;
}

export interface Vacuna {
  id?: number;
  pacienteId: number;
  nombreVacuna: string;
  dosis?: string;
  lote?: string;
  fechaAplicacion: string;
  centroSalud?: string;
  proximaDosis?: string;
}

export interface Antecedente {
  id?: number;
  pacienteId: number;
  tipoAntecedente: 'PATOLOGICO' | 'QUIRURGICO' | 'HEREDOFAMILIAR' | 'FARMACOLOGICO' | 'HABITO_NOCIVO' | 'OTRO';
  descripcion: string;
  parentesco?: string;
  fechaDiagnostico?: string;
  observaciones?: string;
}

export interface RegistroMedico {
  id?: number;
  tipoRegistro: string;
  descripcion: string;
  doctorId?: number;
  doctorNombre?: string;
  fechaRegistro?: string;
  datosEspecificos?: any;
}

export interface HistorialClinicoDTO {
  id?: number;
  pacienteId: number;
  fechaCreacion?: string;
  fechaUltimaActualizacion?: string;
  registros?: RegistroMedico[];
  alergias?: Alergia[];
  vacunas?: Vacuna[];
  antecedentes?: Antecedente[];
}

export const getHistorialPorPaciente = async (pacienteId: number): Promise<HistorialClinicoDTO> => {
  try {
    const response = await apiClient.get<HistorialClinicoDTO>(`/api/historial/paciente/${pacienteId}`);
    return response.data;
  } catch (error) {
    console.warn(`Fallback: No se pudo obtener historial del paciente #${pacienteId}:`, error);
    // Retornar estructura base en caso de paciente nuevo sin historial previo
    return {
      pacienteId,
      fechaCreacion: new Date().toISOString(),
      fechaUltimaActualizacion: new Date().toISOString(),
      registros: [],
      alergias: [],
      vacunas: [],
      antecedentes: [],
    };
  }
};

export const crearRegistro = async (registro: {
  pacienteId: number;
  tipoRegistro: string;
  descripcion: string;
  doctorId?: number;
  datosEspecificos?: any;
}): Promise<RegistroMedico> => {
  const response = await apiClient.post<RegistroMedico>('/api/registros', registro);
  return response.data;
};

export const historialService = {
  getHistorialPorPaciente,
  crearRegistro,
};

export default historialService;

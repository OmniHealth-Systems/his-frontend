import apiClient from '../Config/apiClient';

export interface SignosVitales {
  presionArterial?: string;
  frecuenciaCardiaca?: number;
  temperatura?: number;
  peso?: number;
  talla?: number;
  imc?: number;
  saturacionOxigeno?: number;
}

export interface Diagnostico {
  codigoCie10: string;
  descripcion: string;
  tipo?: string;
}

export interface Receta {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
  indicaciones?: string;
}

export interface ConsultaRequest {
  citaId?: number;
  pacienteId: number;
  doctorId: number;
  motivoConsulta: string;
  anamnesis?: string;
  examenFisico?: string;
  signosVitales?: SignosVitales;
  diagnosticos?: Diagnostico[];
  recetas?: Receta[];
  planTratamiento?: string;
  requiereExamenLaboratorio?: boolean;
  examenesSolicitados?: string;
}

export interface ConsultaResponse {
  id: number;
  citaId?: number;
  pacienteId: number;
  doctorId: number;
  fechaConsulta: string;
  motivoConsulta: string;
  anamnesis?: string;
  examenFisico?: string;
  signosVitales?: SignosVitales;
  diagnosticos: Diagnostico[];
  recetas: Receta[];
  planTratamiento?: string;
  requiereExamenLaboratorio: boolean;
  examenesSolicitados?: string;
  estado: string;
}

export const registrarConsulta = async (consulta: ConsultaRequest): Promise<ConsultaResponse> => {
  const response = await apiClient.post<ConsultaResponse>('/api/v1/consultas', consulta);
  return response.data;
};

export const getConsultas = async (): Promise<ConsultaResponse[]> => {
  const response = await apiClient.get<ConsultaResponse[]>('/api/v1/consultas');
  return response.data;
};

export const getConsultasByPaciente = async (pacienteId: number): Promise<ConsultaResponse[]> => {
  const response = await apiClient.get<ConsultaResponse[]>(`/api/v1/consultas/paciente/${pacienteId}`);
  return response.data;
};

export const consultasService = {
  registrarConsulta,
  getConsultas,
  getConsultasByPaciente,
};

export default consultasService;

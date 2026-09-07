import apiClient from '../Config/apiClient';

export interface ExamenCatalogo {
  id?: number;
  codigo: string;
  nombre: string;
  categoria: string;
  precio: number;
  descripcion?: string;
  tiempoEntregaHoras?: number;
  valoresReferenciaDefault?: string;
  activo?: boolean;
}

export interface DetalleOrden {
  id?: number;
  examen?: ExamenCatalogo;
  resultado?: string;
  valoresReferencia?: string;
  observaciones?: string;
  fechaResultado?: string;
  estado: string;
}

export interface OrdenLaboratorio {
  id: number;
  pacienteId: number;
  doctorId: number;
  consultaId?: number;
  fechaOrden: string;
  estado: string;
  indicacionesMuestra?: string;
  observacionesGenerales?: string;
  detalles: DetalleOrden[];
}

export interface ResultadoDTO {
  resultado: string;
  valoresReferencia?: string;
  observaciones?: string;
}

export const getCatalogoExamenes = async (): Promise<ExamenCatalogo[]> => {
  const response = await apiClient.get<ExamenCatalogo[]>('/api/v1/laboratorio/catalogo');
  return response.data;
};

export const getOrdenesLaboratorio = async (): Promise<OrdenLaboratorio[]> => {
  const response = await apiClient.get<OrdenLaboratorio[]>('/api/v1/laboratorio/ordenes');
  return response.data;
};

export const getOrdenesPendientes = async (): Promise<OrdenLaboratorio[]> => {
  const response = await apiClient.get<OrdenLaboratorio[]>('/api/v1/laboratorio/ordenes/pendientes');
  return response.data;
};

export const registrarResultado = async (
  ordenId: number,
  detalleId: number,
  resultado: ResultadoDTO
): Promise<OrdenLaboratorio> => {
  const response = await apiClient.put<OrdenLaboratorio>(
    `/api/v1/laboratorio/ordenes/${ordenId}/detalles/${detalleId}/resultado`,
    resultado
  );
  return response.data;
};

export const laboratorioService = {
  getCatalogoExamenes,
  getOrdenesLaboratorio,
  getOrdenesPendientes,
  registrarResultado,
};

export default laboratorioService;

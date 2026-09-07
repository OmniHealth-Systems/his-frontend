// src/infrastructure/Services/logistica.service.ts
import apiClient from '../Config/apiClient';

export type CategoriaInsumo =
  | 'DESCARTABLE'
  | 'QUIRURGICO'
  | 'EQUIPO'
  | 'REACTIVO'
  | 'HIGIENE'
  | 'PROTECCION_PERSONAL'
  | 'OTRO';

export type TipoMovimientoLogistica =
  | 'ENTRADA_COMPRA'
  | 'SALIDA_PACIENTE'
  | 'TRANSFERENCIA_SEDE'
  | 'MERMA_VENCIMIENTO'
  | 'AJUSTE_AUDITORIA';

export interface InsumoHospitalario {
  id?: number;
  codigo: string;
  nombre: string;
  categoria: CategoriaInsumo;
  stockActual: number;
  stockMinimo: number;
  unidadMedida: string; // Caja, Unidad, Frasco, Paquete x100
  ubicacionAlmacen?: string;
  sedeId?: number;
  precioUnitario?: number;
  activo?: boolean;
  fechaRegistro?: string;
}

export const listarInsumos = async (): Promise<InsumoHospitalario[]> => {
  try {
    const response = await apiClient.get<InsumoHospitalario[]>('/api/v1/logistica/insumos');
    return response.data || [];
  } catch (error) {
    console.warn('Fallback: Error obteniendo insumos de logística:', error);
    return [];
  }
};

export const listarPorSede = async (sedeId: number): Promise<InsumoHospitalario[]> => {
  try {
    const response = await apiClient.get<InsumoHospitalario[]>(`/api/v1/logistica/insumos/sede/${sedeId}`);
    return response.data || [];
  } catch (error) {
    return [];
  }
};

export const listarAlertasStockMinimo = async (): Promise<InsumoHospitalario[]> => {
  try {
    const response = await apiClient.get<InsumoHospitalario[]>('/api/v1/logistica/insumos/alertas');
    return response.data || [];
  } catch (error) {
    return [];
  }
};

export const registrarInsumo = async (insumo: InsumoHospitalario): Promise<InsumoHospitalario> => {
  const response = await apiClient.post<InsumoHospitalario>('/api/v1/logistica/insumos', insumo);
  return response.data;
};

export const registrarMovimiento = async (
  id: number,
  cantidad: number,
  tipo: TipoMovimientoLogistica,
  motivo?: string,
  sedeId?: number,
  usuarioId?: number
): Promise<InsumoHospitalario> => {
  const response = await apiClient.post<InsumoHospitalario>(
    `/api/v1/logistica/insumos/${id}/movimiento`,
    null,
    {
      params: {
        cantidad,
        tipo,
        motivo,
        sedeId,
        usuarioId,
      },
    }
  );
  return response.data;
};

export const logisticaService = {
  listarInsumos,
  listarPorSede,
  listarAlertasStockMinimo,
  registrarInsumo,
  registrarMovimiento,
};

export default logisticaService;

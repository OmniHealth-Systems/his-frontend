// src/infrastructure/Services/farmacia.service.ts
import apiClient from '../Config/apiClient';

export interface Medicamento {
  id?: number;
  codigo: string;
  nombre: string;
  principioActivo?: string;
  presentacion?: string;
  stockActual: number;
  stockMinimo: number;
  precioUnitario: number;
  lote?: string;
  fechaVencimiento?: string;
  activo?: boolean;
}

export interface MovimientoStockRequest {
  medicamentoId: number;
  cantidad: number;
  tipo: string; // ENTRADA_COMPRA, SALIDA_MANUAL, AJUSTE_INVENTARIO
  motivo?: string;
}

export interface DetalleVentaFarmacia {
  id?: string;
  medicamentoId: number;
  nombreMedicamento: string;
  codigoMedicamento?: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
}

export interface VentaFarmacia {
  id?: string;
  numeroTicket?: string;
  pacienteId?: number;
  pacienteNombre?: string;
  recetaId?: number;
  totalVenta: number;
  metodoPago: string; // EFECTIVO, TARJETA, YAPE, PLIN, TRANSFERENCIA
  estado?: string; // COMPLETADA, ANULADA
  fechaVenta?: string;
  detalles: DetalleVentaFarmacia[];
}

// --- Inventario de Medicamentos ---
export const getMedicamentos = async (): Promise<Medicamento[]> => {
  try {
    const response = await apiClient.get<Medicamento[]>('/api/v1/farmacia/medicamentos');
    return response.data || [];
  } catch (error) {
    console.warn('Fallback: Error obteniendo medicamentos de farmacia:', error);
    return [];
  }
};

export const getMedicamentoById = async (id: number): Promise<Medicamento> => {
  const response = await apiClient.get<Medicamento>(`/api/v1/farmacia/medicamentos/${id}`);
  return response.data;
};

export const createMedicamento = async (medicamento: Medicamento): Promise<Medicamento> => {
  const response = await apiClient.post<Medicamento>('/api/v1/farmacia/medicamentos', medicamento);
  return response.data;
};

export const registrarMovimientoStock = async (movimiento: MovimientoStockRequest): Promise<Medicamento> => {
  const response = await apiClient.post<Medicamento>('/api/v1/farmacia/movimientos', movimiento);
  return response.data;
};

// --- Punto de Venta (POS) ---
export const procesarVentaPOS = async (venta: VentaFarmacia): Promise<VentaFarmacia> => {
  const response = await apiClient.post<VentaFarmacia>('/api/v1/farmacia/pos/ventas', venta);
  return response.data;
};

export const listarVentasPOS = async (): Promise<VentaFarmacia[]> => {
  try {
    const response = await apiClient.get<VentaFarmacia[]>('/api/v1/farmacia/pos/ventas');
    return response.data || [];
  } catch (error) {
    console.warn('Fallback: Error listando ventas de farmacia POS:', error);
    return [];
  }
};

export const obtenerVentaPOSPorId = async (id: string): Promise<VentaFarmacia> => {
  const response = await apiClient.get<VentaFarmacia>(`/api/v1/farmacia/pos/ventas/${id}`);
  return response.data;
};

export const farmaciaService = {
  getMedicamentos,
  getMedicamentoById,
  createMedicamento,
  registrarMovimientoStock,
  procesarVentaPOS,
  listarVentasPOS,
  obtenerVentaPOSPorId,
};

export default farmaciaService;

import apiClient from '../Config/apiClient';

export interface ComprobantePago {
  id?: string;
  numeroComprobante?: string;
  tipoComprobante: string; // BOLETA, FACTURA
  pacienteId: number;
  citaId?: number;
  consultaId?: number;
  montoTotal: number;
  metodoPago: string; // EFECTIVO, TARJETA, YAPE, PLIN, TRANSFERENCIA
  estado?: string; // PENDIENTE, PAGADO, ANULADO
  descripcion?: string;
  fechaEmision?: string;
  fechaPago?: string;
}

export const getComprobantes = async (): Promise<ComprobantePago[]> => {
  const response = await apiClient.get<ComprobantePago[]>('/api/v1/facturacion/comprobantes');
  return response.data;
};

export const getComprobanteById = async (id: string): Promise<ComprobantePago> => {
  const response = await apiClient.get<ComprobantePago>(`/api/v1/facturacion/comprobantes/${id}`);
  return response.data;
};

export const emitirComprobante = async (comprobante: ComprobantePago): Promise<ComprobantePago> => {
  const response = await apiClient.post<ComprobantePago>('/api/v1/facturacion/comprobantes', comprobante);
  return response.data;
};

export const pagarComprobante = async (id: string, metodoPago: string): Promise<ComprobantePago> => {
  const response = await apiClient.post<ComprobantePago>(`/api/v1/facturacion/comprobantes/${id}/pagar`, {
    metodoPago
  });
  return response.data;
};

export const facturacionService = {
  getComprobantes,
  getComprobanteById,
  emitirComprobante,
  pagarComprobante
};

export default facturacionService;
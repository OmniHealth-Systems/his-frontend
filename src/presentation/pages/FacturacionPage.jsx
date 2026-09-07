import React, { useState, useEffect } from 'react';
import { getComprobantes, emitirComprobante, pagarComprobante } from '@/infrastructure/Services/facturacion.service';
import { emitNotification } from '@/presentation/shared/context/NotificationContext';

export default function FacturacionPage() {
  const [comprobantes, setComprobantes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showPayModal, setShowPayModal] = useState(false);
  const [selectedComp, setSelectedComp] = useState(null);
  const [metodoPagoSeleccionado, setMetodoPagoSeleccionado] = useState('TARJETA');

  const [formData, setFormData] = useState({
    pacienteId: 1,
    citaId: '',
    consultaId: '',
    tipoComprobante: 'BOLETA',
    montoTotal: 150.00,
    metodoPago: 'EFECTIVO',
    estado: 'PAGADO',
    descripcion: 'Consulta Médica Especializada y Medicamentos'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getComprobantes();
      setComprobantes(data || []);
    } catch (err) {
      console.error('Error fetching comprobantes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateComprobante = async (e) => {
    e.preventDefault();
    try {
      await emitirComprobante({
        ...formData,
        pacienteId: Number(formData.pacienteId),
        citaId: formData.citaId ? Number(formData.citaId) : undefined,
        consultaId: formData.consultaId ? Number(formData.consultaId) : undefined,
        montoTotal: Number(formData.montoTotal)
      });
      emitNotification('Comprobante emitido con éxito. Evento emitido a Confluent Kafka.', 'success');
      setShowModal(false);
      loadData();
    } catch (err) {
      // Handled by global interceptor
    }
  };

  const handlePagar = async (e) => {
    e.preventDefault();
    try {
      await pagarComprobante(selectedComp.id, metodoPagoSeleccionado);
      emitNotification(`Pago procesado para comprobante ${selectedComp.numeroComprobante}. Evento PagoRealizadoEvent emitido a Kafka.`, 'success');
      setShowPayModal(false);
      loadData();
    } catch (err) {
      // Handled by global interceptor
    }
  };

  const openPayModal = (comp) => {
    setSelectedComp(comp);
    setShowPayModal(true);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>💳 Core Finanzas: Facturación y Pagos</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Emisión de Comprobantes Electrónicos (Boletas/Facturas) y Emisión de Eventos a Kafka</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowModal(true)}
            style={{
              background: '#0284c7',
              color: 'white',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              border: 'none',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            + Emitir Comprobante
          </button>
          <button
            onClick={loadData}
            style={{
              background: '#f1f5f9',
              color: '#334155',
              padding: '0.65rem 1rem',
              borderRadius: '8px',
              border: '1px solid #cbd5e1',
              fontWeight: '600',
              cursor: 'pointer'
            }}
          >
            🔄 Refrescar
          </button>
        </div>
      </div>

      {loading ? (
        <p>Cargando comprobantes contables...</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Comprobante #</th>
                <th style={{ padding: '1rem' }}>Tipo</th>
                <th style={{ padding: '1rem' }}>Paciente ID</th>
                <th style={{ padding: '1rem' }}>Monto Total</th>
                <th style={{ padding: '1rem' }}>Método</th>
                <th style={{ padding: '1rem' }}>Fecha Emisión</th>
                <th style={{ padding: '1rem' }}>Estado</th>
                <th style={{ padding: '1rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {comprobantes.length === 0 ? (
                <tr>
                  <td colSpan="8" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No hay comprobantes de pago registrados aún.
                  </td>
                </tr>
              ) : (
                comprobantes.map((c) => (
                  <tr key={c.id || c.numeroComprobante} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>{c.numeroComprobante}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.2rem 0.5rem',
                        borderRadius: '4px',
                        fontSize: '0.8rem',
                        fontWeight: '600',
                        background: c.tipoComprobante === 'FACTURA' ? '#e0e7ff' : '#f1f5f9',
                        color: c.tipoComprobante === 'FACTURA' ? '#3730a3' : '#334155'
                      }}>
                        {c.tipoComprobante}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>Paciente #{c.pacienteId}</td>
                    <td style={{ padding: '1rem', fontWeight: 'bold', color: '#0f172a' }}>
                      S/. {Number(c.montoTotal).toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem' }}>{c.metodoPago || 'Por definir'}</td>
                    <td style={{ padding: '1rem', fontSize: '0.85rem' }}>
                      {c.fechaEmision ? new Date(c.fechaEmision).toLocaleString() : 'Reciente'}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.6rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '700',
                        background: c.estado === 'PAGADO' ? '#dcfce7' : '#fef3c7',
                        color: c.estado === 'PAGADO' ? '#166534' : '#92400e'
                      }}>
                        {c.estado === 'PAGADO' ? '✅ PAGADO (Kafka)' : '⏳ PENDIENTE'}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {c.estado === 'PENDIENTE' ? (
                        <button
                          onClick={() => openPayModal(c)}
                          style={{
                            background: '#10b981',
                            color: 'white',
                            border: 'none',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem',
                            fontWeight: '600'
                          }}
                        >
                          💵 Cobrar
                        </button>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.85rem' }}>✓ Completado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Emitir Comprobante */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Emitir Comprobante Contable</h2>
            <form onSubmit={handleCreateComprobante} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Tipo de Comprobante</label>
                  <select
                    value={formData.tipoComprobante}
                    onChange={(e) => setFormData({ ...formData, tipoComprobante: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    <option value="BOLETA">Boleta de Venta Electrónica</option>
                    <option value="FACTURA">Factura Electrónica</option>
                  </select>
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Paciente ID *</label>
                  <input
                    type="number"
                    required
                    value={formData.pacienteId}
                    onChange={(e) => setFormData({ ...formData, pacienteId: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Monto Total (S/.) *</label>
                  <input
                    type="number"
                    step="0.10"
                    required
                    value={formData.montoTotal}
                    onChange={(e) => setFormData({ ...formData, montoTotal: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Método de Pago</label>
                  <select
                    value={formData.metodoPago}
                    onChange={(e) => setFormData({ ...formData, metodoPago: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  >
                    <option value="EFECTIVO">Efectivo</option>
                    <option value="TARJETA">Tarjeta Débito/Crédito</option>
                    <option value="YAPE">Yape / Plin</option>
                    <option value="TRANSFERENCIA">Transferencia Bancaria</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Concepto / Descripción</label>
                <input
                  type="text"
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: 'none', background: '#0284c7', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  Emitir y Registrar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Cobrar Comprobante */}
      {showPayModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '450px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Procesar Cobro</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Comprobante <strong>{selectedComp?.numeroComprobante}</strong> - Monto: <strong>S/. {selectedComp?.montoTotal}</strong>
            </p>

            <form onSubmit={handlePagar} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Método de Cobro</label>
                <select
                  value={metodoPagoSeleccionado}
                  onChange={(e) => setMetodoPagoSeleccionado(e.target.value)}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="TARJETA">💳 Tarjeta Débito / Crédito</option>
                  <option value="YAPE">📱 Yape / Plin</option>
                  <option value="EFECTIVO">💵 Efectivo en Caja</option>
                  <option value="TRANSFERENCIA">🏦 Transferencia</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowPayModal(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: 'none', background: '#10b981', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  Confirmar Pago (Kafka)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
import React, { useState, useEffect } from 'react';
import { getMedicamentos, createMedicamento, registrarMovimientoStock } from '@/infrastructure/Services/farmacia.service';
import { emitNotification } from '@/presentation/shared/context/NotificationContext';

export default function FarmaciaPage() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showStockModal, setShowStockModal] = useState(false);
  const [selectedMed, setSelectedMed] = useState(null);

  const [newMedForm, setNewMedForm] = useState({
    codigo: '',
    nombre: '',
    principioActivo: '',
    presentacion: 'Tabletas 500mg',
    stockActual: 100,
    stockMinimo: 20,
    precioUnitario: 12.50,
    lote: 'LT-2026',
    fechaVencimiento: '2027-12-31'
  });

  const [stockForm, setStockForm] = useState({
    cantidad: 10,
    tipo: 'ENTRADA_COMPRA',
    motivo: 'Abastecimiento periódico de inventario'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const data = await getMedicamentos();
      setMedicamentos(data || []);
    } catch (err) {
      console.error('Error fetching farmacia:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateMed = async (e) => {
    e.preventDefault();
    try {
      await createMedicamento({
        ...newMedForm,
        stockActual: Number(newMedForm.stockActual),
        stockMinimo: Number(newMedForm.stockMinimo),
        precioUnitario: Number(newMedForm.precioUnitario)
      });
      emitNotification('Medicamento creado y registrado en inventario.', 'success');
      setShowAddModal(false);
      loadData();
    } catch (err) {
      // Error handled by apiClient interceptor
    }
  };

  const handleStockMovement = async (e) => {
    e.preventDefault();
    try {
      await registrarMovimientoStock({
        medicamentoId: selectedMed.id,
        cantidad: Number(stockForm.cantidad),
        tipo: stockForm.tipo,
        motivo: stockForm.motivo
      });
      emitNotification(`Movimiento de stock registrado para ${selectedMed.nombre}.`, 'success');
      setShowStockModal(false);
      loadData();
    } catch (err) {
      // Error handled by interceptor
    }
  };

  const openStockModal = (med) => {
    setSelectedMed(med);
    setStockForm({
      cantidad: 10,
      tipo: 'ENTRADA_COMPRA',
      motivo: 'Abastecimiento de stock'
    });
    setShowStockModal(true);
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>💊 Core Logística: Farmacia e Inventario</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Control de Stock, Trazabilidad de Lotes y Deducción Automática por Recetas (Kafka)</p>
        </div>
        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={() => setShowAddModal(true)}
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
            + Nuevo Medicamento
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
        <p>Cargando inventario de farmacia...</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Código</th>
                <th style={{ padding: '1rem' }}>Medicamento</th>
                <th style={{ padding: '1rem' }}>Presentación</th>
                <th style={{ padding: '1rem' }}>Stock Actual</th>
                <th style={{ padding: '1rem' }}>Precio Unit.</th>
                <th style={{ padding: '1rem' }}>Lote / Vencimiento</th>
                <th style={{ padding: '1rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {medicamentos.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No hay medicamentos registrados en farmacia.
                  </td>
                </tr>
              ) : (
                medicamentos.map((m) => {
                  const bajoStock = m.stockActual <= m.stockMinimo;
                  return (
                    <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '1rem', fontWeight: 'bold' }}>{m.codigo}</td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: '600', color: '#0f172a' }}>{m.nombre}</div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{m.principioActivo}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>{m.presentacion || 'N/A'}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{
                          padding: '0.25rem 0.6rem',
                          borderRadius: '6px',
                          fontSize: '0.85rem',
                          fontWeight: '700',
                          background: bajoStock ? '#fee2e2' : '#dcfce7',
                          color: bajoStock ? '#991b1b' : '#166534'
                        }}>
                          {m.stockActual} unid. {bajoStock && '⚠️ (Bajo Stock)'}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', fontWeight: '600' }}>S/. {Number(m.precioUnitario).toFixed(2)}</td>
                      <td style={{ padding: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
                        {m.lote || 'LT-GEN'} ({m.fechaVencimiento || '2027'})
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button
                          onClick={() => openStockModal(m)}
                          style={{
                            background: '#0ea5e9',
                            color: 'white',
                            border: 'none',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          📦 Ajustar Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Nuevo Medicamento */}
      {showAddModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '600px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '1rem' }}>Registrar Nuevo Medicamento</h2>
            <form onSubmit={handleCreateMed} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Código *</label>
                  <input
                    type="text"
                    required
                    value={newMedForm.codigo}
                    onChange={(e) => setNewMedForm({ ...newMedForm, codigo: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    placeholder="MED-001"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Nombre Comercial *</label>
                  <input
                    type="text"
                    required
                    value={newMedForm.nombre}
                    onChange={(e) => setNewMedForm({ ...newMedForm, nombre: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    placeholder="Amoxicilina 500mg"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Principio Activo</label>
                  <input
                    type="text"
                    value={newMedForm.principioActivo}
                    onChange={(e) => setNewMedForm({ ...newMedForm, principioActivo: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    placeholder="Amoxicilina Trihidrato"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Presentación</label>
                  <input
                    type="text"
                    value={newMedForm.presentacion}
                    onChange={(e) => setNewMedForm({ ...newMedForm, presentacion: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    placeholder="Caja x 30 tabletas"
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Stock Inicial</label>
                  <input
                    type="number"
                    value={newMedForm.stockActual}
                    onChange={(e) => setNewMedForm({ ...newMedForm, stockActual: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Stock Mínimo</label>
                  <input
                    type="number"
                    value={newMedForm.stockMinimo}
                    onChange={(e) => setNewMedForm({ ...newMedForm, stockMinimo: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Precio Unit. (S/.)</label>
                  <input
                    type="number"
                    step="0.10"
                    value={newMedForm.precioUnitario}
                    onChange={(e) => setNewMedForm({ ...newMedForm, precioUnitario: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: 'none', background: '#0284c7', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  Guardar Medicamento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Ajuste de Stock */}
      {showStockModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{ background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '480px' }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Movimiento de Inventario</h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Medicamento: <strong>{selectedMed?.nombre}</strong> (Stock actual: {selectedMed?.stockActual})
            </p>

            <form onSubmit={handleStockMovement} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Tipo de Movimiento</label>
                <select
                  value={stockForm.tipo}
                  onChange={(e) => setStockForm({ ...stockForm, tipo: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                >
                  <option value="ENTRADA_COMPRA">📥 Entrada por Compra / Proveedor</option>
                  <option value="SALIDA_MANUAL">📤 Salida Manual / Merma</option>
                  <option value="AJUSTE_INVENTARIO">⚙️ Ajuste de Auditoría Física</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Cantidad *</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockForm.cantidad}
                  onChange={(e) => setStockForm({ ...stockForm, cantidad: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Motivo</label>
                <input
                  type="text"
                  value={stockForm.motivo}
                  onChange={(e) => setStockForm({ ...stockForm, motivo: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  placeholder="Lote nuevo de laboratorio..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowStockModal(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: 'none', background: '#0284c7', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  Aplicar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

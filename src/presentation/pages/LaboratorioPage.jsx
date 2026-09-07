import React, { useState, useEffect } from 'react';
import { getOrdenesLaboratorio, registrarResultado } from '@/infrastructure/Services/laboratorio.service';

export default function LaboratorioPage() {
  const [ordenes, setOrdenes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrden, setSelectedOrden] = useState(null);
  const [selectedDetalle, setSelectedDetalle] = useState(null);
  const [showResultModal, setShowResultModal] = useState(false);
  const [resultadoForm, setResultadoForm] = useState({
    resultado: '',
    valoresReferencia: '',
    observaciones: ''
  });
  const [notification, setNotification] = useState(null);

  const loadOrdenes = async () => {
    try {
      setLoading(true);
      const data = await getOrdenesLaboratorio();
      setOrdenes(data || []);
    } catch (error) {
      console.error('Error fetching laboratory orders:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrdenes();
  }, []);

  const openResultModal = (orden, detalle) => {
    setSelectedOrden(orden);
    setSelectedDetalle(detalle);
    setResultadoForm({
      resultado: detalle.resultado || '',
      valoresReferencia: detalle.valoresReferencia || 'Valores estándar',
      observaciones: detalle.observaciones || ''
    });
    setShowResultModal(true);
  };

  const handleSaveResult = async (e) => {
    e.preventDefault();
    try {
      await registrarResultado(selectedOrden.id, selectedDetalle.id, resultadoForm);
      setNotification({
        type: 'success',
        message: `Resultado guardado para orden #${selectedOrden.id}.`
      });
      setShowResultModal(false);
      loadOrdenes();
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Error al registrar resultado de laboratorio.'
      });
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>🔬 Core Clínico: Laboratorio Clínico</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Gestión de Órdenes Asíncronas (Kafka Serverless) y Registro de Resultados</p>
        </div>
        <button
          onClick={loadOrdenes}
          style={{
            background: '#0ea5e9',
            color: 'white',
            padding: '0.65rem 1.25rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          🔄 Actualizar Órdenes
        </button>
      </div>

      {notification && (
        <div style={{
          padding: '1rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          background: notification.type === 'success' ? '#dcfce7' : '#fee2e2',
          color: notification.type === 'success' ? '#166534' : '#991b1b'
        }}>
          {notification.message}
        </div>
      )}

      {loading ? (
        <p>Cargando órdenes de laboratorio...</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem' }}>Orden #</th>
                <th style={{ padding: '1rem' }}>Fecha</th>
                <th style={{ padding: '1rem' }}>Paciente / Médico</th>
                <th style={{ padding: '1rem' }}>Origen</th>
                <th style={{ padding: '1rem' }}>Pruebas / Exámenes</th>
                <th style={{ padding: '1rem' }}>Estado</th>
                <th style={{ padding: '1rem' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {ordenes.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No hay órdenes de laboratorio pendientes en este momento.
                  </td>
                </tr>
              ) : (
                ordenes.map((o) => (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{o.id}</td>
                    <td style={{ padding: '1rem' }}>{new Date(o.fechaOrden).toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <div>Paciente #{o.pacienteId}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>Dr. #{o.doctorId}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {o.consultaId ? (
                        <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.2rem 0.5rem', borderRadius: '4px', fontSize: '0.8rem', fontWeight: '600' }}>
                          ⚡ Kafka Consulta #{o.consultaId}
                        </span>
                      ) : (
                        <span style={{ color: '#64748b', fontSize: '0.8rem' }}>Directa</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {o.detalles && o.detalles.length > 0 ? (
                        o.detalles.map((d) => (
                          <div key={d.id} style={{ marginBottom: '0.25rem', fontSize: '0.85rem' }}>
                            • <strong>{d.examen?.nombre || d.observaciones || 'Examen Clínico'}</strong>
                            {d.resultado ? ` (Res: ${d.resultado})` : ' (Pendiente)'}
                          </div>
                        ))
                      ) : (
                        <span style={{ color: '#94a3b8' }}>{o.indicacionesMuestra || 'Sin detalles'}</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{
                        padding: '0.25rem 0.5rem',
                        borderRadius: '6px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        background: o.estado === 'PENDIENTE' ? '#fef3c7' : o.estado === 'RESULTADOS_LISTOS' ? '#dcfce7' : '#e0e7ff',
                        color: o.estado === 'PENDIENTE' ? '#92400e' : o.estado === 'RESULTADOS_LISTOS' ? '#166534' : '#3730a3'
                      }}>
                        {o.estado}
                      </span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {o.detalles && o.detalles.length > 0 && o.detalles[0] && (
                        <button
                          onClick={() => openResultModal(o, o.detalles[0])}
                          style={{
                            background: '#0284c7',
                            color: 'white',
                            border: 'none',
                            padding: '0.4rem 0.8rem',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            fontSize: '0.85rem'
                          }}
                        >
                          📝 Cargar Resultado
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Carga de Resultados */}
      {showResultModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '500px'
          }}>
            <h2 style={{ fontSize: '1.3rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>
              Registrar Resultado de Examen
            </h2>
            <p style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '1rem' }}>
              Orden #{selectedOrden?.id} - {selectedDetalle?.examen?.nombre || selectedDetalle?.observaciones}
            </p>

            <form onSubmit={handleSaveResult} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Resultado Clínico *</label>
                <input
                  type="text"
                  required
                  value={resultadoForm.resultado}
                  onChange={(e) => setResultadoForm({ ...resultadoForm, resultado: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  placeholder="Ej. 95 mg/dL / Negativo / Normal"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Valores de Referencia</label>
                <input
                  type="text"
                  value={resultadoForm.valoresReferencia}
                  onChange={(e) => setResultadoForm({ ...resultadoForm, valoresReferencia: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  placeholder="Ej. 70 - 100 mg/dL"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Observaciones</label>
                <textarea
                  rows="2"
                  value={resultadoForm.observaciones}
                  onChange={(e) => setResultadoForm({ ...resultadoForm, observaciones: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  placeholder="Muestra procesada en condiciones óptimas..."
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowResultModal(false)}
                  style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #cbd5e1', background: 'white', cursor: 'pointer' }}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  style={{ padding: '0.5rem 1.5rem', borderRadius: '6px', border: 'none', background: '#0284c7', color: 'white', fontWeight: '600', cursor: 'pointer' }}
                >
                  Guardar Resultado
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

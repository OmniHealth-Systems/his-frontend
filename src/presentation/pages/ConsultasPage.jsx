import React, { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { getConsultas, registrarConsulta } from '@/infrastructure/Services/consultas.service';
import { getPacientes } from '@/infrastructure/Services/pacientes.service';
import { getDoctores } from '@/infrastructure/Services/usuarios.service';

export default function ConsultasPage() {
  const { user } = useAuth0();
  const [consultas, setConsultas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [doctores, setDoctores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [notification, setNotification] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    pacienteId: '',
    doctorId: '',
    motivoConsulta: '',
    anamnesis: '',
    examenFisico: '',
    planTratamiento: '',
    requiereExamenLaboratorio: false,
    examenesSolicitados: '',
    signosVitales: {
      presionArterial: '120/80',
      frecuenciaCardiaca: 72,
      temperatura: 36.5,
      peso: 70,
      talla: 170,
      saturacionOxigeno: 98
    },
    diagnosticos: [
      { codigoCie10: 'J00', descripcion: 'Rinofaringitis aguda [resfriado común]', tipo: 'DEFINITIVO' }
    ],
    recetas: [
      { medicamento: 'Paracetamol 500mg', dosis: '1 tableta', frecuencia: 'Cada 8 horas', duracion: '3 días', indicaciones: 'Tomar después de los alimentos' }
    ]
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [consultasData, pacientesData, doctoresData] = await Promise.allSettled([
        getConsultas(),
        getPacientes(),
        getDoctores()
      ]);

      if (consultasData.status === 'fulfilled') setConsultas(consultasData.value || []);
      if (pacientesData.status === 'fulfilled') setPacientes(pacientesData.value || []);
      if (doctoresData.status === 'fulfilled') setDoctores(doctoresData.value || []);
    } catch (error) {
      console.error('Error loading clinical data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        pacienteId: Number(formData.pacienteId),
        doctorId: Number(formData.doctorId)
      };
      await registrarConsulta(payload);
      setNotification({
        type: 'success',
        message: 'Consulta registrada correctamente. Si solicitó exámenes, se emitió el evento a Confluent Kafka.'
      });
      setShowModal(false);
      loadData();
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Error al registrar la consulta médica.'
      });
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '1200px', margin: '0 auto', fontFamily: 'system-ui, -apple-system, sans-serif' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 'bold', color: '#0f172a' }}>🩺 Core Clínico: Consultas Médicas</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem' }}>Diagnósticos CIE-10, Signos Vitales, Recetas y Solicitud Asíncrona de Exámenes</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          style={{
            background: '#0284c7',
            color: 'white',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            border: 'none',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          + Nueva Consulta Médica
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
        <p>Cargando historial de consultas...</p>
      ) : (
        <div style={{ background: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '1rem' }}>ID</th>
                <th style={{ padding: '1rem' }}>Fecha</th>
                <th style={{ padding: '1rem' }}>Paciente ID</th>
                <th style={{ padding: '1rem' }}>Médico ID</th>
                <th style={{ padding: '1rem' }}>Motivo</th>
                <th style={{ padding: '1rem' }}>Laboratorio</th>
                <th style={{ padding: '1rem' }}>Estado</th>
              </tr>
            </thead>
            <tbody>
              {consultas.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: '2rem', textAlign: 'center', color: '#94a3b8' }}>
                    No hay consultas registradas aún. ¡Crea la primera!
                  </td>
                </tr>
              ) : (
                consultas.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '1rem', fontWeight: 'bold' }}>#{c.id}</td>
                    <td style={{ padding: '1rem' }}>{new Date(c.fechaConsulta).toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>Paciente #{c.pacienteId}</td>
                    <td style={{ padding: '1rem' }}>Dr. #{c.doctorId}</td>
                    <td style={{ padding: '1rem' }}>{c.motivoConsulta}</td>
                    <td style={{ padding: '1rem' }}>
                      {c.requiereExamenLaboratorio ? (
                        <span style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                          ⚡ Solicitado (Kafka)
                        </span>
                      ) : (
                        <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>No requerido</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ background: '#dcfce7', color: '#166534', padding: '0.25rem 0.5rem', borderRadius: '6px', fontSize: '0.85rem' }}>
                        {c.estado}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Registro de Consulta */}
      {showModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
        }}>
          <div style={{
            background: 'white', padding: '2rem', borderRadius: '12px', width: '90%', maxWidth: '700px', maxHeight: '90vh', overflowY: 'auto'
          }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '1rem' }}>Registro de Consulta Médica</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Paciente ID *</label>
                  <input
                    type="number"
                    required
                    value={formData.pacienteId}
                    onChange={(e) => setFormData({ ...formData, pacienteId: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    placeholder="Ej. 1"
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Médico ID *</label>
                  <input
                    type="number"
                    required
                    value={formData.doctorId}
                    onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
                    style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    placeholder="Ej. 1"
                  />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Motivo de Consulta *</label>
                <input
                  type="text"
                  required
                  value={formData.motivoConsulta}
                  onChange={(e) => setFormData({ ...formData, motivoConsulta: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  placeholder="Ej. Fiebre persistente y malestar general"
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Anamnesis y Examen Físico</label>
                <textarea
                  rows="2"
                  value={formData.anamnesis}
                  onChange={(e) => setFormData({ ...formData, anamnesis: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  placeholder="Paciente refiere 3 días de evolución..."
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: '600', marginBottom: '0.25rem' }}>Plan de Tratamiento</label>
                <textarea
                  rows="2"
                  value={formData.planTratamiento}
                  onChange={(e) => setFormData({ ...formData, planTratamiento: e.target.value })}
                  style={{ width: '100%', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                  placeholder="Reposo e hidratación constante..."
                />
              </div>

              {/* Solicitar Examen de Laboratorio */}
              <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: '600', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.requiereExamenLaboratorio}
                    onChange={(e) => setFormData({ ...formData, requiereExamenLaboratorio: e.target.checked })}
                  />
                  🔬 Solicitar Exámenes de Laboratorio (Publica a Confluent Kafka)
                </label>
                {formData.requiereExamenLaboratorio && (
                  <input
                    type="text"
                    value={formData.examenesSolicitados}
                    onChange={(e) => setFormData({ ...formData, examenesSolicitados: e.target.value })}
                    style={{ width: '100%', marginTop: '0.5rem', padding: '0.5rem', border: '1px solid #cbd5e1', borderRadius: '6px' }}
                    placeholder="Ej. Hemograma Completo, Glucosa en Ayunas, Perfil Lipídico"
                  />
                )}
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1rem' }}>
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
                  Guardar y Emitir
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

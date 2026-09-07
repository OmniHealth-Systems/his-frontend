import React, { useState, useEffect } from 'react';
import { FaSearch, FaPlus, FaEdit, FaTrash, FaInfoCircle } from 'react-icons/fa';
import { sedesService } from '@/infrastructure/Services/sedes.service';
import '@/presentation/styles/clinica/añadirsede.css';

const Añadirsede = () => {
  const [sedes, setSedes] = useState([]);
  const [clinicas, setClinicas] = useState([]);
  const [formData, setFormData] = useState({
    nombre: '',
    direccion: '',
    telefono: '',
    especialidades: '',
    clinicaId: '',
    estado: 'ACTIVA'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [currentSedeId, setCurrentSedeId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [disponibilidad, setDisponibilidad] = useState({});

  // Cargar sedes y clínicas al inicio
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Simulación de llamadas a la API
        const sedesData = await sedesService.obtenerSedesActivas();
        const clinicasData = await sedesService.obtenerClinicas();
        
        setSedes(sedesData);
        setClinicas(clinicasData);
        
        // Si hay clínicas, seleccionar la primera por defecto en el formulario
        if (clinicasData.length > 0) {
          setFormData(prev => ({ ...prev, clinicaId: clinicasData[0].id }));
        }
      } catch (err) {
        setError('Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Manejar cambios en el formulario
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  // Filtrar sedes basado en el término de búsqueda
  const filteredSedes = sedes.filter(sede => 
    sede.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    sede.direccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (sede.clinica && sede.clinica.nombre.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Crear o actualizar sede
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      setLoading(true);
      if (isEditing) {
        // Actualizar sede existente
        const updatedSede = await sedesService.actualizarSede(currentSedeId, formData);
        setSedes(prev => prev.map(s => s.id === currentSedeId ? updatedSede : s));
      } else {
        // Crear nueva sede
        const newSede = await sedesService.crearSede(formData);
        setSedes(prev => [...prev, newSede]);
      }
      
      // Resetear formulario
      resetForm();
    } catch (err) {
      setError(err.message || 'Error al guardar la sede');
    } finally {
      setLoading(false);
    }
  };

  // Editar una sede existente
  const handleEdit = (sede) => {
    setFormData({
      nombre: sede.nombre,
      direccion: sede.direccion,
      telefono: sede.telefono,
      especialidades: sede.especialidades,
      clinicaId: sede.clinicaId,
      estado: sede.estado
    });
    setIsEditing(true);
    setCurrentSedeId(sede.id);
    setShowForm(true);
  };

  // Eliminar una sede
  const handleDelete = async (sedeId) => {
    if (!window.confirm('¿Está seguro de eliminar esta sede?')) return;
    
    try {
      setLoading(true);
      await sedesService.eliminarSede(sedeId);
      setSedes(prev => prev.filter(s => s.id !== sedeId));
    } catch (err) {
      setError('Error al eliminar la sede');
    } finally {
      setLoading(false);
    }
  };

  // Verificar disponibilidad de una sede
  const verificarDisponibilidad = async (sedeId) => {
    try {
      setLoading(true);
      const data = await sedesService.verificarDisponibilidadSede(sedeId);
      setDisponibilidad(prev => ({ ...prev, [sedeId]: data }));
    } catch (err) {
      setError('Error al verificar disponibilidad');
    } finally {
      setLoading(false);
    }
  };

  // Cambiar estado de una sede
  const cambiarEstadoSede = async (sedeId, nuevoEstado) => {
    try {
      setLoading(true);
      const updatedSede = await sedesService.actualizarEstadoSede(sedeId, nuevoEstado);
      setSedes(prev => prev.map(s => s.id === sedeId ? updatedSede : s));
    } catch (err) {
      setError('Error al actualizar el estado');
    } finally {
      setLoading(false);
    }
  };

  // Resetear formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      direccion: '',
      telefono: '',
      especialidades: '',
      clinicaId: clinicas.length > 0 ? clinicas[0].id : '',
      estado: 'ACTIVA'
    });
    setIsEditing(false);
    setCurrentSedeId(null);
    setShowForm(false);
  };

  return (
    <div className="sedes-container">
      <div className="sedes-header">
        <h1>Gestión de Sedes Clínicas</h1>
        <button 
          className="btn-new" 
          onClick={() => setShowForm(!showForm)}
        >
          <FaPlus /> {showForm ? 'Cancelar' : 'Nueva Sede'}
        </button>
      </div>
      
      {error && <div className="error-message">{error}</div>}
      
      {/* Formulario para crear/editar sedes */}
      {showForm && (
        <form onSubmit={handleSubmit} className="sedes-form">
          <h2>{isEditing ? 'Editar Sede' : 'Crear Nueva Sede'}</h2>
          
          <div className="form-group">
            <label>Nombre de la Sede</label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Dirección</label>
            <input
              type="text"
              name="direccion"
              value={formData.direccion}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Teléfono</label>
            <input
              type="text"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Especialidades (separadas por coma)</label>
            <input
              type="text"
              name="especialidades"
              value={formData.especialidades}
              onChange={handleChange}
              disabled={loading}
            />
          </div>
          
          <div className="form-group">
            <label>Clínica</label>
            <select
              name="clinicaId"
              value={formData.clinicaId}
              onChange={handleChange}
              required
              disabled={loading || clinicas.length === 0}
            >
              {clinicas.map(clinica => (
                <option key={clinica.id} value={clinica.id}>
                  {clinica.nombre}
                </option>
              ))}
            </select>
          </div>
          
          <div className="form-group">
            <label>Estado</label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              required
              disabled={loading}
            >
              <option value="ACTIVA">Activa</option>
              <option value="INACTIVA">Inactiva</option>
              <option value="MANTENIMIENTO">En Mantenimiento</option>
            </select>
          </div>
          
          <div className="form-actions">
            <button 
              type="button" 
              className="btn-cancel"
              onClick={resetForm}
              disabled={loading}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-submit"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (isEditing ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      )}
      
      {/* Búsqueda */}
      <div className="search-section">
        <div className="input-with-icon">
          <input
            type="text"
            placeholder="Buscar sedes por nombre, dirección o clínica..."
            value={searchTerm}
            onChange={handleSearch}
            disabled={loading}
          />
          <FaSearch />
        </div>
      </div>
      
      {/* Listado de sedes */}
      <div className="sedes-list">
        {loading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando sedes...</p>
          </div>
        ) : filteredSedes.length === 0 ? (
          <div className="no-results">
            <p>No se encontraron sedes</p>
          </div>
        ) : (
          <table className="sedes-table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Dirección</th>
                <th>Teléfono</th>
                <th>Clínica</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredSedes.map(sede => (
                <tr key={sede.id} className={sede.estado.toLowerCase()}>
                  <td>{sede.nombre}</td>
                  <td>{sede.direccion}</td>
                  <td>{sede.telefono}</td>
                  <td>{sede.clinica?.nombre || 'Sin clínica'}</td>
                  <td>
                    <span className={`status-badge ${sede.estado.toLowerCase()}`}>
                      {sede.estado}
                    </span>
                  </td>
                  <td className="actions">
                    <button 
                      className="btn-action btn-info"
                      onClick={() => verificarDisponibilidad(sede.id)}
                      title="Ver disponibilidad"
                    >
                      <FaInfoCircle />
                    </button>
                    
                    <button 
                      className="btn-action btn-edit"
                      onClick={() => handleEdit(sede)}
                      title="Editar"
                    >
                      <FaEdit />
                    </button>
                    
                    <button 
                      className="btn-action btn-delete"
                      onClick={() => handleDelete(sede.id)}
                      title="Eliminar"
                    >
                      <FaTrash />
                    </button>
                    
                    {disponibilidad[sede.id] && (
                      <div className="disponibilidad-popup">
                        <p><strong>Disponibilidad:</strong> {disponibilidad[sede.id].disponible ? 'Disponible' : 'No disponible'}</p>
                        {disponibilidad[sede.id].mensaje && (
                          <p>{disponibilidad[sede.id].mensaje}</p>
                        )}
                        {disponibilidad[sede.id].citasDisponibles !== undefined && (
                          <p>Citas disponibles: {disponibilidad[sede.id].citasDisponibles}</p>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Añadirsede;
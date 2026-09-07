// src/pages/EspecialidadesPage.jsx
import React, { useState, useEffect } from 'react';
import { 
 getEspecialidades, createEspecialidad, deleteEspecialidad } from '@/infrastructure/Services/usuarios.service';
import '@/presentation/styles/medico/Especialidades.css';

const EspecialidadesPage = () => {
  const [especialidades, setEspecialidades] = useState([]);
  const [filteredEspecialidades, setFilteredEspecialidades] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Estado para formulario
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: ''
  });

  // Cargar especialidades al montar el componente
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getEspecialidades();
        setEspecialidades(data);
        setFilteredEspecialidades(data);
        setError(null);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Filtrar especialidades cuando cambia el término de búsqueda
  useEffect(() => {
    if (!searchTerm) {
      setFilteredEspecialidades(especialidades);
    } else {
      const filtered = especialidades.filter(esp => 
        esp.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (esp.descripcion && esp.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      setFilteredEspecialidades(filtered);
    }
  }, [searchTerm, especialidades]);

  // Manejar cambios en el formulario
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Manejar envío del formulario
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación básica
    if (!formData.nombre.trim()) {
      setError('El nombre de la especialidad es requerido');
      return;
    }
    
    try {
      const newEspecialidad = await createEspecialidad(formData);
      setEspecialidades([...especialidades, newEspecialidad]);
      setFormData({ nombre: '', descripcion: '' });
      setShowForm(false);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Manejar eliminación de especialidad
  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de eliminar esta especialidad?')) {
      try {
        await deleteEspecialidad(id);
        setEspecialidades(especialidades.filter(esp => esp.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  // Manejar búsqueda
  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="especialidades-container">
      <div className="especialidades-header">
        <h1>Especialidades Médicas</h1>
        <button 
          className={`btn ${showForm ? 'btn-danger' : 'btn-success'}`}
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancelar' : 'Agregar Especialidad'}
        </button>
      </div>
      
      <div className="search-container">
        <input
          type="text"
          placeholder="Buscar especialidades..."
          className="search-input"
          value={searchTerm}
          onChange={handleSearch}
        />
        {searchTerm && (
          <button className="btn btn-clear" onClick={() => setSearchTerm('')}>
            Limpiar
          </button>
        )}
      </div>
      
      {error && <div className="alert alert-error">{error}</div>}
      
      {showForm && (
        <div className="form-container">
          <h2>Agregar Nueva Especialidad</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nombre de la Especialidad *</label>
              <input
                type="text"
                name="nombre"
                className="form-input"
                value={formData.nombre}
                onChange={handleInputChange}
                placeholder="Ej: Cardiología"
                required
              />
            </div>
            
            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                className="form-textarea"
                value={formData.descripcion}
                onChange={handleInputChange}
                placeholder="Descripción de la especialidad..."
              />
            </div>
            
            <div className="form-actions">
              <button 
                type="button" 
                className="btn btn-secondary"
                onClick={() => setShowForm(false)}
              >
                Cancelar
              </button>
              <button type="submit" className="btn btn-primary">
                Guardar Especialidad
              </button>
            </div>
          </form>
        </div>
      )}
      
      {loading ? (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Cargando especialidades médicas...</p>
        </div>
      ) : (
        <div className="especialidades-grid">
          {filteredEspecialidades.length === 0 ? (
            <div className="empty-state">
              {searchTerm ? (
                <p>No se encontraron especialidades para "{searchTerm}"</p>
              ) : (
                <p>No hay especialidades médicas registradas</p>
              )}
              <button className="btn btn-primary" onClick={() => setShowForm(true)}>
                Agregar primera especialidad
              </button>
            </div>
          ) : (
            filteredEspecialidades.map(especialidad => (
              <div key={especialidad.id} className="especialidad-card">
                <div className="card-header">
                  <h3>{especialidad.nombre}</h3>
                  <button 
                    className="btn btn-icon btn-danger"
                    onClick={() => handleDelete(especialidad.id)}
                    title="Eliminar especialidad"
                  >
                    ×
                  </button>
                </div>
                <div className="card-content">
                  <p>{especialidad.descripcion || 'Sin descripción disponible'}</p>
                  <div className="card-meta">
                    <span className="card-id">ID: {especialidad.id}</span>
                    <span className="card-date">
                      Creado: {new Date(especialidad.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default EspecialidadesPage;
// src/hooks/useMedicos.js
import { useState, useEffect } from 'react';
import { 
  getMedicos, 
  createMedico,
  getEspecialidades 
} from '@/infrastructure/Services/usuarios.service';

export const useMedicos = () => {
  const [medicos, setMedicos] = useState([]);
  const [filteredMedicos, setFilteredMedicos] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);

  // Filtros
  const [filters, setFilters] = useState({
    cmp: '',
    nombre: '',
    especialidadId: ''
  });

  // Cargar datos iniciales
  const loadData = async () => {
    setLoading(true);
    try {
      const [medicosData, especialidadesData] = await Promise.all([
        getMedicos(),
        getEspecialidades()
      ]);
      setMedicos(medicosData);
      setFilteredMedicos(medicosData);
      setEspecialidades(especialidadesData);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Aplicar filtros
  useEffect(() => {
    let result = medicos;
    
    if (filters.cmp) {
      result = result.filter(m => m.cmp && m.cmp.toLowerCase().includes(filters.cmp.toLowerCase()));
    }
    
    if (filters.nombre) {
      const nombreLower = filters.nombre.toLowerCase();
      result = result.filter(m => 
        (m.nombre && m.nombre.toLowerCase().includes(nombreLower)) || 
        (m.apellido && m.apellido.toLowerCase().includes(nombreLower))
      );
    }
    
    if (filters.especialidadId) {
      result = result.filter(m => m.especialidadId === parseInt(filters.especialidadId));
    }
    
    setFilteredMedicos(result);
  }, [medicos, filters]);

  // Registrar nuevo médico
  const addMedico = async (medicoData) => {
    try {
      const newMedico = await createMedico(medicoData);
      setMedicos(prev => [...prev, newMedico]);
      setShowForm(false);
      return true;
    } catch (err) {
      setError(err.message);
      return false;
    }
  };

  // Cambiar filtros
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  useEffect(() => {
    loadData();
  }, []);

  return {
    medicos: filteredMedicos,
    especialidades,
    loading,
    error,
    addMedico,
    showForm,
    setShowForm,
    filters,
    handleFilterChange,
    setError
  };
};
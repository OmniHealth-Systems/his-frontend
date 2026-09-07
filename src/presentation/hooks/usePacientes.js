import { useState, useEffect, useCallback } from 'react';
import { getPacientes, deletePaciente as deletePacienteService } from '@/infrastructure/Services/pacientes.service';

const usePacientes = () => {
  const [pacientes, setPacientes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alert, setAlert] = useState({
    show: false,
    type: "",
    message: "",
  });

  const fetchPacientes = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const pacientesData = await getPacientes();  // Usamos getPacientes con Axios
      setPacientes(pacientesData);
    } catch (err) {
      setError(err.message || "Error al cargar los pacientes");
      setAlert({ 
        show: true, 
        type: "error", 
        message: err.message || "Error al cargar los pacientes" 
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const deletePaciente = useCallback(async (id) => {
    try {
      await deletePacienteService(id);  // Usamos la función deletePaciente con Axios
      setPacientes(prev => prev.filter(p => p.id !== id));
      setAlert({ 
        show: true, 
        type: "success", 
        message: "Paciente eliminado correctamente" 
      });
      return true;
    } catch (error) {
      setAlert({ 
        show: true, 
        type: "error", 
        message: error.message || "Error al eliminar el paciente" 
      });
      return false;
    }
  }, []);

  useEffect(() => {
    fetchPacientes();  // Fetch de los pacientes cuando se carga el componente
  }, [fetchPacientes]);

  return { 
    pacientes, 
    loading, 
    error, 
    alert, 
    setAlert,
    deletePaciente,
    refreshPacientes: fetchPacientes
  };
};

export default usePacientes;

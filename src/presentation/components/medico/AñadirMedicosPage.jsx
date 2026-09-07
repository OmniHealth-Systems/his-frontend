import React, { useState } from 'react';
import { createMedico } from '@/infrastructure/Services/usuarios.service';
const AñadirMedicosPage = () => {
  const [medico, setMedico] = useState({
    nombreCompleto: '',
    cmp: '',
    especialidad: '',
    turno: '',
    disponibilidades: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMedico({
      ...medico,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const newMedico = await createMedico(medico);
      console.log('Médico añadido:', newMedico);
      // Aquí podrías redirigir al listado de médicos después de añadirlo
    } catch (error) {
      console.error('Error al añadir médico:', error);
    }
  };

  return (
    <div>
      <h1>Añadir Médico</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Nombre Completo</label>
          <input
            type="text"
            name="nombreCompleto"
            value={medico.nombreCompleto}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>CMP</label>
          <input
            type="text"
            name="cmp"
            value={medico.cmp}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Especialidad</label>
          <input
            type="text"
            name="especialidad"
            value={medico.especialidad}
            onChange={handleInputChange}
          />
        </div>
        <div>
          <label>Turno</label>
          <input
            type="text"
            name="turno"
            value={medico.turno}
            onChange={handleInputChange}
          />
        </div>
        <button type="submit">Añadir Médico</button>
      </form>
    </div>
  );
};

export default AñadirMedicosPage;
import React, { useState, useEffect } from 'react';
import { createPaciente } from '@/infrastructure/Services/pacientes.service';
import Alert from '@/presentation/common/Alert';
import '@/presentation/styles/paciente/AñadirPacientes.css';

const AñadirPacientesPage = ({ onSuccess, segurosMedicos }) => {
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        edad: '',
        email: '',
        fechaNacimiento: '',
        sexo: 'FEMENINO', // Valor predeterminado
        estadoCivil: 'SOLTERO',
        telefono: '',
        nacionalidad: '',
        direccion: '',
        tipoDocumento: 'DNI', // Valor predeterminado
        dni: '',
        contactoEmergencia: '',
        seguroMedico: null,
        departamento: '',
        provincia: '',
        ciudad: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [alert, setAlert] = useState({
        show: false,
        type: '',
        message: '',
    });

    const [provinciasDisponibles, setProvinciasDisponibles] = useState([]);
    const [segurosMedicosList, setSegurosMedicosList] = useState(segurosMedicos || []);  // Verifica la existencia de segurosMedicos

    // Cargar las provincias según el departamento
    const cargarProvincias = (departamento) => {
        if (departamento === 'Lima') {
            setProvinciasDisponibles(['Lima', 'Callao', 'Huaura']);
        } else if (departamento === 'Arequipa') {
            setProvinciasDisponibles(['Arequipa', 'Caylloma']);
        } else {
            setProvinciasDisponibles([]);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleLocationChange = (ubicacion) => {
        setFormData((prevState) => ({
            ...prevState,
            provincia: ubicacion,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            await createPaciente(formData);
            setAlert({
                show: true,
                type: 'success',
                message: 'Paciente registrado correctamente.',
            });

            setFormData({
                nombre: '',
                apellidos: '',
                edad: '',
                email: '',
                fechaNacimiento: '',
                sexo: 'FEMENINO',
                estadoCivil: 'SOLTERO',
                telefono: '',
                nacionalidad: '',
                direccion: '',
                tipoDocumento: 'DNI',
                dni: '',
                contactoEmergencia: '',
                seguroMedico: null,
                departamento: '',
                provincia: '',
                ciudad: '',
            });

            if (onSuccess) onSuccess();
        } catch (error) {
            setAlert({
                show: true,
                type: 'error',
                message: 'Error al registrar el paciente. Inténtalo de nuevo.',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="paciente-form">
            {alert.show && (
                <Alert 
                    type={alert.type} 
                    message={alert.message}
                    onClose={() => setAlert({ show: false, type: '', message: '' })}
                />
            )}
            
            <h2>Registrar Nuevo Paciente</h2>
            
            <form onSubmit={handleSubmit}>
                {/* Sección 1: Datos Personales */}
                <div className="form-section">
                    <h3>Datos Personales</h3>
                    <div className="form-grid">
                        <div>
                            <label>Nombre</label>
                            <input
                                type="text"
                                name="nombre"
                                value={formData.nombre}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Apellidos</label>
                            <input
                                type="text"
                                name="apellidos"
                                value={formData.apellidos}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Edad</label>
                            <input
                                type="number"
                                name="edad"
                                value={formData.edad}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Sección 2: Datos de Contacto */}
                <div className="form-section">
                    <h3>Datos de Contacto</h3>
                    <div className="form-grid">
                        <div>
                            <label>Teléfono</label>
                            <input
                                type="text"
                                name="telefono"
                                value={formData.telefono}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Nacionalidad</label>
                            <input
                                type="text"
                                name="nacionalidad"
                                value={formData.nacionalidad}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                        <div>
                            <label>Contacto de Emergencia</label>
                            <input
                                type="text"
                                name="contactoEmergencia"
                                value={formData.contactoEmergencia}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Sección 3: Dirección */}
                <div className="form-section">
                    <h3>Dirección</h3>
                    <div className="form-grid">
                        <div>
                            <label>Departamento</label>
                            <select
    name="departamento"
    value={formData.departamento || ""}  // Asegurarse de que nunca sea null
    onChange={(e) => {
        handleInputChange(e);
        cargarProvincias(e.target.value);
    }}
    required
>
    <option value="">Selecciona Departamento</option>
    <option value="Lima">Lima</option>
    <option value="Arequipa">Arequipa</option>
</select>
                        </div>

                        <div>
                            <label>Provincia</label>
                          <select
    name="provincia"
    value={formData.provincia || ""}  // Asegurarse de que nunca sea null
    onChange={handleLocationChange}
    required
>
    <option value="">Selecciona Provincia</option>
    {provinciasDisponibles.length > 0 ? (
        provinciasDisponibles.map((provincia, index) => (
            <option key={index} value={provincia}>
                {provincia}
            </option>
        ))
    ) : (
        <option>No hay provincias disponibles</option>
    )}
</select>

                        </div>

                        <div>
                            <label>Ciudad</label>
                            <input
                                type="text"
                                name="ciudad"
                                value={formData.ciudad}
                                onChange={handleInputChange}
                                required
                            />
                        </div>
                    </div>
                </div>

                {/* Sección 4: Seguro Médico */}
                <div className="form-section">
                    <h3>Seguro Médico</h3>
                    <div className="form-grid">
                        <div>
                            <label>Tipo de Seguro</label>
                           <select
    name="seguroMedico"
    value={formData.seguroMedico || ""}  // Asegurarse de que nunca sea null
    onChange={handleInputChange}
    required
>
    <option value="">Selecciona Seguro Médico</option>
    {segurosMedicosList.map((seguro, index) => (
        <option key={index} value={seguro.id}>
            {seguro.nombre}
        </option>
    ))}
    <option value="ninguno">Ninguno</option>
</select>

                        </div>
                    </div>
                </div>

                {/* Botón de Enviar */}
                <div className="form-actions">
    <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? (
            <span className="button-text">
                <span className="loading-indicator"></span> Guardando...
            </span>
        ) : (
            <span className="button-text">Registrar Paciente</span>
        )}
    </button>
</div>
            </form>
        </div>
    );
};

export default AñadirPacientesPage;

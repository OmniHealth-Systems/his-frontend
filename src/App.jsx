import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import { Auth0Provider } from '@auth0/auth0-react';
import AppLayout from './presentation/layouts/AppLayout';
import ProtectedRoute from './infrastructure/Config/ProtectedRoute';
import Auth0TokenBridge from './infrastructure/Config/Auth0TokenBridge';

// Pages
import Login from './presentation/pages/LoginPage';
import CitasPage from './presentation/components/citas/CitasPage';
import TurnoPage from './presentation/pages/TurnoPage';
import ConsultasPage from './presentation/pages/ConsultasPage';
import LaboratorioPage from './presentation/pages/LaboratorioPage';
import PacientesPage from './presentation/pages/PacientesPage';
import AñadirPacientesPage from './presentation/components/pacientes/AñadirPacientesPage';
import FarmaciaPage from './presentation/pages/FarmaciaPage';
import FacturacionPage from './presentation/pages/FacturacionPage';
import MedicosPage from './presentation/pages/MedicosPage';
import EspecialidadesPage from './presentation/components/medico/EspecialidadesPage';
import ClinicasPage from './presentation/components/clinica/clinicaPage';
import InformesPage from './presentation/components/informes/InformesPage';
import NotFoundPage from './presentation/pages/NotFoundPage';

// Fase 3: Nuevas Páginas de Microservicios
import HistorialPage from './presentation/pages/HistorialPage';
import DocumentosPage from './presentation/pages/DocumentosPage';
import POSFarmaciaPage from './presentation/pages/POSFarmaciaPage';
import LogisticaPage from './presentation/pages/LogisticaPage';
import SoportePage from './presentation/pages/SoportePage';
import AuditoriaPage from './presentation/pages/AuditoriaPage';

const auth0Domain = import.meta.env.VITE_AUTH0_DOMAIN || 'TU_DOMAIN_AQUI';
const auth0ClientId = import.meta.env.VITE_AUTH0_CLIENT_ID || 'TU_CLIENT_ID_AQUI';

const App = () => {
  return (
    <Auth0Provider
      domain={auth0Domain}
      clientId={auth0ClientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <Auth0TokenBridge>
        <Routes>
          {/* Ruta Pública: Login */}
          <Route path="/login" element={<Login />} />

          {/* Rutas Protegidas bajo Layout Enterprise */}
          <Route
            element={
              <ProtectedRoute>
                <AppLayout />
              </ProtectedRoute>
            }
          >
            {/* Redirección Raíz */}
            <Route path="/" element={<Navigate to="/citas" replace />} />
            <Route path="/home" element={<Navigate to="/citas" replace />} />

            {/* Core Clínico */}
            <Route path="/citas" element={<CitasPage />} />
            <Route path="/turno" element={<TurnoPage />} />
            <Route path="/consultas" element={<ConsultasPage />} />
            <Route path="/laboratorio" element={<LaboratorioPage />} />
            <Route path="/historial-clinico" element={<HistorialPage />} />
            <Route path="/historial" element={<Navigate to="/historial-clinico" replace />} />
            <Route path="/documentos" element={<DocumentosPage />} />

            {/* Gestión de Pacientes */}
            <Route path="/pacientes" element={<PacientesPage />} />
            <Route path="/listadopacientes" element={<Navigate to="/pacientes" replace />} />
            <Route path="/anadirpacientes" element={<AñadirPacientesPage />} />

            {/* Farmacia, POS & Suministros */}
            <Route path="/farmacia" element={<FarmaciaPage />} />
            <Route path="/farmacia/pos" element={<POSFarmaciaPage />} />
            <Route path="/pos" element={<Navigate to="/farmacia/pos" replace />} />
            <Route path="/logistica" element={<LogisticaPage />} />
            <Route path="/insumos" element={<Navigate to="/logistica" replace />} />

            {/* Mesa de Ayuda & Soporte TI */}
            <Route path="/soporte" element={<SoportePage />} />
            <Route path="/helpdesk" element={<Navigate to="/soporte" replace />} />

            {/* Finanzas & Facturación */}
            <Route path="/facturacion" element={<FacturacionPage />} />

            {/* Informes Médicos */}
            <Route path="/informes" element={<InformesPage />} />

            {/* Directorio Médico y Especialidades (Requiere Rol Admin / Superadmin) */}
            <Route
              path="/medicos"
              element={
                <ProtectedRoute requiredRole="admin">
                  <MedicosPage />
                </ProtectedRoute>
              }
            />
            <Route path="/listademedicos" element={<Navigate to="/medicos" replace />} />
            <Route path="/especialidades" element={<EspecialidadesPage />} />

            {/* Sedes Clínicas (Solo Superadmin) */}
            <Route
              path="/clinica"
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <ClinicasPage />
                </ProtectedRoute>
              }
            />
            <Route path="/sedes" element={<Navigate to="/clinica" replace />} />
            <Route path="/añadirsede" element={<Navigate to="/clinica" replace />} />

            {/* Auditoría & Seguridad Criptográfica (Solo Superadmin) */}
            <Route
              path="/auditoria"
              element={
                <ProtectedRoute requiredRole="superadmin">
                  <AuditoriaPage />
                </ProtectedRoute>
              }
            />
            <Route path="/logs" element={<Navigate to="/auditoria" replace />} />
          </Route>

          {/* Error 404 Global */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Auth0TokenBridge>
    </Auth0Provider>
  );
};

export default App;

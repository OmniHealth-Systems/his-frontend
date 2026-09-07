import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import Forbidden403 from '@/presentation/components/common/Forbidden403';
import { Loader2 } from 'lucide-react';

export const ProtectedRoute = ({ children, element, requiredRole }) => {
  const { isAuthenticated, isLoading, user, loginWithRedirect } = useAuth0();
  const location = useLocation();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      loginWithRedirect({
        appState: {
          returnTo: location.pathname + location.search,
        },
      });
    }
  }, [isLoading, isAuthenticated, location, loginWithRedirect]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
          <span className="text-sm font-medium text-slate-700">Verificando credenciales clínicas...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
        <div className="flex items-center gap-3 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
          <Loader2 className="w-6 h-6 text-sky-600 animate-spin" />
          <span className="text-sm font-medium text-slate-700">Redirigiendo a Auth0 Identity Platform...</span>
        </div>
      </div>
    );
  }

  if (requiredRole) {
    const rawRoles = user?.['https://omnihis.clinic/roles'] || user?.roles || [];
    const userRoles = Array.isArray(rawRoles) ? rawRoles.map(r => r.toLowerCase()) : [String(rawRoles).toLowerCase()];
    const req = requiredRole.toLowerCase();

    // Superadmin posee acceso universal
    const isSuperAdmin = userRoles.includes('superadmin');
    const isAdmin = isSuperAdmin || userRoles.includes('admin');
    const isDoctor = isAdmin || userRoles.includes('medico') || userRoles.includes('doctor');
    const isNurse = isDoctor || userRoles.includes('enfermero') || userRoles.includes('enfermera');

    let hasPermission = false;

    if (req === 'superadmin') {
      hasPermission = isSuperAdmin;
    } else if (req === 'admin') {
      hasPermission = isAdmin;
    } else if (req === 'medico' || req === 'doctor') {
      hasPermission = isDoctor;
    } else if (req === 'enfermero') {
      hasPermission = isNurse;
    } else if (req === 'user') {
      hasPermission = true;
    } else {
      hasPermission = userRoles.includes(req);
    }

    if (!hasPermission) {
      return <Forbidden403 requiredRole={requiredRole} />;
    }
  }

  return children || element;
};

export default ProtectedRoute;

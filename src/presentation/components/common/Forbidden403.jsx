import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home, Lock } from 'lucide-react';
import { useAuth0 } from '@auth0/auth0-react';

export default function Forbidden403({ requiredRole }) {
  const navigate = useNavigate();
  const { user } = useAuth0();

  return (
    <div className="min-h-[75vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-lg w-full bg-white rounded-2xl shadow-sm border border-slate-200 p-8 text-center">
        {/* Shield Icon */}
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 text-red-600 mb-5 ring-8 ring-red-50/50">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Heading */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700 mb-3">
          <Lock className="w-3.5 h-3.5" /> Acceso Restringido • HTTP 403
        </div>

        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Privilegios Insuficientes
        </h1>

        <p className="text-sm text-slate-600 mb-6 leading-relaxed">
          Tu cuenta <span className="font-semibold text-slate-800">({user?.email || 'actual'})</span> no posee los permisos clínicos o administrativos necesarios para ingresar a este módulo.
          {requiredRole && (
            <span className="block mt-2 font-mono text-xs bg-slate-100 py-1 px-2 rounded border border-slate-200 inline-block text-slate-700">
              Rol Requerido: {requiredRole.toUpperCase()}
            </span>
          )}
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 text-sm font-medium transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Regresar
          </button>
          <button
            onClick={() => navigate('/citas')}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white text-sm font-semibold transition-colors shadow-sm"
          >
            <Home className="w-4 h-4" /> Ir a Citas & Agenda
          </button>
        </div>

        {/* Security Notice */}
        <div className="mt-8 pt-4 border-t border-slate-100 text-xs text-slate-400">
          OmniHIS Security Guard • Todos los intentos de acceso no autorizados son auditados en ms-auditoria.
        </div>
      </div>
    </div>
  );
}

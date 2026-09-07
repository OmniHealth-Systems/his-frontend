import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FaHospitalAlt, FaHome, FaCalendarAlt, FaUserInjured, FaArrowLeft } from 'react-icons/fa';

export default function NotFoundPage() {
  const navigate = useNavigate();

  return (
    <main className="min-h-[80vh] flex items-center justify-center px-4 py-16 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="max-w-xl w-full text-center bg-white/80 backdrop-blur-md rounded-2xl shadow-xl border border-blue-100 p-8 md:p-12 transition-all">
        {/* Icon & Badge */}
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100 text-blue-600 mb-6 shadow-inner animate-pulse">
          <FaHospitalAlt className="text-4xl" />
        </div>

        {/* 404 Heading */}
        <h1 className="text-7xl md:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600 tracking-tight mb-2">
          404
        </h1>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">
          Página no encontrada
        </h2>
        <p className="text-slate-600 text-sm md:text-base mb-8 leading-relaxed">
          Lo sentimos, la ruta clínica o sección del sistema hospitalario a la que intentas acceder no existe, ha sido movida o requiere privilegios adicionales.
        </p>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-8">
          <button
            onClick={() => navigate(-1)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 font-medium transition-all shadow-sm"
          >
            <FaArrowLeft className="text-sm" /> Volver atrás
          </button>
          <Link
            to="/home"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-all shadow-md shadow-blue-500/20"
          >
            <FaHome className="text-sm" /> Inicio / Turnos
          </Link>
        </div>

        {/* Quick Links */}
        <div className="border-t border-slate-200 pt-6">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Accesos directos recomendados
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
            <Link
              to="/citas"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              <FaCalendarAlt className="text-xs" /> Gestión de Citas
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              to="/pacientes"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              <FaUserInjured className="text-xs" /> Directorio de Pacientes
            </Link>
            <span className="text-slate-300">•</span>
            <Link
              to="/consultas"
              className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-medium hover:underline"
            >
              Consultas Clínicas
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

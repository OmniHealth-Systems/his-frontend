import React, { useState, useRef, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import {
  Menu,
  Bell,
  Building,
  LogOut,
  User,
  Shield,
  ChevronDown,
  Sparkles
} from 'lucide-react';

export default function Navbar({ setIsMobileOpen }) {
  const { user, isAuthenticated, logout, loginWithRedirect } = useAuth0();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const rawRoles = user?.['https://omnihis.clinic/roles'] || user?.roles || [];
  const roles = Array.isArray(rawRoles) ? rawRoles : [rawRoles].filter(Boolean);
  const primaryRole = roles[0] || 'Personal de Salud';

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-20 flex items-center justify-between px-4 sm:px-6">
      {/* Left section: Hamburger button & Clinic badge */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setIsMobileOpen(true)}
          className="md:hidden p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          aria-label="Abrir Menú"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-xs font-medium text-slate-700">
          <Building className="w-3.5 h-3.5 text-sky-600" />
          <span>Sede Central Hospitalaria</span>
        </div>
      </div>

      {/* Right section: Notifications & User Profile */}
      <div className="flex items-center gap-3 sm:gap-4">
        {/* Quick notification bell */}
        <div className="relative">
          <button
            className="p-2 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
            title="Notificaciones Clínicas"
          >
            <Bell className="w-5 h-5" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-sky-500 rounded-full ring-2 ring-white"></span>
          </button>
        </div>

        {/* User Profile Dropdown */}
        {isAuthenticated ? (
          <div className="relative" ref={dropdownRef}>
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center gap-3 p-1.5 pl-2 pr-3 rounded-full hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all text-left"
            >
              {/* User Avatar */}
              {user?.picture ? (
                <img
                  src={user.picture}
                  alt={user.name || 'Usuario'}
                  className="w-8 h-8 rounded-full ring-2 ring-sky-500/20 object-cover"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs ring-2 ring-sky-500/20">
                  {user?.name ? user.name.substring(0, 2).toUpperCase() : 'DR'}
                </div>
              )}

              {/* User Details */}
              <div className="hidden sm:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight">
                  {user?.name || user?.nickname || user?.email?.split('@')[0]}
                </span>
                <span className="text-[10px] font-semibold text-sky-600 uppercase tracking-wide">
                  {primaryRole}
                </span>
              </div>

              <ChevronDown className="w-4 h-4 text-slate-400 hidden sm:block" />
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                {/* Profile Header */}
                <div className="px-4 py-3 border-b border-slate-100">
                  <p className="text-xs font-bold text-slate-900 truncate">{user?.name || 'Usuario OmniHIS'}</p>
                  <p className="text-[11px] text-slate-500 truncate">{user?.email}</p>
                  <div className="mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">
                    <Shield className="w-3 h-3 text-sky-600" />
                    <span>Rol: {primaryRole}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="p-1.5">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <button
            onClick={() => loginWithRedirect()}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition-all shadow-sm shadow-sky-500/20"
          >
            <User className="w-3.5 h-3.5" /> Iniciar Sesión
          </button>
        )}
      </div>
    </header>
  );
}

import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import {
  CalendarClock,
  Clock,
  Stethoscope,
  FlaskConical,
  Users,
  UserPlus,
  Pill,
  Receipt,
  UserCheck,
  Award,
  Building2,
  FileText,
  Activity,
  ChevronLeft,
  ChevronRight,
  X,
  ShieldAlert,
  ClipboardList,
  FolderOpen,
  ShoppingCart,
  Boxes,
  LifeBuoy
} from 'lucide-react';

export default function Sidebar({ isCollapsed, setIsCollapsed, isMobileOpen, setIsMobileOpen }) {
  const { user } = useAuth0();
  const location = useLocation();

  const rawRoles = user?.['https://omnihis.clinic/roles'] || user?.roles || [];
  const userRoles = Array.isArray(rawRoles) ? rawRoles.map(r => r.toLowerCase()) : [String(rawRoles).toLowerCase()];
  const isSuperAdmin = userRoles.includes('superadmin');
  const isAdmin = isSuperAdmin || userRoles.includes('admin');

  const navigationGroups = [
    {
      title: 'Core Clínico',
      items: [
        { name: 'Citas Médicas', to: '/citas', icon: CalendarClock },
        { name: 'Gestión de Turnos', to: '/turno', icon: Clock },
        { name: 'Consultas Clínicas', to: '/consultas', icon: Stethoscope },
        { name: 'Expediente Clínico (EHR)', to: '/historial-clinico', icon: ClipboardList },
        { name: 'Gestor Documental (S3)', to: '/documentos', icon: FolderOpen },
        { name: 'Laboratorio Clínico', to: '/laboratorio', icon: FlaskConical },
      ],
    },
    {
      title: 'Gestión de Pacientes',
      items: [
        { name: 'Directorio Pacientes', to: '/pacientes', icon: Users },
        { name: 'Registrar Paciente', to: '/anadirpacientes', icon: UserPlus },
      ],
    },
    {
      title: 'Farmacia & Suministros',
      items: [
        { name: 'Farmacia & Stock', to: '/farmacia', icon: Pill },
        { name: 'POS / Despacho Recetas', to: '/farmacia/pos', icon: ShoppingCart },
        { name: 'Logística & Insumos', to: '/logistica', icon: Boxes },
      ],
    },
    {
      title: 'Soporte & Auditoría',
      items: [
        { name: 'Mesa de Ayuda TI', to: '/soporte', icon: LifeBuoy },
        { name: 'Auditoría & Trazabilidad', to: '/auditoria', icon: ShieldAlert, requiredSuperAdmin: true },
      ],
    },
    {
      title: 'Administración & Finanzas',
      items: [
        { name: 'Facturación & Pagos', to: '/facturacion', icon: Receipt },
        { name: 'Directorio Médico', to: '/medicos', icon: UserCheck, requiredAdmin: true },
        { name: 'Especialidades', to: '/especialidades', icon: Award },
        { name: 'Sedes Clínicas', to: '/clinica', icon: Building2, requiredSuperAdmin: true },
        { name: 'Informes Médicos', to: '/informes', icon: FileText },
      ],
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-100">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col">
              <span className="font-extrabold text-slate-900 tracking-tight text-base leading-tight">
                OmniHIS <span className="text-sky-600 font-bold">Cloud</span>
              </span>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-400">
                Hospital Information System
              </span>
            </div>
          )}
        </div>

        {/* Mobile close button */}
        <button
          onClick={() => setIsMobileOpen(false)}
          className="md:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
          aria-label="Cerrar Menú"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Desktop Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          title={isCollapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
        {navigationGroups.map((group) => {
          // Filtrar items según rol
          const filteredItems = group.items.filter((item) => {
            if (item.requiredSuperAdmin && !isSuperAdmin) return false;
            if (item.requiredAdmin && !isAdmin) return false;
            return true;
          });

          if (filteredItems.length === 0) return null;

          return (
            <div key={group.title} className="space-y-1">
              {!isCollapsed && (
                <div className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
                  {group.title}
                </div>
              )}
              <div className="space-y-0.5">
                {filteredItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.to;

                  return (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsMobileOpen(false)}
                      title={isCollapsed ? item.name : undefined}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                          isActive
                            ? 'bg-sky-50 text-sky-700 font-semibold shadow-xs'
                            : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                        } ${isCollapsed ? 'justify-center px-2' : ''}`
                      }
                    >
                      <Icon
                        className={`w-5 h-5 shrink-0 ${
                          isActive ? 'text-sky-600' : 'text-slate-400 group-hover:text-slate-600'
                        }`}
                      />
                      {!isCollapsed && <span className="truncate">{item.name}</span>}
                    </NavLink>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Clinic Status Badge */}
      {!isCollapsed && (
        <div className="p-3 m-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-500">
          <div className="flex items-center justify-between font-semibold text-slate-700 mb-1">
            <span>Sede Principal</span>
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 ring-2 ring-emerald-100"></span>
          </div>
          <p className="text-[11px] text-slate-500 truncate">Conectado a Kafka Cluster</p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:block shrink-0 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className={`fixed top-0 bottom-0 z-30 transition-all duration-300 ease-in-out ${
          isCollapsed ? 'w-20' : 'w-64'
        }`}>
          {sidebarContent}
        </div>
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs transition-opacity"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`md:hidden fixed top-0 bottom-0 left-0 z-50 w-72 max-w-[85vw] transform transition-transform duration-300 ease-in-out ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}

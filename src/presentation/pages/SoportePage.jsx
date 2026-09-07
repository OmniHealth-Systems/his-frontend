import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  LifeBuoy,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Clock,
  MessageSquare,
  Send,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2,
  User,
  ShieldCheck,
  Tag,
  Laptop,
  Flame,
  X,
  FileQuestion,
  ExternalLink
} from 'lucide-react';
import { soporteService } from '@/infrastructure/Services/soporte.service';
import { useAuth0 } from '@auth0/auth0-react';

export default function SoportePage() {
  const { user } = useAuth0();
  const [activeView, setActiveView] = useState('tickets'); // 'tickets' | 'faqs'
  const [tickets, setTickets] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('TODOS');
  const [priorityFilter, setPriorityFilter] = useState('TODOS');
  const [faqSearchQuery, setFaqSearchQuery] = useState('');
  const [expandedFaqId, setExpandedFaqId] = useState(null);

  // Modales y Drawer
  const [showCreateTicketModal, setShowCreateTicketModal] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [showTicketDetails, setShowTicketDetails] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [submittingTicket, setSubmittingTicket] = useState(false);

  // Formulario nuevo ticket
  const [newTicketForm, setNewTicketForm] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'MEDIA',
    categoria: 'SOFTWARE_HIS'
  });

  const loadData = async () => {
    try {
      setLoading(true);
      const [ticketsData, faqsData] = await Promise.allSettled([
        soporteService.listarTickets(),
        soporteService.listarFaqs()
      ]);

      if (ticketsData.status === 'fulfilled' && ticketsData.value?.length > 0) {
        setTickets(ticketsData.value);
      } else {
        // Mock data enterprise
        setTickets([
          {
            id: 'TICK-8021',
            titulo: 'Falla al imprimir recetas en consultorio 104',
            descripcion: 'La impresora térmica EPSON TM-T20 no responde al enviar la receta desde el módulo de consultas.',
            prioridad: 'ALTA',
            categoria: 'IMPRESORAS_RECETAS',
            estado: 'ABIERTO',
            solicitanteNombre: 'Dra. Carmen Valenzuela',
            solicitanteRol: 'Médico Pediatra',
            fechaCreacion: '2026-03-07T08:30:00',
            comentarios: [
              {
                id: '1',
                autorNombre: 'Dra. Carmen Valenzuela',
                autorRol: 'Médico',
                mensaje: 'Se intentó reiniciar la impresora y el switch de red sin éxito.',
                fechaCreacion: '2026-03-07T08:35:00'
              }
            ]
          },
          {
            id: 'TICK-8022',
            titulo: 'Solicitud de acceso al módulo de Facturación para nuevo cajero',
            descripcion: 'Se requiere habilitar permisos de Facturación y POS Farmacia para el usuario cajero_central@omnihis.clinic',
            prioridad: 'MEDIA',
            categoria: 'CUENTAS_ACCESOS',
            estado: 'EN_PROGRESO',
            solicitanteNombre: 'Lic. Roberto Gómez',
            solicitanteRol: 'Jefe de Administración',
            fechaCreacion: '2026-03-06T14:15:00',
            comentarios: [
              {
                id: '1',
                autorNombre: 'Ing. Soporte IT',
                autorRol: 'Soporte TI',
                mensaje: 'Validando autorización con el departamento de RRHH y Superadmin.',
                fechaCreacion: '2026-03-06T15:00:00',
                esInternoIT: true
              }
            ]
          },
          {
            id: 'TICK-8023',
            titulo: 'Latencia intermitente en sincronización de Kafka Farmacia',
            descripcion: 'Las recetas despachadas demoran ~15 segundos en reflejar la deducción de stock en el inventario.',
            prioridad: 'CRITICA',
            categoria: 'SOFTWARE_HIS',
            estado: 'EN_PROGRESO',
            solicitanteNombre: 'Farm. Patricia Morales',
            solicitanteRol: 'Farmacéutica Jefe',
            fechaCreacion: '2026-03-06T11:00:00',
            comentarios: []
          },
          {
            id: 'TICK-8019',
            titulo: 'Calibración de monitor de signos vitales UCI Cama 4',
            descripcion: 'El sensor de SpO2 presenta variaciones anómalas en la telemetría central.',
            prioridad: 'ALTA',
            categoria: 'HARDWARE_MEDICO',
            estado: 'RESUELTO',
            solicitanteNombre: 'Enf. Marcos Ruiz',
            solicitanteRol: 'Enfermero UCI',
            fechaCreacion: '2026-03-05T09:20:00',
            fechaResolucion: '2026-03-05T12:40:00',
            comentarios: [
              {
                id: '1',
                autorNombre: 'Biomédica Central',
                autorRol: 'Ing. Biomédico',
                mensaje: 'Se reemplazó el cable troncal y se recalibró el módulo óptico.',
                fechaCreacion: '2026-03-05T12:35:00'
              }
            ]
          }
        ]);
      }

      if (faqsData.status === 'fulfilled' && faqsData.value?.length > 0) {
        setFaqs(faqsData.value);
      } else {
        setFaqs([
          {
            id: '1',
            categoria: 'Seguridad & Acceso',
            pregunta: '¿Cómo restauro mi sesión o cambio mi contraseña?',
            respuesta: 'El sistema utiliza Auth0 Single Sign-On. Puede cambiar su contraseña haciendo clic en "Olvidé mi contraseña" en la pantalla de ingreso o solicitándolo al administrador TI.'
          },
          {
            id: '2',
            categoria: 'Expediente Clínico & EHR',
            pregunta: '¿Cómo registro una alergia severa o antecedente médico crítico?',
            respuesta: 'Diríjase al módulo "Expediente Clínico", seleccione al paciente, ingrese a la pestaña "Alergias & Reacciones" y haga clic en "Añadir Registro Clínico". Este evento se sincronizará de forma instantánea.'
          },
          {
            id: '3',
            categoria: 'Farmacia & Recetas',
            pregunta: '¿Cómo funciona la deducción automática de stock en el POS?',
            respuesta: 'Al finalizar la venta o despacho en POS Farmacia, el sistema emite un evento Kafka que descuenta inmediatamente las unidades del almacén y notifica si el inventario llega a nivel crítico.'
          },
          {
            id: '4',
            categoria: 'Documentos & Radiografías',
            pregunta: '¿Qué tipos de archivos y tamaños admite el Gestor Documental?',
            respuesta: 'Admite PDFs, imágenes radiológicas (JPEG, PNG, DICOM) y archivos escaneados de hasta 25MB directamente alojados en Amazon S3 / MinIO seguro con URLs prefirmadas temporales.'
          }
        ]);
      }
    } catch (error) {
      toast.error('Error al sincronizar datos de la Mesa de Ayuda');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicketForm.titulo || !newTicketForm.descripcion) {
      toast.error('El título y la descripción son obligatorios');
      return;
    }
    try {
      setSubmittingTicket(true);
      const ticketToCreate = {
        ...newTicketForm,
        solicitanteNombre: user?.name || 'Personal Médico / Operativo',
        solicitanteRol: user?.email || 'Usuario OmniHIS',
        estado: 'ABIERTO',
        fechaCreacion: new Date().toISOString()
      };
      await soporteService.crearTicket(ticketToCreate);
      toast.success('Ticket de incidencia creado correctamente (#IT-' + Math.floor(1000 + Math.random() * 9000) + ')');
      setShowCreateTicketModal(false);
      setNewTicketForm({
        titulo: '',
        descripcion: '',
        prioridad: 'MEDIA',
        categoria: 'SOFTWARE_HIS'
      });
      loadData();
    } catch (error) {
      toast.error('No se pudo crear el ticket de soporte');
    } finally {
      setSubmittingTicket(false);
    }
  };

  const handleStatusChange = async (ticketId, nuevoEstado) => {
    try {
      await soporteService.cambiarEstadoTicket(ticketId, nuevoEstado);
      toast.success(`Estado actualizado a ${nuevoEstado}`);
      setTickets((prev) =>
        prev.map((t) => (t.id === ticketId ? { ...t, estado: nuevoEstado } : t))
      );
      if (selectedTicket && selectedTicket.id === ticketId) {
        setSelectedTicket((prev) => ({ ...prev, estado: nuevoEstado }));
      }
    } catch (error) {
      toast.error('Error al actualizar el estado del ticket');
    }
  };

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim() || !selectedTicket) return;
    try {
      setSubmittingComment(true);
      const newComment = {
        autorNombre: user?.name || 'Personal TI',
        autorRol: user?.email || 'Técnico de Soporte',
        mensaje: newCommentText.trim(),
        fechaCreacion: new Date().toISOString()
      };
      await soporteService.agregarComentario(selectedTicket.id, newComment);
      toast.success('Comentario registrado');
      
      const updatedComments = [...(selectedTicket.comentarios || []), newComment];
      const updatedTicket = { ...selectedTicket, comentarios: updatedComments };
      setSelectedTicket(updatedTicket);
      setTickets((prev) =>
        prev.map((t) => (t.id === selectedTicket.id ? updatedTicket : t))
      );
      setNewCommentText('');
    } catch (error) {
      toast.error('Error al enviar comentario');
    } finally {
      setSubmittingComment(false);
    }
  };

  const openTicketDetail = (ticket) => {
    setSelectedTicket(ticket);
    setShowTicketDetails(true);
  };

  // Filtrado de tickets
  const filteredTickets = tickets.filter((ticket) => {
    const matchSearch =
      ticket.titulo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.descripcion.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ticket.id && ticket.id.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (ticket.solicitanteNombre && ticket.solicitanteNombre.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchStatus = statusFilter === 'TODOS' || ticket.estado === statusFilter;
    const matchPriority = priorityFilter === 'TODOS' || ticket.prioridad === priorityFilter;

    return matchSearch && matchStatus && matchPriority;
  });

  // Filtrado de FAQs
  const filteredFaqs = faqs.filter((faq) =>
    faq.pregunta.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
    faq.respuesta.toLowerCase().includes(faqSearchQuery.toLowerCase()) ||
    faq.categoria.toLowerCase().includes(faqSearchQuery.toLowerCase())
  );

  // Estadísticas rápidas
  const totalAbiertos = tickets.filter((t) => t.estado === 'ABIERTO').length;
  const totalEnProgreso = tickets.filter((t) => t.estado === 'EN_PROGRESO').length;
  const totalResueltos = tickets.filter((t) => t.estado === 'RESUELTO').length;
  const totalCriticos = tickets.filter((t) => t.prioridad === 'CRITICA').length;

  const getPriorityBadge = (prio) => {
    switch (prio) {
      case 'CRITICA':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200"><Flame className="w-3 h-3 text-rose-600" /> Crítica</span>;
      case 'ALTA':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">Alta</span>;
      case 'MEDIA':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200">Media</span>;
      case 'BAJA':
        return <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200">Baja</span>;
      default:
        return <span>{prio}</span>;
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ABIERTO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-200">Abierto</span>;
      case 'EN_PROGRESO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">En Progreso</span>;
      case 'RESUELTO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Resuelto</span>;
      case 'CERRADO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200">Cerrado</span>;
      default:
        return <span>{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-indigo-950/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              <LifeBuoy className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
              Centro de Servicios y Soporte TI
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Mesa de Ayuda & Helpdesk
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Gestión de incidencias tecnológicas hospitalarias, soporte de hardware clínico, cuentas de usuario y base de conocimiento.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
          <button
            onClick={() => setShowCreateTicketModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 transition-all hover:scale-102 active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            Abrir Ticket
          </button>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Tickets Abiertos</p>
            <p className="text-2xl font-black text-blue-600 mt-1">{totalAbiertos}</p>
            <p className="text-xs text-slate-400 mt-0.5">Pendientes de atención</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <AlertCircle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-purple-600 uppercase tracking-wider">En Progreso</p>
            <p className="text-2xl font-black text-purple-600 mt-1">{totalEnProgreso}</p>
            <p className="text-xs text-purple-600/80 mt-0.5">Asignados a soporte</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
            <Clock className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-emerald-600 uppercase tracking-wider">Resueltos</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">{totalResueltos}</p>
            <p className="text-xs text-slate-400 mt-0.5">Incidencias cerradas</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-rose-600 uppercase tracking-wider">Incidencias Críticas</p>
            <p className="text-2xl font-black text-rose-600 mt-1">{totalCriticos}</p>
            <p className="text-xs text-rose-600/80 mt-0.5">Alta prioridad clínica</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <Flame className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200">
        <button
          onClick={() => setActiveView('tickets')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeView === 'tickets'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <LifeBuoy className="w-4 h-4" />
          Tickets de Incidencia ({filteredTickets.length})
        </button>

        <button
          onClick={() => setActiveView('faqs')}
          className={`flex items-center gap-2 px-5 py-3 text-sm font-bold border-b-2 transition-all ${
            activeView === 'faqs'
              ? 'border-indigo-600 text-indigo-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Base de Conocimientos / FAQs ({faqs.length})
        </button>
      </div>

      {/* VIEW 1: TICKETS */}
      {activeView === 'tickets' && (
        <div className="space-y-4">
          {/* Controls bar */}
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
            <div className="relative flex-1 w-full">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar por ID, título, solicitante o descripción..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>

            <div className="flex items-center gap-2 w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:border-indigo-500"
              >
                <option value="TODOS">Todos los Estados</option>
                <option value="ABIERTO">Abiertos</option>
                <option value="EN_PROGRESO">En Progreso</option>
                <option value="RESUELTO">Resueltos</option>
                <option value="CERRADO">Cerrados</option>
              </select>

              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="px-3 py-2 text-xs font-semibold bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:bg-white focus:border-indigo-500"
              >
                <option value="TODOS">Todas las Prioridades</option>
                <option value="CRITICA">Crítica</option>
                <option value="ALTA">Alta</option>
                <option value="MEDIA">Media</option>
                <option value="BAJA">Baja</option>
              </select>
            </div>
          </div>

          {/* Tickets List */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-16 bg-slate-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="py-16 text-center">
                <FileQuestion className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <p className="text-base font-semibold text-slate-700">No hay tickets que coincidan con la búsqueda</p>
                <p className="text-xs text-slate-400 mt-1">Crea una nueva incidencia o cambia los filtros</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredTickets.map((ticket) => (
                  <div
                    key={ticket.id}
                    className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4 cursor-pointer"
                    onClick={() => openTicketDetail(ticket)}
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                          {ticket.id}
                        </span>
                        {getStatusBadge(ticket.estado)}
                        {getPriorityBadge(ticket.prioridad)}
                        <span className="text-xs text-slate-400">
                          {new Date(ticket.fechaCreacion).toLocaleDateString()} {new Date(ticket.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <h3 className="text-base font-bold text-slate-900 leading-snug">
                        {ticket.titulo}
                      </h3>

                      <p className="text-xs text-slate-500 line-clamp-2">
                        {ticket.descripcion}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-slate-400 pt-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3.5 h-3.5" />
                          {ticket.solicitanteNombre} ({ticket.solicitanteRol || 'Usuario'})
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageSquare className="w-3.5 h-3.5" />
                          {ticket.comentarios?.length || 0} comentarios
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <select
                        value={ticket.estado}
                        onChange={(e) => handleStatusChange(ticket.id, e.target.value)}
                        className="px-3 py-1.5 text-xs font-semibold bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl text-slate-700 transition-colors cursor-pointer"
                      >
                        <option value="ABIERTO">Marcar Abierto</option>
                        <option value="EN_PROGRESO">En Progreso</option>
                        <option value="RESUELTO">Marcar Resuelto</option>
                        <option value="CERRADO">Cerrar Ticket</option>
                      </select>

                      <button
                        onClick={() => openTicketDetail(ticket)}
                        className="px-3 py-1.5 text-xs font-semibold bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-xl border border-indigo-200 transition-colors"
                      >
                        Ver Detalle
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: FAQS / BASE DE CONOCIMIENTOS */}
      {activeView === 'faqs' && (
        <div className="space-y-4">
          <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Buscar guías y soluciones en la base de conocimientos..."
                value={faqSearchQuery}
                onChange={(e) => setFaqSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all placeholder:text-slate-400"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredFaqs.map((faq) => {
              const isExpanded = expandedFaqId === faq.id;
              return (
                <div
                  key={faq.id}
                  className="p-5 bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:border-indigo-200 transition-all"
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
                      {faq.categoria}
                    </span>
                    <HelpCircle className="w-4 h-4 text-indigo-500" />
                  </div>

                  <h4 className="text-sm font-bold text-slate-900 mb-2">
                    {faq.pregunta}
                  </h4>

                  <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {faq.respuesta}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Crear Nuevo Ticket */}
      {showCreateTicketModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Abrir Ticket de Incidencia</h3>
              </div>
              <button
                onClick={() => setShowCreateTicketModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Título de la Incidencia</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Error al emitir receta digital en consultorio 2"
                  value={newTicketForm.titulo}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, titulo: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Categoría</label>
                  <select
                    value={newTicketForm.categoria}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, categoria: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="SOFTWARE_HIS">Software HIS / Sistema</option>
                    <option value="HARDWARE_MEDICO">Hardware Médico</option>
                    <option value="IMPRESORAS_RECETAS">Impresoras / Recetas</option>
                    <option value="RED_CONECTIVIDAD">Red & Conectividad</option>
                    <option value="CUENTAS_ACCESOS">Cuentas y Accesos</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Prioridad</label>
                  <select
                    value={newTicketForm.prioridad}
                    onChange={(e) => setNewTicketForm({ ...newTicketForm, prioridad: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  >
                    <option value="BAJA">Baja (Sin impacto crítico)</option>
                    <option value="MEDIA">Media (Afecta parcialmente)</option>
                    <option value="ALTA">Alta (Afecta atención médica)</option>
                    <option value="CRITICA">Crítica (Interrupción total)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Descripción detallada</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Describa el problema, código de error si existe, y los pasos para reproducirlo..."
                  value={newTicketForm.descripcion}
                  onChange={(e) => setNewTicketForm({ ...newTicketForm, descripcion: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateTicketModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submittingTicket}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-600/30 transition-all"
                >
                  {submittingTicket && <Loader2 className="w-4 h-4 animate-spin" />}
                  Enviar Incidencia
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Drawer / Modal: Detalle del Ticket & Comentarios */}
      {showTicketDetails && selectedTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200">
            {/* Header */}
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {selectedTicket.id}
                  </span>
                  {getStatusBadge(selectedTicket.estado)}
                  {getPriorityBadge(selectedTicket.prioridad)}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedTicket.titulo}
                </h3>
              </div>
              <button
                onClick={() => setShowTicketDetails(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Body */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5 text-sm">
              {/* Descripcion inicial */}
              <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Descripción del Solicitante</p>
                <p className="text-slate-700 leading-relaxed">{selectedTicket.descripcion}</p>
                <div className="mt-3 pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs text-slate-500">
                  <span>Solicitado por: <strong className="text-slate-700">{selectedTicket.solicitanteNombre}</strong></span>
                  <span>{new Date(selectedTicket.fechaCreacion).toLocaleString()}</span>
                </div>
              </div>

              {/* Hilo de comentarios */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Historial de Respuestas ({selectedTicket.comentarios?.length || 0})
                </h4>

                {(!selectedTicket.comentarios || selectedTicket.comentarios.length === 0) ? (
                  <p className="text-xs text-slate-400 italic py-2">No hay comentarios aún en este ticket.</p>
                ) : (
                  selectedTicket.comentarios.map((c, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl border text-xs space-y-1 ${
                        c.esInternoIT
                          ? 'bg-amber-50/60 border-amber-200 text-amber-900'
                          : 'bg-white border-slate-200 text-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold">
                        <span className="flex items-center gap-1.5">
                          {c.autorNombre}
                          {c.esInternoIT && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-200 text-amber-800 uppercase font-extrabold">
                              Nota Interna TI
                            </span>
                          )}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {c.fechaCreacion ? new Date(c.fechaCreacion).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                        </span>
                      </div>
                      <p className="leading-relaxed">{c.mensaje}</p>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Footer / Enviar comentario */}
            <form onSubmit={handleAddComment} className="p-4 border-t border-slate-100 bg-slate-50 rounded-b-2xl">
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  placeholder="Escribe una respuesta técnica o actualización..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                  className="flex-1 px-3.5 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
                <button
                  type="submit"
                  disabled={submittingComment || !newCommentText.trim()}
                  className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl shadow-md transition-all"
                >
                  {submittingComment ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Responder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

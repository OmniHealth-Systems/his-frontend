import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  Boxes,
  PlusCircle,
  AlertTriangle,
  ArrowDownUp,
  Package,
  Search,
  Filter,
  CheckCircle2,
  RefreshCw,
  Loader2,
  ArrowUpRight,
  ArrowDownLeft,
  Layers,
  MapPin,
  Clock,
  ShieldCheck,
  Tag,
  Warehouse,
  History,
  X
} from 'lucide-react';
import { logisticaService } from '@/infrastructure/Services/logistica.service';

export default function LogisticaPage() {
  const [insumos, setInsumos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState('TODOS');
  const [filterAlertasOnly, setFilterAlertasOnly] = useState(false);
  
  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showMovementModal, setShowMovementModal] = useState(false);
  const [selectedInsumoForMovement, setSelectedInsumoForMovement] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Formulario nuevo insumo
  const [newInsumo, setNewInsumo] = useState({
    codigo: '',
    nombre: '',
    categoria: 'DESCARTABLE',
    stockActual: 100,
    stockMinimo: 20,
    unidadMedida: 'Unidad',
    ubicacionAlmacen: 'Almacén Central - Pasillo A',
    precioUnitario: 0,
    sedeId: 1
  });

  // Formulario de movimiento
  const [movementForm, setMovementForm] = useState({
    cantidad: 10,
    tipo: 'ENTRADA_COMPRA',
    motivo: 'Reabastecimiento regular de stock',
    sedeId: 1
  });

  const loadInsumos = async () => {
    try {
      setLoading(true);
      const data = await logisticaService.listarInsumos();
      // Si la API devuelve vacío en dev, proporcionamos mock de hospital enterprise
      if (!data || data.length === 0) {
        setInsumos([
          {
            id: 1,
            codigo: 'INS-001-JAL',
            nombre: 'Jeringas Descartables 5ml c/ Aguja 21G',
            categoria: 'DESCARTABLE',
            stockActual: 1250,
            stockMinimo: 300,
            unidadMedida: 'Caja x100',
            ubicacionAlmacen: 'Almacén Central - Rack A-02',
            precioUnitario: 12.50,
            activo: true,
            fechaRegistro: '2026-03-01'
          },
          {
            id: 2,
            codigo: 'INS-002-GTE',
            nombre: 'Guantes Quirúrgicos Estériles Talla 7.5',
            categoria: 'QUIRURGICO',
            stockActual: 45,
            stockMinimo: 100,
            unidadMedida: 'Caja x50 pares',
            ubicacionAlmacen: 'Quirófano Piso 2 - Estante 4',
            precioUnitario: 35.00,
            activo: true,
            fechaRegistro: '2026-03-02'
          },
          {
            id: 3,
            codigo: 'INS-003-SUF',
            nombre: 'Suero Fisiológico 0.9% 500ml',
            categoria: 'DESCARTABLE',
            stockActual: 18,
            stockMinimo: 50,
            unidadMedida: 'Frasco',
            ubicacionAlmacen: 'Emergencias - Cabina 1',
            precioUnitario: 4.80,
            activo: true,
            fechaRegistro: '2026-03-02'
          },
          {
            id: 4,
            codigo: 'INS-004-MAS',
            nombre: 'Mascarillas N95 3M Grado Hospitalario',
            categoria: 'PROTECCION_PERSONAL',
            stockActual: 480,
            stockMinimo: 150,
            unidadMedida: 'Caja x20',
            ubicacionAlmacen: 'Almacén Central - Rack C-01',
            precioUnitario: 28.00,
            activo: true,
            fechaRegistro: '2026-03-03'
          },
          {
            id: 5,
            codigo: 'INS-005-CAT',
            nombre: 'Catéter Intravenoso 18G Introcan',
            categoria: 'QUIRURGICO',
            stockActual: 12,
            stockMinimo: 60,
            unidadMedida: 'Caja x50',
            ubicacionAlmacen: 'Emergencias - Gaveta Shock',
            precioUnitario: 42.00,
            activo: true,
            fechaRegistro: '2026-03-04'
          },
          {
            id: 6,
            codigo: 'INS-006-TIR',
            nombre: 'Tiras Reactivas Glucosa Accu-Chek',
            categoria: 'REACTIVO',
            stockActual: 85,
            stockMinimo: 40,
            unidadMedida: 'Frasco x50',
            ubicacionAlmacen: 'Laboratorio Central - Estante R1',
            precioUnitario: 31.50,
            activo: true,
            fechaRegistro: '2026-03-04'
          },
          {
            id: 7,
            codigo: 'INS-007-ALC',
            nombre: 'Alcohol en Gel 70% con Dosificador 1L',
            categoria: 'HIGIENE',
            stockActual: 220,
            stockMinimo: 50,
            unidadMedida: 'Botella 1L',
            ubicacionAlmacen: 'Higiene & Esterilización',
            precioUnitario: 6.20,
            activo: true,
            fechaRegistro: '2026-03-05'
          }
        ]);
      } else {
        setInsumos(data);
      }
    } catch (error) {
      toast.error('No se pudo sincronizar el inventario hospitalario');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInsumos();
  }, []);

  // Handlers
  const handleCreateInsumo = async (e) => {
    e.preventDefault();
    if (!newInsumo.codigo || !newInsumo.nombre) {
      toast.error('Código y nombre del insumo son obligatorios');
      return;
    }
    try {
      setSubmitting(true);
      await logisticaService.registrarInsumo({
        ...newInsumo,
        stockActual: Number(newInsumo.stockActual),
        stockMinimo: Number(newInsumo.stockMinimo),
        precioUnitario: Number(newInsumo.precioUnitario)
      });
      toast.success('Insumo registrado exitosamente en el inventario');
      setShowCreateModal(false);
      // Reset form
      setNewInsumo({
        codigo: '',
        nombre: '',
        categoria: 'DESCARTABLE',
        stockActual: 100,
        stockMinimo: 20,
        unidadMedida: 'Unidad',
        ubicacionAlmacen: 'Almacén Central - Pasillo A',
        precioUnitario: 0,
        sedeId: 1
      });
      loadInsumos();
    } catch (error) {
      toast.error('Error al registrar insumo médico');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRegisterMovement = async (e) => {
    e.preventDefault();
    if (!selectedInsumoForMovement) return;
    try {
      setSubmitting(true);
      await logisticaService.registrarMovimiento(
        selectedInsumoForMovement.id,
        Number(movementForm.cantidad),
        movementForm.tipo,
        movementForm.motivo,
        movementForm.sedeId
      );
      toast.success(`Movimiento de ${movementForm.tipo} registrado correctamente`);
      setShowMovementModal(false);
      loadInsumos();
    } catch (error) {
      toast.error('Error al registrar el movimiento de stock');
    } finally {
      setSubmitting(false);
    }
  };

  const openMovementDialog = (insumo) => {
    setSelectedInsumoForMovement(insumo);
    setMovementForm({
      cantidad: 10,
      tipo: 'ENTRADA_COMPRA',
      motivo: `Ajuste / Ingreso para ${insumo.nombre}`,
      sedeId: insumo.sedeId || 1
    });
    setShowMovementModal(true);
  };

  // Filtrado
  const filteredInsumos = insumos.filter((item) => {
    const matchSearch =
      item.nombre.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.codigo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.ubicacionAlmacen && item.ubicacionAlmacen.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCategoria = selectedCategoria === 'TODOS' || item.categoria === selectedCategoria;
    const matchAlertas = filterAlertasOnly ? item.stockActual <= item.stockMinimo : true;

    return matchSearch && matchCategoria && matchAlertas;
  });

  const totalInsumos = insumos.length;
  const insumosCriticos = insumos.filter((i) => i.stockActual <= i.stockMinimo).length;
  const valorTotalInventario = insumos.reduce(
    (acc, i) => acc + (i.stockActual || 0) * (i.precioUnitario || 0),
    0
  );

  const getCategoriaBadge = (cat) => {
    switch (cat) {
      case 'DESCARTABLE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200">Descartable</span>;
      case 'QUIRURGICO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">Quirúrgico</span>;
      case 'PROTECCION_PERSONAL':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">EPP</span>;
      case 'REACTIVO':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">Reactivo Lab</span>;
      case 'HIGIENE':
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">Higiene</span>;
      default:
        return <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">{cat}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 p-6 rounded-2xl text-white shadow-xl shadow-sky-950/20">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-lg bg-sky-500/20 text-sky-300 border border-sky-500/30">
              <Boxes className="w-5 h-5" />
            </span>
            <span className="text-xs font-bold uppercase tracking-wider text-sky-400">
              Gestión de Cadena de Suministro
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight">
            Logística e Insumos Hospitalarios
          </h1>
          <p className="text-sm text-slate-300 max-w-2xl">
            Control de inventario médico, almacenes centrales, trazabilidad de materiales quirúrgicos y alertas tempranas de stock mínimo.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadInsumos}
            disabled={loading}
            className="flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-white/10 hover:bg-white/20 text-white backdrop-blur-md border border-white/10 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Sincronizar
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/30 transition-all hover:scale-102 active:scale-98"
          >
            <PlusCircle className="w-4 h-4" />
            Registrar Insumo
          </button>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Total Insumos</p>
            <p className="text-2xl font-black text-slate-900 mt-1">{totalInsumos}</p>
            <p className="text-xs text-slate-400 mt-0.5">Catálogo registrado</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-amber-600 uppercase tracking-wider">Alertas Stock Crítico</p>
            <p className="text-2xl font-black text-amber-600 mt-1">{insumosCriticos}</p>
            <p className="text-xs text-amber-600/80 mt-0.5">Por debajo del mínimo</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Valorización Stock</p>
            <p className="text-2xl font-black text-emerald-700 mt-1">
              ${valorTotalInventario.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">Costo total inventariado</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Package className="w-6 h-6" />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">Almacenes Activos</p>
            <p className="text-2xl font-black text-indigo-700 mt-1">4</p>
            <p className="text-xs text-slate-400 mt-0.5">Central, Quirófano, Urgencias, Lab</p>
          </div>
          <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Warehouse className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Control Bar: Search & Category Filter */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Buscar por código, nombre del insumo o ubicación..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 transition-all placeholder:text-slate-400"
            />
          </div>

          {/* Toggle Alert Filter */}
          <button
            onClick={() => setFilterAlertasOnly(!filterAlertasOnly)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              filterAlertasOnly
                ? 'bg-amber-500 text-white shadow-md shadow-amber-500/20'
                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            {filterAlertasOnly ? 'Mostrando Solo Críticos' : 'Filtrar Solo Stock Bajo'}
          </button>
        </div>

        {/* Category Badges Filter */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
          {[
            { id: 'TODOS', label: 'Todos' },
            { id: 'DESCARTABLE', label: 'Descartables' },
            { id: 'QUIRURGICO', label: 'Quirúrgicos' },
            { id: 'PROTECCION_PERSONAL', label: 'Protección / EPP' },
            { id: 'REACTIVO', label: 'Reactivos' },
            { id: 'HIGIENE', label: 'Higiene & Limpieza' },
            { id: 'EQUIPO', label: 'Equipos Médicos' }
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategoria(cat.id)}
              className={`px-3 py-1.5 rounded-lg font-medium shrink-0 transition-colors ${
                selectedCategoria === cat.id
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-600'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-8 space-y-4">
            {[1, 2, 3, 4, 5].map((idx) => (
              <div key={idx} className="h-14 bg-slate-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredInsumos.length === 0 ? (
          <div className="py-16 text-center">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <p className="text-base font-semibold text-slate-700">No se encontraron insumos</p>
            <p className="text-xs text-slate-400 mt-1">Ajusta los filtros o añade un nuevo insumo al inventario</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-semibold text-xs uppercase tracking-wider">
                  <th className="py-3.5 px-4">Código / Insumo</th>
                  <th className="py-3.5 px-4">Categoría</th>
                  <th className="py-3.5 px-4">Stock Actual</th>
                  <th className="py-3.5 px-4">Nivel Mínimo</th>
                  <th className="py-3.5 px-4">Ubicación Almacén</th>
                  <th className="py-3.5 px-4 text-right">P. Unitario</th>
                  <th className="py-3.5 px-4 text-center">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredInsumos.map((insumo) => {
                  const isLow = insumo.stockActual <= insumo.stockMinimo;
                  const ratio = Math.min(100, Math.round((insumo.stockActual / (insumo.stockMinimo * 2 || 1)) * 100));

                  return (
                    <tr key={insumo.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{insumo.nombre}</span>
                          <span className="text-xs font-mono text-slate-400">{insumo.codigo} • {insumo.unidadMedida}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4">
                        {getCategoriaBadge(insumo.categoria)}
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className={`font-black text-base ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                              {insumo.stockActual}
                            </span>
                            {isLow && (
                              <span className="flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-sm bg-rose-100 text-rose-700">
                                <AlertTriangle className="w-3 h-3" />
                                Reponer
                              </span>
                            )}
                          </div>
                          {/* Progress bar */}
                          <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                            <div
                              className={`h-full rounded-full ${
                                isLow ? 'bg-rose-500' : ratio < 70 ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${ratio}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 font-medium">
                        {insumo.stockMinimo} {insumo.unidadMedida}
                      </td>

                      <td className="py-3.5 px-4 text-slate-600 text-xs">
                        <div className="flex items-center gap-1 text-slate-500">
                          <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
                          <span className="truncate max-w-[180px]">{insumo.ubicacionAlmacen || 'Sin asignar'}</span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-right font-semibold text-slate-800">
                        ${(insumo.precioUnitario || 0).toFixed(2)}
                      </td>

                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => openMovementDialog(insumo)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-100 hover:bg-sky-50 text-slate-700 hover:text-sky-700 border border-slate-200 hover:border-sky-200 transition-all"
                        >
                          <ArrowDownUp className="w-3.5 h-3.5" />
                          Movimiento
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal: Registrar Nuevo Insumo */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Boxes className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-bold text-slate-900">Registrar Insumo Médico</h3>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateInsumo} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Código Insumo</label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. INS-008-GAS"
                    value={newInsumo.codigo}
                    onChange={(e) => setNewInsumo({ ...newInsumo, codigo: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Categoría</label>
                  <select
                    value={newInsumo.categoria}
                    onChange={(e) => setNewInsumo({ ...newInsumo, categoria: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  >
                    <option value="DESCARTABLE">Descartable</option>
                    <option value="QUIRURGICO">Quirúrgico</option>
                    <option value="PROTECCION_PERSONAL">Protección Personal (EPP)</option>
                    <option value="REACTIVO">Reactivo de Laboratorio</option>
                    <option value="HIGIENE">Higiene y Desinfección</option>
                    <option value="EQUIPO">Equipo Médico</option>
                    <option value="OTRO">Otro</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Nombre / Descripción del Insumo</label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Gasas Estériles 10x10cm Paquete x5"
                  value={newInsumo.nombre}
                  onChange={(e) => setNewInsumo({ ...newInsumo, nombre: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stock Inicial</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newInsumo.stockActual}
                    onChange={(e) => setNewInsumo({ ...newInsumo, stockActual: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Stock Mínimo</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newInsumo.stockMinimo}
                    onChange={(e) => setNewInsumo({ ...newInsumo, stockMinimo: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Unidad Medida</label>
                  <input
                    type="text"
                    required
                    placeholder="Caja x100"
                    value={newInsumo.unidadMedida}
                    onChange={(e) => setNewInsumo({ ...newInsumo, unidadMedida: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Ubicación en Almacén</label>
                  <input
                    type="text"
                    placeholder="Rack B-03, Gaveta 2"
                    value={newInsumo.ubicacionAlmacen}
                    onChange={(e) => setNewInsumo({ ...newInsumo, ubicacionAlmacen: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Precio Unitario ($)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={newInsumo.precioUnitario}
                    onChange={(e) => setNewInsumo({ ...newInsumo, precioUnitario: e.target.value })}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-600/30 transition-all"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Guardar Insumo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Movimiento de Stock */}
      {showMovementModal && selectedInsumoForMovement && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <ArrowDownUp className="w-5 h-5 text-sky-600" />
                <h3 className="text-lg font-bold text-slate-900">Registrar Movimiento</h3>
              </div>
              <button
                onClick={() => setShowMovementModal(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
              <p className="font-bold text-slate-800 text-sm">{selectedInsumoForMovement.nombre}</p>
              <p className="text-slate-500">
                Código: <span className="font-mono">{selectedInsumoForMovement.codigo}</span> • Stock Actual:{' '}
                <span className="font-bold text-sky-700">{selectedInsumoForMovement.stockActual} {selectedInsumoForMovement.unidadMedida}</span>
              </p>
            </div>

            <form onSubmit={handleRegisterMovement} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Tipo de Movimiento</label>
                <select
                  value={movementForm.tipo}
                  onChange={(e) => setMovementForm({ ...movementForm, tipo: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                >
                  <option value="ENTRADA_COMPRA">📥 Entrada por Compra / Proveedor</option>
                  <option value="SALIDA_PACIENTE">📤 Salida para Atención / Pabellón</option>
                  <option value="TRANSFERENCIA_SEDE">🔁 Transferencia entre Sedes</option>
                  <option value="MERMA_VENCIMIENTO">⚠️ Merma / Vencimiento / Deterioro</option>
                  <option value="AJUSTE_AUDITORIA">⚖️ Ajuste por Conteo de Auditoría</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Cantidad a Mover ({selectedInsumoForMovement.unidadMedida})</label>
                <input
                  type="number"
                  min="1"
                  required
                  value={movementForm.cantidad}
                  onChange={(e) => setMovementForm({ ...movementForm, cantidad: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-1">Motivo / Justificación</label>
                <textarea
                  rows={2}
                  required
                  value={movementForm.motivo}
                  onChange={(e) => setMovementForm({ ...movementForm, motivo: e.target.value })}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500"
                  placeholder="Justificación del movimiento de inventario..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowMovementModal(false)}
                  className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex items-center gap-2 px-5 py-2 text-sm font-semibold bg-sky-600 hover:bg-sky-500 text-white rounded-xl shadow-lg shadow-sky-600/30 transition-all"
                >
                  {submitting && <Loader2 className="w-4 h-4 animate-spin" />}
                  Confirmar Movimiento
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

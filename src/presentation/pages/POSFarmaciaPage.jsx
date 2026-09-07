import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
  ShoppingBag,
  Search,
  Plus,
  Minus,
  Trash2,
  CreditCard,
  Receipt,
  User,
  Pill,
  CheckCircle2,
  RefreshCw,
  Loader2,
  Printer,
  Sparkles
} from 'lucide-react';
import { farmaciaService } from '@/infrastructure/Services/farmacia.service';
import { pacientesService } from '@/infrastructure/Services/pacientes.service';

export default function POSFarmaciaPage() {
  const [medicamentos, setMedicamentos] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPacienteId, setSelectedPacienteId] = useState('');
  const [carrito, setCarrito] = useState([]);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [ticketEmitido, setTicketEmitido] = useState(null);
  const [ventasRecientes, setVentasRecientes] = useState([]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [medsData, pacsData, ventasData] = await Promise.allSettled([
        farmaciaService.getMedicamentos(),
        pacientesService.getPacientes(),
        farmaciaService.listarVentasPOS(),
      ]);

      if (medsData.status === 'fulfilled') {
        setMedicamentos(medsData.value || []);
      }
      if (pacsData.status === 'fulfilled') {
        setPacientes(pacsData.value || []);
      }
      if (ventasData.status === 'fulfilled') {
        setVentasRecientes(ventasData.value || []);
      }
    } catch (err) {
      console.error('Error cargando datos de farmacia POS:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const filteredMeds = medicamentos.filter(m =>
    m.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.codigo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (m.principioActivo && m.principioActivo.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleAgregarAlCarrito = (med) => {
    if (med.stockActual <= 0) {
      toast.warning('Stock Agotado', { description: `El medicamento ${med.nombre} no cuenta con stock disponible.` });
      return;
    }

    setCarrito(prev => {
      const existing = prev.find(item => item.medicamentoId === med.id);
      if (existing) {
        if (existing.cantidad + 1 > med.stockActual) {
          toast.warning(`Límite de stock alcanzado (${med.stockActual} unid.).`);
          return prev;
        }
        return prev.map(item =>
          item.medicamentoId === med.id
            ? { ...item, cantidad: item.cantidad + 1, subtotal: (item.cantidad + 1) * item.precioUnitario }
            : item
        );
      } else {
        return [
          ...prev,
          {
            medicamentoId: med.id,
            nombreMedicamento: med.nombre,
            codigoMedicamento: med.codigo,
            cantidad: 1,
            precioUnitario: Number(med.precioUnitario),
            subtotal: Number(med.precioUnitario),
            stockMax: med.stockActual,
          },
        ];
      }
    });
    toast.success(`Agregado: ${med.nombre}`);
  };

  const handleUpdateCantidad = (medId, delta) => {
    setCarrito(prev =>
      prev
        .map(item => {
          if (item.medicamentoId === medId) {
            const nuevaCantidad = item.cantidad + delta;
            if (nuevaCantidad > item.stockMax) {
              toast.warning(`Stock máximo disponible: ${item.stockMax}`);
              return item;
            }
            return {
              ...item,
              cantidad: nuevaCantidad,
              subtotal: nuevaCantidad * item.precioUnitario,
            };
          }
          return item;
        })
        .filter(item => item.cantidad > 0)
    );
  };

  const handleEliminarItem = (medId) => {
    setCarrito(prev => prev.filter(item => item.medicamentoId !== medId));
  };

  const subtotalTotal = carrito.reduce((acc, item) => acc + item.subtotal, 0);
  const totalFinal = subtotalTotal;

  const handleFinalizarVenta = async () => {
    if (carrito.length === 0) {
      toast.warning('El carrito de compras está vacío.');
      return;
    }

    try {
      setProcessing(true);
      const ventaPayload = {
        pacienteId: selectedPacienteId ? Number(selectedPacienteId) : undefined,
        totalVenta: totalFinal,
        metodoPago,
        detalles: carrito.map(c => ({
          medicamentoId: c.medicamentoId,
          nombreMedicamento: c.nombreMedicamento,
          codigoMedicamento: c.codigoMedicamento,
          cantidad: c.cantidad,
          precioUnitario: c.precioUnitario,
          subtotal: c.subtotal,
        })),
      };

      const result = await farmaciaService.procesarVentaPOS(ventaPayload);
      toast.success('Venta de Farmacia Procesada', {
        description: `Ticket #${result?.numeroTicket || 'POS-OK'} emitido. Evento Kafka de deducción de stock despachado.`,
      });

      setTicketEmitido({
        ...result,
        totalVenta: totalFinal,
        metodoPago,
        detalles: carrito,
        fechaVenta: new Date().toISOString(),
      });

      setCarrito([]);
      loadData();
    } catch (err) {
      // Handled by Sonner in apiClient
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header del Módulo */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 mb-2 border border-sky-200">
            <ShoppingBag className="w-3.5 h-3.5 text-sky-600" /> Core Farmacia • Punto de Venta (POS)
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Despacho y Venta de Mostrador
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Caja rápida de farmacia, deducción automática de stock en tiempo real y facturación de recetas.
          </p>
        </div>

        <button
          onClick={loadData}
          disabled={loading}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition-colors shadow-xs"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Actualizar Stock</span>
        </button>
      </div>

      {/* Grid: Catálogo + Carrito */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Catálogo de Medicamentos */}
        <div className="lg:col-span-7 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900">Catálogo de Medicamentos</h2>
            <span className="text-xs text-slate-400">{filteredMeds.length} disponibles</span>
          </div>

          <div className="relative">
            <input
              type="text"
              placeholder="Buscar por nombre, principio activo o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-500 text-sm"
            />
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
            {filteredMeds.map((med) => {
              const bajoStock = med.stockActual <= med.stockMinimo;
              const sinStock = med.stockActual <= 0;

              return (
                <div
                  key={med.id}
                  className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                    sinStock ? 'border-slate-200 bg-slate-50/70 opacity-60' :
                    bajoStock ? 'border-amber-200 bg-amber-50/30 hover:border-amber-400' :
                    'border-slate-100 bg-white hover:border-sky-300 shadow-2xs'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-bold text-slate-900 leading-snug">{med.nombre}</h4>
                      <span className="text-[10px] font-bold text-slate-400 font-mono">{med.codigo}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">{med.presentacion || med.principioActivo || 'Presentación clínica'}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                    <div>
                      <span className="text-xs font-extrabold text-slate-900 block">
                        S/. {Number(med.precioUnitario).toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-bold ${sinStock ? 'text-red-600' : bajoStock ? 'text-amber-700' : 'text-emerald-700'}`}>
                        {sinStock ? 'Agotado' : `${med.stockActual} en stock`}
                      </span>
                    </div>

                    <button
                      onClick={() => handleAgregarAlCarrito(med)}
                      disabled={sinStock}
                      className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 disabled:bg-slate-300 text-white text-xs font-bold transition-colors inline-flex items-center gap-1 shadow-xs"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Agregar</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carrito de Venta y Cobro */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Receipt className="w-5 h-5 text-sky-600" />
                <span>Ticket de Despacho</span>
              </div>
              <span className="text-xs font-bold text-sky-600 bg-sky-50 px-2.5 py-0.5 rounded-full border border-sky-200">
                {carrito.length} ítems
              </span>
            </div>

            {/* Asignar Paciente (Opcional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Paciente Asociado</label>
              <select
                value={selectedPacienteId}
                onChange={(e) => setSelectedPacienteId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/20"
              >
                <option value="">-- Venta a Particular / Ambulatorio --</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.nombre} {p.apellidos} (DNI: {p.dni})
                  </option>
                ))}
              </select>
            </div>

            {/* Lista del Carrito */}
            <div className="space-y-2 max-h-[260px] overflow-y-auto pr-1">
              {carrito.length === 0 ? (
                <div className="text-center py-8 text-slate-400 text-xs">
                  <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p>Seleccione medicamentos del catálogo para despachar.</p>
                </div>
              ) : (
                carrito.map((item) => (
                  <div
                    key={item.medicamentoId}
                    className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-slate-900 truncate">{item.nombreMedicamento}</p>
                      <p className="text-slate-500 text-[11px]">S/. {item.precioUnitario.toFixed(2)} c/u</p>
                    </div>

                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg p-1">
                      <button
                        onClick={() => handleUpdateCantidad(item.medicamentoId, -1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-bold text-slate-900">{item.cantidad}</span>
                      <button
                        onClick={() => handleUpdateCantidad(item.medicamentoId, 1)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right">
                      <span className="font-bold text-slate-900 block">S/. {item.subtotal.toFixed(2)}</span>
                      <button
                        onClick={() => handleEliminarItem(item.medicamentoId)}
                        className="text-red-500 hover:text-red-700 text-[10px]"
                      >
                        Quitar
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Resumen de Pago y Checkout */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Método de Cobro</label>
              <select
                value={metodoPago}
                onChange={(e) => setMetodoPago(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800"
              >
                <option value="EFECTIVO">💵 Efectivo en Caja</option>
                <option value="TARJETA">💳 Tarjeta Débito / Crédito</option>
                <option value="YAPE">📱 Yape / Plin</option>
                <option value="TRANSFERENCIA">🏦 Transferencia Bancaria</option>
              </select>
            </div>

            <div className="p-4 bg-slate-900 text-white rounded-xl space-y-1">
              <div className="flex justify-between text-xs text-slate-300">
                <span>Subtotal Gravado:</span>
                <span>S/. {subtotalTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-extrabold text-white pt-1 border-t border-slate-800">
                <span>Total a Cobrar:</span>
                <span className="text-emerald-400">S/. {totalFinal.toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handleFinalizarVenta}
              disabled={processing || carrito.length === 0}
              className="w-full py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:bg-slate-300 text-white font-bold text-xs transition-all shadow-md shadow-emerald-600/20 inline-flex items-center justify-center gap-2"
            >
              {processing ? <Loader2 className="w-4 h-4 animate-spin" /> : <CreditCard className="w-4 h-4" />}
              <span>Emitir Ticket y Despachar (Kafka)</span>
            </button>
          </div>
        </div>
      </div>

      {/* Modal Ticket Impreso */}
      {ticketEmitido && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-6 space-y-4 text-center animate-in fade-in zoom-in-95 font-mono text-xs">
            <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900">OMNIHIS CLOUD PHARMACY</h3>
              <p className="text-[10px] text-slate-500">Comprobante de Venta Electrónica</p>
              <p className="font-bold text-slate-800 mt-1">Ticket #{ticketEmitido.numeroTicket || 'POS-2026-0901'}</p>
            </div>

            <div className="divide-y divide-slate-100 text-left text-[11px] py-2">
              {ticketEmitido.detalles?.map((d, i) => (
                <div key={i} className="py-1.5 flex justify-between">
                  <span>{d.cantidad}x {d.nombreMedicamento}</span>
                  <span className="font-bold">S/. {Number(d.subtotal).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-dashed border-slate-300 flex justify-between text-sm font-bold">
              <span>TOTAL PAGADO:</span>
              <span className="text-emerald-700">S/. {Number(ticketEmitido.totalVenta).toFixed(2)}</span>
            </div>

            <p className="text-[10px] text-slate-400">Método: {ticketEmitido.metodoPago} • Evento Kafka emitido</p>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setTicketEmitido(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white font-sans text-xs font-semibold"
              >
                Cerrar Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

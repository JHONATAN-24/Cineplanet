// ============================================================
// Bandeja de tickets — Operador L1 / Admin L2
// Móvil: cada ticket es una card apilada
// Escritorio: tabla completa
// Filtros: colapsables en un panel desplegable en móvil
// ============================================================
import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Inbox, Search, SlidersHorizontal, ChevronRight,
  ChevronLeft, RefreshCw, AlertCircle, X,
} from 'lucide-react';
import { useTickets } from '../../context/TicketsContext';
import { BadgeEstado, BadgePrioridad, BadgePasarela } from '../../components/ui/Badge';
import { SkeletonCard, SkeletonRow } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { formatearFechaHora, formatearSoles } from '../../utils/format';
import { calcularSla } from '../../utils/sla';
import type { EstadoIncidencia, Prioridad, Pasarela, FiltrosBandeja } from '../../types';

const POR_PAGINA = 10;

export default function BandejaPage() {
  const { items, total, cargando, cargarFiltrados } = useTickets();
  const location = useLocation();
  const baseHref = location.pathname.startsWith('/admin') ? '/admin/bandeja' : '/operador';

  const [filtros, setFiltros] = useState<FiltrosBandeja>({
    estado: '', prioridad: '', pasarela: '', busqueda: '',
    pagina: 1, porPagina: POR_PAGINA,
  });
  const [panelFiltros, setPanelFiltros] = useState(false);

  const cargar = useCallback(() => cargarFiltrados(filtros), [cargarFiltrados, filtros]);
  useEffect(() => { cargar(); }, [cargar]);

  const setF = <K extends keyof FiltrosBandeja>(k: K, v: FiltrosBandeja[K]) =>
    setFiltros((p) => ({ ...p, [k]: v, pagina: 1 }));

  const limpiarFiltros = () =>
    setFiltros({ estado: '', prioridad: '', pasarela: '', busqueda: '', pagina: 1, porPagina: POR_PAGINA });

  const hayFiltros = !!(filtros.estado || filtros.prioridad || filtros.pasarela || filtros.busqueda);
  const totalPaginas = Math.max(1, Math.ceil(total / POR_PAGINA));

  /* ── Chip de filtro activo ─────────────────────────────── */
  const ChipFiltro = ({ label, onQuitar }: { label: string; onQuitar: () => void }) => (
    <span className="inline-flex items-center gap-1 text-xs font-semibold bg-primary/10 text-primary px-2.5 py-1 rounded-full border border-primary/20">
      {label}
      <button onClick={onQuitar} className="hover:text-accent-crimson transition-colors" aria-label={`Quitar filtro ${label}`}>
        <X size={12} />
      </button>
    </span>
  );

  return (
    <div className="animate-fade-in">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-app-text flex items-center gap-2">
            <Inbox size={22} className="text-primary shrink-0" aria-hidden="true" />
            Bandeja de tickets
          </h1>
          <p className="text-app-muted text-sm mt-0.5">
            {total} ticket{total !== 1 ? 's' : ''}
          </p>
        </div>
        <Button
          variante="secondary" tamano="sm"
          icono={<RefreshCw size={15} />}
          onClick={cargar} cargando={cargando}
        >
          Actualizar
        </Button>
      </div>

      {/* Barra búsqueda + toggle filtros */}
      <div className="bg-white rounded-2xl border border-app-border shadow-sm p-3 sm:p-4 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar ID, cliente, correo…"
              value={filtros.busqueda}
              onChange={(e) => setF('busqueda', e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-app-border rounded-xl
                focus:outline-none focus:border-primary min-h-[44px]"
              aria-label="Buscar tickets"
            />
          </div>
          <button
            onClick={() => setPanelFiltros((v) => !v)}
            aria-expanded={panelFiltros}
            aria-label="Mostrar filtros avanzados"
            className={`flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold
              transition-colors min-h-[44px] min-w-[44px]
              ${panelFiltros || hayFiltros
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-app-border text-app-muted hover:border-primary/40'}`}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Filtros</span>
            {hayFiltros && <span className="w-2 h-2 rounded-full bg-primary sm:hidden" aria-hidden="true" />}
          </button>
        </div>

        {/* Panel colapsable de filtros */}
        <div className={`overflow-hidden transition-all duration-200 ${panelFiltros ? 'max-h-64 mt-3' : 'max-h-0'}`}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3">
            {/* Estado */}
            <select
              value={filtros.estado}
              onChange={(e) => setF('estado', e.target.value as EstadoIncidencia | '')}
              className="text-sm border-2 border-app-border rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary bg-white min-h-[44px]"
              aria-label="Estado"
            >
              <option value="">Todos los estados</option>
              {(['Registrado','En Validación','Conciliado','Reembolsado','Escalado','Cerrado'] as EstadoIncidencia[])
                .map((e) => <option key={e} value={e}>{e}</option>)}
            </select>

            {/* Prioridad */}
            <select
              value={filtros.prioridad}
              onChange={(e) => setF('prioridad', e.target.value as Prioridad | '')}
              className="text-sm border-2 border-app-border rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary bg-white min-h-[44px]"
              aria-label="Prioridad"
            >
              <option value="">Todas las prioridades</option>
              {(['Baja','Media','Alta','Crítica'] as Prioridad[]).map((p) => <option key={p} value={p}>{p}</option>)}
            </select>

            {/* Pasarela */}
            <select
              value={filtros.pasarela}
              onChange={(e) => setF('pasarela', e.target.value as Pasarela | '')}
              className="text-sm border-2 border-app-border rounded-xl px-3 py-2.5 focus:outline-none focus:border-primary bg-white min-h-[44px]"
              aria-label="Pasarela"
            >
              <option value="">Todas las pasarelas</option>
              <option value="Niubiz">Niubiz</option>
              <option value="Izipay">Izipay</option>
            </select>

            {/* Limpiar */}
            {hayFiltros && (
              <button
                onClick={limpiarFiltros}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 text-sm font-semibold
                  text-accent-crimson border-2 border-accent-crimson/30 rounded-xl hover:bg-red-50 transition-colors min-h-[44px]"
              >
                <X size={15} aria-hidden="true" /> Limpiar filtros
              </button>
            )}
          </div>
        </div>

        {/* Chips de filtros activos */}
        {hayFiltros && (
          <div className="flex flex-wrap gap-2 mt-2">
            {filtros.estado    && <ChipFiltro label={filtros.estado}    onQuitar={() => setF('estado', '')} />}
            {filtros.prioridad && <ChipFiltro label={filtros.prioridad} onQuitar={() => setF('prioridad', '')} />}
            {filtros.pasarela  && <ChipFiltro label={filtros.pasarela}  onQuitar={() => setF('pasarela', '')} />}
            {filtros.busqueda  && <ChipFiltro label={`"${filtros.busqueda}"`} onQuitar={() => setF('busqueda', '')} />}
          </div>
        )}
      </div>

      {/* ── Vista MÓVIL — cards apiladas (< md) ───────────── */}
      <div className="md:hidden flex flex-col gap-3">
        {cargando ? (
          [1,2,3,4].map((i) => <SkeletonCard key={i} />)
        ) : items.length === 0 ? (
          <div className="bg-white rounded-2xl border border-app-border shadow-sm">
            <EmptyState icono={Inbox} titulo="Sin tickets" descripcion="No hay tickets con los filtros actuales." />
          </div>
        ) : (
          items.map((ticket) => {
            const sla = calcularSla(ticket);
            const href = `${baseHref}/ticket/${ticket.id}`;
            return (
              <Link
                key={ticket.id}
                to={href}
                className="bg-white rounded-2xl border border-app-border shadow-sm p-4
                  hover:border-primary-light hover:shadow-md transition-all group flex items-start justify-between gap-3"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                    <span className="font-mono text-xs font-bold text-app-muted">{ticket.id}</span>
                    <BadgeEstado estado={ticket.estado} size="sm" />
                  </div>
                  <p className="font-semibold text-app-text text-sm truncate">{ticket.clienteNombre}</p>
                  <p className="text-xs text-app-muted truncate">{ticket.clienteCorreo}</p>
                  <div className="flex flex-wrap items-center gap-2 mt-2">
                    <BadgePrioridad prioridad={ticket.prioridad} size="sm" />
                    <BadgePasarela pasarela={ticket.transaccion.pasarela} />
                    <span className="text-xs font-semibold text-app-text">{formatearSoles(ticket.transaccion.monto)}</span>
                    {/* Semáforo SLA */}
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: `${sla.color}18`, color: sla.color }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: sla.color }} aria-hidden="true" />
                      {sla.status === 'ok' ? 'OK' : sla.status === 'riesgo' ? 'Riesgo' : 'Vencido'}
                    </span>
                  </div>
                  <p className="text-xs text-app-muted mt-1">{formatearFechaHora(ticket.fechaCreacion)}</p>
                </div>
                <ChevronRight size={18} className="text-app-muted group-hover:text-primary-light shrink-0 mt-1" aria-hidden="true" />
              </Link>
            );
          })
        )}
      </div>

      {/* ── Vista ESCRITORIO — tabla (>= md) ──────────────── */}
      <div className="hidden md:block bg-white rounded-2xl border border-app-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-app-border bg-app-bg text-xs font-bold text-app-muted uppercase tracking-wide">
              {['ID','Cliente','Estado','Prioridad','Pasarela','Monto','SLA','Fecha',''].map((h) => (
                <th key={h} className="px-4 py-3 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              [1,2,3,4,5].map((i) => <SkeletonRow key={i} columnas={9} />)
            ) : items.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <EmptyState icono={Inbox} titulo="Sin tickets" descripcion="No hay tickets con los filtros actuales." />
                </td>
              </tr>
            ) : (
              items.map((ticket) => {
                const sla = calcularSla(ticket);
                return (
                  <tr key={ticket.id} className="border-b border-app-border hover:bg-primary/5 transition-colors">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs font-bold text-app-muted whitespace-nowrap">{ticket.id}</span>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-semibold text-app-text text-xs max-w-[140px] truncate">{ticket.clienteNombre}</p>
                      <p className="text-xs text-app-muted max-w-[140px] truncate">{ticket.clienteCorreo}</p>
                    </td>
                    <td className="px-4 py-3"><BadgeEstado estado={ticket.estado} size="sm" /></td>
                    <td className="px-4 py-3"><BadgePrioridad prioridad={ticket.prioridad} size="sm" /></td>
                    <td className="px-4 py-3"><BadgePasarela pasarela={ticket.transaccion.pasarela} /></td>
                    <td className="px-4 py-3 font-semibold text-app-text text-xs whitespace-nowrap">
                      {formatearSoles(ticket.transaccion.monto)}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: sla.color }} aria-hidden="true" />
                        <span className="text-xs font-medium whitespace-nowrap" style={{ color: sla.color }}>
                          {sla.status === 'ok' ? 'OK' : sla.status === 'riesgo' ? 'Riesgo' : 'Vencido'}
                        </span>
                        {ticket.slaVencido && <AlertCircle size={12} className="text-accent-crimson" aria-hidden="true" />}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-app-muted whitespace-nowrap">
                      {formatearFechaHora(ticket.fechaCreacion)}
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        to={`${baseHref}/ticket/${ticket.id}`}
                        className="inline-flex items-center gap-1 text-xs text-primary-light font-semibold hover:underline min-h-[44px] justify-center"
                        aria-label={`Ver ticket ${ticket.id}`}
                      >
                        Ver <ChevronRight size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      {totalPaginas > 1 && (
        <div className="flex items-center justify-between mt-4 flex-wrap gap-2">
          <p className="text-xs text-app-muted">Página {filtros.pagina} de {totalPaginas}</p>
          <div className="flex gap-2">
            <Button
              variante="outline" tamano="sm"
              icono={<ChevronLeft size={15} />}
              onClick={() => setFiltros((p) => ({ ...p, pagina: Math.max(1, p.pagina - 1) }))}
              disabled={filtros.pagina <= 1}
              aria-label="Página anterior"
            >
              <span className="hidden sm:inline">Anterior</span>
            </Button>
            <Button
              variante="outline" tamano="sm"
              iconoDerecha={<ChevronRight size={15} />}
              onClick={() => setFiltros((p) => ({ ...p, pagina: Math.min(totalPaginas, p.pagina + 1) }))}
              disabled={filtros.pagina >= totalPaginas}
              aria-label="Página siguiente"
            >
              <span className="hidden sm:inline">Siguiente</span>
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

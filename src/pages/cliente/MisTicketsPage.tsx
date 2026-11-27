// ============================================================
// Mis Tickets — lista responsive (cards en móvil, lista en md+)
// ============================================================
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Ticket, ChevronRight, Search, SlidersHorizontal, X, PlusCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketsContext';
import { BadgeEstado, BadgePrioridad, BadgePasarela } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import Button from '../../components/ui/Button';
import { formatearFechaHora, formatearSoles } from '../../utils/format';
import type { EstadoIncidencia } from '../../types';

const ESTADOS: EstadoIncidencia[] = ['Registrado','En Validación','Conciliado','Reembolsado','Escalado','Cerrado'];

export default function MisTicketsPage() {
  const { usuario } = useAuth();
  const { items, cargando, cargarPorCliente } = useTickets();
  const [busqueda, setBusqueda] = useState('');
  const [filtroEstado, setFiltroEstado] = useState<EstadoIncidencia | ''>('');
  const [filtrosVisibles, setFiltrosVisibles] = useState(false);

  useEffect(() => {
    if (usuario) cargarPorCliente(usuario.id);
  }, [usuario, cargarPorCliente]);

  const filtrados = items
    .filter((t) => !filtroEstado || t.estado === filtroEstado)
    .filter((t) => !busqueda ||
      t.id.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.transaccion.pelicula.toLowerCase().includes(busqueda.toLowerCase()) ||
      t.transaccion.cine.toLowerCase().includes(busqueda.toLowerCase())
    )
    .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));

  const hayFiltros = !!busqueda || !!filtroEstado;

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-app-text flex items-center gap-2 mb-1">
          <Ticket size={22} className="text-primary shrink-0" aria-hidden="true" />
          Mis reclamos
        </h1>
        <p className="text-app-muted text-sm">Historial completo de tus solicitudes de cobro no reflejado</p>
      </div>

      {/* Barra de búsqueda + toggle filtros */}
      <div className="bg-white rounded-2xl border border-app-border shadow-sm p-3 sm:p-4 mb-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-app-muted" aria-hidden="true" />
            <input
              type="search"
              placeholder="Buscar por ID, película, cine..."
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 text-sm border-2 border-app-border rounded-xl
                focus:outline-none focus:border-primary min-h-[44px]"
              aria-label="Buscar tickets"
            />
          </div>
          <button
            onClick={() => setFiltrosVisibles((v) => !v)}
            aria-expanded={filtrosVisibles}
            aria-label="Mostrar filtros"
            className={`flex items-center gap-1.5 px-3 py-2.5 rounded-xl border-2 text-sm font-semibold
              transition-colors min-h-[44px] min-w-[44px] justify-center sm:justify-start
              ${filtrosVisibles || hayFiltros
                ? 'border-primary bg-primary/5 text-primary'
                : 'border-app-border text-app-muted hover:border-primary/40'}`}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Filtros</span>
            {hayFiltros && (
              <span className="w-2 h-2 rounded-full bg-primary sm:hidden" aria-hidden="true" />
            )}
          </button>
        </div>

        {/* Panel de filtros colapsable */}
        <div className={`overflow-hidden transition-all duration-200 ${filtrosVisibles ? 'max-h-32 mt-3' : 'max-h-0'}`}>
          <div className="flex flex-col sm:flex-row gap-2">
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value as EstadoIncidencia | '')}
              className="flex-1 text-sm border-2 border-app-border rounded-xl px-3 py-2.5
                focus:outline-none focus:border-primary bg-white min-h-[44px]"
              aria-label="Filtrar por estado"
            >
              <option value="">Todos los estados</option>
              {ESTADOS.map((e) => <option key={e} value={e}>{e}</option>)}
            </select>
            {hayFiltros && (
              <button
                onClick={() => { setBusqueda(''); setFiltroEstado(''); }}
                className="flex items-center gap-1.5 px-3 py-2.5 text-sm font-semibold text-accent-crimson
                  border-2 border-accent-crimson/30 rounded-xl hover:bg-red-50 transition-colors min-h-[44px]"
              >
                <X size={15} aria-hidden="true" /> Limpiar
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Conteo */}
      <p className="text-xs text-app-muted mb-3 font-medium px-1">
        {filtrados.length} resultado{filtrados.length !== 1 ? 's' : ''}
        {hayFiltros && ' (filtrado)'}
      </p>

      {/* Lista */}
      {cargando ? (
        <div className="flex flex-col gap-3">
          {[1,2,3,4].map((i) => <SkeletonCard key={i} />)}
        </div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-2xl border border-app-border shadow-sm">
          <EmptyState
            icono={Ticket}
            titulo="No se encontraron reclamos"
            descripcion="Ajusta los filtros o registra un nuevo reclamo."
            accion={
              !hayFiltros ? (
                <Link to="/cliente/nuevo-ticket">
                  <Button variante="cta" icono={<PlusCircle size={15} />}>
                    Reportar cobro no reflejado
                  </Button>
                </Link>
              ) : undefined
            }
          />
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {filtrados.map((t) => (
            <Link
              key={t.id}
              to={`/cliente/mis-tickets/${t.id}`}
              className="bg-white rounded-2xl border border-app-border shadow-sm
                hover:border-primary-light hover:shadow-md transition-all group
                p-4 sm:p-5 flex items-start sm:items-center justify-between gap-3"
            >
              <div className="flex-1 min-w-0">
                {/* ID — solo sm+ */}
                <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
                  <span className="font-mono text-xs font-bold text-app-muted hidden sm:inline">{t.id}</span>
                  <BadgeEstado estado={t.estado} size="sm" />
                  <BadgePrioridad prioridad={t.prioridad} size="sm" />
                  <BadgePasarela pasarela={t.transaccion.pasarela} />
                </div>
                <p className="font-semibold text-app-text text-sm truncate">{t.transaccion.pelicula}</p>
                <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1 text-xs text-app-muted">
                  <span className="truncate max-w-[180px] sm:max-w-none">{t.transaccion.cine}</span>
                  <span className="font-semibold text-app-text">{formatearSoles(t.transaccion.monto)}</span>
                  <span className="hidden sm:inline">{formatearFechaHora(t.fechaCreacion)}</span>
                </div>
                <p className="text-xs text-app-muted sm:hidden mt-0.5">{formatearFechaHora(t.fechaCreacion)}</p>
                {t.conciliacion?.codigoQR && (
                  <p className="mt-1.5 text-xs font-semibold text-accent-green">
                    ✓ QR: {t.conciliacion.codigoQR}
                  </p>
                )}
              </div>
              <ChevronRight
                size={18}
                className="text-app-muted group-hover:text-primary-light shrink-0 transition-colors"
                aria-hidden="true"
              />
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================================
// Dashboard del Cliente — responsive mobile-first
// ============================================================
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle, Ticket, CheckCircle2, Clock,
  AlertCircle, ArrowRight, HelpCircle,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTickets } from '../../context/TicketsContext';
import Button from '../../components/ui/Button';
import { BadgeEstado, BadgePrioridad } from '../../components/ui/Badge';
import { SkeletonCard } from '../../components/ui/Skeleton';
import EmptyState from '../../components/ui/EmptyState';
import { formatearFechaHora, formatearSoles } from '../../utils/format';
import DecorativeBanner from '../../components/layout/DecorativeBanner';

export default function ClienteDashboard() {
  const { usuario } = useAuth();
  const { items, cargando, cargarPorCliente } = useTickets();

  useEffect(() => {
    if (usuario) cargarPorCliente(usuario.id);
  }, [usuario, cargarPorCliente]);

  const activos   = items.filter((t) => !['Cerrado','Conciliado','Reembolsado'].includes(t.estado));
  const resueltos = items.filter((t) =>  ['Cerrado','Conciliado','Reembolsado'].includes(t.estado));
  const recientes = [...items]
    .sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion))
    .slice(0, 5);

  const stats = [
    { label: 'Activos',         valor: activos.length,                                     Icon: Clock,        color: 'text-accent-teal',    bg: 'bg-teal-50' },
    { label: 'Resueltos',       valor: resueltos.length,                                    Icon: CheckCircle2, color: 'text-accent-green',   bg: 'bg-green-50' },
    { label: 'Total',           valor: items.length,                                        Icon: Ticket,       color: 'text-primary-light',  bg: 'bg-blue-50' },
    { label: 'SLA vencidos',    valor: items.filter((t) => t.slaVencido).length,            Icon: AlertCircle,  color: 'text-accent-crimson', bg: 'bg-red-50' },
  ];

  return (
    <div className="animate-fade-in space-y-4 sm:space-y-6">

      {/* Hero banner */}
      <div className="relative bg-primary-dark rounded-2xl overflow-hidden p-5 sm:p-6 md:p-8 shadow-sm">
        <DecorativeBanner className="absolute top-0 inset-x-0 h-2" />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-1">
          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white mb-1">
              Hola, {usuario?.nombre.split(' ')[0]} 👋
            </h1>
            <p className="text-white/70 text-sm">
              Gestiona tus reclamos de cobros no reflejados
            </p>
          </div>
          <Link to="/cliente/nuevo-ticket" className="shrink-0">
            <Button variante="cta" tamano="md" icono={<PlusCircle size={18} />} fullWidth>
              Reportar cobro no reflejado
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats — 2 cols móvil, 4 cols md+ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {stats.map(({ label, valor, Icon, color, bg }) => (
          <div key={label} className="bg-white rounded-2xl border border-app-border p-3 sm:p-4 shadow-sm flex items-center gap-3">
            <div className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl ${bg} flex items-center justify-center shrink-0`}>
              <Icon size={18} className={color} aria-hidden="true" />
            </div>
            <div className="min-w-0">
              <p className="text-xl sm:text-2xl font-extrabold text-app-text leading-none">{valor}</p>
              <p className="text-xs text-app-muted font-medium mt-0.5 truncate">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Contenido principal — 1 col móvil, 3 cols lg */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">

        {/* Tickets recientes */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-app-border shadow-sm">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-app-border">
            <h2 className="font-bold text-app-text flex items-center gap-2 text-sm sm:text-base">
              <Ticket size={16} className="text-primary-light shrink-0" aria-hidden="true" />
              Reclamos recientes
            </h2>
            <Link
              to="/cliente/mis-tickets"
              className="text-xs text-primary-light font-semibold hover:underline flex items-center gap-1 shrink-0"
            >
              Ver todos <ArrowRight size={13} />
            </Link>
          </div>

          <div className="p-3 sm:p-4 flex flex-col gap-2 sm:gap-3">
            {cargando ? (
              [1, 2, 3].map((i) => <SkeletonCard key={i} />)
            ) : recientes.length === 0 ? (
              <EmptyState
                icono={Ticket}
                titulo="Sin reclamos registrados"
                descripcion="Cuando registres un reclamo aparecerá aquí."
                accion={
                  <Link to="/cliente/nuevo-ticket">
                    <Button variante="cta" icono={<PlusCircle size={16} />}>
                      Reportar cobro no reflejado
                    </Button>
                  </Link>
                }
              />
            ) : (
              recientes.map((t) => (
                <Link
                  key={t.id}
                  to={`/cliente/mis-tickets/${t.id}`}
                  className="flex items-start sm:items-center justify-between p-3 sm:p-4 rounded-xl border
                    border-app-border hover:border-primary-light hover:bg-primary/5 transition-all group gap-3"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-1.5 mb-1">
                      <span className="text-xs font-mono font-bold text-app-muted hidden sm:inline">{t.id}</span>
                      <BadgeEstado estado={t.estado} size="sm" />
                      <BadgePrioridad prioridad={t.prioridad} size="sm" />
                    </div>
                    <p className="text-sm font-semibold text-app-text truncate">{t.transaccion.pelicula}</p>
                    <p className="text-xs text-app-muted mt-0.5 truncate">
                      {t.transaccion.cine} · {formatearSoles(t.transaccion.monto)}
                    </p>
                    <p className="text-xs text-app-muted sm:hidden mt-0.5">
                      {formatearFechaHora(t.fechaCreacion)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <p className="text-xs text-app-muted hidden sm:block">{formatearFechaHora(t.fechaCreacion)}</p>
                    <ArrowRight size={15} className="text-app-muted group-hover:text-primary-light transition-colors" aria-hidden="true" />
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>

        {/* Columna lateral */}
        <div className="flex flex-col gap-4">
          {/* Accesos rápidos */}
          <div className="bg-white rounded-2xl border border-app-border shadow-sm p-4 sm:p-5">
            <h2 className="font-bold text-app-text mb-4 flex items-center gap-2 text-sm">
              <HelpCircle size={16} className="text-primary-light" aria-hidden="true" />
              Accesos rápidos
            </h2>
            <div className="flex flex-col gap-2">
              {[
                { label: 'Nuevo reclamo', desc: 'Reportar cobro no reflejado', href: '/cliente/nuevo-ticket', cta: true },
                { label: 'Mis reclamos',  desc: 'Ver historial completo',       href: '/cliente/mis-tickets', cta: false },
                { label: 'Ayuda / FAQ',   desc: 'Preguntas frecuentes',         href: '/cliente/faq',         cta: false },
              ].map(({ label, desc, href, cta }) => (
                <Link
                  key={href}
                  to={href}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all group min-h-[44px]
                    ${cta
                      ? 'border-accent-yellow/50 bg-accent-yellow/10 hover:bg-accent-yellow/20'
                      : 'border-app-border hover:border-primary-light hover:bg-primary/5'}`}
                >
                  <div className="min-w-0">
                    <p className={`text-sm font-semibold truncate ${cta ? 'text-primary-dark' : 'text-app-text'}`}>{label}</p>
                    <p className="text-xs text-app-muted">{desc}</p>
                  </div>
                  <ArrowRight size={14} className="text-app-muted group-hover:text-primary-light shrink-0 ml-2" aria-hidden="true" />
                </Link>
              ))}
            </div>
          </div>

          {/* Tip */}
          <div className="bg-accent-yellow/10 border border-accent-yellow/40 rounded-2xl p-4">
            <p className="text-xs font-bold text-primary-dark mb-1">💡 ¿Sabías que...?</p>
            <p className="text-xs text-primary-dark/80 leading-relaxed">
              El 90% de los casos se resuelve automáticamente en menos de 15 minutos con la conciliación directa con la pasarela.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

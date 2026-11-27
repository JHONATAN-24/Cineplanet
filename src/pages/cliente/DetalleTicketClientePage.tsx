// ============================================================
// Detalle del ticket del cliente — responsive, columnas apiladas
// ============================================================
import { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronRight, Ticket, CreditCard, MapPin, Film,
  Calendar, QrCode, ArrowLeft, Clock, Hash,
} from 'lucide-react';
import { useTickets } from '../../context/TicketsContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BadgeEstado, BadgePrioridad, BadgePasarela } from '../../components/ui/Badge';
import TicketStepper from '../../components/tickets/TicketStepper';
import EncuestaCsat from '../../components/tickets/EncuestaCsat';
import Spinner from '../../components/ui/Spinner';
import { formatearFechaHora, formatearSoles, formatearDuracion } from '../../utils/format';
import { calcularSla } from '../../utils/sla';
import type { EncuestaSatisfaccion } from '../../types';

export default function DetalleTicketClientePage() {
  const { id } = useParams<{ id: string }>();
  const { ticketActivo: ticket, cargando, cargarTicket, enviarEncuesta } = useTickets();
  const { usuario } = useAuth();
  const { mostrar } = useToast();

  useEffect(() => { if (id) cargarTicket(id); }, [id, cargarTicket]);

  const handleEncuesta = async (encuesta: EncuestaSatisfaccion) => {
    if (!ticket) return;
    await enviarEncuesta(ticket.id, encuesta);
    mostrar('¡Gracias por tu calificación!', 'exito');
  };

  if (cargando) {
    return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  }
  if (!ticket) {
    return (
      <div className="text-center py-16">
        <p className="text-app-muted text-sm mb-3">Ticket no encontrado.</p>
        <Link to="/cliente/mis-tickets" className="text-primary-light text-sm font-semibold inline-flex items-center gap-1">
          <ArrowLeft size={14} /> Volver
        </Link>
      </div>
    );
  }

  const sla = calcularSla(ticket);
  const resuelto = ['Conciliado','Reembolsado','Cerrado'].includes(ticket.estado);

  /* Fila de dato genérica */
  const FilaDato = ({ Icon, label, valor }: { Icon: typeof Clock; label: string; valor: string }) => (
    <div className="flex items-start gap-2 bg-app-bg rounded-xl p-2.5 sm:p-3">
      <Icon size={13} className="text-app-muted shrink-0 mt-0.5" aria-hidden="true" />
      <div className="min-w-0">
        <p className="text-[10px] text-app-muted uppercase tracking-wide">{label}</p>
        <p className="text-xs font-semibold text-app-text leading-snug">{valor}</p>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-app-muted mb-4 flex-wrap" aria-label="Ruta de navegación">
        <Link to="/cliente" className="hover:text-primary-light">Inicio</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <Link to="/cliente/mis-tickets" className="hover:text-primary-light">Mis reclamos</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className="text-primary font-semibold font-mono truncate max-w-[140px] sm:max-w-none">{ticket.id}</span>
      </nav>

      {/* Cabecera del ticket */}
      <div className="bg-white rounded-2xl border border-app-border shadow-sm p-4 sm:p-5 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5 mb-1">
              <span className="font-mono text-xs font-bold text-app-muted hidden sm:inline">{ticket.id}</span>
              <BadgeEstado estado={ticket.estado} />
              <BadgePrioridad prioridad={ticket.prioridad} />
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-app-text">{ticket.transaccion.pelicula}</h1>
          </div>
          {/* Semáforo SLA */}
          <div
            className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0"
            style={{ backgroundColor: `${sla.color}18`, color: sla.color }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sla.color }} aria-hidden="true" />
            <span className="hidden sm:inline">{sla.status === 'ok' ? 'En tiempo' : sla.status === 'riesgo' ? 'En riesgo' : 'SLA vencido'}</span>
            <span className="sm:hidden">{sla.status === 'ok' ? 'OK' : sla.status === 'riesgo' ? 'Riesgo' : 'Vencido'}</span>
          </div>
        </div>

        {/* Grid de datos — 2 cols en xs, 3 en sm */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3 text-xs mb-3">
          <FilaDato Icon={MapPin}     label="Sede"           valor={ticket.transaccion.cine} />
          <FilaDato Icon={Film}       label="Película"       valor={ticket.transaccion.pelicula} />
          <FilaDato Icon={Calendar}   label="Función"        valor={formatearFechaHora(ticket.transaccion.fechaFuncion)} />
          <FilaDato Icon={CreditCard} label="Monto"          valor={formatearSoles(ticket.transaccion.monto)} />
          <FilaDato Icon={Hash}       label="N° operación"   valor={ticket.transaccion.numerOperacion} />
          <FilaDato Icon={Clock}      label="Registrado"     valor={formatearFechaHora(ticket.fechaCreacion)} />
        </div>

        <div className="flex flex-wrap gap-2">
          <BadgePasarela pasarela={ticket.transaccion.pasarela} />
          <span className="text-xs bg-app-bg px-2.5 py-1 rounded-lg text-app-muted">
            Tarjeta ···· <strong className="text-app-text">{ticket.transaccion.ultimosCuatroDigitos}</strong>
          </span>
        </div>
      </div>

      {/* QR emitido */}
      {ticket.conciliacion?.codigoQR && (
        <div className="bg-green-50 border border-accent-green/30 rounded-2xl p-4 sm:p-5 mb-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-white border-2 border-accent-green/30 flex items-center justify-center shrink-0">
              <QrCode size={30} className="text-accent-green" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-accent-green text-sm mb-1">✓ Entrada digital emitida</p>
              <p className="text-xs text-app-muted mb-2 leading-relaxed">Tu código QR está listo. Preséntalo en el acceso del cine.</p>
              <code className="text-xs font-mono bg-white px-3 py-1.5 rounded-lg border border-accent-green/20 text-accent-green font-bold break-all">
                {ticket.conciliacion.codigoQR}
              </code>
            </div>
          </div>
        </div>
      )}

      {/* Reembolso */}
      {ticket.estado === 'Reembolsado' && (
        <div className="bg-purple-50 border border-accent-purple/30 rounded-2xl p-4 sm:p-5 mb-4">
          <p className="font-bold text-accent-purple text-sm mb-1">💰 Reembolso procesado</p>
          <p className="text-xs text-app-muted leading-relaxed">
            Se procesó el reembolso de <strong>{formatearSoles(ticket.transaccion.monto)}</strong> a tu tarjeta terminada en ···· {ticket.transaccion.ultimosCuatroDigitos}.
            Puede tardar entre 2 y 7 días hábiles según tu banco.
          </p>
        </div>
      )}

      {/* Seguimiento y conciliación — apilados en móvil, 2 cols en sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        {/* Stepper */}
        <div className="bg-white rounded-2xl border border-app-border shadow-sm p-4 sm:p-5">
          <h2 className="font-bold text-app-text text-sm mb-4 flex items-center gap-2">
            <Clock size={15} className="text-primary-light" aria-hidden="true" />
            Seguimiento
          </h2>
          <TicketStepper historial={ticket.historial} estadoActual={ticket.estado} />
        </div>

        {/* Conciliación */}
        <div className="bg-white rounded-2xl border border-app-border shadow-sm p-4 sm:p-5">
          <h2 className="font-bold text-app-text text-sm mb-4">Conciliación</h2>
          {ticket.conciliacion ? (
            <div className="flex flex-col gap-2 text-xs">
              {[
                ['Resultado', ticket.conciliacion.resultado],
                ['Duración', ticket.conciliacion.duracionMs ? `${(ticket.conciliacion.duracionMs/1000).toFixed(1)} seg.` : '—'],
                ...(ticket.tiempoResolucion ? [['Tiempo resolución', formatearDuracion(ticket.tiempoResolucion)]] : []),
              ].map(([lbl, val]) => (
                <div key={lbl} className="flex justify-between bg-app-bg rounded-lg p-2">
                  <span className="text-app-muted">{lbl}</span>
                  <span className="font-semibold text-app-text text-right">{val}</span>
                </div>
              ))}
              <p className="mt-1 p-2.5 bg-app-bg rounded-xl text-app-muted leading-relaxed">
                {ticket.conciliacion.mensajeResultado}
              </p>
            </div>
          ) : (
            <p className="text-xs text-app-muted">Conciliación en curso o pendiente.</p>
          )}

          {/* Barra SLA */}
          <div className="mt-4">
            <div className="flex justify-between text-xs mb-1">
              <span className="text-app-muted">SLA ({ticket.slaObjetivo} min)</span>
              <span className="font-semibold" style={{ color: sla.color }}>
                {sla.status === 'vencido'
                  ? 'Vencido'
                  : `${Math.round(Math.max(0, sla.tiempoRestante))} min restantes`}
              </span>
            </div>
            <div className="w-full bg-app-border rounded-full h-2">
              <div
                className="h-2 rounded-full transition-all"
                style={{ width: `${Math.min(100, sla.porcentaje)}%`, backgroundColor: sla.color }}
                role="progressbar"
                aria-valuenow={Math.round(sla.porcentaje)}
                aria-valuemin={0}
                aria-valuemax={100}
              />
            </div>
          </div>
        </div>
      </div>

      {/* CSAT */}
      {resuelto && (
        <div className="mb-4">
          <EncuestaCsat
            ticketId={ticket.id}
            clienteId={ticket.clienteId}
            onEnviar={handleEncuesta}
            enviada={!!ticket.encuesta}
            calificacionActual={ticket.encuesta?.calificacion}
          />
        </div>
      )}

      {/* Descripción */}
      <div className="bg-white rounded-2xl border border-app-border shadow-sm p-4 sm:p-5 mb-4">
        <h2 className="font-bold text-app-text text-sm mb-2">Descripción del problema</h2>
        <p className="text-sm text-app-muted leading-relaxed">{ticket.descripcion}</p>
      </div>

      <Link
        to="/cliente/mis-tickets"
        className="inline-flex items-center gap-1.5 text-sm text-primary-light font-semibold hover:underline min-h-[44px]"
      >
        <ArrowLeft size={14} aria-hidden="true" />
        Volver a mis reclamos
      </Link>
    </div>
  );
}

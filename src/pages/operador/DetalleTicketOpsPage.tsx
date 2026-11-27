// ============================================================
// Detalle de ticket — Operador / Admin — responsive
// Columnas apiladas en móvil, 2 cols en md+
// ============================================================
import { useEffect, useState } from 'react';
import { useParams, Link, useLocation } from 'react-router-dom';
import {
  ArrowLeft, User, CreditCard, Clock, Shield,
  QrCode, AlertTriangle, ChevronDown, ChevronUp, Send, MessageSquare,
} from 'lucide-react';
import { useTickets } from '../../context/TicketsContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { BadgeEstado, BadgePrioridad, BadgePasarela } from '../../components/ui/Badge';
import TicketStepper from '../../components/tickets/TicketStepper';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import Spinner from '../../components/ui/Spinner';
import { formatearFechaHora, formatearSoles, formatearDuracion } from '../../utils/format';
import { calcularSla } from '../../utils/sla';
import type { EstadoIncidencia } from '../../types';

const TRANSICIONES: Partial<Record<EstadoIncidencia, EstadoIncidencia[]>> = {
  'Registrado':    ['En Validación', 'Escalado'],
  'En Validación': ['Conciliado', 'Reembolsado', 'Escalado'],
  'Escalado':      ['Conciliado', 'Reembolsado', 'Cerrado'],
  'Conciliado':    ['Cerrado'],
  'Reembolsado':   ['Cerrado'],
};

export default function DetalleTicketOpsPage() {
  const { id } = useParams<{ id: string }>();
  const { ticketActivo: ticket, cargando, cargarTicket, cambiarEstado, agregarNota } = useTickets();
  const { usuario } = useAuth();
  const { mostrar } = useToast();
  const location = useLocation();
  const baseHref = location.pathname.startsWith('/admin') ? '/admin/bandeja' : '/operador';

  const [modalEstado, setModalEstado] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState<EstadoIncidencia | ''>('');
  const [comentario, setComentario] = useState('');
  const [nota, setNota] = useState('');
  const [guardandoNota, setGuardandoNota] = useState(false);
  const [guardandoEstado, setGuardandoEstado] = useState(false);
  const [auditoriaAbierta, setAuditoriaAbierta] = useState(false);

  useEffect(() => { if (id) cargarTicket(id); }, [id, cargarTicket]);

  const handleCambiarEstado = async () => {
    if (!ticket || !usuario || !nuevoEstado) return;
    setGuardandoEstado(true);
    try {
      await cambiarEstado(ticket.id, nuevoEstado, usuario.id, usuario.nombre, comentario);
      mostrar(`Estado cambiado a "${nuevoEstado}".`, 'exito');
      setModalEstado(false);
      setNuevoEstado(''); setComentario('');
    } catch { mostrar('Error al cambiar el estado.', 'error'); }
    finally { setGuardandoEstado(false); }
  };

  const handleAgregarNota = async () => {
    if (!ticket || !usuario || !nota.trim()) return;
    setGuardandoNota(true);
    try {
      await agregarNota(ticket.id, usuario.id, usuario.nombre, nota.trim());
      mostrar('Nota interna agregada.', 'exito');
      setNota('');
    } catch { mostrar('Error al agregar la nota.', 'error'); }
    finally { setGuardandoNota(false); }
  };

  if (cargando) return <div className="flex justify-center py-16"><Spinner size="lg" /></div>;
  if (!ticket)  return <div className="text-center py-16 text-app-muted text-sm">Ticket no encontrado.</div>;

  const sla = calcularSla(ticket);
  const posiblesEstados = TRANSICIONES[ticket.estado] ?? [];

  /* Fila de dato genérica */
  const FilaDato = ({ label, valor }: { label: string; valor: string }) => (
    <div className="flex justify-between items-start gap-2 bg-app-bg rounded-xl p-2.5 text-xs">
      <span className="text-app-muted shrink-0">{label}</span>
      <span className="font-semibold text-app-text text-right break-all">{valor}</span>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-xs text-app-muted mb-4 flex-wrap" aria-label="Ruta de navegación">
        <Link to={baseHref} className="hover:text-primary-light inline-flex items-center gap-1">
          <ArrowLeft size={12} /> Bandeja
        </Link>
        <span>/</span>
        <span className="font-mono font-bold text-primary truncate max-w-[140px] sm:max-w-none">{ticket.id}</span>
      </nav>

      {/* Cabecera */}
      <div className="bg-white rounded-2xl border border-app-border shadow-sm p-4 sm:p-5 mb-4">
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-1.5 mb-1.5">
              <span className="font-mono text-xs font-bold text-app-muted hidden sm:inline">{ticket.id}</span>
              <BadgeEstado estado={ticket.estado} />
              <BadgePrioridad prioridad={ticket.prioridad} />
              <BadgePasarela pasarela={ticket.transaccion.pasarela} />
            </div>
            <h1 className="text-base sm:text-lg font-extrabold text-app-text">{ticket.transaccion.pelicula}</h1>
          </div>
          {/* SLA badge */}
          <div
            className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full shrink-0"
            style={{ backgroundColor: `${sla.color}18`, color: sla.color }}
          >
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: sla.color }} aria-hidden="true" />
            <span className="hidden sm:inline">
              {sla.status === 'ok' ? '✓ En tiempo' : sla.status === 'riesgo' ? '⚠ En riesgo' : '✗ Vencido'}
            </span>
            <span className="sm:hidden">
              {sla.status === 'ok' ? 'OK' : sla.status === 'riesgo' ? 'Riesgo' : 'Vencido'}
            </span>
          </div>
        </div>

        {/* Barra SLA */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-app-muted">SLA ({ticket.slaObjetivo} min)</span>
            <span style={{ color: sla.color }} className="font-semibold">
              {sla.status === 'vencido'
                ? `Vencido hace ${formatearDuracion(Math.abs(sla.tiempoRestante))}`
                : `${Math.round(sla.tiempoRestante)} min restantes`}
            </span>
          </div>
          <div className="w-full bg-app-border rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all"
              style={{ width: `${Math.min(100, sla.porcentaje)}%`, backgroundColor: sla.color }}
              role="progressbar"
              aria-valuenow={Math.round(sla.porcentaje)}
              aria-valuemin={0} aria-valuemax={100}
            />
          </div>
        </div>

        {/* Datos cliente + transacción — 1 col móvil, 2 cols md+ */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          <div>
            <h3 className="text-xs font-bold text-app-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <User size={12} aria-hidden="true" /> Cliente
            </h3>
            <div className="flex flex-col gap-1.5">
              <FilaDato label="Nombre"   valor={ticket.clienteNombre} />
              <FilaDato label="DNI"      valor={ticket.clienteDni} />
              <FilaDato label="Correo"   valor={ticket.clienteCorreo} />
              <FilaDato label="Teléfono" valor={ticket.clienteTelefono} />
            </div>
          </div>
          <div>
            <h3 className="text-xs font-bold text-app-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <CreditCard size={12} aria-hidden="true" /> Transacción
            </h3>
            <div className="flex flex-col gap-1.5">
              <FilaDato label="Sede"      valor={ticket.transaccion.cine} />
              <FilaDato label="Monto"     valor={formatearSoles(ticket.transaccion.monto)} />
              <FilaDato label="N° Op."    valor={ticket.transaccion.numerOperacion} />
              <FilaDato label="Tarjeta"   valor={`···· ${ticket.transaccion.ultimosCuatroDigitos}`} />
              <FilaDato label="Producto"  valor={ticket.transaccion.tipoProducto} />
            </div>
          </div>
        </div>
      </div>

      {/* Stepper + Conciliación — apilados en móvil, 2 cols en sm+ */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-2xl border border-app-border shadow-sm p-4 sm:p-5">
          <h2 className="font-bold text-app-text text-sm mb-4 flex items-center gap-2">
            <Clock size={15} className="text-primary-light" aria-hidden="true" /> Historial de estados
          </h2>
          <TicketStepper historial={ticket.historial} estadoActual={ticket.estado} />
        </div>

        <div className="bg-white rounded-2xl border border-app-border shadow-sm p-4 sm:p-5">
          <h2 className="font-bold text-app-text text-sm mb-4">Conciliación automática</h2>
          {ticket.conciliacion ? (
            <div className="flex flex-col gap-2 text-xs">
              <FilaDato label="Resultado" valor={ticket.conciliacion.resultado} />
              <FilaDato label="Duración"  valor={ticket.conciliacion.duracionMs ? `${(ticket.conciliacion.duracionMs/1000).toFixed(1)}s` : '—'} />
              {ticket.conciliacion.codigoQR && (
                <div className="p-3 bg-green-50 rounded-xl border border-accent-green/20 flex items-center gap-2">
                  <QrCode size={18} className="text-accent-green shrink-0" aria-hidden="true" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-accent-green">QR emitido</p>
                    <code className="text-xs text-accent-green break-all">{ticket.conciliacion.codigoQR}</code>
                  </div>
                </div>
              )}
              <p className="p-2.5 bg-app-bg rounded-xl text-app-muted leading-relaxed">
                {ticket.conciliacion.mensajeResultado}
              </p>
            </div>
          ) : (
            <p className="text-xs text-app-muted">Sin resultado aún.</p>
          )}
          <div className="mt-4 pt-3 border-t border-app-border">
            <p className="text-xs font-bold text-app-muted uppercase mb-2">Descripción del cliente</p>
            <p className="text-xs text-app-muted leading-relaxed">{ticket.descripcion}</p>
          </div>
        </div>
      </div>

      {/* Acciones del operador */}
      {posiblesEstados.length > 0 && (
        <div className="bg-white rounded-2xl border border-app-border shadow-sm p-4 sm:p-5 mb-4">
          <h2 className="font-bold text-app-text text-sm mb-4 flex items-center gap-2">
            <Shield size={15} className="text-primary-light" aria-hidden="true" /> Acciones
          </h2>

          {/* Botones de transición — wrap en móvil */}
          <div className="flex flex-wrap gap-2 mb-5">
            {posiblesEstados.map((estado) => (
              <Button
                key={estado}
                variante={estado === 'Escalado' ? 'outline' : estado === 'Cerrado' ? 'secondary' : 'primary'}
                tamano="sm"
                onClick={() => { setNuevoEstado(estado); setModalEstado(true); }}
              >
                → {estado}
              </Button>
            ))}
          </div>

          {/* Nota interna */}
          <div>
            <label htmlFor="nota-interna" className="text-xs font-bold text-app-muted uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <MessageSquare size={12} aria-hidden="true" /> Nota interna
            </label>
            <textarea
              id="nota-interna"
              placeholder="Agregar nota visible solo para operadores y admins…"
              value={nota}
              onChange={(e) => setNota(e.target.value)}
              rows={3}
              className="w-full text-sm border-2 border-app-border rounded-xl px-4 py-2.5
                focus:outline-none focus:border-primary resize-none mb-2"
            />
            <Button
              variante="secondary" tamano="sm"
              icono={<Send size={14} />}
              onClick={handleAgregarNota}
              cargando={guardandoNota}
              disabled={!nota.trim()}
            >
              Guardar nota
            </Button>
          </div>

          {ticket.notasInternas && (
            <div className="mt-4 p-3 bg-amber-50 border border-accent-yellow/30 rounded-xl">
              <p className="text-xs font-bold text-primary-dark mb-1 flex items-center gap-1.5">
                <AlertTriangle size={12} aria-hidden="true" /> Última nota interna
              </p>
              <p className="text-xs text-app-muted leading-relaxed">{ticket.notasInternas}</p>
            </div>
          )}
        </div>
      )}

      {/* Log de auditoría colapsable */}
      <div className="bg-white rounded-2xl border border-app-border shadow-sm mb-6">
        <button
          onClick={() => setAuditoriaAbierta((v) => !v)}
          className="w-full flex items-center justify-between px-4 sm:px-5 py-4 min-h-[52px]"
          aria-expanded={auditoriaAbierta}
        >
          <h2 className="font-bold text-app-text text-sm flex items-center gap-2">
            <Shield size={15} className="text-primary-light" aria-hidden="true" />
            Log de auditoría
            <span className="text-xs font-normal text-app-muted">({ticket.logsAuditoria.length})</span>
          </h2>
          {auditoriaAbierta
            ? <ChevronUp size={16} className="text-app-muted shrink-0" />
            : <ChevronDown size={16} className="text-app-muted shrink-0" />}
        </button>

        {auditoriaAbierta && (
          <div className="border-t border-app-border p-3 sm:p-4 flex flex-col gap-2">
            {[...ticket.logsAuditoria].reverse().map((log) => (
              <div key={log.id} className="text-xs bg-app-bg rounded-xl p-3">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-1">
                  <span className="font-bold text-primary-light">{log.accion}</span>
                  <span className="text-app-muted">{formatearFechaHora(log.fecha)}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5 text-app-muted mb-1">
                  <User size={11} aria-hidden="true" />
                  <span>{log.usuarioNombre}</span>
                  {log.estadoAnterior && (
                    <>
                      <span className="text-app-border">|</span>
                      <span>{log.estadoAnterior}</span>
                      <span>→</span>
                      <span className="font-semibold text-app-text">{log.estadoNuevo}</span>
                    </>
                  )}
                </div>
                {log.detalle && <p className="text-app-muted leading-relaxed">{log.detalle}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal cambio de estado */}
      <Modal
        abierto={modalEstado}
        onCerrar={() => setModalEstado(false)}
        titulo={`Cambiar estado a: ${nuevoEstado}`}
        tamano="sm"
      >
        <div className="flex flex-col gap-4">
          <p className="text-sm text-app-muted">
            ¿Deseas cambiar el ticket <strong className="text-app-text">{ticket.id}</strong> a{' '}
            <strong className="text-primary">{nuevoEstado}</strong>?
          </p>
          <textarea
            placeholder="Comentario o motivo (opcional)…"
            value={comentario}
            onChange={(e) => setComentario(e.target.value)}
            rows={3}
            className="w-full text-sm border-2 border-app-border rounded-xl px-4 py-2.5
              focus:outline-none focus:border-primary resize-none"
          />
          <div className="flex gap-3 justify-end flex-wrap">
            <Button variante="ghost" tamano="sm" onClick={() => setModalEstado(false)}>Cancelar</Button>
            <Button variante="primary" tamano="sm" cargando={guardandoEstado} onClick={handleCambiarEstado}>
              Confirmar
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

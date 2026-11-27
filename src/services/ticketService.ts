// ============================================================
// Servicio de tickets (simulado — reemplazar por fetch/axios)
// ============================================================
import type {
  Incidencia,
  EstadoIncidencia,
  FiltrosBandeja,
  HistorialEstado,
  LogAuditoria,
  EncuestaSatisfaccion,
} from '../types';
import {
  KEYS,
  leerLS,
  actualizarItemEnLS,
  agregarItemEnLS,
} from './storageService';
import { delay } from '../utils/delay';

// ── Consultas ─────────────────────────────────────────────────

export async function listarTickets(): Promise<Incidencia[]> {
  await delay(300, 500);
  return leerLS<Incidencia[]>(KEYS.tickets) ?? [];
}

export async function obtenerTicket(id: string): Promise<Incidencia | null> {
  await delay(200, 400);
  const lista = leerLS<Incidencia[]>(KEYS.tickets) ?? [];
  return lista.find((t) => t.id === id) ?? null;
}

export async function listarTicketsPorCliente(clienteId: string): Promise<Incidencia[]> {
  await delay(300, 500);
  const lista = leerLS<Incidencia[]>(KEYS.tickets) ?? [];
  return lista.filter((t) => t.clienteId === clienteId);
}

/** Paginación + filtros para la bandeja del operador */
export async function listarTicketsFiltrados(
  filtros: FiltrosBandeja
): Promise<{ items: Incidencia[]; total: number }> {
  await delay(300, 600);
  let lista = leerLS<Incidencia[]>(KEYS.tickets) ?? [];

  if (filtros.estado) lista = lista.filter((t) => t.estado === filtros.estado);
  if (filtros.prioridad) lista = lista.filter((t) => t.prioridad === filtros.prioridad);
  if (filtros.pasarela) lista = lista.filter((t) => t.transaccion.pasarela === filtros.pasarela);
  if (filtros.busqueda) {
    const q = filtros.busqueda.toLowerCase();
    lista = lista.filter(
      (t) =>
        t.id.toLowerCase().includes(q) ||
        t.clienteNombre.toLowerCase().includes(q) ||
        t.clienteCorreo.toLowerCase().includes(q)
    );
  }
  if (filtros.fechaDesde) lista = lista.filter((t) => t.fechaCreacion >= filtros.fechaDesde!);
  if (filtros.fechaHasta) lista = lista.filter((t) => t.fechaCreacion <= filtros.fechaHasta! + 'T23:59:59Z');

  // Orden descendente por fecha
  lista.sort((a, b) => b.fechaCreacion.localeCompare(a.fechaCreacion));
  const total = lista.length;
  const inicio = (filtros.pagina - 1) * filtros.porPagina;
  return { items: lista.slice(inicio, inicio + filtros.porPagina), total };
}

// ── Creación ──────────────────────────────────────────────────

export async function crearTicket(ticketParcial: Omit<Incidencia, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'historial' | 'logsAuditoria' | 'slaVencido'>): Promise<Incidencia> {
  await delay(400, 700);

  const ahora = new Date().toISOString();
  const tickets = leerLS<Incidencia[]>(KEYS.tickets) ?? [];

  // Generar ID correlativo
  const fecha = ahora.slice(0, 10).replace(/-/g, '');
  const seq = String(tickets.length + 1).padStart(4, '0');
  const id = `TKT-${fecha}-${seq}`;

  const historial: HistorialEstado[] = [
    {
      id: `hist-${id}-1`,
      ticketId: id,
      estadoNuevo: 'Registrado',
      fecha: ahora,
      usuarioId: ticketParcial.clienteId,
      usuarioNombre: ticketParcial.clienteNombre,
      comentario: 'Ticket registrado desde el portal de autoservicio.',
    },
  ];
  const logsAuditoria: LogAuditoria[] = [
    {
      id: `log-${id}-1`,
      ticketId: id,
      usuarioId: ticketParcial.clienteId,
      usuarioNombre: ticketParcial.clienteNombre,
      accion: 'Creación de ticket',
      detalle: `Ticket creado por el cliente. Monto: S/ ${ticketParcial.transaccion.monto}.`,
      estadoNuevo: 'Registrado',
      fecha: ahora,
    },
  ];

  const ticket: Incidencia = {
    ...ticketParcial,
    id,
    fechaCreacion: ahora,
    fechaActualizacion: ahora,
    estado: 'Registrado',
    historial,
    logsAuditoria,
    slaVencido: false,
  };

  agregarItemEnLS<Incidencia>(KEYS.tickets, ticket);
  return ticket;
}

// ── Actualización ─────────────────────────────────────────────

export async function cambiarEstadoTicket(
  ticketId: string,
  nuevoEstado: EstadoIncidencia,
  operadorId: string,
  operadorNombre: string,
  comentario?: string
): Promise<Incidencia> {
  await delay(300, 500);
  const tickets = leerLS<Incidencia[]>(KEYS.tickets) ?? [];
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) throw new Error(`Ticket ${ticketId} no encontrado.`);

  const ahora = new Date().toISOString();
  const estadoAnterior = ticket.estado;

  const entradaHistorial: HistorialEstado = {
    id: `hist-${ticketId}-${ticket.historial.length + 1}`,
    ticketId,
    estadoAnterior,
    estadoNuevo: nuevoEstado,
    fecha: ahora,
    usuarioId: operadorId,
    usuarioNombre: operadorNombre,
    comentario,
  };

  const logAuditoria: LogAuditoria = {
    id: `log-${ticketId}-${ticket.logsAuditoria.length + 1}`,
    ticketId,
    usuarioId: operadorId,
    usuarioNombre: operadorNombre,
    accion: 'Cambio de estado',
    detalle: comentario,
    estadoAnterior,
    estadoNuevo: nuevoEstado,
    fecha: ahora,
  };

  const ahora2 = new Date();
  const msCreacion = new Date(ticket.fechaCreacion).getTime();
  const tiempoResolucion = Math.round((ahora2.getTime() - msCreacion) / 60000);

  const actualizado: Incidencia = {
    ...ticket,
    estado: nuevoEstado,
    fechaActualizacion: ahora,
    fechaCierre: ['Cerrado', 'Conciliado', 'Reembolsado'].includes(nuevoEstado) ? ahora : ticket.fechaCierre,
    tiempoResolucion: ['Cerrado', 'Conciliado', 'Reembolsado'].includes(nuevoEstado) ? tiempoResolucion : ticket.tiempoResolucion,
    slaVencido: tiempoResolucion > ticket.slaObjetivo,
    historial: [...ticket.historial, entradaHistorial],
    logsAuditoria: [...ticket.logsAuditoria, logAuditoria],
  };

  actualizarItemEnLS<Incidencia>(KEYS.tickets, actualizado);
  return actualizado;
}

export async function agregarNotaInterna(
  ticketId: string,
  operadorId: string,
  operadorNombre: string,
  nota: string
): Promise<Incidencia> {
  await delay(200, 400);
  const tickets = leerLS<Incidencia[]>(KEYS.tickets) ?? [];
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) throw new Error(`Ticket ${ticketId} no encontrado.`);

  const ahora = new Date().toISOString();
  const logAuditoria: LogAuditoria = {
    id: `log-${ticketId}-${ticket.logsAuditoria.length + 1}`,
    ticketId,
    usuarioId: operadorId,
    usuarioNombre: operadorNombre,
    accion: 'Nota interna',
    detalle: nota,
    fecha: ahora,
  };

  const actualizado: Incidencia = {
    ...ticket,
    notasInternas: nota,
    fechaActualizacion: ahora,
    logsAuditoria: [...ticket.logsAuditoria, logAuditoria],
  };

  actualizarItemEnLS<Incidencia>(KEYS.tickets, actualizado);
  return actualizado;
}

export async function actualizarTicketConConciliacion(
  ticket: Incidencia
): Promise<Incidencia> {
  await delay(100, 200);
  actualizarItemEnLS<Incidencia>(KEYS.tickets, ticket);
  return ticket;
}

export async function guardarEncuesta(
  ticketId: string,
  encuesta: EncuestaSatisfaccion
): Promise<Incidencia> {
  await delay(200, 400);
  const tickets = leerLS<Incidencia[]>(KEYS.tickets) ?? [];
  const ticket = tickets.find((t) => t.id === ticketId);
  if (!ticket) throw new Error(`Ticket ${ticketId} no encontrado.`);

  const actualizado: Incidencia = { ...ticket, encuesta };
  actualizarItemEnLS<Incidencia>(KEYS.tickets, actualizado);
  return actualizado;
}

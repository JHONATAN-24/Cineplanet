// ============================================================
// Contexto global de tickets
// ============================================================
import {
  createContext, useContext, useReducer, useCallback,
  type ReactNode,
} from 'react';
import type { Incidencia, EstadoIncidencia, FiltrosBandeja } from '../types';
import {
  listarTickets,
  listarTicketsPorCliente,
  obtenerTicket,
  cambiarEstadoTicket,
  agregarNotaInterna,
  listarTicketsFiltrados,
  guardarEncuesta,
} from '../services/ticketService';
import type { EncuestaSatisfaccion } from '../types';

// ── Estado ────────────────────────────────────────────────────
interface TicketsState {
  items: Incidencia[];
  ticketActivo: Incidencia | null;
  total: number;
  cargando: boolean;
  error: string | null;
}

// ── Acciones ──────────────────────────────────────────────────
type TicketsAction =
  | { type: 'CARGANDO' }
  | { type: 'CARGADO'; items: Incidencia[]; total?: number }
  | { type: 'TICKET_ACTIVO'; ticket: Incidencia | null }
  | { type: 'TICKET_ACTUALIZADO'; ticket: Incidencia }
  | { type: 'TICKET_AGREGADO'; ticket: Incidencia }
  | { type: 'ERROR'; mensaje: string }
  | { type: 'LIMPIAR_ERROR' };

function ticketsReducer(state: TicketsState, action: TicketsAction): TicketsState {
  switch (action.type) {
    case 'CARGANDO':
      return { ...state, cargando: true, error: null };
    case 'CARGADO':
      return { ...state, items: action.items, total: action.total ?? action.items.length, cargando: false, error: null };
    case 'TICKET_ACTIVO':
      return { ...state, ticketActivo: action.ticket, cargando: false };
    case 'TICKET_ACTUALIZADO':
      return {
        ...state,
        items: state.items.map((t) => t.id === action.ticket.id ? action.ticket : t),
        ticketActivo: state.ticketActivo?.id === action.ticket.id ? action.ticket : state.ticketActivo,
        cargando: false,
      };
    case 'TICKET_AGREGADO':
      return {
        ...state,
        items: [action.ticket, ...state.items],
        total: state.total + 1,
        ticketActivo: action.ticket,
        cargando: false,
      };
    case 'ERROR':
      return { ...state, cargando: false, error: action.mensaje };
    case 'LIMPIAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// ── Interfaz del contexto ─────────────────────────────────────
interface TicketsContextValue {
  items: Incidencia[];
  ticketActivo: Incidencia | null;
  total: number;
  cargando: boolean;
  error: string | null;
  cargarTodos: () => Promise<void>;
  cargarPorCliente: (clienteId: string) => Promise<void>;
  cargarFiltrados: (filtros: FiltrosBandeja) => Promise<void>;
  cargarTicket: (id: string) => Promise<void>;
  cambiarEstado: (
    ticketId: string,
    nuevoEstado: EstadoIncidencia,
    operadorId: string,
    operadorNombre: string,
    comentario?: string
  ) => Promise<Incidencia>;
  agregarNota: (ticketId: string, operadorId: string, operadorNombre: string, nota: string) => Promise<void>;
  enviarEncuesta: (ticketId: string, encuesta: EncuestaSatisfaccion) => Promise<void>;
  setTicketActivo: (ticket: Incidencia | null) => void;
  limpiarError: () => void;
}

const TicketsContext = createContext<TicketsContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function TicketsProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(ticketsReducer, {
    items: [],
    ticketActivo: null,
    total: 0,
    cargando: false,
    error: null,
  });

  const cargarTodos = useCallback(async () => {
    dispatch({ type: 'CARGANDO' });
    try {
      const items = await listarTickets();
      dispatch({ type: 'CARGADO', items });
    } catch (err) {
      dispatch({ type: 'ERROR', mensaje: err instanceof Error ? err.message : 'Error al cargar tickets.' });
    }
  }, []);

  const cargarPorCliente = useCallback(async (clienteId: string) => {
    dispatch({ type: 'CARGANDO' });
    try {
      const items = await listarTicketsPorCliente(clienteId);
      dispatch({ type: 'CARGADO', items });
    } catch (err) {
      dispatch({ type: 'ERROR', mensaje: err instanceof Error ? err.message : 'Error al cargar tickets.' });
    }
  }, []);

  const cargarFiltrados = useCallback(async (filtros: FiltrosBandeja) => {
    dispatch({ type: 'CARGANDO' });
    try {
      const { items, total } = await listarTicketsFiltrados(filtros);
      dispatch({ type: 'CARGADO', items, total });
    } catch (err) {
      dispatch({ type: 'ERROR', mensaje: err instanceof Error ? err.message : 'Error al cargar tickets.' });
    }
  }, []);

  const cargarTicket = useCallback(async (id: string) => {
    dispatch({ type: 'CARGANDO' });
    try {
      const ticket = await obtenerTicket(id);
      dispatch({ type: 'TICKET_ACTIVO', ticket });
    } catch (err) {
      dispatch({ type: 'ERROR', mensaje: err instanceof Error ? err.message : 'Error al cargar el ticket.' });
    }
  }, []);

  const cambiarEstado = useCallback(
    async (ticketId: string, nuevoEstado: EstadoIncidencia, operadorId: string, operadorNombre: string, comentario?: string) => {
      dispatch({ type: 'CARGANDO' });
      try {
        const actualizado = await cambiarEstadoTicket(ticketId, nuevoEstado, operadorId, operadorNombre, comentario);
        dispatch({ type: 'TICKET_ACTUALIZADO', ticket: actualizado });
        return actualizado;
      } catch (err) {
        dispatch({ type: 'ERROR', mensaje: err instanceof Error ? err.message : 'Error al cambiar estado.' });
        throw err;
      }
    },
    []
  );

  const agregarNota = useCallback(async (ticketId: string, operadorId: string, operadorNombre: string, nota: string) => {
    dispatch({ type: 'CARGANDO' });
    try {
      const actualizado = await agregarNotaInterna(ticketId, operadorId, operadorNombre, nota);
      dispatch({ type: 'TICKET_ACTUALIZADO', ticket: actualizado });
    } catch (err) {
      dispatch({ type: 'ERROR', mensaje: err instanceof Error ? err.message : 'Error al agregar nota.' });
    }
  }, []);

  const enviarEncuesta = useCallback(async (ticketId: string, encuesta: EncuestaSatisfaccion) => {
    dispatch({ type: 'CARGANDO' });
    try {
      const actualizado = await guardarEncuesta(ticketId, encuesta);
      dispatch({ type: 'TICKET_ACTUALIZADO', ticket: actualizado });
    } catch (err) {
      dispatch({ type: 'ERROR', mensaje: err instanceof Error ? err.message : 'Error al enviar encuesta.' });
    }
  }, []);

  const setTicketActivo = useCallback((ticket: Incidencia | null) => {
    dispatch({ type: 'TICKET_ACTIVO', ticket });
  }, []);

  const limpiarError = useCallback(() => dispatch({ type: 'LIMPIAR_ERROR' }), []);

  return (
    <TicketsContext.Provider
      value={{
        ...state,
        cargarTodos,
        cargarPorCliente,
        cargarFiltrados,
        cargarTicket,
        cambiarEstado,
        agregarNota,
        enviarEncuesta,
        setTicketActivo,
        limpiarError,
      }}
    >
      {children}
    </TicketsContext.Provider>
  );
}

export function useTickets(): TicketsContextValue {
  const ctx = useContext(TicketsContext);
  if (!ctx) throw new Error('useTickets debe usarse dentro de <TicketsProvider>');
  return ctx;
}

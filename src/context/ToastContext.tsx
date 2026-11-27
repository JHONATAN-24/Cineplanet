// ============================================================
// Contexto de notificaciones Toast
// ============================================================
import { createContext, useContext, useReducer, useCallback, type ReactNode } from 'react';

export type ToastTipo = 'exito' | 'error' | 'advertencia' | 'info';

export interface Toast {
  id: string;
  tipo: ToastTipo;
  mensaje: string;
  duracion?: number; // ms
}

interface ToastState {
  toasts: Toast[];
}

type ToastAction =
  | { type: 'AGREGAR'; toast: Toast }
  | { type: 'ELIMINAR'; id: string };

function toastReducer(state: ToastState, action: ToastAction): ToastState {
  switch (action.type) {
    case 'AGREGAR':
      return { toasts: [...state.toasts, action.toast] };
    case 'ELIMINAR':
      return { toasts: state.toasts.filter((t) => t.id !== action.id) };
    default:
      return state;
  }
}

interface ToastContextValue {
  toasts: Toast[];
  mostrar: (mensaje: string, tipo?: ToastTipo, duracion?: number) => void;
  cerrar: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(toastReducer, { toasts: [] });

  const cerrar = useCallback((id: string) => {
    dispatch({ type: 'ELIMINAR', id });
  }, []);

  const mostrar = useCallback((mensaje: string, tipo: ToastTipo = 'info', duracion = 4000) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    dispatch({ type: 'AGREGAR', toast: { id, tipo, mensaje, duracion } });
    setTimeout(() => dispatch({ type: 'ELIMINAR', id }), duracion);
  }, []);

  return (
    <ToastContext.Provider value={{ toasts: state.toasts, mostrar, cerrar }}>
      {children}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast debe usarse dentro de <ToastProvider>');
  return ctx;
}

// ============================================================
// Contexto de autenticación
// ============================================================
import { createContext, useContext, useReducer, useEffect, useCallback, type ReactNode } from 'react';
import type { SesionActiva, Usuario, Rol } from '../types';
import { loginService, logoutService, obtenerSesionActiva } from '../services/authService';
import { escribirLS, KEYS } from '../services/storageService';
import type { LoginCredenciales } from '../types';

// ── Estado ────────────────────────────────────────────────────
interface AuthState {
  sesion: SesionActiva | null;
  cargando: boolean;
  error: string | null;
}

// ── Acciones ──────────────────────────────────────────────────
type AuthAction =
  | { type: 'CARGANDO' }
  | { type: 'LOGIN_OK'; sesion: SesionActiva }
  | { type: 'ACTUALIZAR_USUARIO'; usuario: Usuario }
  | { type: 'LOGOUT' }
  | { type: 'ERROR'; mensaje: string }
  | { type: 'LIMPIAR_ERROR' };

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case 'CARGANDO':
      return { ...state, cargando: true, error: null };
    case 'LOGIN_OK':
      return { sesion: action.sesion, cargando: false, error: null };
    case 'ACTUALIZAR_USUARIO':
      if (!state.sesion) return state;
      return {
        ...state,
        sesion: { ...state.sesion, usuario: action.usuario },
      };
    case 'LOGOUT':
      return { sesion: null, cargando: false, error: null };
    case 'ERROR':
      return { ...state, cargando: false, error: action.mensaje };
    case 'LIMPIAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

// ── Interfaz del contexto ─────────────────────────────────────
interface AuthContextValue {
  sesion: SesionActiva | null;
  usuario: Usuario | null;
  rol: Rol | null;
  cargando: boolean;
  error: string | null;
  login: (credenciales: LoginCredenciales) => Promise<void>;
  logout: () => Promise<void>;
  actualizarUsuario: (usuario: Usuario) => void;
  limpiarError: () => void;
  esCliente: boolean;
  esOperador: boolean;
  esAdmin: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────────
export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, {
    sesion: null,
    cargando: true,
    error: null,
  });

  // Recuperar sesión guardada al iniciar
  useEffect(() => {
    const sesionGuardada = obtenerSesionActiva();
    if (sesionGuardada) {
      dispatch({ type: 'LOGIN_OK', sesion: sesionGuardada });
    } else {
      dispatch({ type: 'LOGOUT' });
    }
  }, []);

  const login = useCallback(async (credenciales: LoginCredenciales) => {
    dispatch({ type: 'CARGANDO' });
    try {
      const sesion = await loginService(credenciales);
      dispatch({ type: 'LOGIN_OK', sesion });
    } catch (err) {
      dispatch({ type: 'ERROR', mensaje: err instanceof Error ? err.message : 'Error al iniciar sesión.' });
    }
  }, []);

  const logout = useCallback(async () => {
    dispatch({ type: 'CARGANDO' });
    await logoutService();
    dispatch({ type: 'LOGOUT' });
  }, []);

  /** Actualiza el usuario en memoria Y en localStorage (sesión persistida) */
  const actualizarUsuario = useCallback((usuario: Usuario) => {
    dispatch({ type: 'ACTUALIZAR_USUARIO', usuario });
    // Persistir la sesión actualizada en localStorage
    const sesionActual = obtenerSesionActiva();
    if (sesionActual) {
      escribirLS(KEYS.sesion, { ...sesionActual, usuario });
    }
  }, []);

  const limpiarError = useCallback(() => dispatch({ type: 'LIMPIAR_ERROR' }), []);

  const usuario = state.sesion?.usuario ?? null;
  const rol = usuario?.rol ?? null;

  const value: AuthContextValue = {
    sesion: state.sesion,
    usuario,
    rol,
    cargando: state.cargando,
    error: state.error,
    login,
    logout,
    actualizarUsuario,
    limpiarError,
    esCliente: rol === 'cliente',
    esOperador: rol === 'operador',
    esAdmin: rol === 'admin',
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Hook para consumir el contexto de autenticación */
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de <AuthProvider>');
  return ctx;
}

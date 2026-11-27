// ============================================================
// LayoutContext — Título del Topbar y estado del drawer móvil
// ============================================================
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface LayoutContextValue {
  titulo: string;
  subtitulo: string;
  setTitulo: (titulo: string, subtitulo?: string) => void;
  drawerAbierto: boolean;
  abrirDrawer: () => void;
  cerrarDrawer: () => void;
  toggleDrawer: () => void;
}

const LayoutContext = createContext<LayoutContextValue | null>(null);

export function LayoutProvider({ children }: { children: ReactNode }) {
  const [titulo, setTituloState] = useState('');
  const [subtitulo, setSubtituloState] = useState('');
  const [drawerAbierto, setDrawerAbierto] = useState(false);

  const setTitulo = useCallback((t: string, s = '') => {
    setTituloState(t);
    setSubtituloState(s);
  }, []);

  const abrirDrawer  = useCallback(() => setDrawerAbierto(true), []);
  const cerrarDrawer = useCallback(() => setDrawerAbierto(false), []);
  const toggleDrawer = useCallback(() => setDrawerAbierto((v) => !v), []);

  return (
    <LayoutContext.Provider value={{ titulo, subtitulo, setTitulo, drawerAbierto, abrirDrawer, cerrarDrawer, toggleDrawer }}>
      {children}
    </LayoutContext.Provider>
  );
}

export function useLayout() {
  const ctx = useContext(LayoutContext);
  if (!ctx) throw new Error('useLayout debe usarse dentro de <LayoutProvider>');
  return ctx;
}

/** Hook que actualiza el título de la página en el Topbar */
export function useTitulo(titulo: string, subtitulo = '') {
  const { setTitulo } = useLayout();
  // Actualiza en cada render donde los valores cambien
  // (safe porque se memoriza en el context)
  if (titulo) setTitulo(titulo, subtitulo);
}

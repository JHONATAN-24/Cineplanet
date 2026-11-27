// Layout del Operador L1 — Sidebar + Topbar + Outlet
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import ToastContainer from '../../components/ui/ToastContainer';
import { LayoutProvider, useLayout } from '../../context/LayoutContext';

// Mapa ruta → título
const TITULOS: Record<string, { titulo: string; sub: string }> = {
  '/operador': { titulo: 'Bandeja de tickets', sub: 'Gestión de incidencias entrantes' },
};

function OperadorInner() {
  const [colapsado, setColapsado] = useState(false);
  const { abrirDrawer } = useLayout();
  const location = useLocation();

  const match = Object.entries(TITULOS).find(([k]) => location.pathname.startsWith(k));
  const { titulo, sub } = match?.[1] ?? { titulo: 'Panel del operador', sub: '' };

  return (
    <div className="min-h-screen bg-app-bg flex">
      <Sidebar colapsado={colapsado} onToggleColapso={() => setColapsado((v) => !v)} />
      <div className="flex-1 flex flex-col min-w-0">
        <Topbar titulo={titulo} subtitulo={sub} onAbrirMenu={abrirDrawer} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
      <ToastContainer />
    </div>
  );
}

export default function OperadorLayout() {
  return (
    <LayoutProvider>
      <OperadorInner />
    </LayoutProvider>
  );
}

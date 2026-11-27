// Layout del Admin L2 — Sidebar + Topbar + Outlet
import { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../../components/layout/Sidebar';
import Topbar from '../../components/layout/Topbar';
import ToastContainer from '../../components/ui/ToastContainer';
import { LayoutProvider, useLayout } from '../../context/LayoutContext';

const TITULOS: Record<string, { titulo: string; sub: string }> = {
  '/admin/bandeja':  { titulo: 'Bandeja de tickets',      sub: 'Gestión de incidencias' },
  '/admin/usuarios': { titulo: 'Gestión de usuarios',     sub: 'Administración de cuentas' },
  '/admin/motor':    { titulo: 'Motor de conciliación',   sub: 'Configuración del motor' },
  '/admin':          { titulo: 'Dashboard ejecutivo',     sub: 'KPIs y métricas SLA' },
};

function AdminInner() {
  const [colapsado, setColapsado] = useState(false);
  const { abrirDrawer } = useLayout();
  const location = useLocation();

  // Busca la ruta más específica primero
  const match = Object.entries(TITULOS)
    .sort((a, b) => b[0].length - a[0].length)
    .find(([k]) => location.pathname.startsWith(k));
  const { titulo, sub } = match?.[1] ?? { titulo: 'Administración', sub: '' };

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

export default function AdminLayout() {
  return (
    <LayoutProvider>
      <AdminInner />
    </LayoutProvider>
  );
}

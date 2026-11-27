// ============================================================
// Sidebar — Barra lateral colapsable (escritorio) / Drawer (móvil)
// SIN botón de cerrar sesión — ese está en el UserMenu del Topbar.
// ============================================================
import { useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Inbox, Users, Settings, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useLayout } from '../../context/LayoutContext';
import LogoCineplanet from './LogoCineplanet';

interface NavItem {
  label: string;
  href: string;
  Icon: typeof LayoutDashboard;
}

const ITEMS_ADMIN: NavItem[] = [
  { label: 'Dashboard ejecutivo', href: '/admin',           Icon: LayoutDashboard },
  { label: 'Bandeja de tickets',  href: '/admin/bandeja',   Icon: Inbox },
  { label: 'Gestión de usuarios', href: '/admin/usuarios',  Icon: Users },
  { label: 'Motor de conciliación', href: '/admin/motor',   Icon: Settings },
];

const ITEMS_OPERADOR: NavItem[] = [
  { label: 'Bandeja de tickets',  href: '/operador',        Icon: Inbox },
];

export default function Sidebar({ colapsado, onToggleColapso }: {
  colapsado: boolean;
  onToggleColapso: () => void;
}) {
  const { rol } = useAuth();
  const { drawerAbierto, cerrarDrawer } = useLayout();
  const location = useLocation();
  const drawerRef = useRef<HTMLDivElement>(null);

  const items = rol === 'admin' ? ITEMS_ADMIN : ITEMS_OPERADOR;

  // Cerrar drawer con Escape
  useEffect(() => {
    if (!drawerAbierto) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') cerrarDrawer(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [drawerAbierto, cerrarDrawer]);

  // Bloquear scroll del body mientras el drawer está abierto
  useEffect(() => {
    document.body.style.overflow = drawerAbierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [drawerAbierto]);

  // Cerrar drawer al cambiar de ruta
  useEffect(() => { cerrarDrawer(); }, [location.pathname, cerrarDrawer]);

  // ── Ítem de navegación ─────────────────────────────────────
  const NavLink = ({ item }: { item: NavItem }) => {
    const activo =
      location.pathname === item.href ||
      (item.href !== '/admin' && item.href !== '/operador' &&
       location.pathname.startsWith(item.href));

    return (
      <Link
        to={item.href}
        aria-current={activo ? 'page' : undefined}
        title={colapsado ? item.label : undefined}
        className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all min-h-[44px]
          ${activo
            ? 'bg-accent-yellow text-primary-dark shadow-sm'
            : 'text-white/75 hover:bg-white/10 hover:text-white'}
          ${colapsado ? 'justify-center' : ''}`}
      >
        <item.Icon size={20} className="shrink-0" aria-hidden="true" />
        {!colapsado && <span className="truncate">{item.label}</span>}
      </Link>
    );
  };

  // ── Contenido interior del sidebar ────────────────────────
  const Contenido = ({ enDrawer = false }: { enDrawer?: boolean }) => (
    <div className="flex flex-col h-full">
      {/* Encabezado */}
      <div className={`flex items-center gap-2 px-4 py-5 border-b border-white/10
        ${colapsado && !enDrawer ? 'justify-center' : 'justify-between'}`}>
        {!colapsado || enDrawer ? (
          <LogoCineplanet dark size="sm" />
        ) : (
          <div className="w-8 h-8 rounded-lg bg-accent-yellow flex items-center justify-center">
            <span className="text-primary-dark font-black text-xs" aria-hidden="true">CP</span>
          </div>
        )}

        {/* X para cerrar el drawer */}
        {enDrawer && (
          <button
            onClick={cerrarDrawer}
            aria-label="Cerrar menú"
            className="text-white/60 hover:text-white p-1.5 rounded-lg hover:bg-white/10 ml-auto min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <X size={20} />
          </button>
        )}

        {/* Botón colapsar — solo escritorio */}
        {!enDrawer && (
          <button
            onClick={onToggleColapso}
            className="hidden lg:flex items-center justify-center text-white/50 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            aria-label={colapsado ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
            title={colapsado ? 'Expandir' : 'Colapsar'}
          >
            {colapsado ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
          </button>
        )}
      </div>

      {/* Navegación */}
      <nav className="flex-1 px-3 py-4 flex flex-col gap-1 overflow-y-auto" aria-label="Menú de navegación principal">
        {items.map((item) => <NavLink key={item.href} item={item} />)}
      </nav>

      {/* SubLabel inferior — sin logout */}
      {(!colapsado || enDrawer) && (
        <div className="px-4 pb-4 border-t border-white/10 pt-3">
          <p className="text-[10px] text-white/30 font-medium text-center tracking-wide uppercase">
            Cineplanet ServiceDesk
          </p>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* ── Drawer móvil / tablet ──────────────────────────── */}
      {/* Overlay */}
      {drawerAbierto && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          onClick={cerrarDrawer}
          aria-hidden="true"
        />
      )}

      {/* Panel deslizante */}
      <div
        ref={drawerRef}
        className={`lg:hidden fixed top-0 left-0 z-50 h-full w-64 bg-primary-dark shadow-2xl
          transition-transform duration-300 ease-in-out
          ${drawerAbierto ? 'translate-x-0' : '-translate-x-full'}`}
        aria-label="Barra lateral de navegación"
        role="dialog"
        aria-modal="true"
      >
        <Contenido enDrawer />
      </div>

      {/* ── Sidebar fijo escritorio ───────────────────────── */}
      <aside
        className={`hidden lg:flex flex-col bg-primary-dark min-h-screen shadow-xl transition-all duration-300
          ${colapsado ? 'w-16' : 'w-60'}`}
        aria-label="Barra lateral de navegación"
      >
        <Contenido />
      </aside>
    </>
  );
}

// ============================================================
// Navbar del portal Cliente — con UserMenu integrado
// ============================================================
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { X, Ticket, HelpCircle, LayoutDashboard, PlusCircle, Menu } from 'lucide-react';
import UserMenu from './UserMenu';
import LogoCineplanet from './LogoCineplanet';

const NAV_ITEMS = [
  { label: 'Inicio',       href: '/cliente',              Icon: LayoutDashboard },
  { label: 'Mis reclamos', href: '/cliente/mis-tickets',  Icon: Ticket },
  { label: 'Ayuda / FAQ',  href: '/cliente/faq',          Icon: HelpCircle },
];

export default function Navbar() {
  const location = useLocation();
  const [menuAbierto, setMenuAbierto] = useState(false);

  const esActivo = (href: string) =>
    href === '/cliente'
      ? location.pathname === '/cliente'
      : location.pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-40 bg-primary shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">

          {/* ── Logo ─────────────────────────────────────── */}
          <Link
            to="/cliente"
            className="flex items-center gap-2 shrink-0 min-h-[44px]"
            aria-label="Ir al inicio"
          >
            <LogoCineplanet dark size="sm" />
            <span className="hidden sm:block text-white/60 text-xs font-medium border-l border-white/20 pl-2">
              ServiceDesk
            </span>
          </Link>

          {/* ── Navegación escritorio ─────────────────────── */}
          <nav className="hidden md:flex items-center gap-1 flex-1 justify-center" aria-label="Menú principal">
            {NAV_ITEMS.map(({ label, href, Icon }) => (
              <Link
                key={href}
                to={href}
                aria-current={esActivo(href) ? 'page' : undefined}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-semibold transition-colors min-h-[44px]
                  ${esActivo(href)
                    ? 'bg-accent-yellow text-primary-dark'
                    : 'text-white/80 hover:bg-white/10 hover:text-white'}`}
              >
                <Icon size={16} aria-hidden="true" />
                {label}
              </Link>
            ))}
          </nav>

          {/* ── Derecha ───────────────────────────────────── */}
          <div className="flex items-center gap-1 sm:gap-2 shrink-0">
            {/* CTA Reportar — escritorio */}
            <Link
              to="/cliente/nuevo-ticket"
              className="hidden sm:flex items-center gap-1.5 bg-accent-yellow text-primary-dark
                px-3 py-2 rounded-xl text-xs font-bold hover:bg-yellow-300 transition-colors min-h-[44px]"
            >
              <PlusCircle size={15} aria-hidden="true" />
              <span className="hidden lg:inline">Reportar cobro</span>
              <span className="lg:hidden">Reportar</span>
            </Link>

            {/* UserMenu (siempre visible) */}
            <UserMenu variante="oscura" />

            {/* Hamburguesa móvil */}
            <button
              className="md:hidden flex items-center justify-center w-11 h-11 rounded-xl text-white hover:bg-white/10 transition-colors"
              onClick={() => setMenuAbierto((v) => !v)}
              aria-expanded={menuAbierto}
              aria-label={menuAbierto ? 'Cerrar menú de navegación' : 'Abrir menú de navegación'}
            >
              {menuAbierto ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Menú móvil desplegable ────────────────────────── */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-200 ${menuAbierto ? 'max-h-96' : 'max-h-0'}`}
        aria-hidden={!menuAbierto}
      >
        <nav className="bg-primary-dark border-t border-white/10 px-4 py-3 flex flex-col gap-1">
          {NAV_ITEMS.map(({ label, href, Icon }) => (
            <Link
              key={href}
              to={href}
              onClick={() => setMenuAbierto(false)}
              className="flex items-center gap-2.5 px-3 py-3 rounded-xl text-sm font-semibold text-white/80 hover:bg-white/10 hover:text-white min-h-[44px]"
            >
              <Icon size={18} aria-hidden="true" />
              {label}
            </Link>
          ))}
          <Link
            to="/cliente/nuevo-ticket"
            onClick={() => setMenuAbierto(false)}
            className="flex items-center gap-2.5 mt-2 px-3 py-3 rounded-xl text-sm font-bold bg-accent-yellow text-primary-dark min-h-[44px]"
          >
            <PlusCircle size={18} aria-hidden="true" />
            Reportar cobro no reflejado
          </Link>
        </nav>
      </div>
    </header>
  );
}

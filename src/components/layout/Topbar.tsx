// ============================================================
// Topbar — Barra superior fija para Operador / Admin
// Izquierda: hamburguesa (móvil) + título de la página.
// Derecha: campana de notificaciones + UserMenu.
// ============================================================
import { Bell } from 'lucide-react';
import UserMenu from './UserMenu';

interface Props {
  titulo: string;
  subtitulo?: string;
  /** Callback del botón hamburguesa (abre el drawer del sidebar) */
  onAbrirMenu: () => void;
  notificaciones?: number;
}

export default function Topbar({ titulo, subtitulo, onAbrirMenu, notificaciones = 0 }: Props) {
  return (
    <header
      className="sticky top-0 z-30 bg-white border-b border-app-border shadow-sm"
      role="banner"
    >
      <div className="flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 h-16">
        {/* ── Izquierda ─────────────────────────────────────── */}
        <div className="flex items-center gap-3 min-w-0">
          {/* Hamburguesa — solo < lg */}
          <button
            onClick={onAbrirMenu}
            aria-label="Abrir menú de navegación"
            className="lg:hidden flex items-center justify-center w-11 h-11 rounded-xl
              text-primary hover:bg-primary/5 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          {/* Título de la página */}
          <div className="min-w-0">
            <h1 className="text-base sm:text-lg font-extrabold text-app-text truncate">{titulo}</h1>
            {subtitulo && (
              <p className="text-xs text-app-muted truncate hidden sm:block">{subtitulo}</p>
            )}
          </div>
        </div>

        {/* ── Derecha ──────────────────────────────────────── */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Campana de notificaciones */}
          <button
            aria-label={`Notificaciones${notificaciones ? `: ${notificaciones} sin leer` : ''}`}
            className="relative flex items-center justify-center w-11 h-11 rounded-xl
              text-app-muted hover:bg-primary/5 hover:text-primary transition-colors"
          >
            <Bell size={20} />
            {notificaciones > 0 && (
              <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-0.5 rounded-full
                bg-accent-crimson text-white text-[10px] font-bold flex items-center justify-center">
                {notificaciones > 9 ? '9+' : notificaciones}
              </span>
            )}
          </button>

          {/* Menú de usuario */}
          <UserMenu variante="clara" />
        </div>
      </div>
    </header>
  );
}

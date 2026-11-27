// ============================================================
// UserMenu — Menú de usuario reutilizable (dropdown)
// Colocado en el extremo derecho de la barra superior.
// Accesible: teclado, Escape, clic fuera, aria.
// ============================================================
import { useEffect, useRef, useState, type RefObject } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown, LogOut, UserCircle2, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

// Rol → etiqueta y color del badge
const ROL_INFO: Record<string, { label: string; clase: string }> = {
  cliente:  { label: 'Cliente',            clase: 'bg-primary/10 text-primary border-primary/20' },
  operador: { label: 'Operador L1',         clase: 'bg-teal-50 text-accent-teal border-accent-teal/30' },
  admin:    { label: 'Administrador L2',    clase: 'bg-amber-50 text-accent-orange border-accent-orange/30' },
};

/** Obtiene las iniciales del nombre (máx. 2) */
function iniciales(nombre: string): string {
  return nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0].toUpperCase())
    .join('');
}

interface Props {
  /** Clase extra para el contenedor (permite variante clara/oscura del topbar) */
  variante?: 'clara' | 'oscura';
}

export default function UserMenu({ variante = 'clara' }: Props) {
  const { usuario, rol, logout } = useAuth();
  const { mostrar } = useToast();
  const navigate = useNavigate();

  const [abierto, setAbierto] = useState(false);
  const contenedorRef = useRef<HTMLDivElement>(null);
  const botonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  if (!usuario) return null;

  const info = ROL_INFO[rol ?? 'cliente'] ?? ROL_INFO.cliente;
  const nombreCorto = usuario.nombre.split(' ').slice(0, 2).join(' ');
  const esOscuro = variante === 'oscura';

  // ── Cerrar con clic fuera ─────────────────────────────────
  useEffect(() => {
    if (!abierto) return;
    const onClickFuera = (e: MouseEvent) => {
      if (contenedorRef.current && !contenedorRef.current.contains(e.target as Node)) {
        setAbierto(false);
      }
    };
    document.addEventListener('mousedown', onClickFuera);
    return () => document.removeEventListener('mousedown', onClickFuera);
  }, [abierto]);

  // ── Cerrar con Escape y volver el foco al botón ───────────
  useEffect(() => {
    if (!abierto) return;
    const onTecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAbierto(false);
        botonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onTecla);
    return () => document.removeEventListener('keydown', onTecla);
  }, [abierto]);

  // ── Navegación con flechas dentro del menú ────────────────
  const onTeclaMenu = (e: React.KeyboardEvent) => {
    const items = menuRef.current?.querySelectorAll<HTMLButtonElement>('[role="menuitem"]');
    if (!items) return;
    const arr = Array.from(items);
    const idx = arr.indexOf(document.activeElement as HTMLButtonElement);
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      (arr[(idx + 1) % arr.length] ?? arr[0])?.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      (arr[(idx - 1 + arr.length) % arr.length] ?? arr[0])?.focus();
    }
  };

  const cerrarSesion = async () => {
    setAbierto(false);
    await logout();
    mostrar('Sesión cerrada correctamente.', 'info');
    navigate('/login', { replace: true });
  };

  // Ruta de perfil según el rol activo
  const rutaPerfil =
    rol === 'admin'    ? '/admin/perfil'    :
    rol === 'operador' ? '/operador/perfil' :
                         '/cliente/perfil';

  const opciones = [
    {
      Icono: UserCircle2,
      label: 'Mi perfil',
      onClick: () => { setAbierto(false); },
      href: rutaPerfil as string | undefined,
    },
    {
      Icono: HelpCircle,
      label: 'Ayuda / Base de conocimiento',
      onClick: () => { setAbierto(false); },
      href: '/cliente/faq' as string | undefined,
    },
  ];

  return (
    <div ref={contenedorRef} className="relative">
      {/* ── Botón disparador ──────────────────────────────── */}
      <button
        ref={botonRef}
        onClick={() => setAbierto((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={abierto}
        aria-label={`Menú de usuario: ${usuario.nombre}`}
        className={`flex items-center gap-2 rounded-xl px-1.5 py-1 sm:px-2 min-h-[44px] min-w-[44px]
          transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
          ${esOscuro
            ? 'hover:bg-white/10 focus-visible:ring-white text-white'
            : 'hover:bg-primary/5 focus-visible:ring-primary text-app-text'}`}
      >
        {/* Avatar */}
        <span
          className="w-9 h-9 rounded-full bg-accent-yellow text-primary-dark font-extrabold text-xs
            flex items-center justify-center shrink-0 border border-primary-dark/10"
          aria-hidden="true"
        >
          {iniciales(usuario.nombre)}
        </span>

        {/* Nombre y rol — solo escritorio */}
        <span className="hidden md:flex flex-col items-start leading-tight">
          <span className={`text-xs font-bold ${esOscuro ? 'text-white' : 'text-app-text'}`}>
            {nombreCorto}
          </span>
          <span className={`text-[10px] ${esOscuro ? 'text-white/60' : 'text-app-muted'}`}>
            {info.label}
          </span>
        </span>

        {/* Chevron que rota */}
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-200 ${abierto ? 'rotate-180' : ''} ${esOscuro ? 'text-white/70' : 'text-app-muted'}`}
          aria-hidden="true"
        />
      </button>

      {/* ── Dropdown ──────────────────────────────────────── */}
      <div
        ref={menuRef}
        role="menu"
        aria-label="Opciones de usuario"
        onKeyDown={onTeclaMenu}
        className={`absolute right-0 top-full mt-2 w-64 sm:w-72 rounded-xl border border-app-border bg-white shadow-lg
          origin-top-right transition-all duration-150 ease-out z-50
          ${abierto
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 -translate-y-1 pointer-events-none'}`}
      >
        {/* Cabecera del dropdown */}
        <div className="flex items-center gap-3 p-4 border-b border-app-border">
          <span
            className="w-12 h-12 rounded-full bg-accent-yellow text-primary-dark font-extrabold text-sm
              flex items-center justify-center shrink-0 border border-primary-dark/10"
            aria-hidden="true"
          >
            {iniciales(usuario.nombre)}
          </span>
          <div className="min-w-0">
            <p className="text-sm font-bold text-app-text truncate">{usuario.nombre}</p>
            <p className="text-xs text-app-muted truncate">{usuario.correo}</p>
            <span className={`inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${info.clase}`}>
              {info.label}
            </span>
          </div>
        </div>

        {/* Opciones */}
        <div className="p-1.5">
          {opciones.map(({ Icono, label, onClick, href }) =>
            href ? (
              <Link
                key={label}
                to={href}
                onClick={onClick}
                role="menuitem"
                tabIndex={abierto ? 0 : -1}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-app-text
                  hover:bg-primary/5 hover:text-primary transition-colors min-h-[44px]"
              >
                <Icono size={18} className="text-app-muted shrink-0" />
                {label}
              </Link>
            ) : (
              <button
                key={label}
                onClick={onClick}
                role="menuitem"
                tabIndex={abierto ? 0 : -1}
                className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold text-app-text
                  hover:bg-primary/5 hover:text-primary transition-colors min-h-[44px]"
              >
                <Icono size={18} className="text-app-muted shrink-0" />
                {label}
              </button>
            )
          )}
        </div>

        {/* Divisor + Cerrar sesión */}
        <div className="border-t border-app-border p-1.5">
          <button
            onClick={cerrarSesion}
            role="menuitem"
            tabIndex={abierto ? 0 : -1}
            className="flex items-center gap-3 w-full text-left px-3 py-2.5 rounded-lg text-sm font-semibold
              text-accent-crimson hover:bg-red-50 transition-colors min-h-[44px]"
          >
            <LogOut size={18} className="shrink-0" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </div>
  );
}

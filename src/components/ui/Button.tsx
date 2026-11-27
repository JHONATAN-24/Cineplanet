// Botón reutilizable con variantes
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import Spinner from './Spinner';

type Variante = 'primary' | 'cta' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Tamano = 'sm' | 'md' | 'lg';

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variante?: Variante;
  tamano?: Tamano;
  cargando?: boolean;
  icono?: ReactNode;
  iconoDerecha?: ReactNode;
  children?: ReactNode;
  fullWidth?: boolean;
}

const variantes: Record<Variante, string> = {
  primary:   'bg-primary text-white hover:bg-primary-dark focus-visible:ring-primary',
  cta:       'bg-accent-yellow text-primary-dark font-bold hover:bg-yellow-400 focus-visible:ring-accent-yellow',
  secondary: 'bg-primary/10 text-primary hover:bg-primary/20 focus-visible:ring-primary',
  danger:    'bg-accent-crimson text-white hover:bg-red-700 focus-visible:ring-accent-crimson',
  ghost:     'bg-transparent text-primary hover:bg-primary/10 focus-visible:ring-primary',
  outline:   'border-2 border-primary text-primary hover:bg-primary hover:text-white focus-visible:ring-primary',
};

const tamanos: Record<Tamano, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
};

export default function Button({
  variante = 'primary',
  tamano = 'md',
  cargando = false,
  icono,
  iconoDerecha,
  children,
  fullWidth = false,
  disabled,
  className = '',
  ...props
}: Props) {
  const base =
    'inline-flex items-center justify-center rounded-xl font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none';

  return (
    <button
      {...props}
      disabled={disabled || cargando}
      aria-disabled={disabled || cargando}
      className={`${base} ${variantes[variante]} ${tamanos[tamano]} ${fullWidth ? 'w-full' : ''} ${className}`}
    >
      {cargando ? (
        <Spinner size="sm" color="currentColor" />
      ) : icono ? (
        <span className="shrink-0">{icono}</span>
      ) : null}
      {children}
      {!cargando && iconoDerecha && <span className="shrink-0">{iconoDerecha}</span>}
    </button>
  );
}

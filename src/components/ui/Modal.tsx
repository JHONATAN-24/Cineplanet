// Modal accesible con overlay
import { useEffect, useRef, type ReactNode } from 'react';
import { X } from 'lucide-react';
import Button from './Button';

interface Props {
  abierto: boolean;
  onCerrar: () => void;
  titulo?: string;
  children: ReactNode;
  tamano?: 'sm' | 'md' | 'lg' | 'xl';
  ocultarCerrar?: boolean;
}

const tamanos = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
  xl: 'max-w-2xl',
};

export default function Modal({ abierto, onCerrar, titulo, children, tamano = 'md', ocultarCerrar = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  // Cerrar con Escape
  useEffect(() => {
    if (!abierto) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onCerrar(); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [abierto, onCerrar]);

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = abierto ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [abierto]);

  if (!abierto) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={titulo}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-primary-dark/50 backdrop-blur-sm"
        onClick={onCerrar}
        aria-hidden="true"
      />
      {/* Contenido */}
      <div
        ref={ref}
        className={`relative bg-white rounded-2xl shadow-2xl w-full ${tamanos[tamano]} max-h-[90vh] overflow-y-auto animate-fade-in`}
      >
        {(titulo || !ocultarCerrar) && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-app-border">
            {titulo && <h2 className="text-lg font-bold text-app-text">{titulo}</h2>}
            {!ocultarCerrar && (
              <Button
                variante="ghost"
                tamano="sm"
                onClick={onCerrar}
                aria-label="Cerrar modal"
                className="ml-auto rounded-full p-1.5"
              >
                <X size={18} />
              </Button>
            )}
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

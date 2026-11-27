// ============================================================
// ToastContainer — Responsive
// Móvil:      inferior centrado, ancho casi completo
// Escritorio: esquina superior derecha, ancho fijo máx 384px
// ============================================================
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useToast, type ToastTipo } from '../../context/ToastContext';

const CONFIG: Record<ToastTipo, { Icon: typeof CheckCircle2; color: string; borde: string }> = {
  exito:       { Icon: CheckCircle2,  color: 'text-accent-green',   borde: 'border-l-accent-green' },
  error:       { Icon: XCircle,       color: 'text-accent-crimson', borde: 'border-l-accent-crimson' },
  advertencia: { Icon: AlertTriangle, color: 'text-accent-orange',  borde: 'border-l-accent-orange' },
  info:        { Icon: Info,          color: 'text-primary-light',  borde: 'border-l-primary-light' },
};

export default function ToastContainer() {
  const { toasts, cerrar } = useToast();
  if (!toasts.length) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className={[
        'fixed z-[100] flex flex-col gap-2 pointer-events-none',
        // Móvil: barra inferior centrada
        'bottom-4 left-4 right-4',
        // sm+: esquina superior derecha, ancho acotado
        'sm:bottom-auto sm:top-4 sm:left-auto sm:right-4 sm:w-full sm:max-w-sm',
      ].join(' ')}
    >
      {toasts.map((t) => {
        const { Icon, color, borde } = CONFIG[t.tipo];
        return (
          <div
            key={t.id}
            role="alert"
            className={[
              'pointer-events-auto bg-white rounded-xl shadow-lg',
              'border border-app-border border-l-4',
              borde,
              'p-3.5 sm:p-4 flex items-start gap-3 animate-fade-in',
            ].join(' ')}
          >
            <Icon size={18} className={`shrink-0 mt-0.5 ${color}`} aria-hidden="true" />
            <p className="text-sm text-app-text flex-1 leading-snug">{t.mensaje}</p>
            <button
              onClick={() => cerrar(t.id)}
              aria-label="Cerrar notificación"
              className="text-app-muted hover:text-app-text transition-colors shrink-0 p-0.5 rounded min-w-[28px] min-h-[28px] flex items-center justify-center"
            >
              <X size={15} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

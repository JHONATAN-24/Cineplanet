// Overlay animado del motor de conciliación automática
import { Loader2, Wifi, CheckCircle2, QrCode, RefreshCw, UserCheck } from 'lucide-react';

const pasos = [
  { paso: 0, Icon: Loader2,     label: 'Registrando reclamo...',              color: 'text-primary' },
  { paso: 1, Icon: Wifi,        label: 'Conectando con la pasarela...',        color: 'text-accent-teal' },
  { paso: 2, Icon: RefreshCw,   label: 'Verificando transacción...',           color: 'text-accent-orange' },
  { paso: 3, Icon: CheckCircle2,label: 'Analizando respuesta...',              color: 'text-accent-green' },
  { paso: 4, Icon: QrCode,      label: 'Emitiendo entrada digital...',          color: 'text-accent-green' },
  { paso: 5, Icon: UserCheck,   label: 'Notificando al cliente...',            color: 'text-accent-green' },
];

interface Props {
  mensaje: string;
  paso: number;
}

export default function ConciliacionAnimacion({ mensaje, paso }: Props) {
  const actual = pasos.find((p) => p.paso === paso) ?? pasos[0];
  const { Icon, color } = actual;

  return (
    <div className="fixed inset-0 z-50 bg-primary-dark/70 backdrop-blur-sm flex items-center justify-center p-4" role="status" aria-live="polite">
      <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-sm w-full text-center animate-fade-in">
        {/* Icono animado */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Icon size={36} className={`${color} ${paso < 4 ? 'animate-spin' : 'animate-bounce-soft'}`} />
            </div>
            {/* Pulso */}
            <div className="absolute inset-0 rounded-full border-4 border-primary/20 animate-ping" />
          </div>
        </div>

        <h2 className="text-lg font-extrabold text-app-text mb-2">Verificando con la pasarela</h2>
        <p className="text-sm text-app-muted mb-6">{mensaje}</p>

        {/* Barra de progreso */}
        <div className="w-full bg-app-border rounded-full h-2 mb-4">
          <div
            className="h-2 rounded-full bg-primary transition-all duration-700"
            style={{ width: `${Math.min(100, (paso / 5) * 100)}%` }}
            role="progressbar"
            aria-valuenow={paso}
            aria-valuemin={0}
            aria-valuemax={5}
          />
        </div>

        {/* Pasos */}
        <div className="flex justify-center gap-1.5 mt-2">
          {pasos.slice(1).map((p) => (
            <div
              key={p.paso}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${paso >= p.paso ? 'bg-primary' : 'bg-app-border'}`}
            />
          ))}
        </div>

        <p className="text-xs text-app-muted mt-4">
          Esto puede tardar entre 3 y 8 segundos. No cierres esta ventana.
        </p>
      </div>
    </div>
  );
}

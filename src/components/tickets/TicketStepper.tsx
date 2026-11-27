// Línea de tiempo visual de estados del ticket
import { CheckCircle2, Circle, Clock } from 'lucide-react';
import type { EstadoIncidencia, HistorialEstado } from '../../types';
import { formatearFechaHora } from '../../utils/format';

const ESTADOS_ORDEN: EstadoIncidencia[] = [
  'Registrado', 'En Validación', 'Conciliado', 'Cerrado',
];

const COLORES: Record<EstadoIncidencia, string> = {
  'Registrado':    '#3B7CC0',
  'En Validación': '#15A9B8',
  'Conciliado':    '#30A67D',
  'Reembolsado':   '#7E2582',
  'Cerrado':       '#5B6B85',
  'Escalado':      '#B5127F',
};

interface Props {
  historial: HistorialEstado[];
  estadoActual: EstadoIncidencia;
}

export default function TicketStepper({ historial, estadoActual }: Props) {
  // Construir la secuencia a mostrar considerando estados especiales
  const estados =
    estadoActual === 'Reembolsado'
      ? ['Registrado', 'En Validación', 'Reembolsado', 'Cerrado'] as EstadoIncidencia[]
      : estadoActual === 'Escalado'
      ? ['Registrado', 'En Validación', 'Escalado'] as EstadoIncidencia[]
      : ESTADOS_ORDEN;

  const encontrarEntrada = (estado: EstadoIncidencia) =>
    historial.find((h) => h.estadoNuevo === estado);

  return (
    <div className="relative">
      {/* Línea vertical */}
      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-app-border" aria-hidden="true" />

      <ol className="relative flex flex-col gap-6">
        {estados.map((estado, idx) => {
          const entrada = encontrarEntrada(estado);
          const activo = estado === estadoActual;
          const completado = historial.some((h) => h.estadoNuevo === estado);
          const futuro = !completado && !activo;

          return (
            <li key={estado} className="flex items-start gap-4 pl-0">
              {/* Círculo indicador */}
              <div
                className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all
                  ${completado ? 'bg-white' : futuro ? 'bg-app-bg border-app-border' : 'bg-white'}`}
                style={{ borderColor: completado || activo ? COLORES[estado] : undefined }}
                aria-hidden="true"
              >
                {completado && !activo ? (
                  <CheckCircle2 size={18} style={{ color: COLORES[estado] }} />
                ) : activo ? (
                  <Clock size={16} style={{ color: COLORES[estado] }} className="animate-pulse-soft" />
                ) : (
                  <Circle size={16} className="text-app-border" />
                )}
              </div>

              {/* Contenido */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-sm font-bold ${futuro ? 'text-app-muted' : 'text-app-text'}`}
                    style={!futuro ? { color: COLORES[estado] } : undefined}
                  >
                    {estado}
                  </span>
                  {activo && (
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-primary/10 text-primary animate-pulse-soft">
                      Estado actual
                    </span>
                  )}
                </div>
                {entrada ? (
                  <div className="mt-1">
                    <p className="text-xs text-app-muted">{formatearFechaHora(entrada.fecha)}</p>
                    {entrada.comentario && (
                      <p className="text-xs text-app-text mt-1 bg-app-bg rounded-lg p-2 border border-app-border">
                        {entrada.comentario}
                      </p>
                    )}
                    <p className="text-[10px] text-app-muted mt-1">Por: {entrada.usuarioNombre}</p>
                  </div>
                ) : (
                  <p className="text-xs text-app-muted mt-0.5">{futuro ? 'Pendiente' : ''}</p>
                )}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

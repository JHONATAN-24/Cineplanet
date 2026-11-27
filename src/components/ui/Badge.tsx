// Badge de estado / prioridad con colores del sistema
import type { EstadoIncidencia, Prioridad } from '../../types';

const estadoColores: Record<EstadoIncidencia, string> = {
  'Registrado':    'bg-primary-light/10 text-primary-light border-primary-light/30',
  'En Validación': 'bg-teal-50 text-accent-teal border-accent-teal/30',
  'Conciliado':    'bg-green-50 text-accent-green border-accent-green/30',
  'Reembolsado':   'bg-purple-50 text-accent-purple border-accent-purple/30',
  'Cerrado':       'bg-gray-100 text-app-muted border-app-border',
  'Escalado':      'bg-pink-50 text-accent-magenta border-accent-magenta/30',
};

const estadoHex: Record<EstadoIncidencia, string> = {
  'Registrado':    '#3B7CC0',
  'En Validación': '#15A9B8',
  'Conciliado':    '#30A67D',
  'Reembolsado':   '#7E2582',
  'Cerrado':       '#5B6B85',
  'Escalado':      '#B5127F',
};

const prioridadColores: Record<Prioridad, string> = {
  'Baja':     'bg-lime-50 text-accent-lime-green border-accent-lime-green/30',
  'Media':    'bg-orange-50 text-accent-orange border-accent-orange/30',
  'Alta':     'bg-red-50 text-accent-orange-red border-accent-orange-red/30',
  'Crítica':  'bg-rose-50 text-accent-crimson border-accent-crimson/30',
};

interface BadgeEstadoProps {
  estado: EstadoIncidencia;
  size?: 'sm' | 'md';
}

export function BadgeEstado({ estado, size = 'md' }: BadgeEstadoProps) {
  const cls = estadoColores[estado] ?? 'bg-gray-100 text-gray-700';
  const sz = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${cls} ${sz}`}
      aria-label={`Estado: ${estado}`}
    >
      <span
        className="w-1.5 h-1.5 rounded-full inline-block"
        style={{ backgroundColor: estadoHex[estado] }}
      />
      {estado}
    </span>
  );
}

interface BadgePrioridadProps {
  prioridad: Prioridad;
  size?: 'sm' | 'md';
}

export function BadgePrioridad({ prioridad, size = 'md' }: BadgePrioridadProps) {
  const cls = prioridadColores[prioridad] ?? 'bg-gray-100 text-gray-700';
  const sz = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center rounded-full font-semibold border ${cls} ${sz}`}
      aria-label={`Prioridad: ${prioridad}`}
    >
      {prioridad}
    </span>
  );
}

interface BadgePasarelaProps {
  pasarela: 'Niubiz' | 'Izipay';
}

export function BadgePasarela({ pasarela }: BadgePasarelaProps) {
  const cls = pasarela === 'Niubiz'
    ? 'bg-primary/10 text-primary border-primary/20'
    : 'bg-orange-50 text-accent-orange border-accent-orange/30';
  return (
    <span className={`inline-flex items-center rounded-full font-semibold border text-xs px-2.5 py-1 ${cls}`}>
      {pasarela}
    </span>
  );
}

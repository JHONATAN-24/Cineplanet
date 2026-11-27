// ============================================================
// Utilidades de SLA / semáforo
// ============================================================
import type { Incidencia } from '../types';

export type SlaStatus = 'ok' | 'riesgo' | 'vencido';

/** Calcula el estado del semáforo de SLA */
export function calcularSla(ticket: Incidencia): {
  status: SlaStatus;
  tiempoTranscurrido: number; // minutos
  tiempoRestante: number;      // minutos (negativo = vencido)
  porcentaje: number;          // 0-100
  color: string;
} {
  const ahora = Date.now();
  const creado = new Date(ticket.fechaCreacion).getTime();
  const transcurridoMs =
    ticket.fechaCierre
      ? new Date(ticket.fechaCierre).getTime() - creado
      : ahora - creado;

  const transcurrido = transcurridoMs / 60000; // minutos
  const objetivo = ticket.slaObjetivo; // minutos
  const restante = objetivo - transcurrido;
  const porcentaje = Math.min(100, (transcurrido / objetivo) * 100);

  let status: SlaStatus;
  let color: string;

  if (transcurrido > objetivo) {
    status = 'vencido';
    color = '#CB2054';
  } else if (transcurrido > objetivo * 0.75) {
    status = 'riesgo';
    color = '#DE9430';
  } else {
    status = 'ok';
    color = '#30A67D';
  }

  return { status, tiempoTranscurrido: transcurrido, tiempoRestante: restante, porcentaje, color };
}

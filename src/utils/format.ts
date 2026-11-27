// ============================================================
// Utilidades de formateo (fechas, moneda en soles)
// ============================================================

/** Formatea un monto en soles peruanos */
export function formatearSoles(monto: number): string {
  return `S/ ${monto.toFixed(2)}`;
}

/** Formatea una fecha/hora completa: "26 nov 2026, 14:05" */
export function formatearFechaHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Formatea solo la fecha: "26 nov 2026" */
export function formatearFecha(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('es-PE', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/** Formatea solo la hora: "14:05 p.m." */
export function formatearHora(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

/** Formatea una duración en minutos: "8 min", "1.5 h" */
export function formatearDuracion(minutos: number): string {
  if (minutos < 60) return `${Math.round(minutos)} min`;
  if (minutos < 1440) return `${(minutos / 60).toFixed(1)} h`;
  return `${(minutos / 1440).toFixed(1)} días`;
}

/** Formatea un número con separador de miles y sufijo */
export function formatearNumero(n: number, sufijo = ''): string {
  return `${n.toLocaleString('es-PE')}${sufijo}`;
}

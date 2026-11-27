// ============================================================
// Exportación de datos a CSV desde el frontend
// ============================================================
import type { Incidencia } from '../types';
import { formatearFechaHora, formatearSoles } from './format';

export function exportarTicketsCSV(tickets: Incidencia[]): void {
  const cabeceras = [
    'ID',
    'Cliente',
    'DNI',
    'Correo',
    'Sede',
    'Película',
    'Monto',
    'Pasarela',
    'Estado',
    'Prioridad',
    'Fecha Creación',
    'Fecha Cierre',
    'Tiempo Resolución (min)',
    'SLA Vencido',
    'QR Emitido',
    'CSAT',
  ];

  const filas = tickets.map((t) => [
    t.id,
    t.clienteNombre,
    t.clienteDni,
    t.clienteCorreo,
    t.transaccion.cine,
    t.transaccion.pelicula,
    formatearSoles(t.transaccion.monto),
    t.transaccion.pasarela,
    t.estado,
    t.prioridad,
    formatearFechaHora(t.fechaCreacion),
    t.fechaCierre ? formatearFechaHora(t.fechaCierre) : '',
    t.tiempoResolucion?.toString() ?? '',
    t.slaVencido ? 'Sí' : 'No',
    t.conciliacion?.codigoQR ?? '',
    t.encuesta?.calificacion?.toString() ?? '',
  ]);

  const contenido = [cabeceras, ...filas]
    .map((fila) => fila.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(','))
    .join('\n');

  const bom = '\uFEFF'; // UTF-8 BOM para Excel
  const blob = new Blob([bom + contenido], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `cineplanet-tickets-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

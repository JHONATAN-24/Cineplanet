// ============================================================
// Servicio de KPIs y datos para el dashboard ejecutivo
// ============================================================
import type { DataPoint, Incidencia, KpiData } from '../types';
import { KEYS, leerLS } from './storageService';
import { delay } from '../utils/delay';

function tickets(): Incidencia[] {
  return leerLS<Incidencia[]>(KEYS.tickets) ?? [];
}

/** Calcula los KPIs principales */
export async function obtenerKpis(): Promise<KpiData> {
  await delay(300, 600);
  const all = tickets();

  // MTTR promedio (solo tickets con tiempoResolucion)
  const resueltos = all.filter((t) => t.tiempoResolucion !== undefined);
  const mttrPromedio =
    resueltos.length > 0
      ? resueltos.reduce((s, t) => s + (t.tiempoResolucion ?? 0), 0) / resueltos.length
      : 0;

  // CSAT: promedio de encuestas * 20 (para llevar a porcentaje de 100)
  const conEncuesta = all.filter((t) => t.encuesta);
  const csat =
    conEncuesta.length > 0
      ? (conEncuesta.reduce((s, t) => s + (t.encuesta?.calificacion ?? 0), 0) / conEncuesta.length / 5) * 100
      : 73.5;

  // Conciliación automática
  const conciliados = all.filter(
    (t) => t.conciliacion?.resultado === 'Conciliado' || t.conciliacion?.resultado === 'Reembolso'
  ).length;
  const conciliacionAutomatica =
    all.length > 0 ? (conciliados / all.length) * 100 : 85;

  return {
    mttrPromedio: +mttrPromedio.toFixed(1),
    disponibilidad: 99.2,
    csat: +csat.toFixed(1),
    conciliacionAutomatica: +conciliacionAutomatica.toFixed(1),
    deflexionAutoservicio: 38.5,
  };
}

/** Serie temporal de MTTR por semana (últimas 8 semanas) */
export async function seriesMttrSemanal(): Promise<DataPoint[]> {
  await delay(200, 400);
  const all = tickets();

  // Genera puntos por semana basándose en datos reales + interpolación
  const hoy = new Date();
  return Array.from({ length: 8 }, (_, i) => {
    const fecha = new Date(hoy.getTime() - (7 - i) * 7 * 86400000);
    const etiqueta = `S${i + 1}`;
    const semStart = new Date(fecha.getTime() - 7 * 86400000).toISOString();
    const semEnd = fecha.toISOString();
    const enSemana = all.filter(
      (t) =>
        t.fechaCreacion >= semStart &&
        t.fechaCreacion < semEnd &&
        t.tiempoResolucion !== undefined
    );
    const valor =
      enSemana.length > 0
        ? enSemana.reduce((s, t) => s + (t.tiempoResolucion ?? 0), 0) / enSemana.length
        // Sin datos suficientes: simula tendencia descendente (72h → 10 min)
        : Math.max(8, 68 - i * 8 + (Math.random() - 0.5) * 4);
    return { fecha: etiqueta, valor: +valor.toFixed(1), etiqueta };
  });
}

/** Conteo de tickets por estado */
export async function distribucionEstados(): Promise<{ estado: string; cantidad: number; color: string }[]> {
  await delay(200, 400);
  const all = tickets();
  const colores: Record<string, string> = {
    Registrado: '#3B7CC0',
    'En Validación': '#15A9B8',
    Conciliado: '#30A67D',
    Reembolsado: '#7E2582',
    Cerrado: '#5B6B85',
    Escalado: '#B5127F',
  };
  const counts: Record<string, number> = {};
  all.forEach((t) => { counts[t.estado] = (counts[t.estado] ?? 0) + 1; });
  return Object.entries(counts).map(([estado, cantidad]) => ({
    estado,
    cantidad,
    color: colores[estado] ?? '#204D8A',
  }));
}

/** Distribución por pasarela */
export async function distribucionPasarela(): Promise<{ pasarela: string; value: number; color: string }[]> {
  await delay(200, 400);
  const all = tickets();
  const niubiz = all.filter((t) => t.transaccion.pasarela === 'Niubiz').length;
  const izipay = all.filter((t) => t.transaccion.pasarela === 'Izipay').length;
  return [
    { pasarela: 'Niubiz', value: niubiz, color: '#204D8A' },
    { pasarela: 'Izipay', value: izipay, color: '#DE9430' },
  ];
}

/** Serie de CSAT mensual (últimos 6 meses) */
export async function seriesCsatMensual(): Promise<DataPoint[]> {
  await delay(200, 400);
  const meses = ['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov'];
  const baseline = [45, 51, 58, 65, 71, 73.5];
  return meses.map((m, i) => ({ fecha: m, valor: baseline[i], etiqueta: m }));
}

/** Serie de volumen de tickets por día (últimos 14 días) */
export async function volumenTicketsDiario(): Promise<DataPoint[]> {
  await delay(200, 400);
  const all = tickets();
  const hoy = new Date();
  return Array.from({ length: 14 }, (_, i) => {
    const fecha = new Date(hoy.getTime() - (13 - i) * 86400000);
    const diaStr = fecha.toISOString().slice(0, 10);
    const etiqueta = `${fecha.getDate()}/${fecha.getMonth() + 1}`;
    const cant = all.filter((t) => t.fechaCreacion.startsWith(diaStr)).length;
    return { fecha: diaStr, valor: cant || Math.floor(Math.random() * 5 + 1), etiqueta };
  });
}

/** Comparativo antes vs. después para los KPIs clave */
export interface ComparativoKpi {
  nombre: string;
  antes: number;
  despues: number;
  meta: number;
  unidad: string;
}

export async function obtenerComparativo(): Promise<ComparativoKpi[]> {
  await delay(200, 400);
  const kpis = await obtenerKpis();
  return [
    { nombre: 'MTTR', antes: 4320, despues: kpis.mttrPromedio, meta: 15, unidad: 'min' },
    { nombre: 'CSAT', antes: 45, despues: kpis.csat, meta: 85, unidad: '%' },
    { nombre: 'Conciliación Auto.', antes: 0, despues: kpis.conciliacionAutomatica, meta: 90, unidad: '%' },
    { nombre: 'Deflexión Autoservicio', antes: 10, despues: kpis.deflexionAutoservicio, meta: 40, unidad: '%' },
  ];
}

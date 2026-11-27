// ============================================================
// Motor de conciliación automática (simulado)
// Simula la consulta a Niubiz/Izipay con lógica ponderada
// ============================================================
import type { Incidencia, Conciliacion, ReglasMotor } from '../types';
import { KEYS, leerLS, escribirLS } from './storageService';
import { actualizarTicketConConciliacion, cambiarEstadoTicket } from './ticketService';
import { delay } from '../utils/delay';

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

/** Genera un código QR simulado único */
function generarQR(ticketId: string): string {
  return `CP${Date.now().toString(36).toUpperCase()}-${ticketId.slice(-6)}`;
}

/** Obtiene las reglas actuales del motor */
export function obtenerReglas(): ReglasMotor {
  return (
    leerLS<ReglasMotor>(KEYS.reglas) ?? {
      activo: true,
      umbralReembolsoAutomatico: 150,
      timeoutSegundos: 8,
      probabilidadConciliacion: 0.9,
      probabilidadReembolso: 0.05,
    }
  );
}

/** Guarda las reglas del motor */
export async function guardarReglas(reglas: ReglasMotor): Promise<ReglasMotor> {
  await delay(200, 400);
  escribirLS(KEYS.reglas, reglas);
  return reglas;
}

/** Callback de progreso durante la conciliación */
export type ProgresoConciliacion = (mensaje: string, paso: number) => void;

/**
 * Ejecuta el motor de conciliación para un ticket.
 * Llama al callback `onProgreso` con mensajes de estado en vivo.
 */
export async function ejecutarConciliacion(
  ticket: Incidencia,
  onProgreso: ProgresoConciliacion
): Promise<Incidencia> {
  const reglas = obtenerReglas();
  const inicio = new Date().toISOString();

  if (!reglas.activo) {
    // Motor desactivado — queda en revisión manual
    onProgreso('Motor de conciliación desactivado. Se asignará a un operador.', 1);
    await delay(500, 1000);
    const ticketEscalado = await cambiarEstadoTicket(
      ticket.id,
      'Escalado',
      'sistema',
      'Sistema',
      'Motor desactivado por configuración. Revisión manual requerida.'
    );
    return ticketEscalado;
  }

  // Paso 1 — Pasar a "En Validación"
  onProgreso(`Conectando con ${ticket.transaccion.pasarela}...`, 1);
  const ticketValidando = await cambiarEstadoTicket(
    ticket.id,
    'En Validación',
    'sistema',
    'Motor de Conciliación',
    'Consulta automática enviada a la pasarela de pagos.'
  );
  await delay(1000, 2500);

  // Paso 2 — Simulación de respuesta de la pasarela
  onProgreso(`Verificando transacción N° ${ticket.transaccion.numerOperacion}...`, 2);
  const timeoutMs = reglas.timeoutSegundos * 1000;
  await delay(Math.min(1500, timeoutMs / 3), Math.min(3000, timeoutMs));

  // Paso 3 — Resultado ponderado
  onProgreso('Analizando respuesta de la pasarela...', 3);
  await delay(500, 1000);

  const r = Math.random();
  const probConc = reglas.probabilidadConciliacion;
  const probReemb = reglas.probabilidadReembolso;

  let conciliacion: Conciliacion;
  let ticketFinal: Incidencia;
  const fin = new Date().toISOString();
  const duracionMs = new Date(fin).getTime() - new Date(inicio).getTime();

  if (r < probConc) {
    // ✅ ~90% → Conciliado — se emite la entrada
    onProgreso('Cobro confirmado. Emitiendo entrada digital...', 4);
    await delay(800, 1500);

    const qr = generarQR(ticket.id);
    conciliacion = {
      id: `conc-${ticket.id}`,
      ticketId: ticket.id,
      fechaInicio: inicio,
      fechaFin: fin,
      resultado: 'Conciliado',
      codigoQR: qr,
      mensajeResultado: 'Cobro confirmado por la pasarela. Entrada digital emitida con código QR válido.',
      intentos: 1,
      duracionMs,
    };

    const ticketConConc = { ...ticketValidando, conciliacion };
    await actualizarTicketConConciliacion(ticketConConc);

    onProgreso('¡Entrada emitida exitosamente!', 5);
    await delay(500, 800);

    ticketFinal = await cambiarEstadoTicket(
      ticket.id,
      'Conciliado',
      'sistema',
      'Motor de Conciliación',
      conciliacion.mensajeResultado
    );
    ticketFinal = { ...ticketFinal, conciliacion };
    await actualizarTicketConConciliacion(ticketFinal);

  } else if (r < probConc + probReemb) {
    // 💰 ~5% → Reembolso automático
    onProgreso('Transacción sin matching en emisión. Procesando reembolso...', 4);
    await delay(800, 1500);

    conciliacion = {
      id: `conc-${ticket.id}`,
      ticketId: ticket.id,
      fechaInicio: inicio,
      fechaFin: fin,
      resultado: 'Reembolso',
      mensajeResultado: 'No se encontró registro de emisión de entrada. Reembolso automático procesado a la tarjeta original.',
      intentos: 1,
      duracionMs,
    };

    const ticketConConc = { ...ticketValidando, conciliacion };
    await actualizarTicketConConciliacion(ticketConConc);

    onProgreso('Reembolso procesado. Notificando al cliente...', 5);
    await delay(500, 800);

    ticketFinal = await cambiarEstadoTicket(
      ticket.id,
      'Reembolsado',
      'sistema',
      'Motor de Conciliación',
      conciliacion.mensajeResultado
    );
    ticketFinal = { ...ticketFinal, conciliacion };
    await actualizarTicketConConciliacion(ticketFinal);

  } else {
    // 🔧 ~5% → Revisión manual
    onProgreso('No se pudo determinar el resultado automáticamente. Escalando a operador...', 4);
    await delay(800, 1500);

    conciliacion = {
      id: `conc-${ticket.id}`,
      ticketId: ticket.id,
      fechaInicio: inicio,
      fechaFin: fin,
      resultado: 'Revisión Manual',
      mensajeResultado: 'La pasarela no retornó un resultado definitivo. Se requiere revisión manual por un operador.',
      intentos: 1,
      duracionMs,
    };

    const ticketConConc = { ...ticketValidando, conciliacion };
    await actualizarTicketConConciliacion(ticketConConc);

    onProgreso('Asignado a operador para revisión manual.', 5);
    await delay(500, 800);

    ticketFinal = await cambiarEstadoTicket(
      ticket.id,
      'Escalado',
      'sistema',
      'Motor de Conciliación',
      conciliacion.mensajeResultado
    );
    ticketFinal = { ...ticketFinal, conciliacion };
    await actualizarTicketConConciliacion(ticketFinal);
  }

  return ticketFinal;
}

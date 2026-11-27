// ============================================================
// Datos de ejemplo (seed) — se cargan en localStorage
// solo la primera vez que se abre la aplicación.
// ============================================================
import type {
  ArticuloFAQ,
  Incidencia,
  ReglasMotor,
  Usuario,
  HistorialEstado,
  Conciliacion,
  EstadoIncidencia,
  Prioridad,
  Pasarela,
  TipoProducto,
} from '../types';
import { SEDES } from './sedes';
import { PELICULAS } from './peliculas';

// ── Utilidades de generación determinista (seed) ─────────────
// PRNG mulberry32 para que el seed sea reproducible
function mulberry32(a: number) {
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261126);
const pick = <T,>(arr: T[]): T => arr[Math.floor(rnd() * arr.length)];
const rint = (min: number, max: number) => Math.floor(rnd() * (max - min + 1)) + min;

// ── Usuarios demo ────────────────────────────────────────────
export const USUARIOS_SEED: Usuario[] = [
  {
    id: 'usr-001',
    nombre: 'Cliente Demo',
    correo: 'cliente@demo.com',
    passwordHash: '123456',
    rol: 'cliente',
    activo: true,
    fechaCreacion: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'usr-002',
    nombre: 'Operador Nivel 1',
    correo: 'operador@demo.com',
    passwordHash: '123456',
    rol: 'operador',
    activo: true,
    fechaCreacion: '2026-09-01T08:00:00.000Z',
  },
  {
    id: 'usr-003',
    nombre: 'Admin L2 Demo',
    correo: 'admin@demo.com',
    passwordHash: '123456',
    rol: 'admin',
    activo: true,
    fechaCreacion: '2026-09-01T08:00:00.000Z',
  },
];

// ── Reglas por defecto del motor de conciliación ──────────────
export const REGLAS_SEED: ReglasMotor = {
  activo: true,
  umbralReembolsoAutomatico: 150,
  timeoutSegundos: 8,
  probabilidadConciliacion: 0.9,
  probabilidadReembolso: 0.05,
};

// ── 15 artículos FAQ ─────────────────────────────────────────
export const FAQS_SEED: ArticuloFAQ[] = [
  {
    id: 'faq-001',
    titulo: 'Me cobraron pero no llegó la entrada ni el QR. ¿Qué hago?',
    contenido:
      'Es un caso de cobro no reflejado. Entra a "Reportar cobro no reflejado", completa los datos de tu compra (monto, últimos 4 dígitos de tu tarjeta y número de operación) y el sistema conciliará automáticamente con la pasarela de pagos. En la mayoría de casos la entrada se emite en menos de 15 minutos.',
    categoria: 'Pagos',
    tags: ['cobro', 'entrada', 'qr', 'conciliación'],
    vistas: 4820,
    util: 389,
  },
  {
    id: 'faq-002',
    titulo: '¿Cuánto demora la conciliación automática?',
    contenido:
      'La consulta a la pasarela (Niubiz o Izipay) demora entre 3 y 8 segundos. Si el cobro se confirma, la entrada digital con su código QR se emite de inmediato. Nuestro objetivo de resolución (MTTR) es menor a 15 minutos.',
    categoria: 'Pagos',
    tags: ['tiempo', 'conciliación', 'mttr'],
    vistas: 3105,
    util: 274,
  },
  {
    id: 'faq-003',
    titulo: '¿Es seguro ingresar los últimos 4 dígitos de mi tarjeta?',
    contenido:
      'Sí. Nunca te pedimos el número completo de la tarjeta, el CVV ni la fecha de vencimiento. Solo los últimos 4 dígitos, como referencia para localizar la transacción en la pasarela (tokenización). El resto de los datos se maneja de forma cifrada.',
    categoria: 'Pagos',
    tags: ['seguridad', 'tarjeta', 'tokenización'],
    vistas: 2560,
    util: 201,
  },
  {
    id: 'faq-004',
    titulo: '¿Qué hago si el código QR no aparece en la app?',
    contenido:
      'Revisa primero la sección "Mis entradas" en la app o en tu correo (incluida la carpeta de spam). Si ya pasaron 10 minutos y no aparece, reporta el caso en el portal: selecciona "Entradas/QR" como tipo de producto y el sistema emitirá nuevamente la entrada con un QR válido.',
    categoria: 'Entradas/QR',
    tags: ['qr', 'entrada', 'app'],
    vistas: 3980,
    util: 312,
  },
  {
    id: 'faq-005',
    titulo: '¿Puedo usar el QR que me reenviaron por el reclamo?',
    contenido:
      'Sí, el QR reemitido tiene la misma validez que el original. Preséntalo directamente en el lector de accesos del cine. Si el lector no lo reconoce, acércate a la taquilla con tu DNI y el número de ticket.',
    categoria: 'Entradas/QR',
    tags: ['qr', 'validez', 'taquilla'],
    vistas: 1890,
    util: 148,
  },
  {
    id: 'faq-006',
    titulo: '¿En cuánto tiempo reciben mi reembolso?',
    contenido:
      'Si la conciliación determina reembolso, el dinero vuelve a la misma tarjeta entre 2 y 7 días hábiles, según el banco emisor. Recibirás una notificación cuando la devolución se haya procesado, con el número de operación como referencia.',
    categoria: 'Reembolsos',
    tags: ['reembolso', 'tarjeta', 'bancos'],
    vistas: 5210,
    util: 402,
  },
  {
    id: 'faq-007',
    title: '',
    contenido: '',
    categoria: 'Reembolsos',
    tags: [],
    vistas: 0,
    util: 0,
  } as unknown as ArticuloFAQ,
  {
    id: 'faq-008',
    titulo: '¿Puedo pedir reembolso de un combo si la entrada sí llegó?',
    contenido:
      'Sí. Si la entrada se emitió correctamente pero el combo no se cobró/entregó de forma correcta, reporta el caso con tipo de producto "Combos". El reembolso del combo se procesa por separado al de las entradas.',
    categoria: 'Combos',
    tags: ['combo', 'reembolso', 'entrada'],
    vistas: 1420,
    util: 96,
  },
  {
    id: 'faq-009',
    titulo: 'El combo que pedí no estaba completo. ¿Qué hago?',
    contenido:
      'Reporta el caso indicando qué productos faltaban en el tipo "Combos". El sistema validará la transacción con la pasarela y, si corresponde, emitirá un cupón de reposición o reembolso del importe del combo.',
    categoria: 'Combos',
    tags: ['combo', 'productos', 'cupón'],
    vistas: 1180,
    util: 84,
  },
  {
    id: 'faq-010',
    titulo: '¿Qué es el "número de operación" y dónde lo encuentro?',
    contenido:
      'Es el identificador de la transacción que genera la pasarela de pagos. Lo encuentras en el SMS o correo de confirmación del banco, o en el detalle de tu movimientos en la app de tu banco. Es un número de 6 a 12 dígitos y es clave para agilizar la conciliación.',
    categoria: 'Pagos',
    tags: ['número operación', 'pasarela', 'banco'],
    vistas: 4400,
    util: 356,
  },
  {
    id: 'faq-011',
    titulo: '¿Puedo registrar un reclamo por otra persona?',
    contenido:
      'El reclamo debe registrarlo el titular de la tarjeta, ya que la conciliación valida el DNI y el correo asociado a la compra. Si compraste para tu familia con tu tarjeta, tú debes registrar el reclamo.',
    categoria: 'Pagos',
    tags: ['titular', 'dni', 'terceros'],
    vistas: 950,
    util: 61,
  },
  {
    id: 'faq-012',
    titulo: '¿Cómo sé si mi ticket ya fue resuelto?',
    contenido:
      'En "Mis reclamos" verás una línea de tiempo con el estado en tiempo real: Registrado → En Validación → Conciliado/Reembolsado → Cerrado. Además recibirás un correo de notificación en cada cambio de estado.',
    categoria: 'Entradas/QR',
    tags: ['estado', 'seguimiento', 'notificación'],
    vistas: 2750,
    util: 219,
  },
  {
    id: 'faq-013',
    titulo: '¿Qué pasa si el sistema no puede resolver mi caso automáticamente?',
    contenido:
      'Un operador de nivel 1 revisará tu caso y lo escalará a un especialista si es necesario. Recibirás el detalle de la resolución en el historial del ticket. El 90% de los casos se resuelven automáticamente en menos de 15 minutos.',
    categoria: 'Reembolsos',
    tags: ['manual', 'operador', 'escalado'],
    vistas: 1980,
    util: 155,
  },
  {
    id: 'faq-014',
    titulo: '¿La conciliación automática funciona con cualquier banco?',
    contenido:
      'Sí, siempre que la compra se haya procesado con las pasarelas Niubiz o Izipay, que cubren la mayoría de tarjetas de débito y crédito de bancos peruanos y extranjeros.',
    categoria: 'Pagos',
    tags: ['banco', 'niubiz', 'izipay'],
    vistas: 860,
    util: 52,
  },
  {
    id: 'faq-015',
    titulo: '¿Cómo califico la atención recibida?',
    contenido:
      'Al cerrarse tu ticket recibirás una encuesta de satisfacción (CSAT) con 5 estrellas. Tu calificación y comentarios nos ayudan a mejorar el servicio. También puedes dejar un comentario opcional.',
    categoria: 'Entradas/QR',
    tags: ['csat', 'encuesta', 'calificación'],
    vistas: 1340,
    util: 98,
  },
];

// Relleno el artículo 007 que quedó vacío arriba (reembolsos)
FAQS_SEED[6] = {
  id: 'faq-007',
  titulo: 'Mi banco dice que el reembolso ya salió pero no lo veo. ¿Y ahora?',
  contenido:
      'Algunos bancos tardan hasta 7 días hábiles en reflejar la devolución. Si ya pasaron 7 días hábiles desde la notificación de reembolso, ingresa a tu reclamo y agrega un comentario; un operador solicitará el comprobante de la pasarela (RAR - Request for Authorization Retrieval) y te dará seguimiento.',
  categoria: 'Reembolsos',
  tags: ['reembolso', 'banco', 'rar', 'demora'],
  vistas: 3120,
  util: 243,
};

// ── Generación de 40 tickets de ejemplo ───────────────────────
const CLIENTES_MOCK = [
  { id: 'usr-001', nombre: 'Cliente Demo', dni: '71234567', correo: 'cliente@demo.com', telefono: '987654321' },
  { id: 'cli-002', nombre: 'María Fernanda Quispe', dni: '44512398', correo: 'maria.quispe@correo.com', telefono: '998112233' },
  { id: 'cli-003', nombre: 'Jorge Luis Ramírez', dni: '09876543', correo: 'jorge.ramirez@correo.com', telefono: '976334455' },
  { id: 'cli-004', nombre: 'Lucía Aranda Flores', dni: '71200334', correo: 'lucia.aranda@correo.com', telefono: '954667788' },
  { id: 'cli-005', nombre: 'Diego Torres Salas', dni: '40123456', correo: 'diego.torres@correo.com', telefono: '923456781' },
  { id: 'cli-006', nombre: 'Ana Cecilia Huamán', dni: '09345678', correo: 'ana.huaman@correo.com', telefono: '912345678' },
];

const DESCRIPCIONES = [
  'Pagué con mi tarjeta de crédito y el monto se descontó, pero nunca llegó la entrada con el QR a mi correo.',
  'Se debitó el importe de la compra de entradas para la función de estreno, pero la app me mostró un error y no tengo el código QR.',
  'Compré 2 entradas y un combo, me cobraron dos veces el mismo monto y solo recibí un QR.',
  'El pago se realizó correctamente según mi banco, pero la pantalla se quedó cargando y no recibí nada.',
  'Compré un combo grande y al llegar al cine no aparecía en mi pedido, aunque el cobro sí se realizó.',
  'Mi banco confirmó la transacción pero la entrada no se emitió. Necesito el reembolso o la entrada antes de la función.',
  'Intenté comprar con la app, salió error de pago, pero el monto sí se descontó de mi tarjeta de débito.',
  'Pagué la entrada para mis hijos y no me llegó el correo con las entradas digitales. La función es hoy en la noche.',
];

function genTicket(n: number): Incidencia {
  const cliente = pick(CLIENTES_MOCK);
  const sede = pick(SEDES);
  const pelicula = pick(PELICULAS);
  const pasarela: Pasarela = rnd() < 0.6 ? 'Niubiz' : 'Izipay';
  const tipoProducto: TipoProducto = pick(['Entradas', 'Entradas', 'Combos', 'Ambos']);
  // Fechas en los últimos 45 días
  const diasAtras = rint(0, 45);
  const fechaCreacion = new Date(Date.now() - diasAtras * 86400000 - rint(0, 12) * 3600000 - rint(0, 59) * 60000);
  const fechaFuncion = new Date(fechaCreacion.getTime() + rint(1, 5) * 86400000 + rint(14, 22) * 3600000);
  const monto = +(rnd() < 0.5 ? rint(20, 90) : rint(90, 260) + rnd() * 0.9).toFixed(2);

  // Distribución de estados (mayoría conciliados/cerrados, algunos activos)
  const r = rnd();
  let estado: EstadoIncidencia;
  let conciliacion: Conciliacion | undefined;
  let prioridad: Prioridad;
  const fechaActualizacion = new Date(fechaCreacion.getTime() + rint(3, 40) * 60000);
  let fechaCierre: string | undefined;
  let tiempoResolucion: number | undefined;

  if (diasAtras > 3) {
    // Tickets antiguos: casi todos resueltos
    if (r < 0.85) {
      estado = 'Conciliado';
      conciliacion = {
        id: `conc-${n}`,
        ticketId: '',
        fechaInicio: fechaCreacion.toISOString(),
        fechaFin: fechaActualizacion.toISOString(),
        resultado: 'Conciliado',
        codigoQR: `CP${Date.parse(fechaCreacion.toISOString()).toString(36).toUpperCase()}${n}`,
        mensajeResultado: 'Cobro confirmado por la pasarela. Entrada digital emitida con QR válido.',
        intentos: 1,
        duracionMs: rint(3000, 8000),
      };
    } else if (r < 0.92) {
      estado = 'Reembolsado';
      conciliacion = {
        id: `conc-${n}`,
        ticketId: '',
        fechaInicio: fechaCreacion.toISOString(),
        fechaFin: fechaActualizacion.toISOString(),
        resultado: 'Reembolso',
        mensajeResultado: 'Transacción sin matching en emisión de entradas. Reembolso procesado a la tarjeta original.',
        intentos: 1,
        duracionMs: rint(3000, 8000),
      };
    } else {
      estado = 'Cerrado';
    }
    fechaCierre = new Date(fechaActualizacion.getTime() + rint(5, 55) * 60000).toISOString();
    tiempoResolucion = rint(5, 14);
  } else {
    // Tickets recientes: mezcla de activos
    if (r < 0.3) estado = 'Registrado';
    else if (r < 0.55) estado = 'En Validación';
    else if (r < 0.8) {
      estado = 'Conciliado';
      conciliacion = {
        id: `conc-${n}`,
        ticketId: '',
        fechaInicio: fechaCreacion.toISOString(),
        fechaFin: fechaActualizacion.toISOString(),
        resultado: 'Conciliado',
        codigoQR: `CP${Date.parse(fechaCreacion.toISOString()).toString(36).toUpperCase()}${n}`,
        mensajeResultado: 'Cobro confirmado por la pasarela. Entrada digital emitida con QR válido.',
        intentos: 1,
        duracionMs: rint(3000, 8000),
      };
    } else if (r < 0.9) estado = 'Escalado';
    else estado = 'Cerrado';
    if (estado === 'Cerrado' || estado === 'Conciliado') {
      fechaCierre = fechaActualizacion.toISOString();
      tiempoResolucion = rint(4, 15);
    }
  }

  prioridad =
    monto > 200 ? 'Crítica' : monto > 120 ? 'Alta' : monto > 60 ? 'Media' : 'Baja';
  if (estado === 'Escalado') prioridad = rnd() < 0.5 ? 'Alta' : 'Crítica';

  const id = `TKT-${fechaCreacion.toISOString().slice(0, 10).replace(/-/g, '')}-${String(n).padStart(4, '0')}`;

  // Historial según estado
  const historial: HistorialEstado[] = [];
  const histFecha1 = new Date(fechaCreacion.getTime() + 20000);
  historial.push({
    id: `hist-${n}-1`,
    ticketId: id,
    estadoNuevo: 'Registrado',
    fecha: fechaCreacion.toISOString(),
    usuarioId: cliente.id,
    usuarioNombre: cliente.nombre,
    comentario: 'Ticket registrado desde el portal de autoservicio.',
  });
  if (estado !== 'Registrado') {
    historial.push({
      id: `hist-${n}-2`,
      ticketId: id,
      estadoAnterior: 'Registrado',
      estadoNuevo: 'En Validación',
      fecha: histFecha1.toISOString(),
      usuarioId: 'sistema',
      usuarioNombre: 'Motor de Conciliación',
      comentario: 'Consulta automática enviada a la pasarela.',
    });
  }
  if (['Conciliado', 'Reembolsado', 'Cerrado'].includes(estado)) {
    historial.push({
      id: `hist-${n}-3`,
      ticketId: id,
      estadoAnterior: 'En Validación',
      estadoNuevo: estado as EstadoIncidencia,
      fecha: fechaActualizacion.toISOString(),
      usuarioId: 'sistema',
      usuarioNombre: 'Motor de Conciliación',
      comentario: conciliacion?.mensajeResultado ?? 'Resolución registrada.',
    });
  }

  const ticket: Incidencia = {
    id,
    clienteId: cliente.id,
    clienteNombre: cliente.nombre,
    clienteDni: cliente.dni,
    clienteCorreo: cliente.correo,
    clienteTelefono: cliente.telefono,
    transaccion: {
      id: `trx-${n}`,
      numerOperacion: String(rint(100000, 99999999)),
      pasarela,
      monto,
      ultimosCuatroDigitos: String(rint(1000, 9999)),
      fechaTransaccion: fechaCreacion.toISOString(),
      cine: sede,
      pelicula,
      fechaFuncion: fechaFuncion.toISOString(),
      tipoProducto,
    },
    descripcion: pick(DESCRIPCIONES),
    estado,
    prioridad,
    asignadoA: estado === 'Escalado' || estado === 'Conciliado' || estado === 'Reembolsado' ? 'usr-002' : undefined,
    asignadoNombre: estado === 'Escalado' || estado === 'Conciliado' || estado === 'Reembolsado' ? 'Operador Nivel 1' : undefined,
    fechaCreacion: fechaCreacion.toISOString(),
    fechaActualizacion: historial[historial.length - 1].fecha,
    fechaCierre,
    slaObjetivo: 15,
    tiempoResolucion,
    slaVencido: tiempoResolucion !== undefined ? tiempoResolucion > 15 : diasAtras > 0 && estado === 'Registrado',
    conciliacion: conciliacion
      ? { ...conciliacion, ticketId: id }
      : undefined,
    historial,
    logsAuditoria: historial.map((h, i) => ({
      id: `log-${n}-${i + 1}`,
      ticketId: id,
      usuarioId: h.usuarioId,
      usuarioNombre: h.usuarioNombre,
      accion: i === 0 ? 'Creación de ticket' : 'Cambio de estado',
      detalle: h.comentario,
      estadoAnterior: h.estadoAnterior,
      estadoNuevo: h.estadoNuevo,
      fecha: h.fecha,
    })),
  };

  return ticket;
}

export const TICKETS_SEED: Incidencia[] = Array.from({ length: 40 }, (_, i) => genTicket(i + 1));

// ── Búsqueda de artículos relacionados (deflexión) ─────────────
export function buscarFaqsRelacionados(texto: string, limite = 3): ArticuloFAQ[] {
  const t = texto.toLowerCase().trim();
  if (t.length < 4) return [];
  return FAQS_SEED.filter(
    (f) =>
      f.tags.some((tag) => t.includes(tag.toLowerCase())) ||
      f.titulo.toLowerCase().includes(t) ||
      f.contenido.toLowerCase().includes(t)
  ).slice(0, limite);
}

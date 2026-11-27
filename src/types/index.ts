// ============================================================
// Tipos y interfaces del dominio — Cineplanet ServiceDesk
// ============================================================

// ── Roles ────────────────────────────────────────────────────
export type Rol = 'cliente' | 'operador' | 'admin';

// ── Usuario ──────────────────────────────────────────────────
export interface Usuario {
  id: string;
  nombre: string;
  correo: string;
  passwordHash: string; // contraseña en texto plano para demo
  rol: Rol;
  activo: boolean;
  fechaCreacion: string; // ISO 8601
  telefono?: string;     // opcional — se rellena desde Mi perfil
  avatar?: string;
}

// ── Estado del ticket ─────────────────────────────────────────
export type EstadoIncidencia =
  | 'Registrado'
  | 'En Validación'
  | 'Conciliado'
  | 'Reembolsado'
  | 'Cerrado'
  | 'Escalado';

// ── Prioridad ────────────────────────────────────────────────
export type Prioridad = 'Baja' | 'Media' | 'Alta' | 'Crítica';

// ── Pasarela de pago ─────────────────────────────────────────
export type Pasarela = 'Niubiz' | 'Izipay';

// ── Tipo de producto ─────────────────────────────────────────
export type TipoProducto = 'Entradas' | 'Combos' | 'Ambos';

// ── Resultado de conciliación ─────────────────────────────────
export type ResultadoConciliacion =
  | 'Conciliado'
  | 'Reembolso'
  | 'Revisión Manual'
  | 'Pendiente';

// ── Transacción ───────────────────────────────────────────────
export interface Transaccion {
  id: string;
  numerOperacion: string;        // número de operación de la pasarela
  pasarela: Pasarela;
  monto: number;                 // en soles (S/)
  ultimosCuatroDigitos: string;  // tokenización — solo los últimos 4 dígitos
  fechaTransaccion: string;      // ISO 8601
  cine: string;
  pelicula: string;
  fechaFuncion: string;          // ISO 8601
  tipoProducto: TipoProducto;
}

// ── Resultado de la conciliación automática ───────────────────
export interface Conciliacion {
  id: string;
  ticketId: string;
  fechaInicio: string;
  fechaFin?: string;
  resultado: ResultadoConciliacion;
  codigoQR?: string;              // simulado si se emite entrada
  mensajeResultado: string;
  intentos: number;
  duracionMs?: number;
}

// ── Entrada de historial / trazabilidad ───────────────────────
export interface HistorialEstado {
  id: string;
  ticketId: string;
  estadoAnterior?: EstadoIncidencia;
  estadoNuevo: EstadoIncidencia;
  fecha: string;                // ISO 8601
  usuarioId: string;
  usuarioNombre: string;
  comentario?: string;
}

// ── Log de auditoría ─────────────────────────────────────────
export interface LogAuditoria {
  id: string;
  ticketId: string;
  usuarioId: string;
  usuarioNombre: string;
  accion: string;
  detalle?: string;
  estadoAnterior?: EstadoIncidencia;
  estadoNuevo?: EstadoIncidencia;
  fecha: string;                // ISO 8601
}

// ── Encuesta de satisfacción (CSAT) ───────────────────────────
export interface EncuestaSatisfaccion {
  id: string;
  ticketId: string;
  usuarioId: string;
  calificacion: 1 | 2 | 3 | 4 | 5;
  comentario?: string;
  fecha: string;
}

// ── Incidencia (ticket principal) ─────────────────────────────
export interface Incidencia {
  id: string;                   // TKT-YYYYMMDD-XXXX
  // Datos del cliente
  clienteId: string;
  clienteNombre: string;
  clienteDni: string;
  clienteCorreo: string;
  clienteTelefono: string;
  // Datos de la transacción
  transaccion: Transaccion;
  descripcion: string;
  // Gestión
  estado: EstadoIncidencia;
  prioridad: Prioridad;
  asignadoA?: string;           // ID del operador/admin
  asignadoNombre?: string;
  // Tiempos
  fechaCreacion: string;
  fechaActualizacion: string;
  fechaCierre?: string;
  // SLA (en minutos)
  slaObjetivo: number;          // 15 min de MTTR objetivo
  tiempoResolucion?: number;    // minutos reales
  slaVencido: boolean;
  // Conciliación
  conciliacion?: Conciliacion;
  // Historial
  historial: HistorialEstado[];
  logsAuditoria: LogAuditoria[];
  // Notas internas (operador/admin)
  notasInternas?: string;
  // CSAT
  encuesta?: EncuestaSatisfaccion;
  // Control
  escaladoA?: string;           // ID del agente L2
  nivelEscalado?: 1 | 2;
}

// ── Artículo de FAQ ──────────────────────────────────────────
export type CategoriaFAQ = 'Pagos' | 'Entradas/QR' | 'Reembolsos' | 'Combos';

export interface ArticuloFAQ {
  id: string;
  titulo: string;
  contenido: string;
  categoria: CategoriaFAQ;
  tags: string[];
  vistas: number;
  util: number;
}

// ── Reglas del motor de conciliación ─────────────────────────
export interface ReglasMotor {
  activo: boolean;
  umbralReembolsoAutomatico: number; // S/ máximo para reembolso automático
  timeoutSegundos: number;           // tiempo máximo de espera de la pasarela
  probabilidadConciliacion: number;  // 0-1 (simulado)
  probabilidadReembolso: number;     // 0-1 (simulado)
}

// ── KPIs para el dashboard ────────────────────────────────────
export interface KpiData {
  mttrPromedio: number;         // en minutos
  disponibilidad: number;       // porcentaje
  csat: number;                 // porcentaje
  conciliacionAutomatica: number; // porcentaje
  deflexionAutoservicio: number;  // porcentaje
}

// ── Punto de serie temporal para gráficos ────────────────────
export interface DataPoint {
  fecha: string;
  valor: number;
  etiqueta?: string;
}

// ── Respuesta genérica de servicios ──────────────────────────
export interface ApiResponse<T> {
  data: T;
  ok: boolean;
  mensaje?: string;
}

// ── Credenciales de login ─────────────────────────────────────
export interface LoginCredenciales {
  correo: string;
  password: string;
}

// ── Sesión activa ─────────────────────────────────────────────
export interface SesionActiva {
  usuario: Usuario;
  token: string;              // JWT simulado
  expiracion: string;
}

// ── Filtros de bandeja ────────────────────────────────────────
export interface FiltrosBandeja {
  estado?: EstadoIncidencia | '';
  prioridad?: Prioridad | '';
  pasarela?: Pasarela | '';
  busqueda?: string;
  fechaDesde?: string;
  fechaHasta?: string;
  pagina: number;
  porPagina: number;
}

// ============================================================
// Esquemas de validación con Zod — mensajes en español
// ============================================================
import { z } from 'zod';

/** DNI peruano: 8 dígitos numéricos */
export const dniSchema = z
  .string()
  .trim()
  .regex(/^\d{8}$/, 'El DNI debe tener exactamente 8 dígitos numéricos.');

/** Teléfono móvil peruano: 9 dígitos, inicia en 9 */
export const telefonoSchema = z
  .string()
  .trim()
  .regex(/^9\d{8}$/, 'El teléfono debe tener 9 dígitos e iniciar con 9.');

/** Correo válido */
export const correoSchema = z
  .string()
  .trim()
  .email('Ingresa un correo electrónico válido.');

/** Últimos 4 dígitos de tarjeta (tokenización) */
export const ultimos4Schema = z
  .string()
  .trim()
  .regex(/^\d{4}$/, 'Ingresa exactamente los últimos 4 dígitos de la tarjeta.');

/** Número de operación de la pasarela */
export const numOperacionSchema = z
  .string()
  .trim()
  .min(6, 'El número de operación debe tener al menos 6 dígitos.')
  .max(12, 'El número de operación no debe exceder 12 dígitos.')
  .regex(/^\d+$/, 'El número de operación solo acepta dígitos.');

/** Monto en soles, mayor a 0 */
export const montoSchema = z.coerce
  .number({ invalid_type_error: 'Ingresa un monto válido.' })
  .positive('El monto debe ser mayor a S/ 0.')
  .max(10000, 'El monto no puede superar S/ 10,000.');

/** Formulario completo de registro de incidencia */
export const incidenciaFormSchema = z.object({
  clienteNombre: z
    .string()
    .trim()
    .min(5, 'Ingresa tu nombre completo (mínimo 5 caracteres).')
    .max(80, 'El nombre no debe exceder 80 caracteres.'),
  clienteDni: dniSchema,
  clienteCorreo: correoSchema,
  clienteTelefono: telefonoSchema,
  cine: z.string().min(1, 'Selecciona el cine o sede.'),
  pelicula: z.string().min(1, 'Selecciona o escribe la película.'),
  fechaFuncion: z.string().min(1, 'Selecciona la fecha de la función.'),
  horaFuncion: z.string().min(1, 'Selecciona la hora de la función.'),
  monto: montoSchema,
  ultimosCuatro: ultimos4Schema,
  pasarela: z.enum(['Niubiz', 'Izipay'], {
    errorMap: () => ({ message: 'Selecciona la pasarela de pago.' }),
  }),
  numeroOperacion: numOperacionSchema,
  tipoProducto: z.enum(['Entradas', 'Combos', 'Ambos'], {
    errorMap: () => ({ message: 'Selecciona el tipo de producto.' }),
  }),
  descripcion: z
    .string()
    .trim()
    .min(20, 'Describe lo ocurrido con al menos 20 caracteres.')
    .max(600, 'La descripción no debe exceder 600 caracteres.'),
});

export type IncidenciaFormValues = z.infer<typeof incidenciaFormSchema>;

/** Formulario de login */
export const loginSchema = z.object({
  correo: correoSchema,
  password: z.string().min(6, 'La contraseña debe tener al menos 6 caracteres.'),
});

export type LoginValues = z.infer<typeof loginSchema>;

/** Formulario de registro de nuevo cliente */
export const registroSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(5, 'Ingresa tu nombre completo (mínimo 5 caracteres).')
    .max(80, 'El nombre no debe exceder 80 caracteres.'),
  correo: correoSchema,
  password: z
    .string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres.')
    .max(50, 'La contraseña no debe exceder 50 caracteres.'),
  confirmar: z.string().min(6, 'Confirma tu contraseña.'),
}).refine((d) => d.password === d.confirmar, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmar'],
});

export type RegistroValues = z.infer<typeof registroSchema>;

/** Formulario de edición de perfil */
export const perfilSchema = z.object({
  nombre: z
    .string()
    .trim()
    .min(5, 'Ingresa tu nombre completo (mínimo 5 caracteres).')
    .max(80, 'El nombre no debe exceder 80 caracteres.'),
  telefono: z
    .string()
    .trim()
    .regex(/^9\d{8}$/, 'El teléfono debe tener 9 dígitos e iniciar con 9.')
    .optional()
    .or(z.literal('')),
});

export type PerfilValues = z.infer<typeof perfilSchema>;

/** Formulario de cambio de contraseña */
export const cambioPasswordSchema = z.object({
  actual: z.string().min(1, 'Ingresa tu contraseña actual.'),
  nueva: z
    .string()
    .min(6, 'La nueva contraseña debe tener al menos 6 caracteres.')
    .max(50, 'La contraseña no debe exceder 50 caracteres.'),
  confirmar: z.string().min(6, 'Confirma la nueva contraseña.'),
}).refine((d) => d.nueva === d.confirmar, {
  message: 'Las contraseñas no coinciden.',
  path: ['confirmar'],
});

export type CambioPasswordValues = z.infer<typeof cambioPasswordSchema>;

// ============================================================
// Servicio de autenticación (simulado)
// ============================================================
import type { LoginCredenciales, SesionActiva, Usuario } from '../types';
import { KEYS, leerLS, escribirLS, eliminarLS } from './storageService';
import { delay } from '../utils/delay';

/** Genera un token JWT simulado */
function generarToken(usuario: Usuario): string {
  const payload = btoa(JSON.stringify({ sub: usuario.id, rol: usuario.rol, iat: Date.now() }));
  return `demo.${payload}.sig`;
}

/** Intento de login — simula llamada HTTP POST /auth/login */
export async function loginService(
  credenciales: LoginCredenciales
): Promise<SesionActiva> {
  await delay(400, 700);

  const usuarios = leerLS<Usuario[]>(KEYS.usuarios) ?? [];
  const usuario = usuarios.find(
    (u) =>
      u.correo.toLowerCase() === credenciales.correo.toLowerCase() &&
      u.passwordHash === credenciales.password
  );

  if (!usuario) {
    throw new Error('Correo o contraseña incorrectos.');
  }
  if (!usuario.activo) {
    throw new Error('Tu cuenta está inactiva. Contacta al administrador.');
  }

  const sesion: SesionActiva = {
    usuario,
    token: generarToken(usuario),
    expiracion: new Date(Date.now() + 8 * 3600000).toISOString(), // 8 h
  };

  escribirLS(KEYS.sesion, sesion);
  return sesion;
}

/** Cierra la sesión */
export async function logoutService(): Promise<void> {
  await delay(100, 200);
  eliminarLS(KEYS.sesion);
}

/** Recupera la sesión guardada (si no ha expirado) */
export function obtenerSesionActiva(): SesionActiva | null {
  const sesion = leerLS<SesionActiva>(KEYS.sesion);
  if (!sesion) return null;
  if (new Date(sesion.expiracion) < new Date()) {
    eliminarLS(KEYS.sesion);
    return null;
  }
  return sesion;
}

// ============================================================
// Servicio de gestión de usuarios (admin)
// ============================================================
import type { Usuario, Rol } from '../types';
import { KEYS, leerLS, actualizarItemEnLS, agregarItemEnLS } from './storageService';
import { delay } from '../utils/delay';

export async function listarUsuarios(): Promise<Usuario[]> {
  await delay(200, 400);
  return leerLS<Usuario[]>(KEYS.usuarios) ?? [];
}

export async function crearUsuario(datos: Omit<Usuario, 'id' | 'fechaCreacion'>): Promise<Usuario> {
  await delay(300, 500);
  const usuarios = leerLS<Usuario[]>(KEYS.usuarios) ?? [];
  const existe = usuarios.find((u) => u.correo.toLowerCase() === datos.correo.toLowerCase());
  if (existe) throw new Error('Ya existe un usuario con ese correo.');

  const usuario: Usuario = {
    ...datos,
    id: `usr-${Date.now()}`,
    fechaCreacion: new Date().toISOString(),
  };
  agregarItemEnLS<Usuario>(KEYS.usuarios, usuario);
  return usuario;
}

export async function toggleActivoUsuario(id: string): Promise<Usuario> {
  await delay(200, 400);
  const usuarios = leerLS<Usuario[]>(KEYS.usuarios) ?? [];
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) throw new Error('Usuario no encontrado.');
  const actualizado = { ...usuario, activo: !usuario.activo };
  actualizarItemEnLS<Usuario>(KEYS.usuarios, actualizado);
  return actualizado;
}

export async function cambiarRol(id: string, nuevoRol: Rol): Promise<Usuario> {
  await delay(200, 400);
  const usuarios = leerLS<Usuario[]>(KEYS.usuarios) ?? [];
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) throw new Error('Usuario no encontrado.');
  const actualizado = { ...usuario, rol: nuevoRol };
  actualizarItemEnLS<Usuario>(KEYS.usuarios, actualizado);
  return actualizado;
}

/** Registra un nuevo cliente desde la pantalla de login */
export async function registrarCliente(datos: {
  nombre: string;
  correo: string;
  password: string;
}): Promise<Usuario> {
  await delay(400, 700);
  const usuarios = leerLS<Usuario[]>(KEYS.usuarios) ?? [];
  const existe = usuarios.find((u) => u.correo.toLowerCase() === datos.correo.toLowerCase());
  if (existe) throw new Error('Ya existe una cuenta con ese correo electrónico.');

  const nuevo: Usuario = {
    id: `usr-${Date.now()}`,
    nombre: datos.nombre.trim(),
    correo: datos.correo.trim().toLowerCase(),
    passwordHash: datos.password,
    rol: 'cliente',
    activo: true,
    fechaCreacion: new Date().toISOString(),
  };
  agregarItemEnLS<Usuario>(KEYS.usuarios, nuevo);
  return nuevo;
}

/** Actualiza nombre y teléfono del perfil del usuario */
export async function actualizarPerfil(
  id: string,
  datos: { nombre: string; telefono?: string }
): Promise<Usuario> {
  await delay(300, 500);
  const usuarios = leerLS<Usuario[]>(KEYS.usuarios) ?? [];
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) throw new Error('Usuario no encontrado.');
  const actualizado: Usuario = {
    ...usuario,
    nombre: datos.nombre.trim(),
    ...(datos.telefono !== undefined ? { telefono: datos.telefono } : {}),
  };
  actualizarItemEnLS<Usuario>(KEYS.usuarios, actualizado);
  return actualizado;
}

/** Cambia la contraseña del usuario (verifica la actual) */
export async function cambiarPassword(
  id: string,
  actual: string,
  nueva: string
): Promise<void> {
  await delay(300, 500);
  const usuarios = leerLS<Usuario[]>(KEYS.usuarios) ?? [];
  const usuario = usuarios.find((u) => u.id === id);
  if (!usuario) throw new Error('Usuario no encontrado.');
  if (usuario.passwordHash !== actual) throw new Error('La contraseña actual es incorrecta.');
  const actualizado = { ...usuario, passwordHash: nueva };
  actualizarItemEnLS<Usuario>(KEYS.usuarios, actualizado);
}

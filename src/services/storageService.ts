// ============================================================
// Servicio de acceso a localStorage — capa genérica
// ============================================================

export const KEYS = {
  usuarios: 'cp_usuarios',
  tickets: 'cp_tickets',
  faqs: 'cp_faqs',
  reglas: 'cp_reglas_motor',
  sesion: 'cp_sesion',
  seeded: 'cp_seeded',
} as const;

/** Leer un valor tipado de localStorage */
export function leerLS<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

/** Escribir un valor en localStorage */
export function escribirLS<T>(key: string, valor: T): void {
  localStorage.setItem(key, JSON.stringify(valor));
}

/** Eliminar una clave */
export function eliminarLS(key: string): void {
  localStorage.removeItem(key);
}

/** Reemplazar un elemento dentro de un array por id */
export function actualizarItemEnLS<T extends { id: string }>(
  key: string,
  item: T
): T[] {
  const arr = leerLS<T[]>(key) ?? [];
  const updated = arr.map((a) => (a.id === item.id ? item : a));
  escribirLS(key, updated);
  return updated;
}

/** Agregar un elemento al array en localStorage */
export function agregarItemEnLS<T extends { id: string }>(
  key: string,
  item: T
): T[] {
  const arr = leerLS<T[]>(key) ?? [];
  const updated = [...arr, item];
  escribirLS(key, updated);
  return updated;
}

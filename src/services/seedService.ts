// ============================================================
// Servicio de inicialización del seed en localStorage
// ============================================================
import { KEYS, leerLS, escribirLS } from './storageService';
import { USUARIOS_SEED, TICKETS_SEED, FAQS_SEED, REGLAS_SEED } from '../data/mockData';

/** Carga el seed solo si no ha sido cargado antes */
export function inicializarSeed(): void {
  const seeded = leerLS<boolean>(KEYS.seeded);
  if (seeded) return;

  escribirLS(KEYS.usuarios, USUARIOS_SEED);
  escribirLS(KEYS.tickets, TICKETS_SEED);
  escribirLS(KEYS.faqs, FAQS_SEED);
  escribirLS(KEYS.reglas, REGLAS_SEED);
  escribirLS(KEYS.seeded, true);

  console.info('[Seed] Datos demo cargados en localStorage.');
}

/** Restablece todos los datos demo (usado por el admin) */
export function restablecerDemoData(): void {
  escribirLS(KEYS.usuarios, USUARIOS_SEED);
  escribirLS(KEYS.tickets, TICKETS_SEED);
  escribirLS(KEYS.faqs, FAQS_SEED);
  escribirLS(KEYS.reglas, REGLAS_SEED);
  escribirLS(KEYS.seeded, true);

  console.info('[Seed] Datos demo restablecidos.');
}

// ============================================================
// Servicio de artículos FAQ
// ============================================================
import type { ArticuloFAQ, CategoriaFAQ } from '../types';
import { KEYS, leerLS } from './storageService';
import { delay } from '../utils/delay';

export async function listarFaqs(): Promise<ArticuloFAQ[]> {
  await delay(200, 400);
  return leerLS<ArticuloFAQ[]>(KEYS.faqs) ?? [];
}

export async function buscarFaqs(
  termino: string,
  categoria?: CategoriaFAQ
): Promise<ArticuloFAQ[]> {
  await delay(100, 300);
  let all = leerLS<ArticuloFAQ[]>(KEYS.faqs) ?? [];
  if (categoria) all = all.filter((f) => f.categoria === categoria);
  if (!termino.trim()) return all;
  const q = termino.toLowerCase();
  return all.filter(
    (f) =>
      f.titulo.toLowerCase().includes(q) ||
      f.contenido.toLowerCase().includes(q) ||
      f.tags.some((t) => t.toLowerCase().includes(q))
  );
}

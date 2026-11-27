/** Pausa artificial para simular latencia de API (300–800 ms por defecto) */
export function delay(min = 300, max = 800): Promise<void> {
  const ms = Math.random() * (max - min) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

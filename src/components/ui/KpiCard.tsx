// Tarjeta de KPI con meta vs. valor actual
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  titulo: string;
  valor: string | number;
  meta: string;
  metaValor?: number;
  actualValor?: number;
  unidad?: string;
  icono?: React.ReactNode;
  mejorCuandoMenor?: boolean; // ej. MTTR (menor es mejor)
  colorSerie?: string;
  cargando?: boolean;
}

export default function KpiCard({
  titulo, valor, meta, metaValor, actualValor, icono, mejorCuandoMenor = false, cargando = false,
}: Props) {
  // Determina si se cumple la meta
  const cumple =
    metaValor !== undefined && actualValor !== undefined
      ? mejorCuandoMenor
        ? actualValor <= metaValor
        : actualValor >= metaValor
      : null;

  const tendenciaPositiva = cumple === null ? true : cumple;
  const Tendencia = tendenciaPositiva ? TrendingUp : TrendingDown;
  const colorTendencia = tendenciaPositiva ? 'text-accent-green' : 'text-accent-crimson';

  return (
    <div className="bg-white rounded-2xl border border-app-border p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          {icono && (
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
              {icono}
            </div>
          )}
          <h3 className="text-sm font-semibold text-app-muted uppercase tracking-wide">{titulo}</h3>
        </div>
        {!mejorCuandoMenor && (
          <Tendencia size={18} className={colorTendencia} aria-hidden="true" />
        )}
      </div>
      <div className="flex items-baseline gap-2 mb-2">
        {cargando ? (
          <div className="h-9 w-24 bg-app-border rounded animate-pulse" />
        ) : (
          <span className="text-3xl font-extrabold text-app-text">{valor}</span>
        )}
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-app-muted">Meta:</span>
        <span className={`font-semibold px-2 py-0.5 rounded-full ${cumple ? 'bg-green-100 text-accent-green' : 'bg-orange-100 text-accent-orange'}`}>
          {meta}
        </span>
        {cumple !== null && (
          <span className={`ml-auto text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${cumple ? 'bg-green-100 text-accent-green' : 'bg-red-100 text-accent-crimson'}`}>
            {cumple ? 'Cumple' : 'En progreso'}
          </span>
        )}
      </div>
    </div>
  );
}

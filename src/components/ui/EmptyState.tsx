// Estado vacío ilustrado
import type { LucideIcon } from 'lucide-react';

interface Props {
  icono: LucideIcon;
  titulo: string;
  descripcion: string;
  accion?: React.ReactNode;
}

export default function EmptyState({ icono: Icono, titulo, descripcion, accion }: Props) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center mb-4">
        <Icono size={32} className="text-primary-light" aria-hidden="true" />
      </div>
      <h3 className="text-lg font-bold text-app-text mb-1">{titulo}</h3>
      <p className="text-sm text-app-muted max-w-sm mb-4">{descripcion}</p>
      {accion}
    </div>
  );
}

// ============================================================
// LogoCineplanet — usa logo.jpg si está disponible,
// con texto de respaldo accesible en caso de fallo de carga.
// ============================================================
import logoUrl from '../../assets/logo.jpg';

interface Props {
  /** dark=true → fondo oscuro (sidebar / navbar primario) */
  dark?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const alturas: Record<string, string> = {
  sm: 'h-7',
  md: 'h-9',
  lg: 'h-12',
};

export default function LogoCineplanet({ dark = false, size = 'md' }: Props) {
  return (
    <span className="inline-flex items-center gap-2 select-none" aria-label="Cineplanet">
      <img
        src={logoUrl}
        alt="Cineplanet"
        className={`${alturas[size]} w-auto object-contain`}
        /* En fondo oscuro aplicamos un filtro que aclara el logo si es necesario */
        style={dark ? { filter: 'brightness(0) invert(1)' } : undefined}
        draggable={false}
      />
    </span>
  );
}

// Spinner de carga
interface Props {
  size?: 'sm' | 'md' | 'lg';
  color?: string;
  className?: string;
}

const sizes = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-12 h-12' };

export default function Spinner({ size = 'md', className = '' }: Props) {
  return (
    <div
      role="status"
      aria-label="Cargando..."
      className={`${sizes[size]} ${className} border-4 border-primary/20 border-t-primary rounded-full animate-spin`}
    />
  );
}

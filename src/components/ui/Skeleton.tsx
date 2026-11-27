// Skeleton de carga para tarjetas y líneas de texto
export function SkeletonCard({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-app-border p-4 animate-pulse ${className}`}>
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-full bg-app-border" />
        <div className="flex-1">
          <div className="h-3 bg-app-border rounded w-1/3 mb-2" />
          <div className="h-2 bg-app-border rounded w-1/2" />
        </div>
      </div>
      <div className="h-2 bg-app-border rounded w-full mb-2" />
      <div className="h-2 bg-app-border rounded w-2/3" />
    </div>
  );
}

export function SkeletonRow({ columnas = 5 }: { columnas?: number }) {
  return (
    <tr>
      {Array.from({ length: columnas }).map((_, i) => (
        <td key={i} className="px-4 py-3">
          <div className="h-4 bg-app-border rounded animate-pulse" />
        </td>
      ))}
    </tr>
  );
}

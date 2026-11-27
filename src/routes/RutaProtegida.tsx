// ============================================================
// Componente de ruta protegida por rol
// ============================================================
import { Navigate, useLocation } from 'react-router-dom';
import type { ReactNode } from 'react';
import type { Rol } from '../types';
import { useAuth } from '../context/AuthContext';
import Spinner from '../components/ui/Spinner';

interface Props {
  children: ReactNode;
  roles?: Rol[]; // Si no se especifica, solo requiere autenticación
}

export default function RutaProtegida({ children, roles }: Props) {
  const { sesion, cargando, rol } = useAuth();
  const location = useLocation();

  if (cargando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-app-bg">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!sesion) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && rol && !roles.includes(rol)) {
    // Redirigir según el rol real del usuario autenticado
    if (rol === 'cliente') return <Navigate to="/cliente" replace />;
    if (rol === 'operador') return <Navigate to="/operador" replace />;
    if (rol === 'admin') return <Navigate to="/admin" replace />;
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

// ============================================================
// Enrutador principal de la aplicación
// ============================================================
import { Routes, Route, Navigate } from 'react-router-dom';
import RutaProtegida from './RutaProtegida';
import { useAuth } from '../context/AuthContext';

// Auth
import LoginPage from '../pages/auth/LoginPage';

// Cliente
import ClienteLayout from '../pages/cliente/ClienteLayout';
import ClienteDashboard from '../pages/cliente/ClienteDashboard';
import NuevoTicketPage from '../pages/cliente/NuevoTicketPage';
import MisTicketsPage from '../pages/cliente/MisTicketsPage';
import DetalleTicketClientePage from '../pages/cliente/DetalleTicketClientePage';
import FaqPage from '../pages/cliente/FaqPage';
import MiPerfilPage from '../pages/cliente/MiPerfilPage';

// Operador
import OperadorLayout from '../pages/operador/OperadorLayout';
import BandejaPage from '../pages/operador/BandejaPage';
import DetalleTicketOpsPage from '../pages/operador/DetalleTicketOpsPage';

// Admin
import AdminLayout from '../pages/admin/AdminLayout';
import DashboardPage from '../pages/admin/DashboardPage';
import UsuariosPage from '../pages/admin/UsuariosPage';
import MotorConfigPage from '../pages/admin/MotorConfigPage';

export default function AppRouter() {
  const { sesion, cargando } = useAuth();
  if (cargando) return null;

  const rutaInicio = () => {
    if (!sesion) return '/login';
    if (sesion.usuario.rol === 'cliente')  return '/cliente';
    if (sesion.usuario.rol === 'operador') return '/operador';
    return '/admin';
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to={rutaInicio()} replace />} />

      {/* ── Autenticación ───────────────────────────────── */}
      <Route path="/login" element={<LoginPage />} />

      {/* ── Cliente ─────────────────────────────────────── */}
      <Route
        path="/cliente"
        element={
          <RutaProtegida roles={['cliente']}>
            <ClienteLayout />
          </RutaProtegida>
        }
      >
        <Route index element={<ClienteDashboard />} />
        <Route path="nuevo-ticket"      element={<NuevoTicketPage />} />
        <Route path="mis-tickets"       element={<MisTicketsPage />} />
        <Route path="mis-tickets/:id"   element={<DetalleTicketClientePage />} />
        <Route path="faq"               element={<FaqPage />} />
        <Route path="perfil"            element={<MiPerfilPage />} />
      </Route>

      {/* ── Operador ─────────────────────────────────────── */}
      <Route
        path="/operador"
        element={
          <RutaProtegida roles={['operador', 'admin']}>
            <OperadorLayout />
          </RutaProtegida>
        }
      >
        <Route index element={<BandejaPage />} />
        <Route path="ticket/:id" element={<DetalleTicketOpsPage />} />
        <Route path="perfil"     element={<MiPerfilPage />} />
      </Route>

      {/* ── Admin ────────────────────────────────────────── */}
      <Route
        path="/admin"
        element={
          <RutaProtegida roles={['admin']}>
            <AdminLayout />
          </RutaProtegida>
        }
      >
        <Route index element={<DashboardPage />} />
        <Route path="usuarios"   element={<UsuariosPage />} />
        <Route path="motor"      element={<MotorConfigPage />} />
        <Route path="bandeja"    element={<BandejaPage />} />
        <Route path="bandeja/:id" element={<DetalleTicketOpsPage />} />
        <Route path="perfil"     element={<MiPerfilPage />} />
      </Route>

      {/* 404 */}
      <Route path="*" element={<Navigate to={rutaInicio()} replace />} />
    </Routes>
  );
}

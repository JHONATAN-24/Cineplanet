// ============================================================
// App.tsx — Raíz de la aplicación
// ============================================================
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { TicketsProvider } from './context/TicketsContext';
import { ToastProvider } from './context/ToastContext';
import { inicializarSeed } from './services/seedService';
import AppRouter from './routes/AppRouter';

// Cargar seed en localStorage (solo la primera vez)
inicializarSeed();

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AuthProvider>
          <TicketsProvider>
            <AppRouter />
          </TicketsProvider>
        </AuthProvider>
      </ToastProvider>
    </BrowserRouter>
  );
}

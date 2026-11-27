// Layout del Cliente — Navbar con UserMenu integrado + Outlet
import { Outlet } from 'react-router-dom';
import Navbar from '../../components/layout/Navbar';
import ToastContainer from '../../components/ui/ToastContainer';

export default function ClienteLayout() {
  return (
    <div className="min-h-screen bg-app-bg flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6">
        <Outlet />
      </main>
      <ToastContainer />
    </div>
  );
}

// ============================================================
// LoginPage — Iniciar sesión + Registrarse (tabs)
// ============================================================
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ChevronRight, AlertCircle, UserPlus, LogIn } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { loginSchema, registroSchema, type LoginValues, type RegistroValues } from '../../utils/validators';
import { registrarCliente } from '../../services/usuarioService';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import DecorativeBanner from '../../components/layout/DecorativeBanner';
import LogoCineplanet from '../../components/layout/LogoCineplanet';

const USUARIOS_DEMO = [
  { correo: 'cliente@demo.com',  rol: 'Cliente Final' },
  { correo: 'operador@demo.com', rol: 'Operador Nivel 1' },
  { correo: 'admin@demo.com',    rol: 'Admin / L2' },
];

type Tab = 'login' | 'registro';

export default function LoginPage() {
  const { login, sesion, cargando, error, limpiarError } = useAuth();
  const { mostrar } = useToast();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>('login');
  const [registrando, setRegistrando] = useState(false);
  const [errorRegistro, setErrorRegistro] = useState<string | null>(null);

  // ── Formulario login ───────────────────────────────────────
  const {
    register: regLogin,
    handleSubmit: handleLogin,
    setValue,
    formState: { errors: errLogin },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  // ── Formulario registro ────────────────────────────────────
  const {
    register: regReg,
    handleSubmit: handleReg,
    reset: resetReg,
    formState: { errors: errReg },
  } = useForm<RegistroValues>({ resolver: zodResolver(registroSchema) });

  // Redirigir si ya hay sesión activa
  useEffect(() => {
    if (!sesion) return;
    const destinos: Record<string, string> = {
      cliente: '/cliente', operador: '/operador', admin: '/admin',
    };
    navigate(destinos[sesion.usuario.rol] ?? '/cliente', { replace: true });
  }, [sesion, navigate]);

  const onLogin = async (values: LoginValues) => {
    limpiarError();
    await login(values);
  };

  const onRegistro = async (values: RegistroValues) => {
    setErrorRegistro(null);
    setRegistrando(true);
    try {
      await registrarCliente({
        nombre: values.nombre,
        correo: values.correo,
        password: values.password,
      });
      mostrar('¡Cuenta creada! Ahora puedes iniciar sesión.', 'exito');
      resetReg();
      setTab('login');
      // Pre-rellenar el correo en el login
      setValue('correo', values.correo);
    } catch (err) {
      setErrorRegistro(err instanceof Error ? err.message : 'Error al crear la cuenta.');
    } finally {
      setRegistrando(false);
    }
  };

  const usarDemo = (correo: string) => {
    setTab('login');
    setValue('correo', correo);
    setValue('password', '123456');
  };

  const cambiarTab = (t: Tab) => {
    limpiarError();
    setErrorRegistro(null);
    setTab(t);
  };

  return (
    <div className="min-h-screen bg-app-bg flex flex-col lg:flex-row">

      {/* ── Panel decorativo lg+ ──────────────────────────── */}
      <div className="hidden lg:flex flex-col justify-between bg-primary-dark w-[45%] xl:w-[42%] p-10 xl:p-14 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
          {Array.from({ length: 6 }).map((_, r) =>
            Array.from({ length: 4 }).map((_, c) => (
              <div
                key={`${r}-${c}`}
                className="absolute rounded-2xl opacity-10"
                style={{
                  width: 90, height: 90,
                  left: c * 130 - 30, top: r * 110 - 20,
                  backgroundColor: ['#B5127F','#CB2054','#D1592B','#DE9430','#FAE93F','#9CC450','#30A67D','#15A9B8'][(r + c) % 8],
                  transform: 'skewX(-10deg)',
                }}
              />
            ))
          )}
        </div>

        <LogoCineplanet dark size="lg" />

        <div className="relative z-10">
          <h1 className="text-3xl xl:text-4xl font-extrabold text-white mb-4 leading-tight">
            Mesa de Servicios<br />
            <span className="text-accent-yellow">Cineplanet</span>
          </h1>
          <p className="text-white/70 text-base xl:text-lg mb-8 leading-relaxed">
            Gestiona incidencias de cobros no reflejados y sigue el estado en tiempo real.
          </p>
          <ul className="flex flex-col gap-3">
            {[
              '✓ Conciliación automática en < 15 minutos',
              '✓ Seguimiento en tiempo real del ticket',
              '✓ Reembolso o reemisión de entrada + QR',
            ].map((t) => (
              <li key={t} className="text-white/80 text-sm font-medium">{t}</li>
            ))}
          </ul>
        </div>

        <DecorativeBanner className="h-8 mt-6 relative z-10" />
      </div>

      {/* ── Panel del formulario ──────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 lg:p-10 min-h-screen lg:min-h-0">

        {/* Logo móvil */}
        <div className="flex flex-col items-center mb-6 lg:hidden">
          <LogoCineplanet size="lg" />
          <DecorativeBanner className="h-5 mt-3 w-40" />
          <p className="text-app-muted text-xs mt-2 font-medium">Mesa de Servicios</p>
        </div>

        <div className="w-full max-w-sm sm:max-w-md">

          {/* ── Tabs ────────────────────────────────────── */}
          <div className="flex bg-white rounded-2xl border border-app-border shadow-sm mb-4 p-1 gap-1">
            <button
              onClick={() => cambiarTab('login')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold
                transition-all min-h-[44px]
                ${tab === 'login'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-app-muted hover:text-app-text hover:bg-app-bg'}`}
              aria-selected={tab === 'login'}
              role="tab"
            >
              <LogIn size={16} aria-hidden="true" />
              Iniciar sesión
            </button>
            <button
              onClick={() => cambiarTab('registro')}
              className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold
                transition-all min-h-[44px]
                ${tab === 'registro'
                  ? 'bg-primary text-white shadow-sm'
                  : 'text-app-muted hover:text-app-text hover:bg-app-bg'}`}
              aria-selected={tab === 'registro'}
              role="tab"
            >
              <UserPlus size={16} aria-hidden="true" />
              Registrarse
            </button>
          </div>

          {/* ── Tab: Iniciar sesión ───────────────────── */}
          {tab === 'login' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl border border-app-border shadow-sm p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-extrabold text-app-text mb-1">
                  Iniciar sesión
                </h2>
                <p className="text-app-muted text-sm mb-5">
                  Accede al portal de servicios de Cineplanet
                </p>

                {error && (
                  <div role="alert" className="mb-4 p-3 bg-red-50 border border-accent-crimson/30 rounded-xl flex items-start gap-2 text-sm text-accent-crimson">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleLogin(onLogin)} noValidate className="flex flex-col gap-4">
                  <Input
                    etiqueta="Correo electrónico"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    requerido
                    error={errLogin.correo?.message}
                    {...regLogin('correo')}
                  />
                  <Input
                    etiqueta="Contraseña"
                    type="password"
                    autoComplete="current-password"
                    placeholder="••••••"
                    requerido
                    error={errLogin.password?.message}
                    {...regLogin('password')}
                  />
                  <Button
                    type="submit"
                    variante="primary"
                    tamano="lg"
                    fullWidth
                    cargando={cargando}
                    iconoDerecha={!cargando ? <ChevronRight size={18} /> : undefined}
                    className="mt-1"
                  >
                    {cargando ? 'Verificando...' : 'Ingresar'}
                  </Button>
                </form>

                <p className="text-center text-xs text-app-muted mt-4">
                  ¿Aún no tienes cuenta?{' '}
                  <button
                    onClick={() => cambiarTab('registro')}
                    className="text-primary-light font-bold hover:underline"
                  >
                    Regístrate gratis
                  </button>
                </p>
              </div>

              {/* Usuarios demo */}
              <div className="mt-4 bg-white rounded-2xl border border-app-border shadow-sm p-4 sm:p-5">
                <p className="text-xs font-bold text-app-muted uppercase tracking-wide mb-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-accent-yellow inline-block" aria-hidden="true" />
                  Usuarios de demostración — contraseña: 123456
                </p>
                <div className="flex flex-col gap-2">
                  {USUARIOS_DEMO.map((u) => (
                    <button
                      key={u.correo}
                      type="button"
                      onClick={() => usarDemo(u.correo)}
                      className="flex items-center justify-between p-3 rounded-xl border border-app-border
                        hover:border-primary hover:bg-primary/5 transition-all text-left group min-h-[44px]"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-app-text truncate">{u.correo}</p>
                        <p className="text-xs text-app-muted">{u.rol}</p>
                      </div>
                      <ChevronRight size={14} className="text-app-muted group-hover:text-primary transition-colors shrink-0 ml-2" aria-hidden="true" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ── Tab: Registrarse ─────────────────────── */}
          {tab === 'registro' && (
            <div className="animate-fade-in">
              <div className="bg-white rounded-2xl border border-app-border shadow-sm p-6 sm:p-8">
                <h2 className="text-xl sm:text-2xl font-extrabold text-app-text mb-1">
                  Crear cuenta
                </h2>
                <p className="text-app-muted text-sm mb-5">
                  Regístrate para gestionar tus reclamos de cobros no reflejados
                </p>

                {errorRegistro && (
                  <div role="alert" className="mb-4 p-3 bg-red-50 border border-accent-crimson/30 rounded-xl flex items-start gap-2 text-sm text-accent-crimson">
                    <AlertCircle size={16} className="shrink-0 mt-0.5" />
                    <span>{errorRegistro}</span>
                  </div>
                )}

                <form onSubmit={handleReg(onRegistro)} noValidate className="flex flex-col gap-4">
                  <Input
                    etiqueta="Nombre completo"
                    placeholder="Juan Pérez García"
                    autoComplete="name"
                    requerido
                    error={errReg.nombre?.message}
                    {...regReg('nombre')}
                  />
                  <Input
                    etiqueta="Correo electrónico"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="tu@correo.com"
                    requerido
                    error={errReg.correo?.message}
                    {...regReg('correo')}
                  />
                  <Input
                    etiqueta="Contraseña"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Mínimo 6 caracteres"
                    requerido
                    ayuda="Al menos 6 caracteres."
                    error={errReg.password?.message}
                    {...regReg('password')}
                  />
                  <Input
                    etiqueta="Confirmar contraseña"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repite tu contraseña"
                    requerido
                    error={errReg.confirmar?.message}
                    {...regReg('confirmar')}
                  />

                  <Button
                    type="submit"
                    variante="cta"
                    tamano="lg"
                    fullWidth
                    cargando={registrando}
                    icono={<UserPlus size={18} />}
                    className="mt-1"
                  >
                    {registrando ? 'Creando cuenta...' : 'Crear cuenta'}
                  </Button>
                </form>

                <p className="text-center text-xs text-app-muted mt-4">
                  ¿Ya tienes cuenta?{' '}
                  <button
                    onClick={() => cambiarTab('login')}
                    className="text-primary-light font-bold hover:underline"
                  >
                    Inicia sesión
                  </button>
                </p>
              </div>

              {/* Info sobre la cuenta */}
              <div className="mt-4 bg-accent-yellow/10 border border-accent-yellow/40 rounded-2xl p-4">
                <p className="text-xs font-bold text-primary-dark mb-1">ℹ️ ¿Qué puedes hacer con tu cuenta?</p>
                <ul className="text-xs text-primary-dark/80 space-y-1 leading-relaxed">
                  <li>• Reportar cobros no reflejados en tus compras</li>
                  <li>• Seguir el estado de tus reclamos en tiempo real</li>
                  <li>• Recibir tu entrada o QR en minutos</li>
                  <li>• Consultar el historial de todas tus solicitudes</li>
                </ul>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

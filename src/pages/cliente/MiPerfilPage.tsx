// ============================================================
// Mi Perfil — edición de datos personales y cambio de contraseña
// Accesible desde el UserMenu de cualquier rol
// ============================================================
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  User, Mail, Phone, Calendar, Shield, Edit3,
  Save, X, KeyRound, CheckCircle2, ArrowLeft,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { actualizarPerfil, cambiarPassword } from '../../services/usuarioService';
import {
  perfilSchema, type PerfilValues,
  cambioPasswordSchema, type CambioPasswordValues,
} from '../../utils/validators';
import Button from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { formatearFecha } from '../../utils/format';

// Badge de rol con colores del sistema
const ROL_INFO: Record<string, { label: string; clase: string }> = {
  cliente:  { label: 'Cliente Final',      clase: 'bg-primary/10 text-primary border-primary/20' },
  operador: { label: 'Operador Nivel 1',    clase: 'bg-teal-50 text-accent-teal border-accent-teal/30' },
  admin:    { label: 'Administrador L2',    clase: 'bg-amber-50 text-accent-orange border-accent-orange/30' },
};

function iniciales(nombre: string): string {
  return nombre.split(' ').filter(Boolean).slice(0, 2).map((p) => p[0].toUpperCase()).join('');
}

export default function MiPerfilPage() {
  const { usuario, actualizarUsuario } = useAuth();
  const { mostrar } = useToast();
  const navigate = useNavigate();
  const [editandoPerfil, setEditandoPerfil] = useState(false);
  const [editandoPassword, setEditandoPassword] = useState(false);
  const [guardandoPerfil, setGuardandoPerfil] = useState(false);
  const [guardandoPassword, setGuardandoPassword] = useState(false);

  const rolInfo = ROL_INFO[usuario?.rol ?? 'cliente'];

  // ── Formulario de perfil ───────────────────────────────────
  const {
    register: regPerfil,
    handleSubmit: handlePerfil,
    reset: resetPerfil,
    formState: { errors: errPerfil },
  } = useForm<PerfilValues>({
    resolver: zodResolver(perfilSchema),
    defaultValues: {
      nombre: usuario?.nombre ?? '',
      telefono: usuario?.telefono ?? '',
    },
  });

  // ── Formulario de contraseña ───────────────────────────────
  const {
    register: regPass,
    handleSubmit: handlePass,
    reset: resetPass,
    formState: { errors: errPass },
  } = useForm<CambioPasswordValues>({
    resolver: zodResolver(cambioPasswordSchema),
  });

  const onGuardarPerfil = async (values: PerfilValues) => {
    if (!usuario) return;
    setGuardandoPerfil(true);
    try {
      const actualizado = await actualizarPerfil(usuario.id, {
        nombre: values.nombre,
        telefono: values.telefono ?? '',
      });
      actualizarUsuario(actualizado);
      mostrar('Perfil actualizado correctamente.', 'exito');
      setEditandoPerfil(false);
    } catch (err) {
      mostrar(err instanceof Error ? err.message : 'Error al guardar el perfil.', 'error');
    } finally {
      setGuardandoPerfil(false);
    }
  };

  const onCancelarPerfil = () => {
    resetPerfil({ nombre: usuario?.nombre ?? '', telefono: usuario?.telefono ?? '' });
    setEditandoPerfil(false);
  };

  const onCambiarPassword = async (values: CambioPasswordValues) => {
    if (!usuario) return;
    setGuardandoPassword(true);
    try {
      await cambiarPassword(usuario.id, values.actual, values.nueva);
      mostrar('Contraseña cambiada correctamente.', 'exito');
      resetPass();
      setEditandoPassword(false);
    } catch (err) {
      mostrar(err instanceof Error ? err.message : 'Error al cambiar la contraseña.', 'error');
    } finally {
      setGuardandoPassword(false);
    }
  };

  if (!usuario) return null;

  // Ruta de retorno según rol
  const rutaAtras = usuario.rol === 'admin' ? '/admin' : usuario.rol === 'operador' ? '/operador' : '/cliente';

  return (
    <div className="max-w-2xl mx-auto animate-fade-in px-0">

      {/* Botón volver */}
      <button
        onClick={() => navigate(rutaAtras)}
        className="inline-flex items-center gap-1.5 text-sm text-primary-light font-semibold
          hover:underline mb-5 min-h-[44px]"
      >
        <ArrowLeft size={15} aria-hidden="true" />
        Volver al inicio
      </button>

      {/* ── Tarjeta de identidad ────────────────────────── */}
      <div className="bg-white rounded-2xl border border-app-border shadow-sm p-5 sm:p-6 mb-4">
        <div className="flex items-center gap-4 mb-5">
          {/* Avatar grande */}
          <div className="w-16 h-16 rounded-2xl bg-accent-yellow flex items-center justify-center shrink-0 shadow-sm">
            <span className="text-primary-dark font-extrabold text-xl" aria-hidden="true">
              {iniciales(usuario.nombre)}
            </span>
          </div>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-extrabold text-app-text truncate">
              {usuario.nombre}
            </h1>
            <p className="text-sm text-app-muted truncate">{usuario.correo}</p>
            <span className={`inline-block mt-1.5 text-xs font-bold px-2.5 py-0.5 rounded-full border ${rolInfo.clase}`}>
              {rolInfo.label}
            </span>
          </div>
        </div>

        {/* Datos de solo lectura */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
          {[
            { Icon: Mail,     label: 'Correo electrónico', valor: usuario.correo },
            { Icon: Shield,   label: 'Rol',                valor: rolInfo.label },
            { Icon: Calendar, label: 'Miembro desde',      valor: formatearFecha(usuario.fechaCreacion) },
            { Icon: Phone,    label: 'Teléfono',           valor: usuario.telefono || 'No registrado' },
          ].map(({ Icon, label, valor }) => (
            <div key={label} className="flex items-start gap-3 bg-app-bg rounded-xl p-3">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <Icon size={15} className="text-primary" aria-hidden="true" />
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-app-muted uppercase tracking-wide font-semibold">{label}</p>
                <p className="text-sm font-semibold text-app-text truncate">{valor}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Botón editar */}
        {!editandoPerfil && (
          <Button
            variante="secondary" tamano="sm"
            icono={<Edit3 size={15} />}
            onClick={() => setEditandoPerfil(true)}
          >
            Editar datos personales
          </Button>
        )}
      </div>

      {/* ── Formulario de edición de perfil ─────────────── */}
      {editandoPerfil && (
        <div className="bg-white rounded-2xl border border-primary-light/40 shadow-sm p-5 sm:p-6 mb-4 animate-fade-in">
          <h2 className="font-bold text-app-text text-sm mb-4 flex items-center gap-2">
            <Edit3 size={15} className="text-primary-light" aria-hidden="true" />
            Editar datos personales
          </h2>
          <form onSubmit={handlePerfil(onGuardarPerfil)} noValidate className="space-y-4">
            <Input
              etiqueta="Nombre completo"
              placeholder="Juan Pérez García"
              autoComplete="name"
              requerido
              error={errPerfil.nombre?.message}
              {...regPerfil('nombre')}
            />
            <Input
              etiqueta="Teléfono móvil"
              type="tel"
              inputMode="numeric"
              placeholder="987654321"
              maxLength={9}
              ayuda="9 dígitos, inicia con 9. Opcional."
              error={errPerfil.telefono?.message}
              {...regPerfil('telefono')}
            />
            {/* Correo — solo lectura, no se edita */}
            <div className="p-3 bg-app-bg rounded-xl border border-app-border">
              <p className="text-xs text-app-muted mb-0.5">Correo electrónico (no editable)</p>
              <p className="text-sm font-semibold text-app-text">{usuario.correo}</p>
            </div>

            <div className="flex gap-3 flex-wrap">
              <Button
                type="submit" variante="primary" tamano="sm"
                icono={<Save size={15} />}
                cargando={guardandoPerfil}
              >
                Guardar cambios
              </Button>
              <Button
                type="button" variante="ghost" tamano="sm"
                icono={<X size={15} />}
                onClick={onCancelarPerfil}
                disabled={guardandoPerfil}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* ── Seguridad: cambio de contraseña ─────────────── */}
      <div className="bg-white rounded-2xl border border-app-border shadow-sm p-5 sm:p-6">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h2 className="font-bold text-app-text text-sm flex items-center gap-2">
            <KeyRound size={15} className="text-primary-light" aria-hidden="true" />
            Seguridad
          </h2>
          {!editandoPassword && (
            <Button
              variante="secondary" tamano="sm"
              icono={<Edit3 size={14} />}
              onClick={() => setEditandoPassword(true)}
            >
              Cambiar contraseña
            </Button>
          )}
        </div>

        {!editandoPassword ? (
          <div className="flex items-center gap-3 p-3 bg-app-bg rounded-xl">
            <CheckCircle2 size={18} className="text-accent-green shrink-0" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-app-text">Contraseña establecida</p>
              <p className="text-xs text-app-muted">Tu contraseña está protegida. Cámbiala aquí si lo necesitas.</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handlePass(onCambiarPassword)} noValidate className="space-y-4 animate-fade-in">
            <Input
              etiqueta="Contraseña actual"
              type="password"
              autoComplete="current-password"
              placeholder="••••••"
              requerido
              error={errPass.actual?.message}
              {...regPass('actual')}
            />
            <Input
              etiqueta="Nueva contraseña"
              type="password"
              autoComplete="new-password"
              placeholder="Mínimo 6 caracteres"
              requerido
              error={errPass.nueva?.message}
              {...regPass('nueva')}
            />
            <Input
              etiqueta="Confirmar nueva contraseña"
              type="password"
              autoComplete="new-password"
              placeholder="Repite la nueva contraseña"
              requerido
              error={errPass.confirmar?.message}
              {...regPass('confirmar')}
            />

            <div className="flex gap-3 flex-wrap">
              <Button
                type="submit" variante="primary" tamano="sm"
                icono={<Save size={15} />}
                cargando={guardandoPassword}
              >
                Cambiar contraseña
              </Button>
              <Button
                type="button" variante="ghost" tamano="sm"
                icono={<X size={15} />}
                onClick={() => { resetPass(); setEditandoPassword(false); }}
                disabled={guardandoPassword}
              >
                Cancelar
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ============================================================
// Gestión de usuarios — Admin L2 — responsive
// Escritorio: tabla. Móvil: cards apiladas
// ============================================================
import { useEffect, useState } from 'react';
import { Users, UserPlus, Shield, ToggleLeft, ToggleRight, Loader2 } from 'lucide-react';
import { listarUsuarios, crearUsuario, toggleActivoUsuario, cambiarRol } from '../../services/usuarioService';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import Button from '../../components/ui/Button';
import Modal from '../../components/ui/Modal';
import { Input, Select } from '../../components/ui/Input';
import type { Usuario, Rol } from '../../types';
import { formatearFecha } from '../../utils/format';

const ROL_LABELS: Record<Rol, string> = {
  cliente: 'Cliente Final', operador: 'Operador Nivel 1', admin: 'Administrador L2',
};
const ROL_COLORS: Record<Rol, string> = {
  cliente: 'bg-primary/10 text-primary', operador: 'bg-teal-100 text-accent-teal', admin: 'bg-amber-100 text-accent-orange',
};

export default function UsuariosPage() {
  const { mostrar } = useToast();
  const { usuario: yo } = useAuth();
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [cargando, setCargando] = useState(true);
  const [modalNuevo, setModalNuevo] = useState(false);
  const [procesando, setProcesando] = useState<string | null>(null);

  // Form nuevo usuario
  const [nombre, setNombre]     = useState('');
  const [correo, setCorreo]     = useState('');
  const [password, setPassword] = useState('');
  const [rol, setRol]           = useState<Rol>('cliente');
  const [errForm, setErrForm]   = useState<string | null>(null);
  const [creando, setCreando]   = useState(false);

  const cargar = async () => {
    setCargando(true);
    setUsuarios(await listarUsuarios());
    setCargando(false);
  };
  useEffect(() => { cargar(); }, []);

  const handleCrear = async () => {
    if (!nombre.trim() || !correo.trim() || !password.trim()) { setErrForm('Todos los campos son requeridos.'); return; }
    if (password.length < 6) { setErrForm('La contraseña debe tener al menos 6 caracteres.'); return; }
    setErrForm(null); setCreando(true);
    try {
      const nuevo = await crearUsuario({ nombre: nombre.trim(), correo: correo.trim(), passwordHash: password, rol, activo: true });
      setUsuarios((p) => [...p, nuevo]);
      mostrar(`Usuario "${nuevo.nombre}" creado.`, 'exito');
      setModalNuevo(false); setNombre(''); setCorreo(''); setPassword(''); setRol('cliente');
    } catch (err) { setErrForm(err instanceof Error ? err.message : 'Error al crear.'); }
    finally { setCreando(false); }
  };

  const handleToggle = async (u: Usuario) => {
    if (u.id === yo?.id) { mostrar('No puedes desactivar tu propia cuenta.', 'advertencia'); return; }
    setProcesando(u.id);
    try {
      const act = await toggleActivoUsuario(u.id);
      setUsuarios((p) => p.map((x) => x.id === act.id ? act : x));
      mostrar(`"${act.nombre}" ${act.activo ? 'activado' : 'desactivado'}.`, 'exito');
    } catch { mostrar('Error al cambiar estado.', 'error'); }
    finally { setProcesando(null); }
  };

  const handleRol = async (u: Usuario, r: Rol) => {
    if (u.id === yo?.id) { mostrar('No puedes cambiar tu propio rol.', 'advertencia'); return; }
    setProcesando(u.id);
    try {
      const act = await cambiarRol(u.id, r);
      setUsuarios((p) => p.map((x) => x.id === act.id ? act : x));
      mostrar(`Rol de "${act.nombre}" cambiado.`, 'exito');
    } catch { mostrar('Error al cambiar rol.', 'error'); }
    finally { setProcesando(null); }
  };

  // Avatar con inicial
  const Avatar = ({ nombre }: { nombre: string }) => (
    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs shrink-0" aria-hidden="true">
      {nombre.charAt(0).toUpperCase()}
    </div>
  );

  return (
    <div className="animate-fade-in">
      {/* Encabezado */}
      <div className="flex items-center justify-between mb-5 flex-wrap gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-app-text flex items-center gap-2">
            <Users size={22} className="text-primary shrink-0" aria-hidden="true" />
            Gestión de usuarios
          </h1>
          <p className="text-app-muted text-sm mt-0.5">{usuarios.length} usuario{usuarios.length !== 1 ? 's' : ''}</p>
        </div>
        <Button variante="primary" icono={<UserPlus size={16} />} onClick={() => setModalNuevo(true)}>
          <span className="hidden sm:inline">Nuevo usuario</span>
          <span className="sm:hidden">Nuevo</span>
        </Button>
      </div>

      {/* ── Vista MÓVIL — cards (< md) ──────────────────── */}
      <div className="md:hidden flex flex-col gap-3">
        {cargando ? (
          <div className="text-center py-8 text-app-muted text-sm">Cargando…</div>
        ) : usuarios.map((u) => {
          const esYo = u.id === yo?.id;
          const enProceso = procesando === u.id;
          return (
            <div
              key={u.id}
              className={`bg-white rounded-2xl border border-app-border shadow-sm p-4 ${esYo ? 'ring-1 ring-primary/20' : ''}`}
            >
              <div className="flex items-start gap-3 mb-3">
                <Avatar nombre={u.nombre} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-semibold text-app-text text-sm truncate">{u.nombre}</p>
                    {esYo && (
                      <span className="text-[10px] bg-accent-yellow text-primary-dark px-1.5 py-0.5 rounded font-bold">Tú</span>
                    )}
                  </div>
                  <p className="text-xs text-app-muted truncate">{u.correo}</p>
                  <p className="text-[10px] text-app-muted mt-0.5">{formatearFecha(u.fechaCreacion)}</p>
                </div>
                {/* Estado activo/inactivo */}
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border shrink-0
                  ${u.activo ? 'bg-green-50 text-accent-green border-accent-green/30' : 'bg-red-50 text-accent-crimson border-accent-crimson/30'}`}>
                  {u.activo ? 'Activo' : 'Inactivo'}
                </span>
              </div>

              <div className="flex items-center justify-between gap-2 flex-wrap">
                {/* Selector de rol */}
                <select
                  value={u.rol}
                  onChange={(e) => handleRol(u, e.target.value as Rol)}
                  disabled={esYo || !!enProceso}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border-0 cursor-pointer min-h-[36px] ${ROL_COLORS[u.rol]} disabled:opacity-60`}
                  aria-label={`Rol de ${u.nombre}`}
                >
                  <option value="cliente">Cliente Final</option>
                  <option value="operador">Operador Nivel 1</option>
                  <option value="admin">Administrador L2</option>
                </select>

                {/* Toggle activo */}
                <button
                  onClick={() => handleToggle(u)}
                  disabled={esYo || !!enProceso}
                  className="flex items-center gap-1.5 text-xs font-semibold text-app-muted
                    hover:text-primary-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[36px]"
                  aria-label={`${u.activo ? 'Desactivar' : 'Activar'} a ${u.nombre}`}
                >
                  {enProceso ? <Loader2 size={16} className="animate-spin" /> :
                    u.activo ? <ToggleRight size={18} className="text-accent-green" /> :
                    <ToggleLeft size={18} />}
                  {u.activo ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Vista ESCRITORIO — tabla (>= md) ───────────── */}
      <div className="hidden md:block bg-white rounded-2xl border border-app-border shadow-sm overflow-x-auto">
        <table className="w-full text-sm" role="table">
          <thead>
            <tr className="border-b border-app-border bg-app-bg text-xs font-bold text-app-muted uppercase tracking-wide">
              {['Usuario','Rol','Estado','Creado','Acciones'].map((h) => (
                <th key={h} className="px-5 py-3 text-left whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cargando ? (
              <tr><td colSpan={5} className="text-center py-8 text-app-muted text-sm">Cargando…</td></tr>
            ) : usuarios.map((u) => {
              const esYo = u.id === yo?.id;
              const enProceso = procesando === u.id;
              return (
                <tr key={u.id} className={`border-b border-app-border transition-colors ${esYo ? 'bg-primary/5' : 'hover:bg-app-bg'}`}>
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar nombre={u.nombre} />
                      <div className="min-w-0">
                        <p className="font-semibold text-app-text text-sm flex items-center gap-1.5 flex-wrap">
                          {u.nombre}
                          {esYo && <span className="text-[10px] bg-accent-yellow text-primary-dark px-1.5 py-0.5 rounded font-bold">Tú</span>}
                        </p>
                        <p className="text-xs text-app-muted truncate max-w-[180px]">{u.correo}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={u.rol}
                      onChange={(e) => handleRol(u, e.target.value as Rol)}
                      disabled={esYo || !!enProceso}
                      className={`text-xs font-semibold px-2.5 py-1 rounded-xl border-0 cursor-pointer min-h-[36px] ${ROL_COLORS[u.rol]} disabled:opacity-60`}
                      aria-label={`Rol de ${u.nombre}`}
                    >
                      <option value="cliente">Cliente Final</option>
                      <option value="operador">Operador Nivel 1</option>
                      <option value="admin">Administrador L2</option>
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border
                      ${u.activo ? 'bg-green-50 text-accent-green border-accent-green/30' : 'bg-red-50 text-accent-crimson border-accent-crimson/30'}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${u.activo ? 'bg-accent-green' : 'bg-accent-crimson'}`} />
                      {u.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-app-muted whitespace-nowrap">{formatearFecha(u.fechaCreacion)}</td>
                  <td className="px-5 py-4">
                    <button
                      onClick={() => handleToggle(u)}
                      disabled={esYo || !!enProceso}
                      className="flex items-center gap-1.5 text-xs font-semibold text-app-muted
                        hover:text-primary-light disabled:opacity-40 disabled:cursor-not-allowed transition-colors min-h-[44px]"
                      aria-label={`${u.activo ? 'Desactivar' : 'Activar'} a ${u.nombre}`}
                    >
                      {enProceso ? <Loader2 size={16} className="animate-spin" /> :
                        u.activo ? <ToggleRight size={18} className="text-accent-green" /> :
                        <ToggleLeft size={18} />}
                      {u.activo ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Modal nuevo usuario */}
      <Modal
        abierto={modalNuevo}
        onCerrar={() => { setModalNuevo(false); setErrForm(null); }}
        titulo="Crear nuevo usuario" tamano="sm"
      >
        <div className="flex flex-col gap-4">
          {errForm && (
            <div role="alert" className="p-3 bg-red-50 border border-accent-crimson/30 rounded-xl text-xs text-accent-crimson flex items-center gap-2">
              <Shield size={14} className="shrink-0" /> {errForm}
            </div>
          )}
          <Input etiqueta="Nombre completo" placeholder="Ana García" requerido
            value={nombre} onChange={(e) => setNombre(e.target.value)} />
          <Input etiqueta="Correo electrónico" type="email" inputMode="email" placeholder="ana@correo.com" requerido
            value={correo} onChange={(e) => setCorreo(e.target.value)} />
          <Input etiqueta="Contraseña" type="password" placeholder="Mínimo 6 caracteres" requerido
            value={password} onChange={(e) => setPassword(e.target.value)} />
          <Select
            etiqueta="Rol" requerido value={rol}
            onChange={(e) => setRol(e.target.value as Rol)}
            opciones={[
              { valor: 'cliente', texto: 'Cliente Final' },
              { valor: 'operador', texto: 'Operador Nivel 1' },
              { valor: 'admin', texto: 'Administrador L2' },
            ]}
          />
          <div className="flex gap-3 justify-end flex-wrap pt-1">
            <Button variante="ghost" tamano="sm" onClick={() => setModalNuevo(false)}>Cancelar</Button>
            <Button variante="primary" tamano="sm" cargando={creando} onClick={handleCrear} icono={<UserPlus size={15} />}>
              Crear usuario
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}

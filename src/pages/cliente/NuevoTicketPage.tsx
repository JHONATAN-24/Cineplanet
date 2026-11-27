// ============================================================
// Formulario de registro de incidencia — responsive
// ============================================================
import { useState, useCallback } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FileText, AlertTriangle, Info, ChevronRight, Lightbulb } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { incidenciaFormSchema, type IncidenciaFormValues } from '../../utils/validators';
import { crearTicket } from '../../services/ticketService';
import { ejecutarConciliacion, type ProgresoConciliacion } from '../../services/conciliationService';
import { buscarFaqsRelacionados } from '../../data/mockData';
import type { ArticuloFAQ, Incidencia } from '../../types';
import { SEDES } from '../../data/sedes';
import { PELICULAS } from '../../data/peliculas';
import Button from '../../components/ui/Button';
import { Input, Select, Textarea } from '../../components/ui/Input';
import ConciliacionAnimacion from '../../components/tickets/ConciliacionAnimacion';

export default function NuevoTicketPage() {
  const { usuario } = useAuth();
  const { mostrar } = useToast();
  const navigate = useNavigate();
  const [enviando, setEnviando] = useState(false);
  const [progreso, setProgreso] = useState<{ mensaje: string; paso: number } | null>(null);
  const [faqsSugeridos, setFaqsSugeridos] = useState<ArticuloFAQ[]>([]);

  const { register, handleSubmit, watch, formState: { errors } } = useForm<IncidenciaFormValues>({
    resolver: zodResolver(incidenciaFormSchema),
    defaultValues: {
      clienteNombre: usuario?.nombre ?? '',
      clienteCorreo: usuario?.correo ?? '',
    },
  });

  const handleDescripcionChange = useCallback((texto: string) => {
    setFaqsSugeridos(buscarFaqsRelacionados(texto, 3));
  }, []);

  const onProgreso: ProgresoConciliacion = (mensaje, paso) => setProgreso({ mensaje, paso });

  const onSubmit = async (values: IncidenciaFormValues) => {
    if (!usuario) return;
    setEnviando(true);
    setProgreso({ mensaje: 'Registrando reclamo...', paso: 0 });
    try {
      const fechaFuncionISO = `${values.fechaFuncion}T${values.horaFuncion}:00.000Z`;
      const parcial: Omit<Incidencia, 'id' | 'fechaCreacion' | 'fechaActualizacion' | 'historial' | 'logsAuditoria' | 'slaVencido'> = {
        clienteId: usuario.id,
        clienteNombre: values.clienteNombre,
        clienteDni: values.clienteDni,
        clienteCorreo: values.clienteCorreo,
        clienteTelefono: values.clienteTelefono,
        transaccion: {
          id: `trx-new-${Date.now()}`,
          numerOperacion: values.numeroOperacion,
          pasarela: values.pasarela,
          monto: values.monto,
          ultimosCuatroDigitos: values.ultimosCuatro,
          fechaTransaccion: new Date().toISOString(),
          cine: values.cine,
          pelicula: values.pelicula,
          fechaFuncion: fechaFuncionISO,
          tipoProducto: values.tipoProducto,
        },
        descripcion: values.descripcion,
        estado: 'Registrado',
        prioridad: values.monto > 200 ? 'Crítica' : values.monto > 120 ? 'Alta' : values.monto > 60 ? 'Media' : 'Baja',
        slaObjetivo: 15,
      };
      const ticket = await crearTicket(parcial);
      setProgreso({ mensaje: 'Iniciando conciliación automática...', paso: 1 });
      const final = await ejecutarConciliacion(ticket, onProgreso);
      mostrar('Reclamo registrado y procesado correctamente.', 'exito');
      navigate(`/cliente/mis-tickets/${final.id}`);
    } catch (err) {
      mostrar(err instanceof Error ? err.message : 'Error al registrar el reclamo.', 'error');
    } finally {
      setEnviando(false);
      setProgreso(null);
    }
  };

  // Sección de formulario con número y título
  const Seccion = ({ num, titulo, children }: { num: number; titulo: string; children: React.ReactNode }) => (
    <section className="bg-white rounded-2xl border border-app-border p-4 sm:p-6 shadow-sm">
      <h2 className="font-bold text-app-muted text-xs uppercase tracking-wide mb-4 flex items-center gap-2">
        <span className="w-5 h-5 rounded-full bg-primary text-white text-xs flex items-center justify-center font-bold shrink-0" aria-hidden="true">
          {num}
        </span>
        {titulo}
      </h2>
      {children}
    </section>
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-1.5 text-app-muted text-xs mb-4 flex-wrap" aria-label="Ruta de navegación">
        <Link to="/cliente" className="hover:text-primary-light">Inicio</Link>
        <ChevronRight size={12} aria-hidden="true" />
        <span className="text-primary font-semibold">Reportar cobro no reflejado</span>
      </nav>

      <div className="mb-5">
        <h1 className="text-xl sm:text-2xl font-extrabold text-app-text flex items-center gap-2">
          <FileText size={22} className="text-primary shrink-0" aria-hidden="true" />
          Reportar cobro no reflejado
        </h1>
        <p className="text-app-muted text-sm mt-1">
          Completa los datos de tu compra. El sistema consultará automáticamente con la pasarela de pagos.
        </p>
      </div>

      {/* Alerta seguridad */}
      <div className="bg-blue-50 border border-primary-light/30 rounded-xl p-3 sm:p-4 mb-5 flex gap-3">
        <Info size={18} className="text-primary-light shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <p className="text-sm font-semibold text-primary-dark mb-0.5">Tu información está protegida</p>
          <p className="text-xs text-app-muted leading-relaxed">
            Solo pedimos los <strong>últimos 4 dígitos</strong> de tu tarjeta (tokenización).
            Nunca el número completo, CVV ni fecha de vencimiento.
          </p>
        </div>
      </div>

      {/* Overlay de conciliación */}
      {enviando && progreso && (
        <ConciliacionAnimacion mensaje={progreso.mensaje} paso={progreso.paso} />
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4 sm:space-y-5">

        {/* 1 — Datos personales */}
        <Seccion num={1} titulo="Datos personales">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              etiqueta="Nombre completo"
              placeholder="Juan Pérez García"
              autoComplete="name"
              requerido
              error={errors.clienteNombre?.message}
              {...register('clienteNombre')}
            />
            <Input
              etiqueta="DNI"
              placeholder="12345678"
              inputMode="numeric"
              maxLength={8}
              ayuda="8 dígitos numéricos"
              requerido
              error={errors.clienteDni?.message}
              {...register('clienteDni')}
            />
            <Input
              etiqueta="Correo electrónico"
              type="email"
              inputMode="email"
              placeholder="juan@correo.com"
              autoComplete="email"
              requerido
              error={errors.clienteCorreo?.message}
              {...register('clienteCorreo')}
            />
            <Input
              etiqueta="Teléfono móvil"
              type="tel"
              inputMode="numeric"
              placeholder="987654321"
              maxLength={9}
              ayuda="9 dígitos, inicia con 9"
              requerido
              error={errors.clienteTelefono?.message}
              {...register('clienteTelefono')}
            />
          </div>
        </Seccion>

        {/* 2 — Datos de la compra */}
        <Seccion num={2} titulo="Datos de la compra">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Select
              etiqueta="Cine / Sede"
              placeholder="Selecciona el cine"
              opciones={SEDES}
              requerido
              error={errors.cine?.message}
              {...register('cine')}
            />
            <Select
              etiqueta="Película"
              placeholder="Selecciona la película"
              opciones={PELICULAS}
              requerido
              error={errors.pelicula?.message}
              {...register('pelicula')}
            />
            <Input
              etiqueta="Fecha de la función"
              type="date"
              requerido
              error={errors.fechaFuncion?.message}
              {...register('fechaFuncion')}
            />
            <Input
              etiqueta="Hora de la función"
              type="time"
              requerido
              error={errors.horaFuncion?.message}
              {...register('horaFuncion')}
            />
            <Select
              etiqueta="Tipo de producto"
              placeholder="Selecciona el tipo"
              opciones={['Entradas', 'Combos', 'Ambos']}
              requerido
              error={errors.tipoProducto?.message}
              {...register('tipoProducto')}
              className="sm:col-span-2"
            />
          </div>
        </Seccion>

        {/* 3 — Datos del pago */}
        <Seccion num={3} titulo="Datos del pago">
          <div className="bg-amber-50 border border-accent-yellow/40 rounded-xl p-3 mb-4 flex gap-2">
            <AlertTriangle size={16} className="text-accent-orange shrink-0 mt-0.5" aria-hidden="true" />
            <p className="text-xs text-primary-dark leading-relaxed">
              <strong>Solo los últimos 4 dígitos.</strong> Nunca ingreses el número completo de tu tarjeta.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <Input
              etiqueta="Monto cobrado (S/)"
              type="number"
              inputMode="decimal"
              step="0.01"
              min="0.01"
              placeholder="45.00"
              ayuda="Monto exacto del cargo en soles"
              requerido
              error={errors.monto?.message}
              {...register('monto')}
            />
            <Input
              etiqueta="Últimos 4 dígitos de la tarjeta"
              inputMode="numeric"
              placeholder="1234"
              maxLength={4}
              ayuda="Solo los últimos 4 dígitos"
              requerido
              error={errors.ultimosCuatro?.message}
              {...register('ultimosCuatro')}
            />
            <Select
              etiqueta="Pasarela de pago"
              placeholder="Selecciona la pasarela"
              opciones={['Niubiz', 'Izipay']}
              requerido
              error={errors.pasarela?.message}
              {...register('pasarela')}
            />
            <Input
              etiqueta="Número de operación"
              inputMode="numeric"
              placeholder="123456789"
              ayuda="6–12 dígitos del SMS o app del banco"
              requerido
              error={errors.numeroOperacion?.message}
              {...register('numeroOperacion')}
            />
          </div>
        </Seccion>

        {/* 4 — Descripción */}
        <Seccion num={4} titulo="Descripción del problema">
          <Textarea
            etiqueta="Describe lo ocurrido"
            placeholder="Pagué con mi tarjeta y el monto se descontó, pero no llegó la entrada con el QR a mi correo..."
            rows={4}
            requerido
            ayuda="Mínimo 20 caracteres."
            error={errors.descripcion?.message}
            {...register('descripcion', {
              onChange: (e) => handleDescripcionChange(e.target.value),
            })}
          />

          {/* FAQs sugeridos */}
          {faqsSugeridos.length > 0 && (
            <div className="mt-4 p-3 sm:p-4 bg-primary/5 rounded-xl border border-primary/10">
              <p className="text-xs font-bold text-primary flex items-center gap-1.5 mb-2">
                <Lightbulb size={13} aria-hidden="true" />
                ¿Tu caso está en nuestras preguntas frecuentes?
              </p>
              <div className="flex flex-col gap-1.5">
                {faqsSugeridos.map((faq) => (
                  <Link
                    key={faq.id}
                    to="/cliente/faq"
                    className="text-xs text-primary-light hover:underline font-medium"
                  >
                    → {faq.titulo}
                  </Link>
                ))}
              </div>
              <p className="text-xs text-app-muted mt-2">
                Si la respuesta no resuelve tu caso, continúa con el formulario.
              </p>
            </div>
          )}
        </Seccion>

        {/* Botón enviar */}
        <Button
          type="submit"
          variante="cta"
          tamano="lg"
          fullWidth
          cargando={enviando}
          icono={<FileText size={18} />}
        >
          {enviando ? 'Procesando...' : 'Registrar reclamo'}
        </Button>
      </form>
    </div>
  );
}
